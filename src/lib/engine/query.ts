import type { ExtractedSample } from "@/lib/labs/artifacts";

export type HuntHit = {
  sample: ExtractedSample;
  why: string;
};

function wildcard(value: string, pattern: string) {
  const re = new RegExp(
    "^" +
      pattern
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*")
        .replace(/\?/g, ".") +
      "$",
    "i",
  );
  return re.test(value);
}

function domainOf(addr: string) {
  const at = addr.lastIndexOf("@");
  return (at >= 0 ? addr.slice(at + 1) : addr).toLowerCase();
}

export function runHuntQuery(query: string, samples: ExtractedSample[]): HuntHit[] {
  const q = query.trim();
  if (!q) return samples.map((s) => ({ sample: s, why: "all samples" }));

  if (/header\.reply-to\s*!=\s*sender/i.test(q)) {
    return samples
      .filter((s) => domainOf(s.replyTo) !== domainOf(s.fromAddr))
      .map((s) => ({ sample: s, why: "reply-to domain != sender domain" }));
  }

  const term = /^([a-z0-9._-]+):(.*)$/i.exec(q);
  if (!term) {
    const needle = q.toLowerCase();
    return samples
      .filter((s) => JSON.stringify(s).toLowerCase().includes(needle))
      .map((s) => ({ sample: s, why: `contains "${q}"` }));
  }

  const key = term[1].toLowerCase();
  const value = term[2].trim();
  const hits: HuntHit[] = [];

  for (const s of samples) {
    if (key === "domain") {
      const domains = s.artifacts.filter((a) => a.kind === "domain" || a.kind === "url");
      for (const a of domains) {
        const host = String(a.kind === "url" ? a.meta.hostname : a.value);
        if (wildcard(host, value) || wildcard(a.value, value)) {
          hits.push({ sample: s, why: `${a.label} ${host}` });
          break;
        }
      }
    } else if (key === "hash" || key === "sha256") {
      const att = s.artifacts.find(
        (a) => a.kind === "attachment" && a.value.toLowerCase().includes(value.toLowerCase()),
      );
      if (att) hits.push({ sample: s, why: `hash ${att.value}` });
    } else if (key === "tld") {
      const u = s.artifacts.find((a) => a.kind === "url" && String(a.meta.tld).toLowerCase() === value.toLowerCase());
      if (u) hits.push({ sample: s, why: `tld ${value}` });
    } else if (key === "sender") {
      if (wildcard(s.fromAddr, value) || s.fromAddr.toLowerCase().includes(value.toLowerCase())) {
        hits.push({ sample: s, why: s.fromAddr });
      }
    } else if (key === "subject") {
      if (wildcard(s.subject, value) || s.subject.toLowerCase().includes(value.toLowerCase())) {
        hits.push({ sample: s, why: s.subject });
      }
    } else {
      if (JSON.stringify(s).toLowerCase().includes(value.toLowerCase())) {
        hits.push({ sample: s, why: `${key}:${value}` });
      }
    }
  }
  return hits;
}
