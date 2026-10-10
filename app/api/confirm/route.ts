import { Resend } from "resend";
import { ACTIVITIES, ALL_SLOTS, TZ } from "@/lib/data";

const sent = new Map<string, number>(); // best-effort dedupe; Resend idempotency key covers the rest
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const todayInTz = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());

export async function POST(req: Request) {
  let b: any;
  try {
    b = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const { date, time, activity, clientId } = b ?? {};
  const act = ACTIVITIES.find((a) => a.id === activity);
  const validDate =
    typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !isNaN(Date.parse(date)) &&
    date > todayInTz();
  if (
    !validDate ||
    !ALL_SLOTS.includes(time) ||
    !act ||
    typeof clientId !== "string" ||
    !/^[\w-]{8,64}$/.test(clientId)
  ) {
    return Response.json(
      { error: "Some details look off. Please go back and re-pick." },
      { status: 400 },
    );
  }
  if (sent.has(clientId))
    return Response.json({ ok: true, delivered: true, duplicate: true });

  const key = process.env.RESEND_API_KEY,
    to = process.env.NOTIFY_EMAIL_TO;
  const prettyDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date + "T12:00:00Z"));
  const submittedAt = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: TZ,
  }).format(new Date());
  const summary = {
    prettyDate,
    time,
    activity: `${act.title} ${act.emoji}`,
    submittedAt,
  };

  if (!key || !to) {
    // Placeholder integration: nothing is sent. See README to enable email.
    console.warn(
      "[confirm] Email NOT sent: set RESEND_API_KEY and NOTIFY_EMAIL_TO.",
      summary,
    );
    if (process.env.NODE_ENV === "production")
      return Response.json(
        { error: "Notifications aren't set up yet." },
        { status: 503 },
      );
    sent.set(clientId, Date.now());
    return Response.json({ ok: true, delivered: false });
  }

  const html = `<div style="font-family:Georgia,serif;max-width:480px;margin:auto;padding:24px;background:#FFFAF3;color:#4A2C3C">
    <h1 style="font-weight:500">She said yes! 💌</h1>
    <p><b>Date:</b> ${esc(prettyDate)}<br/><b>Time:</b> ${esc(time)}<br/><b>Activity:</b> ${esc(summary.activity)}</p>
    <p style="color:#8A6B7A;font-size:13px">Confirmed on ${esc(submittedAt)} (Montevideo time)</p></div>`;
  const text = `She said yes!\nDate: ${prettyDate}\nTime: ${time}\nActivity: ${summary.activity}\nConfirmed: ${submittedAt}`;
  try {
    const { error } = await new Resend(key).emails.send(
      {
        from:
          process.env.NOTIFY_EMAIL_FROM ||
          "Date Invite <onboarding@resend.dev>",
        to,
        subject: "She said yes! 💌",
        html,
        text,
      },
      { idempotencyKey: `date-invite/${clientId}` },
    );
    if (error) throw new Error(error.message);
    sent.set(clientId, Date.now());
    return Response.json({ ok: true, delivered: true });
  } catch (e) {
    console.error("[confirm] Resend failed:", e);
    return Response.json(
      { error: "Couldn't send it just now. Please try again." },
      { status: 502 },
    );
  }
}
