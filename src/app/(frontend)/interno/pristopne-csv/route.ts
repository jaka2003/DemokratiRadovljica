import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'
import { SPOL_OPCIJE, POSTA_OPCIJE, IZOBRAZBA_OPCIJE, PRISTOP_STATUSI } from '@/lib/pristop'

const label = (opcije: readonly { value: string; label: string }[], v: unknown) =>
  opcije.find((o) => o.value === v)?.label || String(v ?? '')

const datum = (v: unknown) => {
  if (!v) return ''
  try {
    return new Date(v as string).toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return ''
  }
}

// Izvoz pristopnih izjav (včlanitev) v CSV (Excel).
export async function GET(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return new Response('Dostop zavrnjen', { status: 403 })

  const res = await payload.find({
    collection: 'pristopne-izjave',
    sort: '-createdAt',
    limit: 5000,
    depth: 0,
    overrideAccess: true,
  })

  const headers = [
    'Ime in priimek',
    'Datum rojstva',
    'Spol',
    'E-naslov',
    'Mobilni telefon',
    'Telefon',
    'Stalni naslov',
    'Mesto',
    'Pošta',
    'Začasni naslov',
    'Mesto (zač.)',
    'Pošta (zač.)',
    'Pošto na',
    'Poklic',
    'Delovno mesto',
    'Podjetje',
    'Sedež zaposlitve',
    'Izobrazba',
    'Status',
    'Oddano',
  ]
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = (res.docs as Record<string, unknown>[]).map((d) =>
    [
      d.imePriimek,
      datum(d.datumRojstva),
      label(SPOL_OPCIJE, d.spol),
      d.email,
      d.mobilniTelefon,
      d.telefon,
      d.stalniNaslov,
      d.stalnoMesto,
      d.stalnaPosta,
      d.zacasniNaslov,
      d.zacasnoMesto,
      d.zacasnaPosta,
      label(POSTA_OPCIJE, d.postaNa),
      d.poklic,
      d.delovnoMesto,
      d.podjetje,
      d.sedezZaposlitve,
      label(IZOBRAZBA_OPCIJE, d.izobrazba),
      label(PRISTOP_STATUSI, d.status),
      datum(d.createdAt),
    ]
      .map(esc)
      .join(','),
  )
  const csv = '﻿' + [headers.map(esc).join(','), ...rows].join('\r\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="pristopne-izjave.csv"',
    },
  })
}
