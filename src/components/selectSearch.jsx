import { useState, useRef, useEffect } from "react";

export default function SelectSearch({
    options = [],
    value,
    onChange,
    name,
    placeholder = "Selecione...",
    disabled = false,
    disabledPlaceholder = "Selecione um setor primeiro",
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    const filtered = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    function handleOpen() {
        if (disabled) return;
        setOpen(true);
        setSearch("");
        setTimeout(() => inputRef.current?.focus(), 0);
    }

    function handleSelect(opt) {
        onChange(opt);
        setOpen(false);
        setSearch("");
    }

    function handleClear(e) {
        e.stopPropagation();
        onChange(null);
        setSearch("");
    }

    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setSearch("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const displayPlaceholder = disabled ? disabledPlaceholder : placeholder;

    return (
        <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
            <input type="hidden" name={name} value={value?.value || ""} />

            {/* Trigger */}
            {!open ? (
                <div
                    onClick={handleOpen}
                    className={`selectTrigger ${open ? "selectTriggerOpen" : ""} ${disabled ? "selectTriggerDisabled" : ""}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: disabled ? "not-allowed" : "pointer" }}
                >
                    <span className={!value ? "selectPlaceholder" : ""}>
                        {value?.label  || displayPlaceholder}
                    </span>
                    
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {value && !disabled && (
                            <span
                                onClick={handleClear}
                                style={{ opacity: 0.4, fontSize: 12, padding: "0 4px", cursor: "pointer" }}
                            >
                                ✕
                            </span>
                        )}
                        <span>▾</span>
                    </span>
                </div>
            ) : (
                /* Campo de busca aparece no lugar do trigger */
                <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Buscar...`}
                    className="selectTrigger selectTriggerOpen"
                    style={{ width: "100%", boxSizing: "border-box" }}
                />
            )}

            {/* Dropdown */}
            {open && (
                <div className="selectDropdown">
                    {filtered.length === 0 ? (
                        <div className="selectOption" style={{ opacity: 0.5, cursor: "default" }}>
                            Nenhum resultado
                        </div>
                    ) : (
                        filtered.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt)}
                                className={`selectOption ${value?.value === opt.value ? "selectOptionActive" : ""}`}
                            >
                                {opt.label}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}