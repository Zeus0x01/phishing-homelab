# Sentinel Range

Defensive **phishing-awareness training** homelab.

Every message, URL, attachment, and login page is **fictional training content** shown inside the app. Nothing here is a real phishing campaign: the app does not send email, and simulated login forms do not keep what you type.

**Try it:** [phishing-homelab.vercel.app](https://phishing-homelab.vercel.app)

---

## Who this is for

| Role | What you use |
|------|----------------|
| **Learners** | Labs, sample inbox, tasks, hints, debrief |
| **Trainers / analysts** | Engine console (artifacts, rules, verdicts), progress |
| **Content builders** | Admin → new lab or import a training `.eml` draft |

Authorized **defensive training** only.

---

## How to use (learners & trainers)

1. Open the app and pick a **lab** from the list.
2. Work through the steps (sender, authentication, links, attachments as asked).
3. Use the **Engine** view when you want a deeper look: headers, artifacts, attachment hashes, optional VirusTotal **hash lookup** links.
4. Finish the lab and review the **debrief** so the takeaways stick.

Everything is marked **TRAINING SIMULATION**. Treat it as practice, not a live mailbox.

### Attachments in training

- You see **names, types, and hashes** — not real malware files to download and run.
- “Open on VirusTotal” only looks up a hash in the browser. Training hashes may show as unknown on VirusTotal; that is normal for fictional samples.

---

## Building or editing labs (content creators)

- **Admin UI:** `/admin` → create a lab, or use **Import .eml → lab template** with a **sanitized** sample you are allowed to use for training, then review and save.
- **Files:** add JSON under `labs/` using the shape in [labs/README.md](labs/README.md).

Keep samples fictional or sanitized. Do not put real personal data into labs.

---

## Safety model (everyone)

- Email view is sanitized, sandboxed, and watermarked **TRAINING SIMULATION**.
- Scores and verdicts are for training feedback only.
- Typed “credentials” in harvest simulations are not stored or sent.

---

## For developers only

The sections below are for people who run or deploy the codebase. **Learners and trainers can ignore this.**

### Stack

React 19, TanStack Start/Router, Tailwind CSS v4, Zod lab schemas. Labs live in `labs/*.json` plus an optional database registry. Persistence uses PostgreSQL when a server env var `DATABASE_URL` is set; otherwise an embedded local fallback is used for demos.

### Local development

```sh
npm install
npm run dev
```

```sh
npm run typecheck && npm run lint && npm test && npm run build
```

### Deploy & secrets

- Prefer hosting on Vercel (Nitro preset is already configured).
- Put connection strings and keys only in the host’s **environment variable** UI — never in git, README, issues, or chat.
- If a secret was exposed, rotate it in the database/provider dashboard.

---

## Contribution

Use only for defensive security education. Lab contributions should stay fictional or properly sanitized.
