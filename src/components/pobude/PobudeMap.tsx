'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { kategorijaInfo, statusInfo } from '@/lib/pobude'
import { ring, inObcina } from '@/lib/obcina'
import { Lightbox } from '@/components/site/Lightbox'
import boundaryData from '@/data/radovljica-boundary.json'

export type JavnaPobuda = {
  id: string | number
  naslov: string
  kategorija: string
  kraj: string
  status: string
  lat: number
  lng: number
  fotoUrls?: string[]
}

// Splošna točka (npr. predlagano plakatno mesto) – prikaže se kot pin s svojo barvo.
export type MestoTocka = {
  id: string | number
  naslov: string
  kraj?: string
  statusLabel?: string
  lat: number
  lng: number
  fotoUrls?: string[]
}

// Predogled fotografije v oblačku (klik poveča vse slike). Značka +N, če je slik več.
function FotoPredogled({ slike, alt, onOpen }: { slike?: string[]; alt: string; onOpen: (slike: string[]) => void }) {
  if (!slike || slike.length === 0) return null
  return (
    <div style={{ position: 'relative', marginBottom: 6, cursor: 'zoom-in' }} onClick={() => onOpen(slike)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slike[0]}
        alt={alt}
        style={{ width: '100%', maxWidth: 230, height: 130, objectFit: 'cover', borderRadius: 8, display: 'block' }}
      />
      {slike.length > 1 ? (
        <span
          style={{
            position: 'absolute',
            right: 6,
            bottom: 6,
            background: 'rgba(15,0,78,0.82)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            padding: '1px 7px',
            borderRadius: 999,
          }}
        >
          +{slike.length - 1}
        </span>
      ) : null}
    </div>
  )
}

// Meja občine (ring) in test znotraj/zunaj sta v skupnem modulu '@/lib/obcina'.
const [minLng, minLat, maxLng, maxLat] = boundaryData.bbox as [number, number, number, number]
const PAD = 0.015
// Dodaten prostor na vrhu (sever), da se oblaček ob kliku lahko samodejno premakne v vidno polje.
const BOUNDS = L.latLngBounds([minLat - PAD, minLng - PAD], [maxLat + 0.05, maxLng + PAD])

// Velik zunanji pravokotnik (maska) z luknjo v obliki občine – vse zunaj prekrije.
const WORLD: [number, number][] = [
  [-85, -180],
  [-85, 180],
  [85, 180],
  [85, -180],
]

function pinIcon(color: string, highlight = false) {
  const stroke = highlight ? '#0f004e' : '#ffffff'
  const sw = highlight ? 3 : 2
  const html = `
    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z"
        fill="${color}" stroke="${stroke}" stroke-width="${sw}"/>
      <circle cx="15" cy="15" r="5.5" fill="#ffffff"/>
    </svg>`
  return L.divIcon({ html, className: 'pobuda-pin', iconSize: [30, 40], iconAnchor: [15, 40], popupAnchor: [0, -38] })
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (inObcina(e.latlng.lat, e.latlng.lng)) onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function FitToObcina() {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(L.latLngBounds(ring), { padding: [10, 10] })
  }, [map])
  return null
}

// Ko uporabnik uporabi svojo lokacijo (GPS), zemljevid nežno odleti tja in približa.
function FlyTo({ focus }: { focus: { lat: number; lng: number; key: number } | null }) {
  const map = useMap()
  useEffect(() => {
    if (focus) map.flyTo([focus.lat, focus.lng], 16, { duration: 0.8 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.key])
  return null
}

export default function PobudeMap({
  pobude,
  draft,
  focus,
  onPick,
  mesta = [],
  draftLabel = 'Lokacija tvoje pobude (povleci za premik)',
}: {
  pobude: JavnaPobuda[]
  draft: { lat: number; lng: number } | null
  focus?: { lat: number; lng: number; key: number } | null
  onPick: (lat: number, lng: number) => void
  mesta?: MestoTocka[]
  draftLabel?: string
}) {
  const draftIcon = useMemo(() => pinIcon('#00bbc1', true), [])
  const mestoIcon = useMemo(() => pinIcon('#0f004e'), [])
  const [lightbox, setLightbox] = useState<{ slike: string[]; i: number } | null>(null)
  const odpriFoto = (slike: string[]) => setLightbox({ slike, i: 0 })

  return (
    <>
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
      <FlyTo focus={focus ?? null} />
      <ClickHandler onPick={onPick} />

      {/* Maska: vse zunaj občine prekrito */}
      <Polygon
        positions={[WORLD, ring]}
        pathOptions={{ color: 'transparent', fillColor: '#eef1f6', fillOpacity: 0.92, stroke: false }}
        interactive={false}
      />
      {/* Obris meje občine */}
      <Polygon
        positions={ring}
        pathOptions={{ color: '#00bbc1', weight: 2.5, fill: false }}
        interactive={false}
      />

      {/* Odobrene pobude */}
      {pobude.map((p) => {
        const kat = kategorijaInfo(p.kategorija)
        return (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={pinIcon(kat.color)}>
            <Popup autoPanPaddingTopLeft={[20, 90] as never} autoPanPaddingBottomRight={[20, 20] as never}>
              <div className="text-sm" style={{ minWidth: 170 }}>
                <FotoPredogled slike={p.fotoUrls} alt={p.naslov} onOpen={odpriFoto} />
                <div className="font-semibold text-[#0f004e]">{p.naslov}</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: kat.color }} />
                  {kat.label} · {p.kraj}
                </div>
                <div className="mt-1 text-xs text-[#5b5f73]">Status: {statusInfo(p.status).label}</div>
              </div>
            </Popup>
          </Marker>
        )
      })}

      {/* Predlagana plakatna mesta */}
      {mesta.map((m) => (
        <Marker key={`m-${m.id}`} position={[m.lat, m.lng]} icon={mestoIcon}>
          <Popup autoPanPaddingTopLeft={[20, 90] as never} autoPanPaddingBottomRight={[20, 20] as never}>
            <div className="text-sm" style={{ minWidth: 170 }}>
              <FotoPredogled slike={m.fotoUrls} alt={m.naslov} onOpen={odpriFoto} />
              <div className="font-semibold text-[#0f004e]">{m.naslov}</div>
              {(m.kraj || m.statusLabel) && (
                <div className="mt-1 text-xs text-[#5b5f73]">
                  {m.kraj || ''}
                  {m.kraj && m.statusLabel ? ' · ' : ''}
                  {m.statusLabel ? `Status: ${m.statusLabel}` : ''}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Lokacija nove pobude (osnutek) */}
      {draft && (
        <Marker
          position={[draft.lat, draft.lng]}
          icon={draftIcon}
          draggable
          eventHandlers={{
            dragend(e) {
              const m = e.target as L.Marker
              const ll = m.getLatLng()
              if (inObcina(ll.lat, ll.lng)) onPick(ll.lat, ll.lng)
              else m.setLatLng([draft.lat, draft.lng])
            },
          }}
        >
          <Popup>{draftLabel}</Popup>
        </Marker>
      )}
    </MapContainer>

    {lightbox && (
      <Lightbox
        slike={lightbox.slike}
        index={lightbox.i}
        onIndex={(i) => setLightbox((l) => (l ? { ...l, i } : l))}
        onClose={() => setLightbox(null)}
      />
    )}
    </>
  )
}
