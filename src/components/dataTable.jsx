import styles from "./CSS/dataTable.module.css";

export function DataTable({ columns, data, onRowClick, actions, loading, emptyMessage = "Nenhum registro encontrado.", pagination, onPageChange }) {
  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={styles.th} style={{ width: col.width }}>
                {col.title}
              </th>
            ))}
            {actions && <th className={styles.th} style={{ width: 80, textAlign: "center" }}>*</th>}
          </tr>
        </thead>

        <tbody>
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className={styles.empty}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row.id ?? index}
                className={`${styles.tr} ${onRowClick ? styles.trClickable : ""}`}
                onClick={() => onRowClick?.(row)}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {columns.map((col) => (
                  <td key={col.key} className={styles.td}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                  </td>
                ))}
                {actions && (
                  <td className={styles.td} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.actionsCell}>
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && pagination.totalPages > 1 && (
        <div style={{ margin: 16, display: "flex", justifyContent: "end", gap: 8 }}>

          <button
            className="btn-secondary"
            disabled={!pagination.hasPrev}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Anterior
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={p === pagination.page ? "btn-primary" : "btn-secondary"}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ))}

          <button
            className="btn-secondary"
            disabled={!pagination.hasNext}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
}