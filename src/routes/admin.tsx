import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { LabAdminPanel } from "@/components/lab/lab-admin-panel";
import { SessionAdminControls } from "@/components/lab/session-admin-controls";

export const Route = createFileRoute("/admin")({ component: Admin });

function Admin() {
  return <AppShell eyebrow="Configuration" title="Admin"><main className="mx-auto max-w-7xl px-page py-8"><LabAdminPanel /><SessionAdminControls /></main></AppShell>;
}
