import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-smL0uvz7.js
var DURATION_MS = 18e5;
var LAB_BANNER = "CLOSED TRAINING LAB — fictional artifacts, no mail is sent, no credentials leave this browser.";
var emails = [
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
X-Mailer: Microsoft Outlook 16.0
Authentication-Results: mx.northwind-lab.com; spf=fail; dkim=none; dmarc=fail`,
		auth: {
			spf: "fail",
			dkim: "none",
			dmarc: "fail"
		},
		attachments: []
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
    for <ap@northwind-lab.com>; Mon, 07 Sep 2026 09:51:06 +0000
From: "Rania Haddad" <rania.haddad@atlas-parts.co>
To: ap@northwind-lab.com
Subject: Updated wiring instructions — Invoice AT-88421
Date: Mon, 07 Sep 2026 09:51:04 +0000
Message-ID: <rania.88421@atlas-parts.co>
Authentication-Results: mx.northwind-lab.com; spf=pass; dkim=pass; dmarc=pass`,
		auth: {
			spf: "pass",
			dkim: "pass",
			dmarc: "pass"
		},
		attachments: []
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
		headers: `Return-Path: <bounce@mail.phish-delivery.net>
Received: from mail.phish-delivery.net ([185.199.108.153])
    by mx.northwind-lab.com; Mon, 07 Sep 2026 09:32:12 +0000
From: "Billing Desk" <invoices@docs-share.live>
To: finance@northwind-lab.com
Subject: Invoice 90441.pdf
Authentication-Results: mx.northwind-lab.com; spf=fail; dkim=none; dmarc=fail`,
		auth: {
			spf: "fail",
			dkim: "none",
			dmarc: "fail"
		},
		attachments: [{
			id: "a1",
			name: "Invoice_90441.pdf.html",
			size: "18 KB",
			type: "text/html"
		}]
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
<p data-qr="1"></p>
<p>HR Payroll — do not forward.</p>`,
		headers: `From: "HR Payroll" <payroll@hr-northwind.net>
To: allstaff@northwind-lab.com
Subject: Scan to confirm your 2026 benefits enrollment
Authentication-Results: mx.northwind-lab.com; spf=fail; dkim=none; dmarc=fail`,
		auth: {
			spf: "fail",
			dkim: "none",
			dmarc: "fail"
		},
		attachments: []
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
Authentication-Results: mx.northwind-lab.com; spf=fail; dkim=fail; dmarc=fail
(Note: display From uses the org domain; envelope is mail.phish-delivery.net)`,
		auth: {
			spf: "fail",
			dkim: "fail",
			dmarc: "fail"
		},
		attachments: []
	}
];
var attachmentSource = `<!DOCTYPE html>
<html>
<head><title>Invoice 90441</title></head>
<body>
  <!-- Training sample: HTML lure disguised as a PDF -->
  <h1>Secure document</h1>
  <p>Click to view invoice.</p>
  <script>
    // Lab sample only — would redirect a victim browser
    window.location = "https://secure-verify.live/login.php?src=invoice";
  <\/script>
</body>
</html>`;
var engine = {
	campaignId: "PH-2026-0907-441",
	score: 94,
	status: "Active",
	techniques: [
		"Brand impersonation (Microsoft)",
		"Urgency / time pressure",
		"Credential harvesting form",
		"Look-alike / nested domain",
		"Redirect chain (2 hops)",
		"HTML attachment lure",
		"QR (quishing)",
		"Business email compromise (vendor mailbox)"
	],
	url: {
		original: "https://login.microsoftonline.com.secure-verify.live/auth?token=8f3a9c2e1b7d",
		hop1: "https://secure-verify.live/r/8f3a9c2e",
		final: "https://secure-verify.live/login.php"
	},
	infra: {
		ip: "185.199.108.153",
		asn: "AS13335 (Cloudflare)",
		registrar: "Namecheap",
		privacy: true,
		domain: "secure-verify.live",
		created: "04 Sep 2026",
		ageDays: 3,
		ssl: "Let's Encrypt (issued 2 days ago)"
	},
	similar: 3,
	sandbox: "Page loads clean — no malware drop. Pure credential phishing + MFA field."
};
var sms = {
	from: "MS-ALERT",
	body: "Microsoft: Unusual sign-in from Cairo. Verify now http://sec-vfy.live/m/8f3a",
	time: "10:16 UTC"
};
var voice = {
	ticket: "SOC-441-V",
	note: "Employee reported a callback from +20-12-XXXX claiming to be Microsoft support. Caller already knew the finance shared mailbox. Asked the user to read an authenticator code."
};
var questions = [
	{
		id: "q1",
		points: 10,
		kind: "text",
		prompt: "What is the primary malicious domain used for credential collection?",
		hint: "Final landing host, not the nested look-alike FQDN.",
		accept: [
			"secure-verify.live",
			"https://secure-verify.live",
			"https://secure-verify.live/login.php"
		]
	},
	{
		id: "q2",
		points: 10,
		kind: "text",
		prompt: "What is the IP address of the sending mail server used by the spoofed Microsoft mail?",
		hint: "First Received hop on e1.",
		accept: ["185.199.108.153"]
	},
	{
		id: "q3",
		points: 10,
		kind: "text",
		prompt: "How many days old is the malicious domain (registration age)?",
		hint: "Engine WHOIS.",
		accept: [
			"3",
			"3 days",
			"three"
		]
	},
	{
		id: "q4",
		points: 5,
		kind: "text",
		prompt: "What is the Discover-Phish detection score?",
		hint: "Dashboard header.",
		accept: [
			"94",
			"94/100",
			"94 / 100"
		]
	},
	{
		id: "q5",
		points: 10,
		kind: "choice",
		prompt: "Main social-engineering technique in the Microsoft-branded mail body?",
		hint: "Look at tone and deadline.",
		choices: [
			"Humor / rapport",
			"Urgency / time pressure",
			"Authority of a CEO only",
			"Prize / lottery"
		],
		accept: ["Urgency / time pressure"]
	},
	{
		id: "q6",
		points: 10,
		kind: "text",
		prompt: "How many redirect hops are in the URL chain (engine)?",
		hint: "Original → hop → final.",
		accept: [
			"2",
			"two",
			"2 hops"
		]
	},
	{
		id: "q7",
		points: 15,
		kind: "choice",
		prompt: "Is the Microsoft-branded From address a legitimate Microsoft domain?",
		hint: "Compare microsoft-support.online vs microsoft.com.",
		choices: ["Yes — microsoft-support.online is Microsoft", "No — look-alike domain, not owned by Microsoft"],
		accept: ["No — look-alike domain, not owned by Microsoft"]
	},
	{
		id: "q8",
		points: 15,
		kind: "choice",
		prompt: "After the victim submits email + password + MFA on the clone page, what is the attacker’s most likely goal?",
		hint: "Form asks for a security code, then redirects to the real site.",
		choices: [
			"Drop ransomware via the login form",
			"Harvest credentials and a live session / MFA code (AiTM)",
			"Mine cryptocurrency in the browser",
			"Deface microsoft.com"
		],
		accept: ["Harvest credentials and a live session / MFA code (AiTM)"]
	},
	{
		id: "q9",
		points: 10,
		kind: "choice",
		prompt: "Which message is NOT spoofed (auth passes) but is still phishing?",
		hint: "SPF/DKIM/DMARC all pass.",
		choices: [
			"Microsoft Account Security (e1)",
			"Rania Haddad / Atlas Parts wire-change (e2)",
			"Invoice 90441 attachment (e3)",
			"HR Payroll QR (e4)"
		],
		accept: ["Rania Haddad / Atlas Parts wire-change (e2)"]
	},
	{
		id: "q10",
		points: 15,
		kind: "choice",
		prompt: "Which authentication results failed on the spoofed Microsoft message?",
		hint: "Authentication-Results header.",
		choices: [
			"Only DKIM",
			"SPF and DMARC (DKIM none)",
			"All three passed",
			"Only BIMI"
		],
		accept: ["SPF and DMARC (DKIM none)"]
	}
];
var totalPoints = questions.reduce((s, q) => s + q.points, 0);
function normalize(s) {
	return s.trim().toLowerCase().replace(/\/+$/, "").replace(/^https?:\/\//, "");
}
function grade(id, value) {
	const q = questions.find((x) => x.id === id);
	if (!q) return false;
	const n = normalize(value);
	return q.accept.some((a) => normalize(a) === n);
}
function remainingMs(startedAt) {
	if (!startedAt) return DURATION_MS;
	return Math.max(0, DURATION_MS - (Date.now() - startedAt));
}
function computeScore(answers) {
	let score = 0;
	const detail = [];
	for (const q of questions) {
		const ok = grade(q.id, answers[q.id] ?? "");
		if (ok) score += q.points;
		detail.push({
			id: q.id,
			ok,
			points: q.points
		});
	}
	return {
		score,
		detail
	};
}
var useLab = create()(persist((set) => ({
	startedAt: null,
	answers: {},
	submitted: false,
	lureTried: false,
	inspectedAttach: false,
	qrScanned: false,
	start: () => set({
		startedAt: Date.now(),
		submitted: false,
		answers: {}
	}),
	setAnswer: (id, v) => set((s) => ({ answers: {
		...s.answers,
		[id]: v
	} })),
	submit: () => set({ submitted: true }),
	reset: () => set({
		startedAt: null,
		answers: {},
		submitted: false,
		lureTried: false,
		inspectedAttach: false,
		qrScanned: false
	}),
	markLure: () => set({ lureTried: true }),
	markAttach: () => set({ inspectedAttach: true }),
	markQr: () => set({ qrScanned: true })
}), { name: "phishlab-ctf" }));
//#endregion
export { engine as a, sms as c, voice as d, emails as i, totalPoints as l, attachmentSource as n, questions as o, computeScore as r, remainingMs as s, LAB_BANNER as t, useLab as u };
