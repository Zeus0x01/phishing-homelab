import type { EmailSample, LabDefinition } from "./schema";

export type ArtifactKind =
  | "sender"
  | "reply-to"
  | "domain"
  | "auth"
  | "url"
  | "attachment"
  | "image"
  | "language"
  | "ip"
  | "header";

export type Artifact = {
  id: string;
  kind: ArtifactKind;
  label: string;
  value: string;
  meta: Record<string, string | number | boolean>;
};

export type ExtractedSample = {
  labId: string;
  labTitle: string;
  sampleId: string;
  subject: string;
  fromName: string;
  fromAddr: string;
  replyTo: string;
  to: string;
  date: string;
  folder: string;
  html: string;
  headers: string;
  rawSource: string;
  artifacts: Artifact[];
};

function domainOf(addr: string): string {
  const at = addr.lastIndexOf("@");
  return at >= 0 ? addr.slice(at + 1).toLowerCase() : addr.toLowerCase();
}

export function extractArtifacts(lab: LabDefinition, sample: EmailSample): ExtractedSample {
  const artifacts: Artifact[] = [];
  const sid = `${lab.id}:${sample.id}`;

  artifacts.push({
    id: `${sid}:sender`,
    kind: "sender",
    label: "Sender address",
    value: sample.fromAddr,
    meta: { name: sample.fromName, domain: domainOf(sample.fromAddr) },
  });
  artifacts.push({
    id: `${sid}:sender-domain`,
    kind: "domain",
    label: "Sender domain",
    value: domainOf(sample.fromAddr),
    meta: { role: "from" },
  });
  artifacts.push({
    id: `${sid}:reply-to`,
    kind: "reply-to",
    label: "Reply-To",
    value: sample.replyTo,
    meta: {
      domain: domainOf(sample.replyTo),
      mismatch: domainOf(sample.replyTo) !== domainOf(sample.fromAddr),
    },
  });
  artifacts.push({
    id: `${sid}:spf`,
    kind: "auth",
    label: "SPF",
    value: sample.auth.spf,
    meta: { protocol: "spf" },
  });
  artifacts.push({
    id: `${sid}:dkim`,
    kind: "auth",
    label: "DKIM",
    value: sample.auth.dkim,
    meta: { protocol: "dkim" },
  });
  artifacts.push({
    id: `${sid}:dmarc`,
    kind: "auth",
    label: "DMARC",
    value: sample.auth.dmarc,
    meta: { protocol: "dmarc" },
  });

  sample.urls.forEach((u, i) => {
    artifacts.push({
      id: `${sid}:url:${i}`,
      kind: "url",
      label: u.display,
      value: u.href,
      meta: {
        hostname: u.hostname,
        punycode: u.punycode,
        tld: u.tld,
        suspiciousTld: u.suspiciousTld,
        hops: u.redirectChain.length,
        chain: u.redirectChain.join(" → "),
      },
    });
  });

  sample.attachments.forEach((a, i) => {
    const ext = a.name.includes(".") ? a.name.slice(a.name.lastIndexOf(".") + 1).toLowerCase() : "";
    artifacts.push({
      id: `${sid}:att:${i}`,
      kind: "attachment",
      label: a.name,
      value: a.sha256,
      meta: { type: a.type, sizeBytes: a.sizeBytes, ext, sha256: a.sha256 },
    });
  });

  sample.images.forEach((img, i) => {
    artifacts.push({
      id: `${sid}:img:${i}`,
      kind: "image",
      label: img.alt || "embedded image",
      value: img.src,
      meta: { src: img.src },
    });
  });

  artifacts.push({
    id: `${sid}:lang`,
    kind: "language",
    label: "Tone",
    value: sample.language.tone.join(", "),
    meta: {
      locale: sample.language.locale,
      urgencyScore: sample.language.urgencyScore,
      credentialHarvest: sample.credentialHarvest,
      fakeLoginIndicators: sample.fakeLoginIndicators.join("; ") || "none",
      indicatorCount: sample.fakeLoginIndicators.length,
    },
  });

  sample.sendingIps.forEach((ip, i) => {
    artifacts.push({
      id: `${sid}:ip:${i}`,
      kind: "ip",
      label: "Sending IP",
      value: ip,
      meta: { ip },
    });
  });

  artifacts.push({
    id: `${sid}:hdr`,
    kind: "header",
    label: "Raw headers",
    value: sample.headers,
    meta: {},
  });

  return {
    labId: lab.id,
    labTitle: lab.title,
    sampleId: sample.id,
    subject: sample.subject,
    fromName: sample.fromName,
    fromAddr: sample.fromAddr,
    replyTo: sample.replyTo,
    to: sample.to,
    date: sample.date,
    folder: sample.folder,
    html: sample.html,
    headers: sample.headers,
    rawSource: sample.rawSource,
    artifacts,
  };
}

export function collectAllSamples(labs: LabDefinition[]): ExtractedSample[] {
  return labs.flatMap((lab) => lab.emailSamples.map((s) => extractArtifacts(lab, s)));
}
