import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, Users, Clock, Trophy,
  ArrowRight, CalendarBlank, Warning,
} from "@phosphor-icons/react";
import api from "../services/api";
import styles from "./CSS/dashboard.module.css";

function StatCard({ label, value, sub, icon: Icon, palette, loading }) {
  const accentClass = {
    orange: styles.statAccentOrange,
    blue: styles.statAccentBlue,
    green: styles.statAccentGreen,
    purple: styles.statAccentPurple,
  }[palette];

  const iconClass = {
    orange: styles.iconWrapOrange,
    blue: styles.iconWrapBlue,
    green: styles.iconWrapGreen,
    purple: styles.iconWrapPurple,
  }[palette];

  const iconColor = {
    orange: "#EE600F",
    blue: "#f59e0b",
    green: "#f97316",
    purple: "#ea580c",
  }[palette];

  return (
    <div className={styles.statCard}>
      <div className={`${styles.statAccent} ${accentClass}`} />
      <div className={`${styles.iconWrap} ${iconClass}`}>
        <Icon size={18} color={iconColor} weight="duotone" />
      </div>
      <p className={styles.statLabel}>{label}</p>
      {loading
        ? <div className={styles.skeleton} />
        : <p className={styles.statValue}>{value ?? "—"}</p>
      }
      <p className={styles.statSub}>{sub}</p>
    </div>
  );
}

function BarChart({ data, loading }) {
  if (loading) return <div className={`${styles.skeleton} ${styles.emptyChart}`} />;

  if (!data?.length) return (
    <div className={`${styles.emptyState} ${styles.emptyChart}`}>
      Nenhuma vaga ativa com candidatos.
    </div>
  );

  const max = Math.max(...data.map((d) => d.candidates), 1);

  return (
    <div className={styles.chartWrap}>
      {data.map((item) => {
        const pct = (item.candidates / max) * 100;
        return (
          <div key={item.id} className={styles.chartCol}>
            <span className={styles.chartCount}>{item.candidates}</span>
            <div className={styles.chartBarWrap}>
              <div
                className={styles.chartBar}
                style={{ height: `${Math.max(pct, 4)}%` }}
              />
            </div>
            <span className={styles.chartLabel}>
              {item.title.length > 12 ? item.title.slice(0, 12) + "…" : item.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function JobsDaysOpen({ data, loading, navigate }) {
  if (loading) return (
    <div className={styles.jobList}>
      {[1, 2, 3].map((i) => (
        <div key={i} className={styles.skeletonRow} />
      ))}
    </div>
  );

  if (!data?.length) return (
    <div className={`${styles.emptyState} ${styles.emptyList}`}>
      Nenhuma vaga ativa no momento.
    </div>
  );

  return (
    <div className={styles.jobList}>
      {data.map((job) => {
        const isLate = job.deadline && new Date(job.deadline) < new Date();

        const badgeClass =
          job.daysOpen > 60 ? styles.daysBadgeRed :
            job.daysOpen > 30 ? styles.daysBadgeOrange :
              styles.daysBadgeGreen;

        return (
          <div
            key={job.id}
            className={styles.jobRow}
            onClick={() => navigate(`/jobs/${job.id}`)}
          >
            <div className={styles.jobInfo}>
              <span className={styles.jobName}>
                {isLate && (
                  <Warning
                    size={13}
                    color="#ef4444"
                    weight="fill"
                    style={{ marginRight: 4, verticalAlign: "middle" }}
                  />
                )}
                {job.title}
              </span>
              <span className={styles.jobMeta}>
                {job.candidates} candidato{job.candidates !== 1 ? "s" : ""}
                {job.deadline && ` · prazo ${new Date(job.deadline).toLocaleDateString("pt-BR")}`}
              </span>
            </div>

            <span className={`${styles.daysBadge} ${badgeClass}`}>
              {job.daysOpen}d aberta
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const monthName = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="page-content">
      <div className={styles.page}>

        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Visão geral de {monthName}</p>
        </div>

        <div className={styles.topGrid}>
          <StatCard
            label="Vagas ativas"
            value={data?.activeJobs}
            sub="abertas agora"
            icon={Briefcase}
            palette="orange"
            loading={loading}
          />
          <StatCard
            label="Candidatos este mês"
            value={data?.candidatesThisMonth}
            sub="novas candidaturas"
            icon={Users}
            palette="blue"
            loading={loading}
          />
          <StatCard
            label="Contratações este mês"
            value={data?.hiredThisMonth}
            sub={`${data?.hiredTotal ?? "—"} no total`}
            icon={Trophy}
            palette="green"
            loading={loading}
          />
          <StatCard
            label="Vagas com prazo"
            value={data?.jobsDaysOpen?.filter((j) => j.deadline)?.length ?? "—"}
            sub="com data limite definida"
            icon={CalendarBlank}
            palette="purple"
            loading={loading}
          />
        </div>

        <div className={styles.bottomGrid}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionTitle}>Candidatos por vaga</p>
                <p className={styles.sectionSub}>Vagas ativas · até 6 exibidas</p>
              </div>
              <button className={styles.linkBtn} onClick={() => navigate("/jobs")}>
                Ver vagas <ArrowRight size={12} weight="bold" />
              </button>
            </div>
            <BarChart data={data?.jobsWithCandidates} loading={loading} />
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionTitle}>Tempo de abertura</p>
                <p className={styles.sectionSub}>Dias que cada vaga está aberta</p>
              </div>
              <div className={styles.legend}>
                <span className={styles.legendGreen}>● até 30d</span>
                <span className={styles.legendOrange}>● até 60d</span>
                <span className={styles.legendRed}>● +60d</span>
              </div>
            </div>
            <JobsDaysOpen
              data={data?.jobsDaysOpen}
              loading={loading}
              navigate={navigate}
            />
          </div>

        </div>
      </div>
    </div>
  );
}