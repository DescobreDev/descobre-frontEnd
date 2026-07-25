import styles from "./VerifyIllustration.module.css";

export function VerifyIllustration() {
  return (
    <svg
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.svg}
      aria-hidden="true"
    >
      <ellipse cx="110" cy="160" rx="70" ry="10" fill="rgba(249,115,22,0.15)" />

      <rect x="20" y="50" width="180" height="110" rx="12" fill="#1a1a1f" stroke="rgba(249,115,22,0.35)" strokeWidth="1.5" />
      <path d="M20 62 L110 115 L200 62" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <line x1="20" y1="130" x2="200" y2="130" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

      <rect x="62" y="18" width="96" height="72" rx="8" fill="#212126" stroke="rgba(249,115,22,0.5)" strokeWidth="1.5" className={styles.letterCard} />
      <line x1="78" y1="38" x2="142" y2="38" stroke="rgba(249,115,22,0.6)" strokeWidth="2" strokeLinecap="round" />
      <line x1="78" y1="50" x2="142" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" />
      <line x1="78" y1="62" x2="120" y2="62" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeLinecap="round" />

      <circle cx="158" cy="22" r="14" fill="#16a34a" />
      <path d="M151 22 L156 27 L165 17" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

      <circle cx="42" cy="40" r="3" fill="rgba(249,115,22,0.5)" className={styles.particle1} />
      <circle cx="185" cy="35" r="2" fill="rgba(249,115,22,0.35)" className={styles.particle2} />
      <circle cx="30" cy="100" r="2" fill="rgba(249,115,22,0.25)" className={styles.particle3} />
      <circle cx="192" cy="95" r="3" fill="rgba(249,115,22,0.3)" className={styles.particle1} />
    </svg>
  );
}