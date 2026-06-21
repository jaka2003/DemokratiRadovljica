'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import boundaryData from '@/data/radovljica-boundary.json'

export type KrajPin = {
  slug: string
  naslov: string
  lat: number
  lng: number
}

const ring: [number, number][] = (boundaryData.coordinates[0] as [number, number][]).map(
  ([lng, lat]) => [lat, lng],
)
const [minLng, minLat, maxLng, maxLat] = boundaryData.bbox as [number, number, number, number]
const PAD = 0.015
const BOUNDS = L.latLngBounds([minLat - PAD, minLng - PAD], [maxLat + PAD, maxLng + PAD])
const WORLD: [number, number][] = [
  [-85, -180],
  [-85, 180],
  [85, 180],
  [85, -180],
]

function pin() {
  const html = `
    <svg width="28" height="38" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z"
        fill="#0f004e" stroke="#ffffff" stroke-width="2"/>
      <circle cx="15" cy="15" r="5.5" fill="#00bbc1"/>
    </svg>`
  return L.divIcon({ html, className: 'kraj-pin', iconSize: [28, 38], iconAnchor: [14, 38], popupAnchor: [0, -36] })
}

function FitToObcina() {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(L.latLngBounds(ring), { padding: [10, 10] })
  }, [map])
  return null
}

export default function ObcinaMap({ kraji }: { kraji: KrajPin[] }) {
  const icon = pin()
  return (
    <MapContainer
      bounds={L.latLngBounds(ring)}
      maxBounds={BOUNDS}
      maxBoundsViscosity={1}
      minZoom={11}
      maxZoom={18}
      scrollWheelZoom={true}
      className="h-full w-full"
      style={{ minHeight: 460, backgroundColor: '#eef1f6' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToObcina />
      <Polygon positions={[WORLD, ring]} pathOptions={{ fillColor: '#eef1f6', fillOpacity: 0.92, stroke: false }} interactive={false} />
      <Polygon positions={ring} pathOptions={{ color: '#00bbc1', weight: 2.5, fill: false }} interactive={false} />

      {kraji
        .filter((k) => typeof k.lat === 'number' && typeof k.lng === 'number')
        .map((k) => (
          <Marker key={k.slug} position={[k.lat, k.lng]} icon={icon}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-[#0f004e]">{k.naslov}</div>
                <a href={`/obcina/${k.slug}`} className="mt-1 inline-block text-xs font-medium text-[#008288] underline">
                  Odpri podstran kraja →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  )
}
