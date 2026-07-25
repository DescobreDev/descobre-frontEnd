import logo from "../../assets/LOGO-DESCOBRE-BRANCA.svg";
import styles from "./AuthShell.module.css";

export function AuthShell({ illustration, headline, badges = [], children }) {
  return (
    <div className={styles.container}>
      <aside className={styles.panel}>
        <div className={styles.panelContent}>
          <div className={styles.panelLogo}>
            <img src={logo} alt="Descobre" className={styles.panelLogoImg} />
          </div>

          {illustration && <div className={styles.panelArt}>{illustration}</div>}

          {headline && <div className={styles.panelHeadline}>{headline}</div>}

          {badges.length > 0 && (
            <div className={styles.panelBadges}>
              {badges.map((badge) => (
                <span key={badge} className={styles.badge}>{badge}</span>
              ))}
            </div>
          )}
        </div>
      </aside>

      <main className={styles.side}>
        <div className={styles.card}>{children}</div>
      </main>
    </div>
  );
}