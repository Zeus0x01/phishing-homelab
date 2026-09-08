const BLOCKED_TAGS = /<\/?(script|iframe|object|embed|form|link|meta|base|svg|math)[^>]*>/gi;
const EVENT_ATTR = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URL = /\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi;

export type SanitizedMail = {
  html: string;
  links: { text: string; href: string }[];
  srcDoc: string;
};

export function sanitizeTrainingHtml(html: string): SanitizedMail {
  const links: { text: string; href: string }[] = [];
  let cleaned = html.replace(BLOCKED_TAGS, "").replace(EVENT_ATTR, "").replace(JS_URL, "");

  cleaned = cleaned.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_m, attrs: string, text: string) => {
    const hrefMatch = /href\s*=\s*(['"])([\s\S]*?)\1/i.exec(attrs);
    const candidateHref = hrefMatch?.[2] ?? "";
    const href = safeTrainingUrl(candidateHref);
    const visible = text.replace(/<[^>]+>/g, "").trim() || href || "training link";
    links.push({ text: visible, href });
    return `<span class="lab-link" data-href="${escapeAttr(href)}" title="${escapeAttr(href)}">${escapeHtml(visible)}</span>`;
  });

  const watermark = `<div style="position:sticky;top:0;z-index:9;background:#7a1f1f;color:#fff;font:12px/1.4 ui-sans-serif,system-ui,sans-serif;padding:8px 12px;text-align:center;">TRAINING SIMULATION — links are inert. Hover a highlighted URL to see the real destination stored in the lab template.</div>`;
  const csp =
    "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; img-src data: cid: https:; style-src 'unsafe-inline'; font-src 'none'; script-src 'none';\">";
  const styles = `<style>
    body{font:14px/1.55 ui-sans-serif,system-ui,sans-serif;color:#1b242c;background:#f7f5f1;margin:0;padding:0 16px 24px;}
    .lab-link{color:#0b6e6a;text-decoration:underline;text-decoration-style:dotted;cursor:help;}
    .urg{color:#9b1c1c;font-weight:600;}
  </style>`;
  const srcDoc = `<!doctype html><html><head>${csp}${styles}</head><body>${watermark}${cleaned}</body></html>`;
  return { html: cleaned, links, srcDoc };
}

function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function escapeHtml(s: string) {
  return escapeAttr(s).replace(/'/g, "&#39;");
}

function safeTrainingUrl(value: string) {
  try {
    const url = new URL(value, "https://training.invalid");
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return value;
  } catch {
    return "";
  }
}
