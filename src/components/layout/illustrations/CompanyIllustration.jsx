import styles from "./CompanyIllustration.module.css";

export function CompanyIllustration() {
  return (
    <svg
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.svg}
      aria-hidden="true"
    >
      <ellipse cx="100" cy="200" rx="70" ry="9" fill="rgba(249,115,22,0.12)" />

      <rect x="40" y="70" width="90" height="120" rx="6" fill="#1e1a15" stroke="rgba(249,115,22,0.35)" strokeWidth="1.5" />
      {[0, 1, 2, 3].map((row) => (
        <g key={row}>
          <rect x={54} y={88 + row * 24} width="14" height="14" rx="2" fill="rgba(249,115,22,0.18)" />
          <rect x={78} y={88 + row * 24} width="14" height="14" rx="2" fill="rgba(255,255,255,0.06)" />
          <rect x={102} y={88 + row * 24} width="14" height="14" rx="2" fill="rgba(255,255,255,0.06)" />
        </g>
      ))}
      <rect x="72" y="168" width="26" height="22" rx="2" fill="rgba(249,115,22,0.3)" />

      <g className={styles.card}>
        <rect x="112" y="34" width="72" height="86" rx="10" fill="#242019" stroke="rgba(249,115,22,0.5)" strokeWidth="1.5" />
        <line x1="126" y1="54" x2="170" y2="54" stroke="rgba(249,115,22,0.6)" strokeWidth="2" strokeLinecap="round" />
        {[68, 82, 96].map((y) => (
          <g key={y}>
            <circle cx="128" cy={y} r="4" fill="none" stroke="rgba(249,115,22,0.6)" strokeWidth="1.4" />
            <path d={`M126 ${y} L127.5 ${y + 1.5} L130 ${y - 1.5}`} stroke="rgba(249,115,22,0.9)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="136" y1={y} x2="168" y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeLinecap="round" />
          </g>
        ))}
      </g>

      <circle cx="30" cy="50" r="3" fill="rgba(249,115,22,0.45)" className={styles.particle1} />
      <circle cx="176" cy="140" r="2" fill="rgba(249,115,22,0.35)" className={styles.particle2} />
      <circle cx="24" cy="150" r="2" fill="rgba(249,115,22,0.25)" className={styles.particle3} />
    </svg>
  );
}