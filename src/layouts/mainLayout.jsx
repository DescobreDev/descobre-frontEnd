import { Outlet, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authContext";
import { usePlan } from "../hooks/usePlan";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer.tsx";
import CompanyOnboardingModal from "../components/layout/CompanyOnboardingModal";
import styles from "./CSS/main.module.css";
import {
  Buildings, ChartBar, House, CreditCard, MoneyIcon, GearIcon, List,
} from "@phosphor-icons/react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Início", Icon: House },
  { to: "/jobs", label: "Vagas", Icon: ChartBar },
  { to: "/myCompany", label: "Minha Empresa", Icon: Buildings },
  { to: "/plans", label: "Planos", Icon: CreditCard },
  { to: "/payments", label: "Pagamentos", Icon: MoneyIcon },
];

function DashboardLayout() {
  const { user, logout, setUser } = useContext(AuthContext);
  const { planName, hasActivePlan } = usePlan();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !user.company) setShowOnboarding(true);
  }, [user]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className={styles.dashboard}>
      <Sidebar
        navItems={NAV_ITEMS}
        planName={planName}
        hasActivePlan={hasActivePlan}
        user={user}
        onLogout={handleLogout}
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setMobileNavOpen(true)}
            aria-label="Abrir menu"
          >
            <List size={22} weight="bold" />
          </button>
          <span className={styles.topbarTitle}>Descobre</span>
        </header>

        {!hasActivePlan && (
          <div className={styles.limitBanner}>
            <span>⚠ Você não possui um plano ativo.</span>
            <button onClick={() => navigate("/plans")} className={styles.limitBannerBtn}>
              Ver planos →
            </button>
          </div>
        )}

        <section className={styles.content}>
          <Outlet />
        </section>

        <Footer />
      </div>

      <CompanyOnboardingModal
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        user={user}
        setUser={setUser}
      />
    </div>
  );
}

export default DashboardLayout;