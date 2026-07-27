import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CaretDown, Check } from "@phosphor-icons/react";

/**
 * StatusMenu
 * Popover em formato de card pra trocar o status de uma vaga — bolinha de
 * cor, rótulo e check no item selecionado. Usa os tokens do tema (var(--*))
 * em vez de hex fixo, então acompanha o sistema de design automaticamente.
 */
export default function StatusMenu({ value, options, onChange, disabled = false, variant = "default" }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});

  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const onGradient = variant === "onGradient";

  const current = options[value] ?? {
    label: value,
    color: "var(--text-muted)",
    bg: "var(--surface-2)",
    dot: "var(--text-muted)",
  };

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
          padding: "6px 12px",
          borderRadius: 99,
          fontSize: 12,
          fontWeight: 600,
          color: current.color,
          background: current.bg,
          opacity: disabled ? 0.6 : 1,
          fontFamily: "inherit",
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
            background: "var(--surface)",
            borderRadius: "var(--r-md)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-md)",
            padding: 6,
          }}
        >
          <p style={{
            margin: 0, padding: "6px 10px 8px",
            fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em",
            textTransform: "uppercase", color: "var(--text-muted)",
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
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
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
                  borderRadius: "var(--r-sm)",
                  cursor: "pointer",
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: "var(--text)",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 99, background: cfg.dot, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{cfg.label}</span>
                {selected && <Check size={15} weight="bold" color="var(--green)" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}