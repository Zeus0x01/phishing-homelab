import type { LabRendererProps } from "@/lib/labs/renderer";
import { TaskList } from "@/components/lab/task-list";

export function GenericLabRenderer({ lab, onCheck, answers }: LabRendererProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-muted">{lab.description}</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
        {lab.learningObjectives.map((o) => (
          <li key={o}>{o}</li>
        ))}
      </ul>
      <TaskList lab={lab} answers={answers} onCheck={onCheck} />
    </div>
  );
}
