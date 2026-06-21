import boundaryData from '@/data/radovljica-boundary.json'

// Meja občine Radovljica brez odvisnosti od Leafleta (varno tudi na strežniku).
// GeoJSON je [lng, lat] – pretvorimo v [lat, lng], kot pričakuje ray casting in Leaflet.
export const ring: [number, number][] = (boundaryData.coordinates[0] as [number, number][]).map(
  ([lng, lat]) => [lat, lng],
)

// Ali točka (lat, lng) leži znotraj občine (ray casting).
export function inObcina(lat: number, lng: number): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [yi, xi] = ring[i]
    const [yj, xj] = ring[j]
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}
