import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import { DataTable } from "../../components/dataTable";
import { PlanGate } from "../../hooks/planGate";
import AsyncSelect from "../../components/asyncSelect";
import api from "../../services/api";

const STATUS_LABELS = {
    PENDING: "Aguardando",
    IN_REVIEW: "Em triagem",
    INTERVIEW: "Entrevista",
    APPROVED: "Aprovado",
    REJECTED: "Reprovado",
    WITHDRAWN: "Desistiu",
};

const STATUS_COLORS = {
    PENDING: { color: "#f59e0b", bg: "#fef3c7" },
    IN_REVIEW: { color: "#3b82f6", bg: "#dbeafe" },
    INTERVIEW: { color: "#8b5cf6", bg: "#ede9fe" },
    APPROVED: { color: "#10b981", bg: "#d1fae5" },
    REJECTED: { color: "#ef4444", bg: "#fee2e2" },
    WITHDRAWN: { color: "#6b7280", bg: "#f3f4f6" },
};

const columns = [
    { key: "candidateName", title: "Candidato", width: "25%" },
    { key: "candidateEmail", title: "E-mail", width: "25%" },
    { key: "candidatePhone", title: "Telefone", width: "15%" },
    {
        key: "status",
        title: "Status",
        width: "15%",
        render: (val) => {
            const s = STATUS_COLORS[val] ?? { color: "#6b7280", bg: "#f3f4f6" };
            return (
                <span style={{
                    color: s.color,
                    background: s.bg,
                    fontWeight: 600,
                    fontSize: 12,
                    padding: "2px 10px",
                    borderRadius: 20,
                }}>
                    {STATUS_LABELS[val] ?? val}
                </span>
            );
        },
    },
    {
        key: "compatibility",
        title: "Match",
        width: "10%",
        render: (val) => {
            let color = "#6b7280";
            let bg = "#f3f4f6";

            if (val >= 80) {
                color = "#16a34a";
                bg = "#dcfce7";
            } else if (val >= 60) {
                color = "#ca8a04";
                bg = "#fef9c3";
            } else {
                color = "#dc2626";
                bg = "#fee2e2";
            }

            return (
                <span style={{
                    color,
                    background: bg,
                    fontWeight: 700,
                    fontSize: 12,
                    padding: "2px 10px",
                    borderRadius: 20,
                }}>
                    {val}%
                </span>
            );
        },
    },
    {
        key: "appliedAt",
        title: "Candidatou-se em",
        width: "20%",
        render: (val) => new Date(val).toLocaleDateString("pt-BR"),
    },
];

async function fetchStatusOptions() {
    return [
        { value: "", label: "Todos os status" },
        ...Object.entries(STATUS_LABELS).map(([val, label]) => ({ value: val, label })),
    ];
}

export default function JobsCandidates() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("");
    const [jobTitle, setJobTitle] = useState("");

    async function load(p = 1) {
        setLoading(true);
        try {
            const params = { page: p, limit: 10 };
            if (statusFilter) params.status = statusFilter;

            const res = await api.get(`/jobs/${id}/candidates`, { params });

            if (res.data.jobTitle) setJobTitle(res.data.jobTitle);

            const rows = res.data.data.map((app) => ({
                id: app.id,
                candidateName: app.candidate.name,
                candidateEmail: app.candidate.email,
                candidatePhone: app.candidate.phone ?? "—",
                status: app.status,
                appliedAt: app.appliedAt,
                compatibility: app.compatibility,
            }));

            setData(rows);
            setPagination(res.data.pagination);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(page); }, [page, statusFilter]);

    return (
        <PlanGate>
            <div className="page-content">
                <div className="header flex" style={{ alignItems: "center", gap: 12, justifyContent: "space-between" }}>
                    <div className="flex gap-2">
                        <button
                            className="btn-secondary"
                            style={{ padding: "8px 12px" }}
                            onClick={() => navigate(`/jobs/${id}`)}
                        >
                            <ArrowLeft size={16} weight="bold" />
                        </button>
                        <div>
                            <h1 className="pageTitle">Candidatos</h1>
                            <p className="pageSubtitle">
                                {jobTitle ? `Vaga: ${jobTitle}` : "Lista de candidaturas"}
                            </p>
                        </div>
                    </div>

                    <div style={{ width: "300px" }}>
                        <AsyncSelect
                            name="statusFilter"
                            value={
                                statusFilter
                                    ? { value: statusFilter, label: STATUS_LABELS[statusFilter] }
                                    : { value: "", label: "Todos os status" }
                            }
                            fetchOptions={fetchStatusOptions}
                            onChange={(opt) => {
                                setStatusFilter(opt.value);
                                setPage(1);
                            }}
                            placeholder="Todos os status"
                            colorMap={STATUS_COLORS}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    pagination={pagination}
                    onPageChange={(p) => setPage(p)}
                    emptyMessage="Nenhum candidato encontrado."
                    onRowClick={(row) => navigate(`/jobs/${id}/candidates/${row.id}`)}
                />

            </div>
        </PlanGate>
    );
}