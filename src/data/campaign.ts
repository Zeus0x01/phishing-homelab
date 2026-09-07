export type EmailKind = "spoofed" | "compromised" | "attachment" | "qr";

export type LabEmail = {
  id: string;
  folder: "Reported" | "Finance" | "HR" | "IT";
  kind: EmailKind;
  fromName: string;
  fromAddr: string;
  to: string;
  subject: string;
  date: string;
  unread: boolean;
  preview: string;
  html: string;
  headers: string;
  auth: { spf: "pass" | "fail" | "none"; dkim: "pass" | "fail" | "none"; dmarc: "pass" | "fail" | "none" };
  attachments: { name: string; size: string; type: string; id: string }[];
};

export type Question = {
  id: string;
  points: number;
  prompt: string;
  hint: string;
  kind: "text" | "choice";
  choices?: string[];
  accept: string[];
};

export type Engine = {
  campaignId: string;
  score: number;
  status: string;
  techniques: string[];
  url: { original: string; hop1: string; final: string };
  infra: {
    ip: string;
    asn: string;
    registrar: string;
    privacy: boolean;
    domain: string;
    created: string;
    ageDays: number;
    ssl: string;
  };
  similar: number;
  sandbox: string;
};

export type LabPack = {
  id: string;
  name: string;
  code: string;
  minutes: number;
  blurb: string;
  emails: LabEmail[];
  engine: Engine;
  sms: { from: string; body: string; time: string };
  voice: { ticket: string; note: string };
  questions: Question[];
  attachmentSource: string;
  lureBrand: string;
  lureHost: string;
};

export const LAB_BANNER =
  "CLOSED TRAINING LAB — fictional artifacts, no mail is sent, no credentials leave this browser.";

const nightwireEmails: LabEmail[] = [
  {
    id: "e1",
    folder: "Reported",
    kind: "spoofed",
    fromName: "Microsoft Account Security",
    fromAddr: "security-alert@microsoft-support.online",
    to: "finance@northwind-lab.com",
    subject: "Urgent: Unusual sign-in activity detected – Action required within 24 hours",
    date: "Mon, 07 Sep 2026 10:14:18 +0000",
    unread: true,
    preview: "We detected a sign-in attempt from a new device in Cairo, Egypt…",
    html: `<p>Dear User,</p>
<p>We detected a sign-in attempt from a new device in <b>Cairo, Egypt</b> on 07 Sep 2026 at 09:47 UTC.</p>
<p>If this was not you, please secure your account immediately:</p>
<p><a data-href="lure">Review activity and secure account</a></p>
<p class="urg">Failure to act within 24 hours will result in temporary account suspension.</p>
<p>Microsoft Account Team<br/>This is an automated message. Please do not reply.</p>`,
    headers: `Return-Path: <bounce@mail.phish-delivery.net>
Received: from mail.phish-delivery.net (mail.phish-delivery.net [185.199.108.153])
    by mx.northwind-lab.com (Postfix) with ESMTPS id 4F7A2B3C1
    for <finance@northwind-lab.com>; Mon, 07 Sep 2026 10:14:22 +0000 (UTC)
From: "Microsoft Account Security" <security-alert@microsoft-support.online>
Reply-To: support@microsoft-support.online
To: finance@northwind-lab.com
Subject: Urgent: Unusual sign-in activity detected – Action required within 24 hours
Date: Mon, 07 Sep 2026 10:14:18 +0000
Message-ID: <20260907101418.5f3a2b@microsoft-support.online>
MIME-Version: 1.0
Content-Type: text/html; charset="UTF-8"
Authentication-Results: mx.northwind-lab.com; spf=fail; dkim=none; dmarc=fail`,
    auth: { spf: "fail", dkim: "none", dmarc: "fail" },
    attachments: [],
  },
  {
    id: "e2",
    folder: "Finance",
    kind: "compromised",
    fromName: "Rania Haddad",
    fromAddr: "rania.haddad@atlas-parts.co",
    to: "ap@northwind-lab.com",
    subject: "Updated wiring instructions — Invoice AT-88421",
    date: "Mon, 07 Sep 2026 09:51:04 +0000",
    unread: true,
    preview: "Please use the new account below for the remaining balance. Our bank flagged the old one…",
    html: `<p>Hi team,</p>
<p>Please use the <b>new account</b> below for the remaining balance on AT-88421. Our bank flagged the old one this morning.</p>
<p>Bank: GulfClear Private<br/>IBAN: EG3800190005000000004290118<br/>Ref: AT-88421-URGENT</p>
<p>Can you process today? I am in a supplier meeting until 18:00.</p>
<p>— Rania Haddad<br/>Accounts, Atlas Parts</p>`,
    headers: `Return-Path: <rania.haddad@atlas-parts.co>
Received: from mail.atlas-parts.co (mail.atlas-parts.co [203.0.113.44])
    by mx.northwind-lab.com with ESMTPS id 9C11
From: "Rania Haddad" <rania.haddad@atlas-parts.co>
Authentication-Results: mx.northwind-lab.com; spf=pass; dkim=pass; dmarc=pass`,
    auth: { spf: "pass", dkim: "pass", dmarc: "pass" },
    attachments: [],
  },
  {
    id: "e3",
    folder: "Finance",
    kind: "attachment",
    fromName: "Billing Desk",
    fromAddr: "invoices@docs-share.live",
    to: "finance@northwind-lab.com",
    subject: "Invoice 90441.pdf",
    date: "Mon, 07 Sep 2026 09:32:11 +0000",
    unread: true,
    preview: "Please find attached the overdue invoice. Open to view the secure document.",
    html: `<p>Please find attached the overdue invoice.</p>
<p>Open the file to view the secure document. Payment is due upon receipt.</p>
<p>Docs-Share Billing</p>`,
    headers: `Received: from mail.phish-delivery.net ([185.199.108.153])
From: "Billing Desk" <invoices@docs-share.live>
Authentication-Results: mx.northwind-lab.com; spf=fail; dkim=none; dmarc=fail`,
    auth: { spf: "fail", dkim: "none", dmarc: "fail" },
    attachments: [{ id: "a1", name: "Invoice_90441.pdf.html", size: "18 KB", type: "text/html" }],
  },
  {
    id: "e4",
    folder: "HR",
    kind: "qr",
    fromName: "HR Payroll",
    fromAddr: "payroll@hr-northwind.net",
    to: "allstaff@northwind-lab.com",
    subject: "Scan to confirm your 2026 benefits enrollment",
    date: "Mon, 07 Sep 2026 08:12:40 +0000",
    unread: false,
    preview: "Mobile enrollment is required this year. Scan the QR code before Friday.",
    html: `<p>Team,</p>
<p>Mobile enrollment is required this year. Scan the QR code before Friday to confirm your benefits.</p>
<p>HR Payroll — do not forward.</p>`,
    headers: `From: "HR Payroll" <payroll@hr-northwind.net>
Authentication-Results: mx.northwind-lab.com; spf=fail; dkim=none; dmarc=fail`,
    auth: { spf: "fail", dkim: "none", dmarc: "fail" },
    attachments: [],
  },
  {
    id: "e5",
    folder: "IT",
    kind: "spoofed",
    fromName: "IT Service Desk",
    fromAddr: "noreply@northwind-lab.com",
    to: "it-oncall@northwind-lab.com",
    subject: "Password expiry — reset via portal",
    date: "Mon, 07 Sep 2026 07:04:02 +0000",
    unread: false,
    preview: "Your directory password expires in 4 hours. Use the portal link…",
    html: `<p>Your directory password expires in 4 hours.</p>
<p>Use the portal: <span class="mono">https://login.microsoftonline.com.secure-verify.live/auth?token=it-oncall</span></p>
<p>IT Service Desk</p>`,
    headers: `From: "IT Service Desk" <noreply@northwind-lab.com>
Reply-To: help@secure-verify.live
Received: from unknown ([185.199.108.153])
Authentication-Results: mx.northwind-lab.com; spf=fail; dkim=fail; dmarc=fail`,
    auth: { spf: "fail", dkim: "fail", dmarc: "fail" },
    attachments: [],
  },
];

export const catalog: LabPack[] = [
  {
    id: "nightwire",
    name: "Operation Nightwire",
    code: "PH-2026-0907-441",
    minutes: 30,
    blurb: "Spoofed brand mail, vendor BEC, HTML invoice, QR, SMS, clone portal.",
    emails: nightwireEmails,
    engine: {
      campaignId: "PH-2026-0907-441",
      score: 94,
      status: "Active",
      techniques: [
        "Brand impersonation",
        "Urgency",
        "Credential harvesting",
        "Look-alike domain",
        "Redirect chain (2 hops)",
        "HTML lure",
        "QR",
        "BEC",
      ],
      url: {
        original: "https://login.microsoftonline.com.secure-verify.live/auth?token=8f3a9c2e1b7d",
        hop1: "https://secure-verify.live/r/8f3a9c2e",
        final: "https://secure-verify.live/login.php",
      },
      infra: {
        ip: "185.199.108.153",
        asn: "AS13335 (Cloudflare)",
        registrar: "Namecheap",
        privacy: true,
        domain: "secure-verify.live",
        created: "04 Sep 2026",
        ageDays: 3,
        ssl: "Let's Encrypt (issued 2 days ago)",
      },
      similar: 3,
      sandbox: "Page loads clean — no malware drop. Pure credential phishing + MFA field.",
    },
    sms: {
      from: "MS-ALERT",
      body: "Microsoft: Unusual sign-in from Cairo. Verify now http://sec-vfy.live/m/8f3a",
      time: "10:16 UTC",
    },
    voice: {
      ticket: "SOC-441-V",
      note: "Callback from +20-12-XXXX claiming Microsoft support. Asked the user to read an authenticator code.",
    },
    attachmentSource: `<!DOCTYPE html>
<html><body>
<h1>Secure document</h1>
<script>window.location = "https://secure-verify.live/login.php?src=invoice";</script>
</body></html>`,
    lureBrand: "Microsoft-style portal (training clone)",
    lureHost: "secure-verify.live/login.php",
    questions: [
      {
        id: "q1",
        points: 10,
        kind: "text",
        prompt: "What is the primary malicious domain used for credential collection?",
        hint: "Final landing host.",
        accept: ["secure-verify.live", "https://secure-verify.live", "https://secure-verify.live/login.php"],
      },
      {
        id: "q2",
        points: 10,
        kind: "text",
        prompt: "Sending mail server IP for the spoofed Microsoft message?",
        hint: "Received hop.",
        accept: ["185.199.108.153"],
      },
      {
        id: "q3",
        points: 10,
        kind: "text",
        prompt: "Malicious domain age in days?",
        hint: "WHOIS.",
        accept: ["3", "3 days", "three"],
      },
      {
        id: "q4",
        points: 5,
        kind: "text",
        prompt: "Discover-Phish detection score?",
        hint: "Engine header.",
        accept: ["94", "94/100", "94 / 100"],
      },
      {
        id: "q5",
        points: 10,
        kind: "choice",
        prompt: "Main technique in the Microsoft-branded body?",
        hint: "Deadline language.",
        choices: ["Humor / rapport", "Urgency / time pressure", "Prize / lottery", "CEO-only authority"],
        accept: ["Urgency / time pressure"],
      },
      {
        id: "q6",
        points: 10,
        kind: "text",
        prompt: "How many redirect hops in the URL chain?",
        hint: "Engine URL panel.",
        accept: ["2", "two", "2 hops"],
      },
      {
        id: "q7",
        points: 15,
        kind: "choice",
        prompt: "Is microsoft-support.online a legitimate Microsoft domain?",
        hint: "Look-alike.",
        choices: ["Yes", "No — look-alike domain, not owned by Microsoft"],
        accept: ["No — look-alike domain, not owned by Microsoft"],
      },
      {
        id: "q8",
        points: 15,
        kind: "choice",
        prompt: "Goal after email + password + MFA on the clone?",
        hint: "Security code field.",
        choices: [
          "Ransomware via the form",
          "Harvest credentials and a live session / MFA code (AiTM)",
          "Browser cryptominer",
          "Deface the real site",
        ],
        accept: ["Harvest credentials and a live session / MFA code (AiTM)"],
      },
      {
        id: "q9",
        points: 10,
        kind: "choice",
        prompt: "Which message is NOT spoofed (auth passes) but is still phishing?",
        hint: "SPF/DKIM/DMARC pass.",
        choices: [
          "Microsoft Account Security (e1)",
          "Rania Haddad / Atlas Parts wire-change (e2)",
          "Invoice 90441 attachment (e3)",
          "HR Payroll QR (e4)",
        ],
        accept: ["Rania Haddad / Atlas Parts wire-change (e2)"],
      },
      {
        id: "q10",
        points: 15,
        kind: "choice",
        prompt: "Auth results on the spoofed Microsoft message?",
        hint: "Headers.",
        choices: ["Only DKIM", "SPF and DMARC (DKIM none)", "All passed", "Only BIMI"],
        accept: ["SPF and DMARC (DKIM none)"],
      },
    ],
  },
  {
    id: "harbor",
    name: "Harbor Payroll",
    code: "PH-2026-0812-118",
    minutes: 20,
    blurb: "HR W-2 bait, look-alike payroll host, one-day-old domain, SMS OTP harvest.",
    emails: [
      {
        id: "h1",
        folder: "HR",
        kind: "spoofed",
        fromName: "Harbor Benefits",
        fromAddr: "noreply@harbor-hr.email",
        to: "staff@northwind-lab.com",
        subject: "Action required: 2025 W-2 is ready",
        date: "Tue, 12 Aug 2026 07:40:00 +0000",
        unread: true,
        preview: "Download your form before Friday or it will be mailed to your last address…",
        html: `<p>Your W-2 is ready.</p>
<p><a data-href="lure">Open Harbor Payroll</a></p>
<p class="urg">Download before Friday.</p>`,
        headers: `Received: from mx.bulk-relay.net ([198.51.100.22])
From: "Harbor Benefits" <noreply@harbor-hr.email>
Authentication-Results: mx.northwind-lab.com; spf=fail; dkim=fail; dmarc=fail`,
        auth: { spf: "fail", dkim: "fail", dmarc: "fail" },
        attachments: [],
      },
      {
        id: "h2",
        folder: "HR",
        kind: "attachment",
        fromName: "Tax Desk",
        fromAddr: "forms@harbor-pay.live",
        to: "staff@northwind-lab.com",
        subject: "W2-2025.pdf",
        date: "Tue, 12 Aug 2026 07:41:12 +0000",
        unread: true,
        preview: "Attached form. Enable content if prompted.",
        html: `<p>Attached form. Enable content if prompted.</p>`,
        headers: `From: forms@harbor-pay.live
Authentication-Results: mx.northwind-lab.com; spf=fail; dkim=none; dmarc=fail`,
        auth: { spf: "fail", dkim: "none", dmarc: "fail" },
        attachments: [{ id: "a2", name: "W2-2025.pdf.html", size: "22 KB", type: "text/html" }],
      },
    ],
    engine: {
      campaignId: "PH-2026-0812-118",
      score: 91,
      status: "Active",
      techniques: ["HR / W-2 bait", "Look-alike payroll host", "OTP harvest"],
      url: {
        original: "https://harborbenefits.com.harbor-pay.live/w2",
        hop1: "https://harbor-pay.live/r/w2",
        final: "https://harbor-pay.live/sso",
      },
      infra: {
        ip: "198.51.100.22",
        asn: "AS64500",
        registrar: "Porkbun",
        privacy: true,
        domain: "harbor-pay.live",
        created: "11 Aug 2026",
        ageDays: 1,
        ssl: "Let's Encrypt (same day)",
      },
      similar: 41,
      sandbox: "SSO clone asks email, password, SMS code. No payload drop.",
    },
    sms: {
      from: "HARBOR",
      body: "Harbor Payroll: confirm W-2 http://hbr-pay.live/w2",
      time: "07:44 UTC",
    },
    voice: {
      ticket: "SOC-118-H",
      note: "HR inbox flooded; no real Harbor ticket exists for W-2 reissue this week.",
    },
    attachmentSource: `<html><body><script>location="https://harbor-pay.live/sso"</script></body></html>`,
    lureBrand: "Harbor Payroll SSO (training clone)",
    lureHost: "harbor-pay.live/sso",
    questions: [
      {
        id: "q1",
        points: 15,
        kind: "text",
        prompt: "Credential-collection domain?",
        hint: "Engine infra.",
        accept: ["harbor-pay.live", "https://harbor-pay.live", "https://harbor-pay.live/sso"],
      },
      {
        id: "q2",
        points: 10,
        kind: "text",
        prompt: "Sending IP?",
        hint: "Headers / engine.",
        accept: ["198.51.100.22"],
      },
      {
        id: "q3",
        points: 10,
        kind: "text",
        prompt: "Domain age in days?",
        hint: "Created 11 Aug vs mail 12 Aug.",
        accept: ["1", "1 day", "one"],
      },
      {
        id: "q4",
        points: 10,
        kind: "text",
        prompt: "Detection score?",
        hint: "Engine.",
        accept: ["91", "91/100"],
      },
      {
        id: "q5",
        points: 15,
        kind: "choice",
        prompt: "Why is this high-yield bait?",
        hint: "Tax form.",
        choices: ["Crypto airdrop", "W-2 / payroll data", "Game key", "Survey prize"],
        accept: ["W-2 / payroll data"],
      },
    ],
  },
  {
    id: "ledger",
    name: "Quiet Ledger",
    code: "PH-2026-0701-007",
    minutes: 15,
    blurb: "Pure BEC. Auth passes. No clone page. Wire-change from a real-looking CFO thread.",
    emails: [
      {
        id: "l1",
        folder: "Finance",
        kind: "compromised",
        fromName: "Mara Chen",
        fromAddr: "mara.chen@northwind-lab.com",
        to: "ap@northwind-lab.com",
        subject: "Re: closing — send now",
        date: "Wed, 01 Jul 2026 16:02:09 +0000",
        unread: true,
        preview: "I'm in a board session. Pay the remaining 184,400 to the account in the thread…",
        html: `<p>I'm in a board session. Pay the remaining 184,400 to the account below. Do not call — phones are off.</p>
<p>IBAN GB29NWBK60161331926819 · Ref CLOSE-1844</p>
<p>— Mara</p>`,
        headers: `Return-Path: <mara.chen@northwind-lab.com>
Received: from mail.northwind-lab.com ([203.0.113.10])
Authentication-Results: mx.northwind-lab.com; spf=pass; dkim=pass; dmarc=pass
X-Note: Mailbox session from IP 45.77.88.12 (not the usual VPN)`,
        auth: { spf: "pass", dkim: "pass", dmarc: "pass" },
        attachments: [],
      },
    ],
    engine: {
      campaignId: "PH-2026-0701-007",
      score: 62,
      status: "BEC — low URL score, high business risk",
      techniques: ["Mailbox takeover", "Wire-change", "Urgency", "Do-not-call instruction"],
      url: { original: "—", hop1: "—", final: "—" },
      infra: {
        ip: "45.77.88.12",
        asn: "AS20473",
        registrar: "—",
        privacy: false,
        domain: "northwind-lab.com (legitimate, session anomaly)",
        created: "2018",
        ageDays: 2900,
        ssl: "Org cert",
      },
      similar: 1,
      sandbox: "No landing page. Payment fraud via compromised or spoof-resistant channel.",
    },
    sms: {
      from: "MARA",
      body: "AP: board asked you to process CLOSE-1844 now. Confirm in mail.",
      time: "16:05 UTC",
    },
    voice: {
      ticket: "SOC-007-B",
      note: "CFO was in a flight. She did not send the wire mail. Unusual IMAP IP 45.77.88.12.",
    },
    attachmentSource: "No file. This lab is conversation + payment fraud.",
    lureBrand: "No web lure in this lab",
    lureHost: "none",
    questions: [
      {
        id: "q1",
        points: 15,
        kind: "choice",
        prompt: "Did SPF/DKIM/DMARC fail?",
        hint: "Headers.",
        choices: ["Yes, all failed", "No — they passed; still treat as BEC"],
        accept: ["No — they passed; still treat as BEC"],
      },
      {
        id: "q2",
        points: 15,
        kind: "text",
        prompt: "Anomalous IMAP / session IP noted in headers?",
        hint: "X-Note.",
        accept: ["45.77.88.12"],
      },
      {
        id: "q3",
        points: 15,
        kind: "choice",
        prompt: "Best first control?",
        hint: "Out of band.",
        choices: [
          "Pay because auth passed",
          "Out-of-band verify with known CFO number, freeze the wire",
          "Click any portal in the thread",
        ],
        accept: ["Out-of-band verify with known CFO number, freeze the wire"],
      },
      {
        id: "q4",
        points: 10,
        kind: "text",
        prompt: "Engine detection score?",
        hint: "Lower because no lure URL.",
        accept: ["62", "62/100"],
      },
    ],
  },
  {
    id: "parcel",
    name: "Parcel Drop",
    code: "PH-2026-0915-303",
    minutes: 20,
    blurb: "Carrier SMS + QR on a fake label + HTML “label PDF”.",
    emails: [
      {
        id: "p1",
        folder: "IT",
        kind: "qr",
        fromName: "North Courier",
        fromAddr: "track@north-courier.support",
        to: "reception@northwind-lab.com",
        subject: "Delivery exception — customs",
        date: "Tue, 15 Sep 2026 11:20:00 +0000",
        unread: true,
        preview: "Scan the label QR or open the attached waybill to pay a 14.00 fee…",
        html: `<p>Package held. Pay 14.00 or it returns.</p>
<p><a data-href="lure">Open tracking</a></p>`,
        headers: `Received: from unknown ([203.0.113.90])
From: "North Courier" <track@north-courier.support>
Authentication-Results: mx.northwind-lab.com; spf=fail; dkim=none; dmarc=fail`,
        auth: { spf: "fail", dkim: "none", dmarc: "fail" },
        attachments: [{ id: "a3", name: "Waybill-44091.pdf.html", size: "9 KB", type: "text/html" }],
      },
    ],
    engine: {
      campaignId: "PH-2026-0915-303",
      score: 88,
      status: "Active",
      techniques: ["Smishing", "Quishing", "Small-fee urgency", "HTML label"],
      url: {
        original: "https://north-courier.support/track/44091",
        hop1: "https://ncourier.live/t/44091",
        final: "https://ncourier.live/pay",
      },
      infra: {
        ip: "203.0.113.90",
        asn: "AS13335",
        registrar: "Namecheap",
        privacy: true,
        domain: "ncourier.live",
        created: "14 Sep 2026",
        ageDays: 1,
        ssl: "Let's Encrypt",
      },
      similar: 12,
      sandbox: "Card form + cloned carrier branding. No malware.",
    },
    sms: {
      from: "N-COURIER",
      body: "Exception: pay 14.00 http://ncourier.live/p/44091",
      time: "11:21 UTC",
    },
    voice: {
      ticket: "SOC-303-P",
      note: "Reception almost paid. No real North Courier account on file.",
    },
    attachmentSource: `<html><body><script>location="https://ncourier.live/pay"</script></body></html>`,
    lureBrand: "North Courier pay portal (training clone)",
    lureHost: "ncourier.live/pay",
    questions: [
      {
        id: "q1",
        points: 15,
        kind: "text",
        prompt: "Payment domain?",
        hint: "Final hop.",
        accept: ["ncourier.live", "https://ncourier.live", "https://ncourier.live/pay"],
      },
      {
        id: "q2",
        points: 10,
        kind: "text",
        prompt: "Sending IP?",
        hint: "Headers.",
        accept: ["203.0.113.90"],
      },
      {
        id: "q3",
        points: 10,
        kind: "choice",
        prompt: "Primary extra-email vector?",
        hint: "SMS + QR.",
        choices: ["USB drop", "Smishing / quishing", "Printer firmware", "Wi-Fi pineapple only"],
        accept: ["Smishing / quishing"],
      },
      {
        id: "q4",
        points: 10,
        kind: "text",
        prompt: "Detection score?",
        hint: "Engine.",
        accept: ["88", "88/100"],
      },
    ],
  },
];

export function getLab(id: string | null | undefined) {
  return catalog.find((l) => l.id === id) ?? catalog[0];
}

export function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\/+$/, "").replace(/^https?:\/\//, "");
}

export function gradeQuestion(q: Question, value: string) {
  const n = normalize(value);
  return q.accept.some((a) => normalize(a) === n);
}

export function totalFor(qs: Question[]) {
  return qs.reduce((s, q) => s + q.points, 0);
}
