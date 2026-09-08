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
| **Content builders** | Admin → new lab or import a training sample draft |

Authorized **defensive training** only.

---

## How to use

1. Open the app and pick a **lab** from the list.
2. Work through the steps (sender, authentication, links, attachments as asked).
3. Use the **Engine** view when you want a deeper look: headers, artifacts, attachment details, and optional VirusTotal hash lookup links.
4. Finish the lab and review the **debrief** so the takeaways stick.

Everything is marked **TRAINING SIMULATION**. Treat it as practice, not a live mailbox.

### Attachments in training

- You see **names, types, and hashes** — not real malware files to download and run.
- “Open on VirusTotal” only looks up a hash in the browser. Training hashes may show as unknown on VirusTotal; that is normal for fictional samples.

### Building training content

Open **Admin** in the app to create a lab or import a sanitized training sample, then review and save. Keep samples fictional or sanitized. Do not put real personal data into labs.

---

## Safety

- Email view is sanitized, sandboxed, and watermarked **TRAINING SIMULATION**.
- Scores and verdicts are for training feedback only.
- Typed “credentials” in harvest simulations are not stored or sent.

Use only for defensive security education.
