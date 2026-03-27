import styles from "./CSS/loading.module.css";

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.logoWrap}>
          <div className={styles.logoDot} />
          <div className={styles.logoDot} />
          <div className={styles.logoDot} />
        </div>

        <span className={styles.brandName}>D.escobre</span>

        <div className={styles.progressWrap}>
          <div className={styles.progressBar} />
        </div>

        <p className={styles.hint}>Carregando sua experiência...</p>
      </div>
    </div>
  );
}