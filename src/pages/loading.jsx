import logo from "../assets/LOGO-DESCOBRE-BRANCA.svg";
import styles from "./CSS/loading.module.css";

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.logoWrap}>
          <img src={logo} alt="Descobre" className={styles.logoImg} />
        </div>

        <div className={styles.ring} role="status" aria-label="Carregando">
          <svg className={styles.ringSvg} viewBox="0 0 44 44">
            <circle className={styles.ringTrack} cx="22" cy="22" r="19" />
            <circle className={styles.ringProgress} cx="22" cy="22" r="19" />
          </svg>
        </div>

        <p className={styles.hint}>Carregando sua experiência...</p>
      </div>
    </div>
  );
}