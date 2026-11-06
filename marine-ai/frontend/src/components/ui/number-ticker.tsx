import React, { useEffect, useRef } from "react";
import {
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { cn } from "../../lib/utils";

export interface NumberTickerProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  startValue?: number;
  /** Seconds to wait after entering the viewport */
  delay?: number;
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
}

export function NumberTicker({
  value,
  startValue = 0,
  delay = 0,
  decimalPlaces = 0,
  prefix = "",
  suffix = "",
  className,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(startValue);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "0px 0px 50px 0px" });
  const reducedMotion = useReducedMotion();

  const format = (n: number) =>
    `${prefix}${Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(n)}${suffix}`;

  useEffect(() => {
    const isVisible = () => {
      if (isInView) return true;
      if (typeof window !== "undefined" && ref.current) {
        const rect = ref.current.getBoundingClientRect();
        return (
          rect.top <=
            (window.innerHeight || document.documentElement.clientHeight) + 100 &&
          rect.bottom >= 0
        );
      }
      return false;
    };

    if (!isVisible()) return;

    if (reducedMotion) {
      motionValue.jump(value);
      return;
    }
    const timeout = setTimeout(() => {
      motionValue.set(value);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [isInView, reducedMotion, motionValue, value, delay]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) ref.current.textContent = format(latest);
    });
    return () => unsubscribe();
  }, [springValue, prefix, suffix, decimalPlaces]);

  return (
    <span
      ref={ref}
      data-slot="number-ticker"
      className={cn("inline-block tabular-nums", className)}
      {...props}
    >
      {format(startValue)}
    </span>
  );
}

export default NumberTicker;
