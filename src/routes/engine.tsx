import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { EngineConsole } from "@/components/engine/engine-console";

export const Route = createFileRoute("/engine")({ component: EngineRoute });

function EngineRoute() {
  return <AppShell eyebrow="Detection console" title="Engine"><EngineConsole /></AppShell>;
}
