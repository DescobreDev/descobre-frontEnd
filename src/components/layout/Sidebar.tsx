import { NavLink, useNavigate } from "react-router-dom";
import { CaretRight, SignOut, X } from "@phosphor-icons/react";
import logo from "../../assets/LOGO-DESCOBRE-BRANCA.svg";
import styles from "./Sidebar.module.css";


function Sidebar({ navItems, planName, hasActivePlan, user, onLogout, isOpen, onClose }) {
  const navigate = useNavigate();
  const userInitial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";

  function goTo(path) {
    navigate(path);
    onClose?.();
  }

  return (
    <>
      <button
        type="button"
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
        onClick={onClose}
        aria-label="Fechar menu"
        tabIndex={isOpen ? 0 : -1}
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.logoRow}>
            <img src={logo} alt="Descobre" className={styles.logoImg} />
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Fechar menu"
            >
              <X size={20} weight="bold" />
            </button>
          </div>

          <nav className={styles.nav} aria-label="Navegação principal">
            <button type="button" className={styles.planBadge} onClick={() => goTo("/plans")}>
              <div className={styles.planBadgeTop}>
                <span className={styles.planBadgeName}>
                  {hasActivePlan ? planName : "Sem plano"}
                </span>
                <span className={styles.planBadgeAction}>Upgrade →</span>
              </div>
              <span className={styles.planBadgeUsage}>
                {hasActivePlan ? "Plano ativo" : "Assine um plano para começar"}
              </span>
            </button>

            <p className={styles.navLabel}>Menu</p>
            {navItems.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                }
              >
                <span className={styles.navIcon}>
                  <Icon size={18} weight="duotone" />
                </span>
                <span className={styles.navText}>{label}</span>
                <CaretRight size={14} className={styles.navArrow} />
              </NavLink>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar} aria-hidden="true">{userInitial}</div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user?.name || "Usuário"}</p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
          <button type="button" className={styles.logoutBtn} onClick={onLogout}>
            <SignOut size={16} weight="bold" />
            <span>Sair com segurança</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;