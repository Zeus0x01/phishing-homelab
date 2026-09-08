import { Link } from "@tanstack/react-router";
import type { LabRendererProps } from "@/lib/labs/renderer";
import { TaskList } from "@/components/lab/task-list";

export function CredentialHarvestRenderer({ lab, onCheck, answers }: LabRendererProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-muted">{lab.description}</p>
      <div className="rounded-xl border border-warn/40 bg-warn/10 p-4 text-sm text-warn">
        The portal is a local mock. Submitting it records only that you reached the intercept — never the
        typed values.
      </div>
      <Link
        to="/web"
        className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-bg"
      >
        Open sandboxed portal
      </Link>
      <TaskList lab={lab} answers={answers} onCheck={onCheck} />
    </div>
  );
}
