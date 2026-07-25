import styles from "./OtpInput.module.css";

export function OtpInput({ digits, hasError, registerRef, onDigitChange, onKeyDown, onPaste }) {
  return (
    <div
      className={styles.row}
      role="group"
      aria-label={`Código de verificação de ${digits.length} dígitos`}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={registerRef(index)}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          aria-label={`Dígito ${index + 1} de ${digits.length}`}
          aria-invalid={hasError || undefined}
          onChange={(e) => onDigitChange(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          onPaste={index === 0 ? onPaste : undefined}
          className={`${styles.input} ${hasError ? styles.error : digit ? styles.filled : ""}`}
        />
      ))}
    </div>
  );
}