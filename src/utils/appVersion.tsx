
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "0.0.0-dev";
export const APP_ENV = import.meta.env.MODE || "development";
export const BUILD_TIME = import.meta.env.VITE_BUILD_TIME || null;
export const COMMIT_SHA = import.meta.env.VITE_COMMIT_SHA || null;


export function getVersionLabel() {
  return COMMIT_SHA ? `v${APP_VERSION} · ${COMMIT_SHA.slice(0, 7)}` : `v${APP_VERSION}`;
}


export function getVersionTooltip() {
  if (!BUILD_TIME) return `Ambiente: ${APP_ENV}`;
  const date = new Date(BUILD_TIME);
  const formatted = Number.isNaN(date.getTime())
    ? BUILD_TIME
    : date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  return `Build em ${formatted} · Ambiente: ${APP_ENV}`;
}