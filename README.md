# Sentinel Range

Defensive **phishing-awareness training** homelab.

Every message, URL, attachment, and login page is **fictional template data** rendered inside the app. The app does not send mail, does not perform live lookups against real samples, and does not store values typed into simulated credential forms.

**Live demo:** [phishing-homelab.vercel.app](https://phishing-homelab.vercel.app)

---

## What it is

- Train analysts and employees on how to **spot** phishing (headers, auth results, links, attachments).
- Labs are JSON templates under `labs/` (and optional database-backed labs via Admin).
- Engine console for artifact review, rules, hunting queries, and simulated response actions.
- Optional **Import .eml** helper on the Admin page to turn a sanitized `.eml` into a lab draft.

This project is for **authorized defensive training only**.

---

## Security (read this)

- **Never commit secrets.** Do not put database passwords, API keys, or connection strings in the repo, README, issues, or screenshots.
- Configure persistence only through your host’s **environment variables** (e.g. Vercel → Project Settings → Environment Variables).
- Use a variable named `DATABASE_URL` for PostgreSQL when you want durable storage. If it is unset, the app uses a local embedded fallback suitable for demos.
- Rotate any credential that was ever pasted into chat, email, or a public page.
- Only import `.eml` samples you are allowed to analyze. Prefer sanitized research corpora. Do not open real malware on a production machine.
- Attachment handling stores **metadata and hashes only** — not file binaries. VirusTotal links in the UI are **hash lookups** (no upload from this app).

---

## Stack (high level)

| Area | Choice |
|------|--------|
| UI | React 19, TanStack Start/Router, Tailwind CSS v4 |
| Validation | Zod lab schemas |
| Labs | `labs/*.json` + optional DB registry |
| Persistence | PostgreSQL when `DATABASE_URL` is set; embedded fallback otherwise |
| Deploy | Vercel (Nitro preset in `vite.config.ts`) |

---

## Run locally

```sh
npm install
npm run dev
```

Before shipping changes:

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

---

## Deploy (Vercel)

1. Import this repository in Vercel.
2. In **Environment Variables**, set `DATABASE_URL` to your Postgres connection string **only in the Vercel UI** (Production / Preview as needed).
3. Deploy. Migrations run as part of the build when `DATABASE_URL` is present.

Do **not** write real connection strings into this README or any tracked file.

---

## Add a lab

### Option A — JSON file

Create a file in `labs/` following [labs/README.md](labs/README.md). Include at least one step, learning objectives, a `renderer` (`generic`, `email-analysis`, `url-typospot`, or `credential-harvest`), and template `emailSamples` with static URLs and auth metadata.

### Option B — Admin UI

1. Open `/admin`.
2. Use **New lab**, or **Import .eml → lab template** with a sanitized `.eml`.
3. Review the JSON draft (set `published` when ready).
4. **Save definition** (database-backed labs only; file templates remain read-only).

---

## Safety model

- Rendered email is sanitized, shown in a sandboxed iframe, and watermarked **TRAINING SIMULATION**.
- Verdicts and progress are training analytics, not production SOC telemetry.
- No user-entered credential value is persisted or transmitted.

---

## License / contribution

Use only for defensive security education. When contributing labs, keep all artifacts fictional or properly sanitized and avoid real personal data.
