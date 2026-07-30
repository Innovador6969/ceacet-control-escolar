export function collapseWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeCatalogName(value: string) {
  return collapseWhitespace(value).toLowerCase();
}

export function normalizeCatalogCode(value: string) {
  return collapseWhitespace(value).toUpperCase();
}

export function normalizeOptionalText(value: string) {
  const normalized = value.trim();
  return normalized === "" ? undefined : normalized;
}

export function normalizeOptionalCatalogCode(value: string) {
  const normalized = normalizeOptionalText(value);
  return normalized ? normalizeCatalogCode(normalized) : undefined;
}
