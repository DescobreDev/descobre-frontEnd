import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Plus, X, MapPin, Buildings, CheckCircle } from "@phosphor-icons/react";
import Select from "../../components/select";
import SelectSearch from "../../components/selectSearch";
import { AuthContext } from "../../context/authContext";
import api from "../../services/api";
import styles from "./CSS/jobs.module.css";

const ESTADOS = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
    "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const contractOptions = [
    { value: "CLT", label: "CLT" },
    { value: "PJ", label: "PJ" },
    { value: "FREELANCER", label: "Freelancer" },
];

const jobTypeOptions = [
    { value: "STANDARD", label: "Padrão" },
    { value: "INTERNSHIP", label: "Estágio" },
    { value: "TRAINEE", label: "Trainee" },
];

const workFormatOptions = [
    { value: "REMOTE", label: "Remoto" },
    { value: "HYBRID", label: "Híbrido" },
    { value: "ONSITE", label: "Presencial" },
];

const priorityOptions = [
    { value: "LOW", label: "Baixa" },
    { value: "MEDIUM", label: "Média" },
    { value: "HIGH", label: "Alta" },
    { value: "URGENT", label: "Urgente" },
];

const affirmativeOptions = [
    { value: "NOT_INFORMED", label: "Não informado" },
    { value: "PCD", label: "PCD" },
    { value: "WOMEN", label: "Mulheres" },
    { value: "FIFTY_PLUS", label: "50+" },
    { value: "LGBTQIAPN", label: "LGBTQiapn+" },
];

const stateOptions = ESTADOS.map((uf) => ({ value: uf, label: uf }));

const STEPS = [
    { label: "Informações da vaga" },
    { label: "Contrato e configurações" },
];

function StepIndicator({ current }) {
    return (
        <div className={styles.stepIndicator}>
            {STEPS.map((step, i) => (
                <div key={i} className={styles.stepItem}>
                    <div className={`${styles.stepCircle} ${i < current ? styles.stepDone : i === current ? styles.stepActive : styles.stepIdle}`}>
                        {i < current
                            ? <CheckCircle size={16} weight="fill" />
                            : <span>{i + 1}</span>
                        }
                    </div>
                    <span className={`${styles.stepLabel} ${i === current ? styles.stepLabelActive : ""}`}>
                        {step.label}
                    </span>
                    {i < STEPS.length - 1 && (
                        <div className={`${styles.stepLine} ${i < current ? styles.stepLineDone : ""}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

export function JobForm({ initialData, onSubmit, loading, submitLabel = "Salvar vaga"}) {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [step, setStep] = useState(0);
    const [benefits, setBenefits] = useState([]);
    const [newBenefit, setNewBenefit] = useState("");
    const [selectedBenefits, setSelectedBenefits] = useState(initialData?.benefitIds ?? []);
    const [customBenefits, setCustomBenefits] = useState([]);
    const [loadingCep, setLoadingCep] = useState(false);
    const [cepError, setCepError] = useState("");
    const [errors, setErrors] = useState({});

    const [sectorOptions, setSectorOptions] = useState([]);
    const [positionOptions, setPositionOptions] = useState([]);
    const [loadingSector, setLoadingSector] = useState(true);
    const [loadingPositions, setLoadingPositions] = useState(false);

    useEffect(() => {
        api.get("/jobs/sector")
            .then((res) => {
                setSectorOptions(res.data.map((a) => ({ value: a.id, label: a.name })));
            })
            .catch(() => { })
            .finally(() => setLoadingSector(false));
    }, []);

    async function fetchPositions(sectorId) {
        if (!sectorId) return setPositionOptions([]);
        setLoadingPositions(true);
        try {
            const res = await api.get(`jobs/sector/${sectorId}/positions`);
            setPositionOptions(res.data.positions.map((p) => ({ value: p.id, label: p.name })));
        } catch {
            setPositionOptions([]);
        } finally {
            setLoadingPositions(false);
        }
    }

    useEffect(() => {
        if (initialData?.sector?.value) {
            fetchPositions(initialData.sector.value);
        }
    }, []);
    // ────────────────────────────────────────────────────────────

    const [form, setForm] = useState({
        title: initialData?.title ?? "",
        description: initialData?.description ?? "",
        sector: initialData?.sector ?? null,
        position: initialData?.position ?? null,
        contractType: initialData?.contractType ?? "",
        jobType: initialData?.jobType ?? "STANDARD",
        workFormat: initialData?.workFormat ?? "",
        workload: initialData?.workload ?? "",
        salary: initialData?.salary ?? "",
        priority: initialData?.priority ?? "MEDIUM",
        visible: initialData?.visible ?? true,
        affirmative: initialData?.affirmative ?? "NOT_INFORMED",
        deadline: initialData?.deadline ? initialData.deadline.split("T")[0] : "",
        cep: initialData?.cep ?? "",
        state: initialData?.state ?? "",
        city: initialData?.city ?? "",
        neighborhood: initialData?.neighborhood ?? "",
        address: initialData?.address ?? "",
        number: initialData?.number ?? "",
        complement: initialData?.complement ?? "",
    });

    const isRemote = form.workFormat === "REMOTE";

    useEffect(() => {
        api.get("/jobs/benefits")
            .then((res) => setBenefits(res.data))
            .catch(() => { });
    }, []);

    function handleSectorChange(option) {
        setForm((prev) => ({ ...prev, sector: option, position: null }));
        setPositionOptions([]);
        fetchPositions(option?.value);
        if (errors.sector) setErrors((prev) => ({ ...prev, sector: "" }));
    }

    function handlePositionChange(option) {
        setForm((prev) => ({ ...prev, position: option }));
        if (errors.position) setErrors((prev) => ({ ...prev, position: "" }));
    }

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    async function handleCepBlur() {
        const raw = form.cep.replace(/\D/g, "");
        if (raw.length !== 8) return;
        setLoadingCep(true);
        setCepError("");
        try {
            const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
            const data = await res.json();
            if (data.erro) { setCepError("CEP não encontrado."); return; }
            setForm((prev) => ({
                ...prev,
                address: data.logradouro || prev.address,
                neighborhood: data.bairro || prev.neighborhood,
                city: data.localidade || prev.city,
                state: data.uf || prev.state,
            }));
        } catch {
            setCepError("Erro ao buscar o CEP.");
        } finally {
            setLoadingCep(false);
        }
    }

    function fillCompanyAddress() {
        const company = user?.company;
        if (!company) return;
        setForm((prev) => ({
            ...prev,
            cep: company.cep || prev.cep,
            address: company.address || prev.address,
            number: company.number || prev.number,
            complement: company.complement || prev.complement,
            city: company.city || prev.city,
            state: company.state || prev.state,
            neighborhood: company.neighborhood || prev.neighborhood,
        }));
    }

    function validateStep1() {
        const errs = {};
        if (!form.title.trim()) errs.title = "Título obrigatório";
        if (!form.sector) errs.sector = "Setor obrigatório";
        if (!form.position) errs.position = "Cargo obrigatório";
        if (!form.description.trim()) errs.description = "Descrição obrigatória";
        if (!form.workFormat) errs.workFormat = "Formato obrigatório";
        if (!isRemote) {
            if (!form.cep.trim()) errs.cep = "CEP obrigatório";
            if (!form.city.trim()) errs.city = "Cidade obrigatória";
            if (!form.state) errs.state = "Estado obrigatório";
            if (!form.neighborhood.trim()) errs.neighborhood = "Bairro obrigatório";
            if (!form.address.trim()) errs.address = "Endereço obrigatório";
            if (!form.number.trim()) errs.number = "Número obrigatório";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function validateStep2() {
        const errs = {};
        if (!form.contractType) errs.contractType = "Tipo de contrato obrigatório";
        if (!form.workload) errs.workload = "Carga horária obrigatória";
        if (!form.deadline) errs.deadline = "Data limite obrigatória";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function handleNext() {
        if (validateStep1()) setStep(1);
    }

    function handleBack() {
        setStep(0);
        setErrors({});
    }

    function handleSubmit(e) {
        e?.preventDefault();
        if (!validateStep2()) return;
        onSubmit({
            ...form,
            sectorId: form.sector?.value ?? null,
            positionId: form.position?.value ?? null,
            workload: Number(form.workload),
            salary: form.salary ? Number(form.salary) : null,
            cep: isRemote ? null : form.cep,
            address: isRemote ? null : form.address,
            number: isRemote ? null : form.number,
            complement: isRemote ? null : form.complement,
            city: isRemote ? null : form.city,
            state: isRemote ? null : form.state,
            neighborhood: isRemote ? null : form.neighborhood,
            benefitIds: selectedBenefits,
            customBenefits: customBenefits,
        });
    }

    function toggleBenefit(id) {
        setSelectedBenefits((prev) =>
            prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
        );
    }

    function addCustomBenefit() {
        const trimmed = newBenefit.trim();
        if (!trimmed || customBenefits.includes(trimmed)) return;
        setCustomBenefits((prev) => [...prev, trimmed]);
        setNewBenefit("");
    }

    function removeCustomBenefit(name) {
        setCustomBenefits((prev) => prev.filter((b) => b !== name));
    }

    return (
        <div className={styles.formPage}>

            <StepIndicator current={step} />

            {/* ════ STEP 1 ════ */}
            {step === 0 && (
                <>
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <p className="card-title">Informações básicas</p>
                                <p className="card-subtitle">Dados principais da vaga</p>
                            </div>
                        </div>

                        <div className="card-body">
                            <div className="form-grid">
                                <div className="col-span-2" style={{ display: "flex", gap: "16px" }}>
                                    <div style={{ flex: 3 }}>
                                        <div className="form-field">
                                            <label className="form-label">Título da vaga</label>
                                            <input name="title" value={form.title} placeholder="Ex: Vaga para desenvolvedor" onChange={handleChange} className={`input ${errors.title ? styles.inputError : ""}`} />
                                            {errors.title && <span className={styles.errorMsg}>{errors.title}</span>}
                                        </div>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div className="form-field">
                                            <label className="form-label">Formato</label>
                                            <Select
                                                options={workFormatOptions}
                                                value={workFormatOptions.find(opt => opt.value === form.workFormat)}
                                                onChange={(opt) => setForm((prev) => ({ ...prev, workFormat: opt.value }))}
                                            />
                                            {errors.workFormat && <span className={styles.errorMsg}>{errors.workFormat}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label className="form-label">Setor</label>
                                    <SelectSearch
                                        name="sector"
                                        options={sectorOptions}
                                        value={form.sector}
                                        onChange={handleSectorChange}
                                        placeholder={loadingSector ? "Carregando..." : "Ex: Tecnologia"}
                                        disabled={loadingSector}
                                    />
                                    {errors.sector && <span className={styles.errorMsg}>{errors.sector}</span>}
                                </div>

                                <div className="form-field">
                                    <label className="form-label">Cargo / Nível</label>
                                    <SelectSearch
                                        name="position"
                                        options={positionOptions}
                                        value={form.position}
                                        onChange={handlePositionChange}
                                        placeholder={loadingPositions ? "Carregando cargos..." : "Ex: Analista Pleno"}
                                        disabled={!form.sector || loadingPositions}
                                        disabledPlaceholder="Selecione um setor primeiro"
                                    />
                                    {errors.position && <span className={styles.errorMsg}>{errors.position}</span>}
                                </div>

                                <div className="form-field col-span-2">
                                    <label className="form-label">Descrição da vaga</label>
                                    <textarea name="description" value={form.description} onChange={handleChange}
                                        placeholder="Descreva as responsabilidades, requisitos e diferenciais..."
                                        rows={5} className={`input textarea ${errors.description ? styles.inputError : ""}`} />
                                    {errors.description && <span className={styles.errorMsg}>{errors.description}</span>}
                                </div>
                            </div>
                        </div>

                    </div>

                    {isRemote && (
                        <div className={styles.remoteNote}>
                            <MapPin size={16} color="var(--orange)" />
                            <span>Vaga remota — localização não é necessária</span>
                        </div>
                    )}

                    {!isRemote && form.workFormat && (
                        <div className="card">
                            <div className="card-header">
                                <div>
                                    <p className="card-title">Localização</p>
                                    <p className="card-subtitle">Endereço onde a vaga será exercida</p>
                                </div>
                                {user?.company && (
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={fillCompanyAddress}
                                        style={{ fontSize: 12, padding: "7px 12px" }}
                                    >
                                        <Buildings size={14} weight="duotone" />
                                        Usar endereço da empresa
                                    </button>
                                )}
                            </div>

                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="form-label">CEP</label>
                                    <div className="input-wrap">
                                        <input
                                            name="cep"
                                            value={form.cep}
                                            onChange={handleChange}
                                            onBlur={handleCepBlur}
                                            placeholder="00000-000"
                                            maxLength={9}
                                            className={`input ${errors.cep || cepError ? styles.inputError : ""}`}
                                        />
                                        {loadingCep && <span className="input-badge">Buscando...</span>}
                                    </div>
                                    {(errors.cep || cepError) && (
                                        <span className={styles.errorMsg}>{errors.cep || cepError}</span>
                                    )}
                                </div>

                                <div className="form-field">
                                    <label className="form-label">Estado</label>
                                    <Select
                                        options={stateOptions}
                                        value={stateOptions.find(opt => opt.value === form.state)}
                                        onChange={(opt) => setForm((prev) => ({ ...prev, state: opt.value }))}
                                    />
                                    {errors.state && <span className={styles.errorMsg}>{errors.state}</span>}
                                </div>

                                <div className="form-field">
                                    <label className="form-label">Cidade</label>
                                    <input name="city" value={form.city} onChange={handleChange}
                                        placeholder="São Paulo"
                                        className={`input ${errors.city ? styles.inputError : ""}`} />
                                    {errors.city && <span className={styles.errorMsg}>{errors.city}</span>}
                                </div>

                                <div className="form-field">
                                    <label className="form-label">Bairro</label>
                                    <input name="neighborhood" value={form.neighborhood} onChange={handleChange}
                                        placeholder="Bela Vista"
                                        className={`input ${errors.neighborhood ? styles.inputError : ""}`} />
                                    {errors.neighborhood && <span className={styles.errorMsg}>{errors.neighborhood}</span>}
                                </div>

                                <div className="form-field col-span-2">
                                    <label className="form-label">Endereço</label>
                                    <input name="address" value={form.address} onChange={handleChange}
                                        placeholder="Rua, Avenida..."
                                        className={`input ${errors.address ? styles.inputError : ""}`} />
                                    {errors.address && <span className={styles.errorMsg}>{errors.address}</span>}
                                </div>

                                <div className="form-field">
                                    <label className="form-label">Número</label>
                                    <input name="number" value={form.number} onChange={handleChange}
                                        placeholder="123"
                                        className={`input ${errors.number ? styles.inputError : ""}`} />
                                    {errors.number && <span className={styles.errorMsg}>{errors.number}</span>}
                                </div>

                                <div className="form-field">
                                    <label className="form-label">Complemento</label>
                                    <input name="complement" value={form.complement} onChange={handleChange}
                                        placeholder="Sala 4..." className="input" />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ════ STEP 2 ════ */}
            {step === 1 && (
                <>
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <p className="card-title">Tipo e contrato</p>
                                <p className="card-subtitle">Modalidade e carga horária</p>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-field">
                                <label className="form-label">Tipo de contrato</label>
                                <Select
                                    options={contractOptions}
                                    value={contractOptions.find(opt => opt.value === form.contractType)}
                                    onChange={(opt) => setForm((prev) => ({ ...prev, contractType: opt.value }))}
                                />
                                {errors.contractType && <span className={styles.errorMsg}>{errors.contractType}</span>}
                            </div>

                            <div className="form-field">
                                <label className="form-label">Tipo de vaga</label>
                                <Select
                                    options={jobTypeOptions}
                                    value={jobTypeOptions.find(opt => opt.value === form.jobType)}
                                    onChange={(opt) => setForm((prev) => ({ ...prev, jobType: opt.value }))}
                                />
                            </div>

                            <div className="form-field col-span-2">
                                <label className="form-label">Carga horária semanal (h)</label>
                                <input name="workload" type="number" value={form.workload} onChange={handleChange}
                                    placeholder="Ex: 40"
                                    className={`input ${errors.workload ? styles.inputError : ""}`} />
                                {errors.workload && <span className={styles.errorMsg}>{errors.workload}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div>
                                <p className="card-title">Configurações</p>
                                <p className="card-subtitle">Salário, prioridade e visibilidade</p>
                            </div>

                            <label className={styles.toggleLabel}>
                                <input type="checkbox" name="visible" checked={form.visible}
                                    onChange={handleChange} className={styles.toggleInput} />
                                <span className={styles.toggleTrack}>
                                    <span className={styles.toggleThumb} />
                                </span>
                                <span style={{ fontSize: 13, color: "var(--text-2)" }}>
                                    {form.visible ? "Visível" : "Oculta"}
                                </span>
                            </label>
                        </div>

                        <div className="form-grid">
                            <div className="form-field">
                                <label className="form-label">Salário (R$)</label>
                                <input name="salary" type="number" value={form.salary} onChange={handleChange}
                                    placeholder="Ex: 8000" className="input" />
                            </div>

                            <div className="form-field">
                                <label className="form-label">Prioridade</label>
                                <Select
                                    options={priorityOptions}
                                    value={priorityOptions.find(opt => opt.value === form.priority)}
                                    onChange={(opt) => setForm((prev) => ({ ...prev, priority: opt.value }))}
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label">Data limite</label>
                                <input name="deadline" type="date" value={form.deadline}
                                    onChange={handleChange} className={`input ${errors.workload ? styles.inputError : ""}`} />

                                {errors.deadline && <span className={styles.errorMsg}>{errors.deadline}</span>}
                            </div>

                            <div className="form-field">
                                <label className="form-label">Vaga afirmativa</label>
                                <Select
                                    options={affirmativeOptions}
                                    value={affirmativeOptions.find(opt => opt.value === form.affirmative)}
                                    onChange={(opt) => setForm((prev) => ({ ...prev, affirmative: opt.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div>
                                <p className="card-title">Benefícios</p>
                                <p className="card-subtitle">Selecione os existentes ou adicione novos</p>
                            </div>
                        </div>

                        <div className={styles.benefitsList}>
                            {benefits.map((b) => (
                                <button
                                    key={b.id}
                                    type="button"
                                    className={`${styles.benefitChip} ${selectedBenefits.includes(b.id) ? styles.benefitChipActive : ""}`}
                                    onClick={() => toggleBenefit(b.id)}
                                >
                                    {b.name}
                                </button>
                            ))}
                        </div>

                        <div className={styles.newBenefitRow}>
                            <input
                                value={newBenefit}
                                onChange={(e) => setNewBenefit(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomBenefit())}
                                placeholder="Adicionar benefício personalizado..."
                                className="input"
                                style={{ flex: 1 }}
                            />
                            <button type="button" className="btn-secondary" onClick={addCustomBenefit}>
                                <Plus size={15} weight="bold" />
                                Adicionar
                            </button>
                        </div>

                        {customBenefits.length > 0 && (
                            <div className={styles.customBenefits}>
                                {customBenefits.map((name) => (
                                    <span key={name} className={styles.customChip}>
                                        {name}
                                        <button type="button" onClick={() => removeCustomBenefit(name)}>
                                            <X size={12} weight="bold" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ── Footer ── */}
            <div className={styles.formFooter}>
                {step === 0 ? (
                    <button type="button" className="btn-secondary" onClick={() => navigate("/jobs")}>
                        <ArrowLeft size={16} weight="bold" />
                        Cancelar
                    </button>
                ) : (
                    <button type="button" className="btn-secondary" onClick={handleBack}>
                        <ArrowLeft size={16} weight="bold" />
                        Voltar
                    </button>
                )}

                {step === 0 ? (
                    <button type="button" className="btn-primary" onClick={handleNext}>
                        Próximo
                        <ArrowRight size={16} weight="bold" />
                    </button>
                ) : (
                    <button type="button" className="btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Salvando..." : submitLabel}
                        {!loading && <ArrowRight size={16} weight="bold" />}
                    </button>
                )}
            </div>

        </div>
    );
}