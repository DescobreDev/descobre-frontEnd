import { useRef, useState, useCallback } from "react";
import { UploadSimpleIcon, ImageIcon, XIcon, ArrowClockwiseIcon } from "@phosphor-icons/react";
import styles from "./CSS/LogoUploadField.module.css";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

function LogoUploadField({ file, preview, onChange, onError, label = "Logo", optional = true }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSet = useCallback(
    (selectedFile) => {
      if (!selectedFile) return;

      if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
        onError?.("A logo deve ser um arquivo JPG, PNG ou WEBP.");
        return;
      }
      if (selectedFile.size > MAX_SIZE_BYTES) {
        onError?.("A logo deve ter no máximo 2 MB.");
        return;
      }

      onError?.(null);
      const previewUrl = URL.createObjectURL(selectedFile);
      onChange?.(selectedFile, previewUrl);
    },
    [onChange, onError]
  );

  function handleInputChange(e) {
    validateAndSet(e.target.files?.[0]);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    validateAndSet(e.dataTransfer.files?.[0]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleRemove(e) {
    e.stopPropagation();
    if (preview) URL.revokeObjectURL(preview);
    onChange?.(null, null);
  }

  function handleReplace(e) {
    e.stopPropagation();
    inputRef.current?.click();
  }

  const sizeLabel = file ? formatBytes(file.size) : null;

  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label} {optional && <span className={styles.optional}>(opcional)</span>}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleInputChange}
        className={styles.hiddenInput}
        aria-hidden="true"
        tabIndex={-1}
      />

      {preview ? (
        <div className={styles.previewCard}>
          <div className={styles.previewThumb}>
            <img src={preview} alt="Prévia da logo" className={styles.previewImg} />
          </div>

          <div className={styles.previewInfo}>
            <span className={styles.previewName} title={file?.name}>
              {file?.name || "Logo selecionada"}
            </span>
            {sizeLabel && <span className={styles.previewMeta}>{sizeLabel}</span>}
          </div>

          <div className={styles.previewActions}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={handleReplace}
              aria-label="Trocar logo"
              title="Trocar logo"
            >
              <ArrowClockwiseIcon size={15} weight="bold" />
            </button>
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
              onClick={handleRemove}
              aria-label="Remover logo"
              title="Remover logo"
            >
              <XIcon size={15} weight="bold" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ""}`}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <span className={styles.dropzoneIcon}>
            {isDragging ? <UploadSimpleIcon size={20} weight="bold" /> : <ImageIcon size={20} weight="bold" />}
          </span>
          <span className={styles.dropzoneText}>
            <strong>{isDragging ? "Solte a imagem aqui" : "Clique para enviar"}</strong>
            {!isDragging && " ou arraste o arquivo"}
          </span>
          <span className={styles.dropzoneHint}>JPG, PNG ou WEBP · até 2 MB</span>
        </button>
      )}
    </div>
  );
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default LogoUploadField;