/**
 * Client-side EML parser for training lab import.
 * Produces a sanitized EmailSample-shaped object from a .eml text body.
 * Never executes attachments or fetches remote content.
 */

export type ParsedAuth = {
  spf: "pass" | "fail" | "none";
  dkim: "pass" | "fail" | "none";
  dmarc: "pass" | "fail" | "none";
};

export type ParsedUrl = {
  display: string;
  href: string;
  hostname: string;
  punycode: string;
  tld: string;
  suspiciousTld: boolean;
  redirectChain: string[];
};

export type ParsedAttachment = {
  name: string;
  type: string;
  sizeBytes: number;
  sha256: string;
};

export type ParsedEmailSample = {
  id: string;
  folder: string;
  fromName: string;
  fromAddr: string;
  replyTo: string;
  to: string;
  subject: string;
  date: string;
  preview: string;
  html: string;
  rawSource: string;
  headers: string;
  auth: ParsedAuth;
  urls: ParsedUrl[];
  attachments: ParsedAttachment[];
  images: { alt: string; src: string }[];
  language: { locale: string; tone: string[]; urgencyScore: number };
  sendingIps: string[];
  fakeLoginIndicators: string[];
  credentialHarvest: boolean;
};

const SUSPICIOUS_TLDS = new Set([
  "xyz", "top", "live", "click", "link", "info", "biz", "icu", "tk", "ml", "ga", "cf",
  "gq", "work", "rest", "zip", "mov", "country", "kim",
]);

const URGENCY_WORDS = [
  "urgent", "immediately", "action required", "verify", "confirm", "suspend",
  "locked", "password", "account", "invoice", "payment", "wire", "transfer",
  "within 24", "within 2 hours", "click here", "act now",
];

function headerValue(headers: string, name: string): string {
  const re = new RegExp(`^${name}:\\s*(.+)$`, "im");
  const match = headers.match(re);
  if (!match) return "";
  let value = match[1].trim();
  // Unfold simple continued header lines
  const lines = headers.split(/\r?\n/);
  let idx = lines.findIndex((l) => re.test(l));
  if (idx >= 0) {
    while (idx + 1 < lines.length && /^\s/.test(lines[idx + 1])) {
      value += " " + lines[idx + 1].trim();
      idx += 1;
    }
  }
  return value.replace(/\s+/g, " ").trim();
}

function parseAddress(raw: string): { name: string; addr: string } {
  if (!raw) return { name: "", addr: "" };
  const angle = raw.match(/^(.*)<([^>]+)>\s*$/);
  if (angle) {
    return {
      name: angle[1].replace(/^["]|["]$/g, "").trim() || angle[2],
      addr: angle[2].trim().toLowerCase(),
    };
  }
  if (raw.includes("@")) return { name: raw, addr: raw.trim().toLowerCase() };
  return { name: raw, addr: raw };
}

function parseAuthResult(value: string, key: "spf" | "dkim" | "dmarc"): "pass" | "fail" | "none" {
  const lower = value.toLowerCase();
  const re = new RegExp(`${key}\\s*=\\s*(pass|fail|softfail|none|neutral|temperror|permerror)`, "i");
  const m = lower.match(re);
  if (!m) return "none";
  const v = m[1].toLowerCase();
  if (v === "pass") return "pass";
  if (v === "fail" || v === "softfail" || v === "permerror") return "fail";
  return "none";
}

function extractUrls(html: string, text: string): ParsedUrl[] {
  const seen = new Set<string>();
  const urls: ParsedUrl[] = [];

  const hrefRe = /href\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = hrefRe.exec(html))) {
    pushUrl(m[1], m[1]);
  }

  const bareRe = /https?:\/\/[^\s<>"']+/gi;
  while ((m = bareRe.exec(html + "\n" + text))) {
    pushUrl(m[0], m[0]);
  }

  function pushUrl(display: string, href: string) {
    const cleaned = href.trim().replace(/[)>,.;]+$/, "");
    if (!cleaned.startsWith("http") || seen.has(cleaned)) return;
    seen.add(cleaned);
    try {
      const u = new URL(cleaned);
      const hostname = u.hostname.toLowerCase();
      const parts = hostname.split(".");
      const tld = parts[parts.length - 1] || "";
      urls.push({
        display: display.slice(0, 120),
        href: cleaned,
        hostname,
        punycode: hostname,
        tld,
        suspiciousTld: SUSPICIOUS_TLDS.has(tld),
        redirectChain: [cleaned],
      });
    } catch {
      // skip invalid
    }
  }

  return urls;
}

function extractSendingIps(headers: string): string[] {
  const ips: string[] = [];
  const re = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g;
  const received = headers.match(/^Received:.*$/gim) ?? [];
  for (const line of received) {
    const m = line.match(re);
    if (m) ips.push(...m);
  }
  return [...new Set(ips)].slice(0, 8);
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function urgencyScore(text: string): number {
  const lower = text.toLowerCase();
  let score = 10;
  for (const word of URGENCY_WORDS) {
    if (lower.includes(word)) score += 12;
  }
  return Math.min(100, score);
}

function toneFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const tones: string[] = [];
  if (/urgent|immediately|action required|within \d/.test(lower)) tones.push("urgent");
  if (/password|account|verify|login|sign.?in/.test(lower)) tones.push("credential");
  if (/invoice|payment|wire|transfer|payroll|refund/.test(lower)) tones.push("finance");
  if (/microsoft|office|outlook|google|apple|amazon|paypal/.test(lower)) tones.push("brand");
  if (tones.length === 0) tones.push("informational");
  return tones;
}

function splitHeadersAndBody(raw: string): { headers: string; body: string } {
  const normalized = raw.replace(/\r\n/g, "\n");
  const idx = normalized.search(/\n\n/);
  if (idx < 0) return { headers: normalized, body: "" };
  return {
    headers: normalized.slice(0, idx).trim(),
    body: normalized.slice(idx + 2),
  };
}

function extractHtmlPart(body: string, contentType: string): string {
  if (/multipart/i.test(contentType)) {
    const boundaryMatch = contentType.match(/boundary="?([^";\s]+)"?/i);
    if (boundaryMatch) {
      const boundary = boundaryMatch[1];
      const parts = body.split(`--${boundary}`);
      for (const part of parts) {
        if (/Content-Type:\s*text\/html/i.test(part)) {
          const pIdx = part.search(/\n\n/);
          if (pIdx >= 0) {
            let html = part.slice(pIdx + 2).trim();
            if (/Content-Transfer-Encoding:\s*base64/i.test(part)) {
              try {
                html = atob(html.replace(/\s+/g, ""));
              } catch {
                /* keep as-is */
              }
            } else if (/Content-Transfer-Encoding:\s*quoted-printable/i.test(part)) {
              html = html.replace(/=\r?\n/g, "").replace(/=([0-9A-Fa-f]{2})/g, (_, h) =>
                String.fromCharCode(parseInt(h, 16)),
              );
            }
            return html;
          }
        }
      }
    }
  }
  if (/text\/html/i.test(contentType) || /<html|<body|<p[\s>]/i.test(body)) {
    return body;
  }
  // plain text → simple HTML
  return `<p>${body.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/\n/g, "<br/>")}</p>`;
}

/** Deterministic fake SHA-256 for training metadata (not a real file hash). */
export function trainingHash(seed: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5 ^ 0xdeadbeef;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ (c + i), 0x01000193) >>> 0;
  }
  const hex = (n: number) => n.toString(16).padStart(8, "0");
  const base = `${hex(h1)}${hex(h2)}${hex(h1 ^ h2)}${hex(~h1 >>> 0)}`;
  return (base + base).slice(0, 64);
}

function extractAttachmentMeta(headers: string, body: string): ParsedAttachment[] {
  const atts: ParsedAttachment[] = [];
  const nameRe = /filename\*?=(?:UTF-8''|"?)([^";\n]+)/gi;
  let m: RegExpExecArray | null;
  const blob = headers + "\n" + body.slice(0, 8000);
  while ((m = nameRe.exec(blob))) {
    const name = decodeURIComponent(m[1].replace(/"/g, "").trim());
    if (!name || name.length > 200) continue;
    if (atts.some((a) => a.name === name)) continue;
    const ext = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1).toLowerCase() : "bin";
    const typeMap: Record<string, string> = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      zip: "application/zip",
      rar: "application/x-rar-compressed",
      iso: "application/x-iso9660-image",
      html: "text/html",
      htm: "text/html",
      exe: "application/x-msdownload",
      js: "application/javascript",
      vbs: "text/vbscript",
    };
    atts.push({
      name,
      type: typeMap[ext] ?? "application/octet-stream",
      sizeBytes: 0,
      sha256: trainingHash(`${name}:${ext}:training`),
    });
  }
  return atts;
}

export function parseEml(raw: string, options?: { sampleId?: string; folder?: string }): ParsedEmailSample {
  const { headers, body } = splitHeadersAndBody(raw);
  const contentType = headerValue(headers, "Content-Type") || "text/plain";
  const fromRaw = headerValue(headers, "From");
  const replyRaw = headerValue(headers, "Reply-To") || fromRaw;
  const toRaw = headerValue(headers, "To");
  const subject = headerValue(headers, "Subject") || "(no subject)";
  const date = headerValue(headers, "Date") || new Date().toUTCString();
  const authHeader =
    headerValue(headers, "Authentication-Results") ||
    headerValue(headers, "Authentication-Results-Original") ||
    "";

  const from = parseAddress(fromRaw);
  const reply = parseAddress(replyRaw);
  const to = parseAddress(toRaw);

  const html = extractHtmlPart(body, contentType);
  const text = stripHtml(html);
  const urls = extractUrls(html, text);
  const attachments = extractAttachmentMeta(headers, body);
  const auth: ParsedAuth = {
    spf: parseAuthResult(authHeader, "spf"),
    dkim: parseAuthResult(authHeader, "dkim"),
    dmarc: parseAuthResult(authHeader, "dmarc"),
  };

  const tones = toneFromText(subject + " " + text);
  const credentialHarvest =
    tones.includes("credential") ||
    urls.some((u) => /login|signin|verify|account|password/i.test(u.href));

  const id =
    options?.sampleId ||
    `import-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  // Cap stored HTML for training safety / size
  const safeHtml = html.slice(0, 50_000);
  const safeHeaders = headers.slice(0, 12_000);
  const safeRaw = raw.slice(0, 20_000);

  return {
    id,
    folder: options?.folder ?? "Imported",
    fromName: from.name || from.addr,
    fromAddr: from.addr || "unknown@imported.invalid",
    replyTo: reply.addr || from.addr,
    to: to.addr || "trainee@lab.example",
    subject: subject.slice(0, 300),
    date,
    preview: text.slice(0, 160),
    html: safeHtml,
    rawSource: safeRaw,
    headers: safeHeaders,
    auth,
    urls,
    attachments,
    images: [],
    language: {
      locale: "en",
      tone: tones,
      urgencyScore: urgencyScore(subject + " " + text),
    },
    sendingIps: extractSendingIps(headers),
    fakeLoginIndicators: credentialHarvest
      ? ["possible credential collection language", "review URL host vs claimed brand"]
      : [],
    credentialHarvest,
  };
}

export function buildLabDraftFromSample(
  sample: ParsedEmailSample,
  overrides?: { id?: string; title?: string; difficulty?: string },
): Record<string, unknown> {
  const domain = sample.fromAddr.includes("@")
    ? sample.fromAddr.split("@")[1]
    : sample.fromAddr;
  const primaryHost = sample.urls[0]?.hostname ?? domain;

  const labId =
    overrides?.id ||
    `imported-${domain.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase().slice(0, 40) || "sample"}`;

  return {
    id: labId,
    title: overrides?.title || `Imported: ${sample.subject.slice(0, 60)}`,
    description:
      "Lab generated from a sanitized .eml import. Review and edit steps, hashes, and URLs before publishing. All content is for defensive training only.",
    difficulty: overrides?.difficulty || "intermediate",
    category: "email",
    minutes: 20,
    learningObjectives: [
      "Separate display name from the real From address",
      "Read SPF / DKIM / DMARC results",
      "Identify suspicious link destinations",
      sample.attachments.length
        ? "Inspect attachment metadata and hash without opening the file"
        : "Document reply-to and authentication mismatches",
    ],
    steps: [
      {
        id: "s1",
        title: "Identify the sending domain",
        prompt: "What domain appears in the From address?",
        hint: "Look after the @ sign, not the display name.",
        checkType: "flag",
        expected: [domain, `from:${domain}`],
        points: 15,
      },
      {
        id: "s2",
        title: "Authentication",
        prompt: "Did SPF pass, fail, or none?",
        checkType: "choice",
        choices: ["pass", "fail", "none"],
        expected: [sample.auth.spf],
        points: 15,
      },
      {
        id: "s3",
        title: "Link destination",
        prompt: "What hostname does the primary link resolve to in the template?",
        checkType: "flag",
        expected: [primaryHost],
        points: 20,
      },
      {
        id: "s4",
        title: "Reply-To",
        prompt: "Is Reply-To the same as From? Answer yes or no.",
        checkType: "choice",
        choices: ["yes", "no"],
        expected: [
          sample.replyTo.toLowerCase() === sample.fromAddr.toLowerCase() ? "yes" : "no",
        ],
        points: 10,
      },
    ],
    hints: [
      "Display names are free text. The address after @ is what you can verify.",
      "SPF fail + lookalike domain is stronger evidence than urgency language alone.",
      "Open the Engine tab to review extracted artifacts and attachment hashes.",
    ],
    scoringRubric: [
      { id: "r1", description: "Correct sending domain", points: 15 },
      { id: "r2", description: "Correct SPF reading", points: 15 },
      { id: "r3", description: "Correct link hostname", points: 20 },
      { id: "r4", description: "Reply-To relationship", points: 10 },
    ],
    flags: [
      {
        id: "sending-domain",
        label: "From domain",
        check: "contains",
        value: domain,
        points: 15,
      },
    ],
    renderer: "email-analysis",
    published: false,
    emailSamples: [sample],
  };
}
