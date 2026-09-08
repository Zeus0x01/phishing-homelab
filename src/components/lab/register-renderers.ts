import { registerLabRenderer } from "@/lib/labs/renderer";
import { EmailAnalysisRenderer } from "@/components/lab/email-analysis-renderer";
import { UrlTypospotRenderer } from "@/components/lab/url-typospot-renderer";
import { CredentialHarvestRenderer } from "@/components/lab/credential-harvest-renderer";
import { GenericLabRenderer } from "@/components/lab/generic-renderer";

let done = false;

export function ensureRenderers() {
  if (done) return;
  done = true;
  registerLabRenderer({ id: "generic", label: "Generic tasks", Component: GenericLabRenderer });
  registerLabRenderer({ id: "email-analysis", label: "Email analysis", Component: EmailAnalysisRenderer });
  registerLabRenderer({ id: "url-typospot", label: "URL / typospot", Component: UrlTypospotRenderer });
  registerLabRenderer({
    id: "credential-harvest",
    label: "Credential harvest sandbox",
    Component: CredentialHarvestRenderer,
  });
}
