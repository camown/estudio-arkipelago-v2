'use client';

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  className?: string;
  delay?: number;
  decimalPlaces?: number;
}

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(direction === "down" ? value : 0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000;
    const startVal = direction === "down" ? value : 0;
    const endVal = direction === "down" ? 0 : value;

    const timer = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        const current = startVal + (endVal - startVal) * easeProgress;
        setDisplayValue(current);

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setDisplayValue(endVal);
        }
      };
      window.requestAnimationFrame(step);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, direction, delay]);

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)}>
      {displayValue.toFixed(decimalPlaces)}
    </span>
  );
}
