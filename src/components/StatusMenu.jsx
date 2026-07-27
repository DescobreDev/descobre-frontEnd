import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CaretDown, Check } from "@phosphor-icons/react";

export default function StatusMenu({ value, options, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});

  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const current = options[value] ?? { label: value, color: "#64748b", bg: "#f1f5f9", dot: "#94a3b8" };

  function handleToggle() {
    if (disabled) return;

    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < 200;

      setMenuStyle({
        position: "fixed",
        left: rect.left,
        minWidth: Math.max(rect.width, 190),
        zIndex: 9999,
        ...(openUpward
          ? { bottom: window.innerHeight - rect.top + 8 }
          : { top: rect.bottom + 8 }),
      });
    }
    setOpen((prev) => !prev);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={triggerRef} style={{ width: "100%" }} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          width: "100%",
          border: "none",
          cursor: disabled ? "default" : "pointer",
          padding: "5px 12px",
          borderRadius: 99,
          fontSize: 12,
          fontWeight: 600,
          color: current.color,
          background: current.bg,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: 99, background: current.dot, flexShrink: 0 }} />
        {current.label}
        {!disabled && <CaretDown size={9} weight="bold" style={{ opacity: 0.55, marginLeft: 1 }} />}
      </button>

      {open && !disabled && createPortal(
        <div
          ref={menuRef}
          style={{
            ...menuStyle,
            background: "#ffffff",
            borderRadius: 14,
            border: "1px solid #eef1f6",
            boxShadow: "0 16px 40px rgba(15,23,42,0.16), 0 2px 8px rgba(15,23,42,0.06)",
            padding: 6,
          }}
        >
          <p style={{
            margin: 0, padding: "6px 10px 8px",
            fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em",
            textTransform: "uppercase", color: "#94a3b8",
          }}>
            Alterar status
          </p>

          {Object.entries(options).map(([key, cfg]) => {
            const selected = key === value;
            return (
              <button
                key={key}
                type="button"
                onClick={() => { onChange(key); setOpen(false); }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  background: "transparent",
                  padding: "9px 10px",
                  borderRadius: 9,
                  cursor: "pointer",
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: "#1e293b",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 99, background: cfg.dot, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{cfg.label}</span>
                {selected && <Check size={15} weight="bold" color="#059669" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}