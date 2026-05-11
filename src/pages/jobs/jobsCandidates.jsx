import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, SealCheck } from "@phosphor-icons/react";
import { DataTable } from "../../components/dataTable";
import { PlanGate } from "../../hooks/planGate";
import AsyncSelect from "../../components/asyncSelect";
import api from "../../services/api";

const STATUS_LABELS = {
    RECEBIDA:    "Aguardando",
    ANALISE:     "Análise",
    ENTREVISTA:  "Entrevista",
    APROVADO:    "Aprovado",
    REPROVADO:   "Reprovado",
    DESISTIU:    "Desistiu",
};

const STATUS_COLORS = {
    RECEBIDA:   { color: "#f59e0b", bg: "#fef3c7" },
    ANALISE:    { color: "#3b82f6", bg: "#dbeafe" },
    ENTREVISTA: { color: "#8b5cf6", bg: "#ede9fe" },
    APROVADO:   { color: "#10b981", bg: "#d1fae5" },
    REPROVADO:  { color: "#ef4444", bg: "#fee2e2" },
    DESISTIU:   { color: "#6b7280", bg: "#f3f4f6" },
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
                    color: s.color, background: s.bg,
                    fontWeight: 600, fontSize: 12,
                    padding: "2px 10px", borderRadius: 20,
                    display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                    {val === "APROVADO" && <SealCheck size={12} weight="fill" />}
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
            const color = val >= 80 ? "#16a34a" : val >= 60 ? "#ca8a04" : "#dc2626";
            const bg = val >= 80 ? "#dcfce7" : val >= 60 ? "#fef9c3" : "#fee2e2";
            return (
                <span style={{ color, background: bg, fontWeight: 700, fontSize: 12, padding: "2px 10px", borderRadius: 20 }}>
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

function HiredBanner({ hired }) {
    if (!hired) return null;
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
            border: "1px solid #6ee7b7",
            borderRadius: 12, padding: "14px 20px",
        }}>
            <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "#fff", border: "2px solid #6ee7b7",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
                <Trophy size={22} weight="fill" color="#059669" />
            </div>
            <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#065f46" }}>
                    Vaga encerrada por contratação
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#047857" }}>
                    <strong>{hired.name}</strong> foi contratado(a) em{" "}
                    {new Date(hired.hiredAt).toLocaleDateString("pt-BR")}.
                    A lista abaixo está em modo somente leitura.
                </p>
            </div>
        </div>
    );
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
    const [jobStatus, setJobStatus] = useState(null);
    const [hiredCandidate, setHiredCandidate] = useState(null);

    const isHired = jobStatus === "HIRED";

    async function load(p = 1) {
        setLoading(true);
        try {
            const params = { page: p, limit: 10 };
            if (statusFilter) params.status = statusFilter;

            const res = await api.get(`/jobs/${id}/candidates`, { params });

            if (res.data.jobTitle) setJobTitle(res.data.jobTitle);
            if (res.data.jobStatus) setJobStatus(res.data.jobStatus);

            if (res.data.hiredCandidate) {
                setHiredCandidate(res.data.hiredCandidate);
            }

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
                                {isHired && (
                                    <span style={{
                                        marginLeft: 8, fontSize: 11, fontWeight: 700,
                                        color: "#065f46", background: "#d1fae5",
                                        padding: "2px 8px", borderRadius: 20,
                                        verticalAlign: "middle",
                                    }}>
                                        Contratada
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {!isHired && (
                        <div style={{ width: "300px" }}>
                            <AsyncSelect
                                name="statusFilter"
                                value={
                                    statusFilter
                                        ? { value: statusFilter, label: STATUS_LABELS[statusFilter] }
                                        : { value: "", label: "Todos os status" }
                                }
                                fetchOptions={fetchStatusOptions}
                                onChange={(opt) => { setStatusFilter(opt.value); setPage(1); }}
                                placeholder="Todos os status"
                                colorMap={STATUS_COLORS}
                            />
                        </div>
                    )}
                </div>
                <HiredBanner hired={isHired ? hiredCandidate : null} />

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