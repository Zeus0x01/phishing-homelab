import { LAB_BANNER } from "@/lib/labs/schema";

export function TrainingBanner() {
  return (
    <p className="border-b border-warn/35 bg-warn/10 px-4 py-2 text-center text-xs leading-relaxed text-warn">
      {LAB_BANNER}
    </p>
  );
}
