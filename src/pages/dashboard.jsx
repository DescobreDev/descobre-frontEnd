import styles from "./CSS/Dashboard.module.css";

function Dashboard() {
  return (
    <>
      <section className={styles.cards}>
        <div className={styles.card}>
          <h3>Usuários</h3>
          <p>1</p>
        </div>

        <div className={styles.card}>
          <h3>Atividades</h3>
          <p>12</p>
        </div>

        <div className={styles.card}>
          <h3>Status</h3>
          <p>Ativo</p>
        </div>
      </section>

      <div className={styles.contentBox}>
        Área principal do sistema
      </div>
    </>
  );
}

export default Dashboard;