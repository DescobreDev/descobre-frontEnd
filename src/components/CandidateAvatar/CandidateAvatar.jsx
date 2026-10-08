import { useState } from "react";
import styles from "../CSS/CandidateAvatar.module.css";

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export function CandidateAvatar({ name, avatar, legacyUrl, size = 64 }) {
  const [failed, setFailed] = useState(false);

  const src = avatar ? (size <= 64 ? avatar.thumbUrl : avatar.url) : legacyUrl;

  if (!src || failed) {
    return (
      <div
        className={styles.fallback}
        style={{ width: size, height: size, fontSize: size * 0.36 }}
      >
        {initials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Foto de ${name}`}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={styles.img}
      onError={() => setFailed(true)}
    />
  );
}