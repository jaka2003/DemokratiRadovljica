// Razbije besedilo (ločeno z vejico, podpičjem ali novo vrstico) v seznam.
export const splitToList = (s?: unknown): string[] =>
  String(s ?? '')
    .split(/[\n;,]+/)
    .map((x) => x.trim())
    .filter(Boolean)
