import { useState, useEffect, useRef } from "react";
import api from "../services/api";

const normalize = (t) =>
    t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, " ");

export default function PositionSearch({ value, onChange, disabled, hasError, placeholder }) {
    const [query, setQuery] = useState("");
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");
    const boxRef = useRef(null);

    useEffect(() => {
        const trimmed = query.trim();
        if (!open || trimmed.length < 2) { setItems([]); return; }
        setLoading(true);
        const t = setTimeout(async () => {
            try {
                const { data } = await api.get(`/positions/search?q=${encodeURIComponent(trimmed)}`);
                setItems(data);
            } catch {
                setItems([]);
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(t);
    }, [query, open]);

    useEffect(() => {
        function onClickOutside(e) {
            if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    function select(item) {
        onChange({ value: item.id, label: item.name, sectorName: item.sectorName ?? null });
        setQuery("");
        setOpen(false);
    }

    async function handleCreate() {
        setCreating(true);
        setCreateError("");
        try {
            const { data } = await api.post("/positions", { name: query.trim() });
            select({ id: data.id, name: data.name, sectorName: null });
        } catch (err) {
            setCreateError(err?.response?.data?.message || "Não foi possível criar o cargo.");
        } finally {
            setCreating(false);
        }
    }

    const trimmed = query.trim();
    const showCreate =
        !loading && trimmed.length >= 3 &&
        !items.some((i) => normalize(i.name) === normalize(trimmed));

    const dropdownStyle = {
        position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, marginTop: 4,
        background: "#fff", border: "1px solid #e4e9f0", borderRadius: 8,
        maxHeight: 260, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    };
    const rowStyle = { padding: "10px 12px", cursor: "pointer", fontSize: 14 };

    return (
        <div ref={boxRef} style={{ position: "relative" }}>
            <input
                className={`input ${hasError ? "inputError" : ""}`}
                value={open ? query : (value?.label ?? "")}
                placeholder={placeholder}
                disabled={disabled}
                onFocus={() => { setOpen(true); setQuery(""); }}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            />

            {open && !disabled && (
                <div style={dropdownStyle}>
                    {trimmed.length < 2 && (
                        <div style={{ ...rowStyle, color: "#6b7684", cursor: "default" }}>Digite para buscar...</div>
                    )}
                    {loading && (
                        <div style={{ ...rowStyle, color: "#6b7684", cursor: "default" }}>Buscando...</div>
                    )}
                    {!loading && items.map((i) => (
                        <div key={i.id} style={rowStyle} onMouseDown={() => select(i)}>
                            {i.name}
                        </div>
                    ))}
                    {!loading && trimmed.length >= 2 && items.length === 0 && !showCreate && (
                        <div style={{ ...rowStyle, color: "#6b7684", cursor: "default" }}>Nenhum resultado.</div>
                    )}
                    {showCreate && (
                        <div style={{ ...rowStyle, color: "#f97316", fontWeight: 600 }} onMouseDown={handleCreate}>
                            {creating ? "Criando..." : `+ Criar "${trimmed}"`}
                        </div>
                    )}
                    {createError && (
                        <div style={{ ...rowStyle, color: "#B91C1C", cursor: "default" }}>{createError}</div>
                    )}
                </div>
            )}
        </div>
    );
}