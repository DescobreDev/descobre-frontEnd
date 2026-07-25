import { Shield, EnvelopeSimple } from "@phosphor-icons/react";
import { getVersionLabel, getVersionTooltip } from "../../utils/appVersion.tsx";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLeft}>
        <span className={styles.footerCopy}>
          © {new Date().getFullYear()} Descobre. Todos os direitos reservados.
        </span>
        <span className={styles.versionBadge} title={getVersionTooltip()}>
          <span className={styles.versionDot} aria-hidden="true" />
          {getVersionLabel()}
        </span>
      </div>

      <div className={styles.footerLinks}>
        <a href="/privacy">
          <Shield size={13} /> Privacidade
        </a>
        <a href="/terms">Termos de uso</a>
        <a href="mailto:suporte@descobre.com.br">
          <EnvelopeSimple size={13} /> Suporte
        </a>
      </div>
    </footer>
  );
}

export default Footer;