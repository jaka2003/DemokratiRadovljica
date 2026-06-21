import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'

// Izvoz seznama kandidatov v CSV (spec. razdelek 11.1).
export async function GET(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return new Response('Dostop zavrnjen', { status: 403 })

  const res = await payload.find({
    collection: 'users',
    where: { vloga: { equals: 'kandidat' } },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })

  const headers = [
    'Ime',
    'E-pošta',
    'Kraj',
    'Telefon',
    'Status profila',
    'Status dokumentacije',
    'Službeni e-naslov',
    'Zadnja prijava',
  ]
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = res.docs.map((d: Record<string, unknown>) =>
    [
      d.ime,
      d.email,
      d.naslovKraj,
      d.telefon,
      d.statusProfila,
      d.statusDokumentacije,
      d.sluzbeniEmailPotrjen,
      d.zadnjaPrijava || '',
    ]
      .map(esc)
      .join(','),
  )
  const csv = '﻿' + [headers.map(esc).join(','), ...rows].join('\r\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="kandidati.csv"',
    },
  })
}
