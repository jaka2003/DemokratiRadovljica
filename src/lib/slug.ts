// Pretvori naslov v URL-prijazen "slug" (del spletne povezave) – brez šumnikov in presledkov.
export function slugify(s: unknown): string {
  return String(s ?? '')
    .toLowerCase()
    .replace(/č/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/ć/g, 'c')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
