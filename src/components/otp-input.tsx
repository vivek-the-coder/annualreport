"use client";

import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/components/ui";

/**
 * Accessible 6-digit OTP entry: auto-advance, backspace-to-previous,
 * arrow-key navigation and full-code paste support.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  length = 6,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  length?: number;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  function setDigit(i: number, digit: string) {
    const chars = value.padEnd(length, " ").split("");
    chars[i] = digit || " ";
    const next = chars.join("").replace(/\s/g, " ").trimEnd();
    const cleaned = next.split("").map((c) => (c === " " ? "" : c)).join("");
    onChange(cleaned);
    if (digit && i < length - 1) refs.current[i + 1]?.focus();
    if (cleaned.length === length) onComplete?.(cleaned);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>, i: number) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[i]) {
        setDigit(i, "");
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
        const chars = value.split("");
        chars.splice(i - 1, 1);
        onChange(chars.join(""));
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
    if (pasted.length === length) onComplete?.(pasted);
  }

  return (
    <div
      className="flex gap-1.5 sm:gap-2"
      role="group"
      aria-label={`Enter the ${length}-digit verification code`}
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          value={value[i] ?? ""}
          onChange={(e) => setDigit(i, e.target.value.replace(/\D/g, "").slice(-1))}
          onKeyDown={(e) => onKeyDown(e, i)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-12 min-w-0 flex-1 rounded-xl border text-center font-display text-lg font-extrabold text-navy-900 transition sm:h-14 sm:text-xl",
            "focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100",
            invalid ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white",
            disabled && "opacity-60"
          )}
        />
      ))}
    </div>
  );
}
