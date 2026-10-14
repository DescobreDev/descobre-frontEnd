import { useEffect, useState } from "react";

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

export default function CompanyLogo({ name, src, size = 88, radius = 16 }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: radius,
        border: "1px solid #e4e9f0",
        background: "#f4f6f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={`Logo de ${name ?? "empresa"}`}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      ) : (
        <span style={{ fontWeight: 700, fontSize: size * 0.3, color: "#6b7684" }}>
          {initials(name)}
        </span>
      )}
    </div>
  );
}