import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'

// Pošiljanje e-pošte kandidatom (spec. razdelek 11.2).
export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return NextResponse.json({ ok: false, error: 'Dostop zavrnjen.' }, { status: 403 })

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ ok: false, error: 'Neveljavna zahteva.' }, { status: 400 })
  }
  const subject = String(form.get('subject') || '').trim()
  const html = String(form.get('body') || '').trim()
  const test = form.get('test') === 'true'

  if (!subject || !html)
    return NextResponse.json({ ok: false, error: 'Vnesi zadevo in vsebino.' }, { status: 400 })

  // Priloge (datoteke).
  const datoteke = form.getAll('priloge').filter((f): f is File => typeof f === 'object' && 'arrayBuffer' in f && (f as File).size > 0)
  const skupnaVelikost = datoteke.reduce((s, f) => s + f.size, 0)
  if (skupnaVelikost > 15 * 1024 * 1024)
    return NextResponse.json({ ok: false, error: 'Priloge so prevelike (skupaj največ 15 MB).' }, { status: 400 })
  const attachments = await Promise.all(
    datoteke.map(async (f) => ({ filename: f.name, content: Buffer.from(await f.arrayBuffer()) })),
  )

  // Prejemniki: bodisi izrecno izbrani posamezniki (userIds), bodisi po kategorijah (vloge)
  // z načinom ujemanja – »katera koli« (unija) ali »vse hkrati« (presek).
  const userIdsRaw = String(form.get('userIds') || '').trim()
  const kategorijeRaw = String(form.get('kategorije') || '').trim()
  const nacin = form.get('nacin') === 'vse' ? 'vse' : 'katera'

  // Ročni dodatni e-naslovi (osebe, ki niso uporabniki aplikacije).
  const rocni = String(form.get('dodatniEmaili') || '')
    .split(/[\s,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))

  // where = null pomeni »ne dodajaj uporabnikov« (npr. samo ročni naslovi).
  let where: Record<string, unknown> | null = null
  let opisFilter = 'vsi uporabniki'
  if (userIdsRaw) {
    let ids: (string | number)[] = []
    try {
      ids = JSON.parse(userIdsRaw)
    } catch {}
    where = { id: { in: ids } }
    opisFilter = `posamezni (${ids.length})`
  } else {
    let kategorije: string[] = []
    try {
      kategorije = JSON.parse(kategorijeRaw)
    } catch {}
    if (kategorije.length) {
      where =
        nacin === 'vse'
          ? { and: kategorije.map((k) => ({ vloga: { in: [k] } })) }
          : { vloga: { in: kategorije } }
      opisFilter = `${kategorije.join(', ')} (${nacin === 'vse' ? 'vse hkrati' : 'katera koli'})`
    } else if (rocni.length) {
      // Brez kategorij, a so ročni naslovi → pošlji SAMO njim (ne vsem uporabnikom).
      where = null
      opisFilter = 'samo dodatni naslovi'
    } else {
      where = {} // brez izbire in brez ročnih = vsi uporabniki (kot doslej)
    }
  }
  if (rocni.length && opisFilter !== 'samo dodatni naslovi') opisFilter += ` + ${rocni.length} dodatnih`

  // Testno pošiljanje: samo administratorju.
  if (test) {
    try {
      await payload.sendEmail({ to: user!.email, subject: `[TEST] ${subject}`, html, attachments })
      return NextResponse.json({ ok: true, sent: 1, test: true })
    } catch (e) {
      console.error(e)
      return NextResponse.json({ ok: false, error: 'Testno sporočilo ni bilo poslano.' }, { status: 500 })
    }
  }

  const emails = new Set<string>()
  if (where) {
    const res = await payload.find({ collection: 'users', where: where as never, limit: 1000, depth: 0, overrideAccess: true })
    for (const d of res.docs as Record<string, unknown>[]) {
      const e = String(d.email || '').trim().toLowerCase()
      if (e) emails.add(e)
    }
  }
  for (const e of rocni) emails.add(e)
  const prejemniki = [...emails]
  if (!prejemniki.length) {
    return NextResponse.json(
      { ok: false, error: 'Ni prejemnikov – izberi kategorije/osebe ali vpiši dodatne e-naslove.' },
      { status: 400 },
    )
  }

  // GDPR: vsako sporočilo vsebuje možnost odjave.
  const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const noga = `<hr/><p style="font-size:12px;color:#888">To sporočilo ste prejeli kot del kampanje Demokrati Radovljica. Odjavo lahko uredite <a href="${base}/zasebnost">tukaj</a>.</p>`

  let sent = 0
  for (const to of prejemniki) {
    try {
      await payload.sendEmail({ to, subject, html: html + noga, attachments })
      sent++
    } catch (e) {
      console.error('E-pošta ni bila poslana:', to, e)
    }
  }

  // Evidenca poslanih sporočil.
  try {
    await payload.create({
      collection: 'email-dnevnik',
      data: { zadeva: subject, filter: opisFilter, prejemnikov: sent, posiljatelj: user!.email, vsebina: html },
      overrideAccess: true,
    })
  } catch {}

  return NextResponse.json({ ok: true, sent, total: prejemniki.length })
}
