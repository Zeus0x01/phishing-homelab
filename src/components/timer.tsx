import { useEffect, useState } from "react";
import { remainingMs } from "@/lib/store";

export function Timer({
  startedAt,
  minutes,
  onExpire,
}: {
  startedAt: number | null;
  minutes: number;
  onExpire?: () => void;
}) {
  const [left, setLeft] = useState(() => remainingMs(startedAt, minutes));

  useEffect(() => {
    const t = setInterval(() => {
      const n = remainingMs(startedAt, minutes);
      setLeft(n);
      if (n <= 0) onExpire?.();
    }, 250);
    return () => clearInterval(t);
  }, [startedAt, minutes, onExpire]);

  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  const urgent = left < 5 * 60 * 1000;

  return (
    <span
      className={`font-mono tabular-nums text-sm tracking-wide ${urgent ? "text-crit" : "text-primary"}`}
    >
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}
