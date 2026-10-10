"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Coffee,
  Gamepad2,
  Heart,
  IceCreamCone,
  Loader2,
  Sparkles,
  Sunset,
  Utensils,
} from "lucide-react";
import { ACTIVITIES, SLOT_GROUPS, TZ, type ActivityId } from "@/lib/data";

const ICONS = {
  coffee: Coffee,
  dinner: Utensils,
  sunset: Sunset,
  gaming: Gamepad2,
  sweet: IceCreamCone,
  surprise: Sparkles,
};
const CARD_TINTS: Record<ActivityId, string> = {
  coffee: "bg-[#F6E3D3]",
  dinner: "bg-[#F6D9D6]",
  sunset: "bg-[#F8DCC8]",
  gaming: "bg-[#DDD4F0]",
  sweet: "bg-[#F4D4E2]",
  surprise: "bg-[#E8E0F5]",
};
const btnPrimary =
  "rounded-full bg-rose px-7 py-3.5 font-semibold text-paper shadow-lift transition hover:bg-rosedeep active:scale-[.97] disabled:opacity-60";
const btnGhost =
  "rounded-full border border-plum/25 bg-paper px-7 py-3.5 font-semibold text-plum/80 transition hover:border-plum/50";
type Sel = { date: string; time: string; activity: ActivityId | "" };

const HEARTS = [
  [8, 9, 18],
  [22, 14, 24],
  [38, 10, 21],
  [55, 16, 27],
  [70, 12, 19],
  [84, 18, 25],
  [93, 11, 22],
];
function Floaters({ count = 7 }: { count?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      {HEARTS.slice(0, count).map(([left, size, dur], i) => (
        <Heart
          key={i}
          className={`float-heart ${i % 3 === 0 ? "text-lavender" : "text-rose/60"}`}
          fill="currentColor"
          strokeWidth={0}
          style={{
            left: `${left}%`,
            width: size,
            height: size,
            animationDuration: `${dur}s`,
            animationDelay: `${i * -3.5}s`,
            top: `${10 + ((i * 13) % 70)}%`,
          }}
        />
      ))}
    </div>
  );
}

function Letter({
  step,
  children,
}: {
  step: number;
  children: React.ReactNode;
}) {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <div className="relative rounded-[30px] border border-rose/25 bg-paper px-6 pb-9 pt-12 shadow-paper sm:px-8">
        <div
          aria-hidden
          className="absolute right-5 top-4 grid h-11 w-9 rotate-6 place-items-center border-2 border-dashed border-rose/40 bg-blush/50 text-rose"
        >
          <Heart className="h-4 w-4" fill="currentColor" strokeWidth={0} />
        </div>
        {children}
      </div>
      <div
        className="mt-6 flex justify-center gap-2"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={step + 1}
        aria-label={`Step ${step + 1} of 5`}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${i <= step ? "w-5 bg-rose" : "w-1.5 bg-rose/25"}`}
          />
        ))}
      </div>
    </main>
  );
}

function DodgeNo({ avoid }: { avoid: React.RefObject<HTMLElement>[] }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [tries, setTries] = useState(0);
  const dodge = () => {
    const el = ref.current;
    if (!el) return;
    const w = size?.w ?? el.offsetWidth,
      h = size?.h ?? el.offsetHeight,
      m = 16;
    if (!size) setSize({ w, h });
    const vw = window.innerWidth,
      vh = window.innerHeight;
    const blocks = avoid
      .map((r) => r.current?.getBoundingClientRect())
      .filter(Boolean) as DOMRect[];
    let best = { x: m, y: vh - h - m };
    for (let i = 0; i < 40; i++) {
      const x = m + Math.random() * Math.max(0, vw - w - 2 * m),
        y = m + Math.random() * Math.max(0, vh - h - 2 * m);
      const hit = blocks.some(
        (b) =>
          x < b.right + 16 &&
          x + w > b.left - 16 &&
          y < b.bottom + 16 &&
          y + h > b.top - 16,
      );
      if (!hit && (!pos || Math.hypot(x - pos.x, y - pos.y) > 140)) {
        best = { x, y };
        break;
      }
    }
    setPos(best);
    setTries((t) => t + 1);
  };
  const btn = (
    <button
      ref={ref}
      type="button"
      className={btnGhost + " select-none touch-manipulation"}
      style={
        pos
          ? {
              position: "fixed",
              left: pos.x,
              top: pos.y,
              zIndex: 30,
              transition:
                "left .35s cubic-bezier(.3,1.4,.5,1), top .35s cubic-bezier(.3,1.4,.5,1)",
            }
          : undefined
      }
      onPointerEnter={(e) => e.pointerType === "mouse" && dodge()}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") {
          e.preventDefault();
          dodge();
        }
      }}
      onClick={dodge}
    >
      {tries > 5 ? "Nope 🙈" : "No"}
    </button>
  );
  return (
    <span
      className="inline-block"
      style={size ? { width: size.w, height: size.h } : undefined}
    >
      {pos && typeof document !== "undefined"
        ? createPortal(btn, document.body)
        : btn}
    </span>
  );
}

const fmtDate = (d: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(d + "T12:00:00Z"));
const tomorrow = () => {
  const t = new Date(Date.now() + 864e5);
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(t);
};
const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function Invite() {
  const reduce = useReducedMotion();
  const [who, setWho] = useState("");
  useEffect(
    () =>
      setWho(
        (new URLSearchParams(window.location.search).get("for") || "")
          .trim()
          .toUpperCase()
          .slice(0, 40),
      ),
    [],
  );
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Sel>({ date: "", time: "", activity: "" });
  const [err, setErr] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [delivered, setDelivered] = useState(true);
  const clientId = useRef(newId());
  const yesRef = useRef<HTMLButtonElement>(null),
    headRef = useRef<HTMLHeadingElement>(null);
  const [minDate, setMinDate] = useState("");
  useEffect(() => setMinDate(tomorrow()), []);
  const go = (n: number) => {
    setErr("");
    setStep(n);
    window.scrollTo({ top: 0 });
  };

  async function confirm() {
    if (status === "sending" || status === "done") return;
    setStatus("sending");
    setErr("");
    try {
      const r = await fetch("/api/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sel, who, clientId: clientId.current }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Something went wrong.");
      setDelivered(j.delivered !== false);
      setStatus("done");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const act = ACTIVITIES.find((a) => a.id === sel.activity);
  const Back = ({ to }: { to: number }) => (
    <button
      type="button"
      onClick={() => go(to)}
      className="mb-5 -ml-1 inline-flex items-center gap-1 text-sm text-mauve hover:text-plum"
    >
      <ArrowLeft className="h-4 w-4" /> Back
    </button>
  );
  const sub = "mt-3 text-[1.05rem] leading-relaxed text-mauve";
  const h1 = "display text-[2.15rem] leading-[1.1] sm:text-[2.5rem]";

  return (
    <>
      <Floaters count={step === 4 ? 7 : 4} />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -10 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Letter step={step}>
            {step === 0 && (
              <>
                <p className="text-mauve">
                  I have a tiny question for you {who}
                </p>
                <h1 ref={headRef} className={`${h1} mt-3`}>
                  Sooo… would you go on a date with me? ♡
                </h1>
                <div className="mt-9 flex items-center gap-4">
                  <button
                    ref={yesRef}
                    className={btnPrimary}
                    onClick={() => go(1)}
                  >
                    Yes! ♡
                  </button>
                  <DodgeNo avoid={[yesRef, headRef]} />
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <h1 className={h1}>WAIT… YOU ACTUALLY SAID YESSSS?! 🥹♡</h1>
                <p className={sub}>
                  I was hoping you&apos;d say that, but I wasn&apos;t prepared
                  for it.
                </p>
                <button className={`${btnPrimary} mt-9`} onClick={() => go(2)}>
                  Okay, okay 😂
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <Back to={1} />
                <h1 className={h1}>Sooo… when are you free? ♡</h1>
                <p className={sub}>
                  Let&apos;s find a time for our little adventure.
                </p>
                <label className="mt-7 block text-sm font-semibold" htmlFor="d">
                  Pick a day
                </label>
                <input
                  id="d"
                  type="date"
                  min={minDate}
                  value={sel.date}
                  onChange={(e) => setSel({ ...sel, date: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-rose/30 bg-white/70 px-4 py-3.5 text-lg text-plum"
                />
                {SLOT_GROUPS.map((g) => (
                  <fieldset key={g.label} className="mt-6">
                    <legend className="text-sm font-semibold">{g.label}</legend>
                    <div className="mt-2 flex flex-wrap gap-2.5">
                      {g.slots.map((s) => (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={sel.time === s}
                          onClick={() => setSel({ ...sel, time: s })}
                          className={`rounded-full border px-5 py-2.5 font-medium transition ${sel.time === s ? "border-rose bg-rose text-paper shadow-lift" : "border-rose/30 bg-white/70 hover:border-rose"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ))}
                <p className="mt-6 text-sm text-mauve">
                  {sel.date && sel.time
                    ? `${fmtDate(sel.date)} at ${sel.time}. Good choice 😌`
                    : "Pick whatever feels right. I'll make it work."}
                </p>
                {err && (
                  <p
                    role="alert"
                    className="mt-4 text-sm font-medium text-rosedeep"
                  >
                    {err}
                  </p>
                )}
                <button
                  className={`${btnPrimary} mt-6`}
                  onClick={() =>
                    sel.date && sel.time
                      ? go(3)
                      : setErr("Pick a day and a time first ♡")
                  }
                >
                  Lock it in ♡
                </button>
              </>
            )}
            {step === 3 && (
              <>
                <Back to={2} />
                <h1 className={h1}>Okayyy, one more important question… 👀</h1>
                <p className={sub}>What are you in the mood for?</p>
                <div
                  role="radiogroup"
                  aria-label="Date idea"
                  className="mt-6 grid grid-cols-2 gap-3"
                >
                  {ACTIVITIES.map((a, i) => {
                    const Icon = ICONS[a.id],
                      on = sel.activity === a.id;
                    return (
                      <button
                        key={a.id}
                        role="radio"
                        aria-checked={on}
                        onClick={() => setSel({ ...sel, activity: a.id })}
                        className={`relative flex flex-col items-start rounded-3xl border p-4 text-left transition active:scale-[.98] ${on ? "border-rose bg-white ring-2 ring-rose" : "border-rose/25 bg-white/60 hover:border-rose/60"} ${i % 2 ? "sm:rotate-[.6deg]" : "sm:-rotate-[.6deg]"}`}
                      >
                        <span
                          className={`grid h-10 w-10 place-items-center rounded-2xl text-rosedeep ${CARD_TINTS[a.id]}`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="display mt-3 text-[1.05rem] leading-tight">
                          {a.title} {a.emoji}
                        </span>
                        <span className="mt-1.5 text-[.8rem] leading-snug text-mauve">
                          {a.desc}
                        </span>
                        {on && (
                          <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-rose text-paper">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {err && (
                  <p
                    role="alert"
                    className="mt-4 text-sm font-medium text-rosedeep"
                  >
                    {err}
                  </p>
                )}
                <button
                  className={`${btnPrimary} mt-7`}
                  onClick={() =>
                    sel.activity ? go(4) : setErr("Choose one to continue ♡")
                  }
                >
                  That&apos;s the plan ♡
                </button>
              </>
            )}
            {step === 4 && (
              <>
                <h1 className={h1}>Glad you didn&apos;t say no 🥹♡</h1>
                <p className={sub}>
                  Get ready for <b className="text-plum">{sel.time}</b> on{" "}
                  <b className="text-plum">{fmtDate(sel.date)}</b>… I&apos;m
                  coming to get you. See you soon! ♡
                </p>
                {act && (
                  <p className="mt-4 rounded-2xl bg-blush/50 px-4 py-3 text-[.95rem]">
                    {act.line}
                  </p>
                )}
                {status === "done" ? (
                  <div role="status" className="mt-8">
                    <p className="display text-2xl">
                      It&apos;s officially a date! See you soon 💌
                    </p>
                    {!delivered && process.env.NODE_ENV !== "production" && (
                      <p className="mt-3 text-xs text-mauve">
                        Dev note: email not sent (RESEND_API_KEY /
                        NOTIFY_EMAIL_TO missing).
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {err && (
                      <p
                        role="alert"
                        className="mt-5 text-sm font-medium text-rosedeep"
                      >
                        {err}
                      </p>
                    )}
                    <button
                      className={`${btnPrimary} mt-8 inline-flex items-center gap-2`}
                      disabled={status === "sending"}
                      onClick={confirm}
                    >
                      {status === "sending" && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {status === "error"
                        ? "Try again 💗"
                        : "Okay, I accept! 💗"}
                    </button>
                  </>
                )}
              </>
            )}
          </Letter>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
