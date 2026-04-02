import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function AsyncSelect({
    fetchOptions,
    value,
    onChange,
    name,
    placeholder = "Selecione...",
    colorMap = {},
}) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dropStyle, setDropStyle] = useState({});

    const containerRef = useRef(null);
    const dropdownRef = useRef(null);

    function handleOpen() {
        if (!open && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropUp = spaceBelow < 220;

            setDropStyle({
                position: "fixed",
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
                ...(dropUp
                    ? { bottom: window.innerHeight - rect.top + 6 }
                    : { top: rect.bottom + 6 }
                ),
            });
        }
        setOpen((prev) => !prev);
    }

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        fetchOptions()
            .then(setOptions)
            .finally(() => setLoading(false));
    }, [open]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target) &&
                !dropdownRef.current?.contains(event.target)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef}>
            <input type="hidden" name={name} value={value?.value || ""} />

            <div className="selectContainer">
                <div
                    onClick={handleOpen}
                    className={`selectTrigger ${open ? "selectTriggerOpen" : ""}`}
                >
                    {value && colorMap[value.value] ? (
                        <span style={{
                            display: "inline-block",
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "3px 10px",
                            borderRadius: 99,
                            color: colorMap[value.value].color,
                            background: colorMap[value.value].bg,
                            whiteSpace: "nowrap",
                            width: "100%",
                            textAlign: "center"
                        }}>
                            {value.label}
                        </span>
                    ) : (
                        <span className={!value ? "selectPlaceholder" : ""}>
                            {value?.label || placeholder}
                        </span>
                    )}
                    <span className="ml-2">▾</span>
                </div>

                {open && createPortal(
                    <div ref={dropdownRef} className="selectDropdown" style={dropStyle}>
                        {loading && <div className="selectOption">Carregando...</div>}

                        {!loading && options.length === 0 && (
                            <div className="selectOption">Nenhum resultado</div>
                        )}

                        {!loading && options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => { onChange(opt); setOpen(false); }}
                                className={`selectOption ${value?.value === opt.value ? "selectOptionActive" : ""}`}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>,
                    document.body
                )}
            </div>
        </div>
    );
}