// Pomožno za prikaz slik: upošteva fokusno točko medija pri obrezu (object-cover).
// Če je v adminu nastavljena fokusna točka (focalX/focalY, 0–100), jo uporabi;
// sicer vrne podan privzetek (za portrete oseb priporočeno '50% 25%' – obraz ostane v okvirju).
export function focalPos(media: unknown, fallback = 'center'): string {
  const m = media as { focalX?: number | null; focalY?: number | null } | null | undefined
  if (m && typeof m.focalX === 'number' && typeof m.focalY === 'number') {
    return `${m.focalX}% ${m.focalY}%`
  }
  return fallback
}
