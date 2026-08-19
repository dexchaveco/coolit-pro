# Deploying Coolit Pro

## The one thing that matters for hosting

This app stores everything in a single SQLite file (`data/coolit.db`),
using Node's built-in SQLite support — there's no separate database
service to pay for or manage. The tradeoff: it needs to run somewhere with
a **persistent disk**, not a serverless platform with an ephemeral
filesystem. That means plain Vercel/Netlify serverless functions won't
keep your data between requests. Good options instead:

| Option | Cost | Notes |
|---|---|---|
| **Railway** | ~$5/mo | Easiest. Connect your GitHub repo, add a volume, set env vars, done. |
| **Render** | ~$7/mo | Similar to Railway — "Web Service" + a persistent disk mounted at `/data`. |
| **Fly.io** | ~$5/mo | More control, still simple — `fly volumes create`, attach it, deploy. |
| **A small VPS** (DigitalOcean, Linode, etc.) | ~$5-6/mo | Most control, most setup — `pm2` or `systemd` to keep it running, a reverse proxy (Caddy/nginx) for HTTPS. |

For 3 people and a few hundred customers, the cheapest tier of any of
these is overkill in your favor — this is a genuinely small amount of
data.

If you outgrow SQLite later (many more techs, heavier concurrent load),
the data layer is isolated in `src/lib/db.ts` — swapping it for hosted
Postgres is a contained change, not a rewrite.

## Steps (Railway, as the easiest path)

1. Push this project to a GitHub repo.
2. In Railway, "New Project" → "Deploy from GitHub repo".
3. Add a volume, mount it at `/data`.
4. Set environment variables (see below), including `DB_PATH=/data/coolit.db`.
5. Deploy. Railway runs `npm run build` then `npm run start` automatically.
6. Open a one-off shell (Railway's "Run command" feature) and run
   `npm run seed` once to create your first logins.
7. Point your domain at it, and change the seeded passwords immediately
   from Settings.

## Environment variables

Copy `.env.example` and fill in real values wherever you deploy:

- `COOLIT_SESSION_SECRET` — long random string, signs login sessions.
- `CALL_WEBHOOK_SECRET` — long random string, protects the call webhook.
- `DB_PATH` — path to the SQLite file. Point this at your mounted volume.
- `NEXT_PUBLIC_APP_URL` — your real domain, shown on the Settings page.

## Backups

It's one file. Back it up by copying `data/coolit.db` (and the `-wal`/
`-shm` files next to it if present) somewhere safe on a schedule — most of
the platforms above offer disk snapshots too.

## Connecting a real phone system

Today, anyone can tap **Log a call** in the app the moment the phone
rings — that alone solves "only Rick knows what came in." When you're
ready to stop typing that in by hand, point a real phone provider's
webhooks at:

```
POST https://your-domain.com/api/webhooks/calls
Header: x-webhook-secret: <your CALL_WEBHOOK_SECRET>
```

Incoming calls get matched to an existing lead or customer automatically
by phone number, and show up in Intake either way.

**Which provider to actually use:**

- **OpenPhone** (recommended) — a real shared business line built for
  exactly this: everyone on the team sees the same calls and texts on
  their own phone or the OpenPhone app, and it has documented webhooks for
  calls and messages that plug straight into the endpoint above. Roughly
  $15-23/user/month. This is the cleanest fix for "Rick is the only one
  who sees calls" — the number itself becomes shared, not just the data
  about it.
- **Grasshopper** — what you mentioned, and it does forwarding/voicemail
  well, but it has no public webhook API today. The practical path is
  Grasshopper → Zapier (on a missed-call or voicemail trigger) → this
  webhook URL. That covers missed calls and voicemails, not live call
  data, since Zapier's Grasshopper integration is limited to those
  triggers.
- **Twilio** — the most flexible and often cheapest per-minute, but it's
  a build-it-yourself phone system (buying a number, writing call-routing
  rules). Worth it later if you want more control; more setup than the
  other two right now.

Either way, the manual **Log a call** button works today, for free, with
no provider at all — that's the fastest fix for the bottleneck, and it
still works forever as a fallback for whoever picks up a personal cell.
