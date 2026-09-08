import { Link } from "@tanstack/react-router";
import type { LabRendererProps } from "@/lib/labs/renderer";
import { TaskList } from "@/components/lab/task-list";

export function UrlTypospotRenderer({ lab, onCheck, answers }: LabRendererProps) {
  const urls = lab.emailSamples.flatMap((s) => s.urls);
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-muted">{lab.description}</p>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-xl text-left text-sm">
          <thead className="border-b border-border text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Display</th>
              <th className="px-3 py-2 font-medium">Hostname</th>
              <th className="px-3 py-2 font-medium">Punycode</th>
              <th className="px-3 py-2 font-medium">TLD</th>
            </tr>
          </thead>
          <tbody>
            {urls.map((u) => (
              <tr key={u.href} className="border-b border-border/70">
                <td className="px-3 py-2">{u.display}</td>
                <td className="px-3 py-2 font-mono text-xs break-all text-primary">{u.hostname}</td>
                <td className="px-3 py-2 font-mono text-xs break-all">{u.punycode}</td>
                <td className="px-3 py-2 font-mono text-xs">
                  {u.tld}
                  {u.suspiciousTld ? <span className="ml-2 text-crit">risky</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm">
        Full redirect chains live in{" "}
        <Link to="/lab" className="text-primary underline">
          Engine
        </Link>
        .
      </p>
      <TaskList lab={lab} answers={answers} onCheck={onCheck} />
    </div>
  );
}
