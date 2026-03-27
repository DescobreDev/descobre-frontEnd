import { useState, useRef, useEffect } from "react";

export default function Select({ options, value, onChange, name, placeholder = "Selecione..." }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    function handleSelect(option) {
        onChange(option);
        setOpen(false);
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={containerRef}>
            <input type="hidden" name={name} value={value?.value || ""} />

            <div className="selectContainer">
                <div
                    onClick={() => setOpen(!open)}
                    className={`selectTrigger ${open ? "selectTriggerOpen" : ""}`}
                >
                    <span className={!value ? "selectPlaceholder" : ""}>
                        {value?.label || placeholder}
                    </span>

                    <span>▾</span>
                </div>

                {open && (
                    <div className="selectDropdown">
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt)}
                                className={`selectOption ${value?.value === opt.value ? "selectOptionActive" : ""
                                    }`}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}