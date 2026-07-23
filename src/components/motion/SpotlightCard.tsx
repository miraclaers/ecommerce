"use client";

import {
  useCallback,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Soft pointer spotlight (React Bits–style) — paint only, no layout shift.
 */
export function SpotlightCard({ children, className = "" }: SpotlightCardProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  const onMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (reduceMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setPos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    },
    [reduceMotion]
  );

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={`relative overflow-hidden ${className}`}
      style={
        reduceMotion
          ? undefined
          : {
              backgroundImage: active
                ? `radial-gradient(420px circle at ${pos.x}% ${pos.y}%, rgb(var(--accent) / 0.09), transparent 55%)`
                : undefined,
            }
      }
    >
      {children}
    </div>
  );
}
