# Date invite ♡

Next.js 14 · React · TypeScript · Tailwind · Framer Motion · Lucide · Resend

## Run locally
```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```
On your phone while developing: open `http://<your-computer-LAN-IP>:3000` on the same Wi-Fi.

## Enable the email notification
1. Create a free account at https://resend.com and make an API key.
2. In `.env.local` set:
   - `RESEND_API_KEY` – your key
   - `NOTIFY_EMAIL_TO` – the address that receives the booking
   - `NOTIFY_EMAIL_FROM` – optional. The default `onboarding@resend.dev` only delivers to **the email you signed up to Resend with**. To send to any other address, verify a domain in Resend and use e.g. `Date Invite <hello@yourdomain.com>`.
3. Restart `npm run dev`.

Without these variables, development mode only logs the booking to the server console (the UI shows a dev note that no email was sent). In production, the API returns an error instead of pretending, and she sees a "try again" button.

## Deploy to Vercel
1. Push this folder to a GitHub repo and import it at https://vercel.com/new (or run `npx vercel`).
2. Add the three environment variables above under Project → Settings → Environment Variables.
3. Deploy, then send her the URL. Do one full test run yourself first and check your inbox.

## Customize
- Activities, wording and time slots: `lib/data.ts` (the server validates against the same list).
- Colors: `tailwind.config.ts`. Fonts: `app/layout.tsx`.
- Duplicate protection: the button locks while sending, each visit has a unique id, and Resend's idempotency key blocks repeats.
