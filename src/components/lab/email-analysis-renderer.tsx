import { Link } from "@tanstack/react-router";
import type { LabRendererProps } from "@/lib/labs/renderer";
import { TaskList } from "@/components/lab/task-list";

export function EmailAnalysisRenderer({ lab, onCheck, answers }: LabRendererProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-muted">{lab.description}</p>
      <p className="text-sm">
        Open the sample in{" "}
        <Link to="/lab" className="text-primary underline">
          Engine
        </Link>{" "}
        to read headers, artifacts, and detections, then answer the tasks.
      </p>
      <TaskList lab={lab} answers={answers} onCheck={onCheck} />
    </div>
  );
}
