# Coolit Pro

A field service console for Cool It With Rick — intake, jobs, scheduling,
invoicing, and maintenance plans, built so nothing depends on one phone in
one truck.

It's a normal web app. It runs in a browser on an iPad, a laptop, or a
phone — nothing to install from an app store. Log in, bookmark it, go.

## Why this exists

Right now Rick is the only one who sees calls come in, jobs get written on
paper, and Dexter and his wife have no visibility into either. Coolit Pro
fixes that by giving everyone the same shared board:

- **Intake** — every call, text, or walk-in lands on one board the whole
  team can see, not just whoever picked up the phone. Anyone can tap
  **Log a call** from anywhere in the app the moment it happens.
- **Jobs & Schedule** — what's happening today, who's on it, what's next.
- **Invoices** — turn a completed job into a bill in a couple of taps.
- **Maintenance plans** — track the recurring $29/mo customers and when
  they're due for a visit.
- **A webhook endpoint** ready to receive calls automatically once you
  connect a real phone provider (see DEPLOYMENT.md).

## Quick start (local)

```bash
npm install
npm run seed   # creates starter logins + a little sample data
npm run dev
```

Open http://localhost:3000. Sign in with one of the accounts the seed
script prints to your terminal (Dexter's owner login, and a Rick
technician login) — **change both passwords immediately** from the
Settings page once you're in.

There's no separate database to install — it's a single SQLite file
that gets created automatically at `data/coolit.db` the first time the
app runs, using Node's built-in SQLite support. Nothing to configure for
local use.

## Adding your team

As an Owner, go to **Settings → Add a team member** to create logins for
your wife and any other techs. Give each person their own login (don't
share one) — that's how the activity feed and "who's on this job" actually
mean something.

## Deploying it for real

See `DEPLOYMENT.md` for hosting options, environment variables, and how to
wire up real phone call routing.
