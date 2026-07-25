import { useEffect, useRef, useState } from "react";

export function useOtpCode(length, { onComplete } = {}) {
  const [digits, setDigits] = useState(() => Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function registerRef(index) {
    return (el) => {
      inputRefs.current[index] = el;
    };
  }

  function setDigitAt(index, rawValue) {
    const value = rawValue.replace(/\D/g, "").slice(-1);

    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;

      if (value && index === length - 1) {
        const code = next.join("");
        if (code.length === length) onComplete?.(code);
      }
      return next;
    });

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    const next = Array(length).fill("");
    for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i];
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();

    if (pasted.length === length) onComplete?.(pasted);
  }

  function reset() {
    setDigits(Array(length).fill(""));
    inputRefs.current[0]?.focus();
  }

  return {
    digits,
    code: digits.join(""),
    registerRef,
    setDigitAt,
    handleKeyDown,
    handlePaste,
    reset,
  };
}