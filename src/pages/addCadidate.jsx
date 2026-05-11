import { useEffect, useState, useContext } from "react";
import { PlanGate } from "../hooks/planGate";
import { AuthContext } from "../context/authContext";
import api from "../services/api";

export default function addCandidate() {
    const [jobs, setJobs] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [selectedJob, setSelectedJob] = useState("");
    const [selectedCandidate, setSelectedCandidate] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoadingData(true);
        try {
            const [jobsRes, candidatesRes] = await Promise.all([
                api.get("/jobs?page=1&limit=999"),
                api.get("/jobs/test/candidates"),
            ]);
            console.log("jobs:", jobsRes.data);
            console.log("candidates:", candidatesRes.data);
            setJobs(jobsRes.data.data ?? []);
            setCandidates(candidatesRes.data ?? []);
        } catch (err) {
            console.error("fetchData error:", err?.response ?? err);
            setMessage({ type: "error", text: "Erro ao carregar dados: " + (err?.response?.data?.message ?? err.message) });
        } finally {
            setLoadingData(false);
        }
    }

    async function handleAttach() {
        if (!selectedJob || !selectedCandidate) {
            setMessage({ type: "error", text: "Selecione uma vaga e um candidato." });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            await api.post(`/jobs/${selectedJob}/candidates`, {
                candidateId: Number(selectedCandidate),
            });
            setMessage({ type: "success", text: "Candidato inserido na vaga com sucesso!" });
            setSelectedJob("");
            setSelectedCandidate("");
        } catch (err) {
            const msg = err?.response?.data?.message ?? err.message;
            setMessage({ type: "error", text: "Erro: " + msg });
        } finally {
            setLoading(false);
        }
    }

    return (
        <PlanGate>
            <div className="page-content">
                <div className="header">
                    <h1 className="pageTitle">Adicionar candidatos — Ambiente de Teste</h1>
                </div>

                {message && (
                    <div style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        marginBottom: 16,
                        fontSize: 13,
                        background: message.type === "success" ? "#d1fae5" : "#fee2e2",
                        color: message.type === "success" ? "#065f46" : "#991b1b",
                        border: `1px solid ${message.type === "success" ? "#6ee7b7" : "#fca5a5"}`,
                    }}>
                        {message.text}
                    </div>
                )}

                {loadingData ? (
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Carregando...</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
                        <div className="form-field">
                            <label className="form-label">Vaga</label>
                            <select
                                className="input"
                                value={selectedJob}
                                onChange={(e) => setSelectedJob(e.target.value)}
                            >
                                <option value="">Selecione a vaga</option>
                                {jobs.map((job) => (
                                    <option key={job.id} value={job.id}>
                                        #{job.id} — {job.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-field">
                            <label className="form-label">Candidato</label>
                            <select
                                className="input"
                                value={selectedCandidate}
                                onChange={(e) => setSelectedCandidate(e.target.value)}
                            >
                                <option value="">Selecione o candidato</option>
                                {candidates.map((candidate) => (
                                    <option key={candidate.id} value={candidate.id}>
                                        #{candidate.id} — {candidate.name} ({candidate.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={handleAttach}
                            disabled={loading || !selectedJob || !selectedCandidate}
                        >
                            {loading ? "Inserindo..." : "Inserir candidato na vaga"}
                        </button>
                    </div>
                )}
            </div>
        </PlanGate>
    );
}