import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

import { POBUDA_KATEGORIJE, KRAJI } from '@/lib/pobude'
import { kategorijaInfo } from '@/lib/pobude'

const KATEGORIJE = POBUDA_KATEGORIJE.map((k) => k.value) as string[]
const KRAJI_LIST = KRAJI as readonly string[]

function err(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export async function POST(req: Request) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return err('Neveljavna zahteva.')
  }

  const get = (k: string) => String(form.get(k) ?? '').trim()

  const naslov = get('naslov')
  const kategorija = get('kategorija')
  const kraj = get('kraj')
  const opis = get('opis')
  const imePriimek = get('imePriimek')
  const email = get('email')
  const telefon = get('telefon')
  const soglasje = form.get('soglasjeGDPR') === 'true' || form.get('soglasjeGDPR') === 'on'
  const dovoliJavnoObjavo =
    form.get('dovoliJavnoObjavo') === 'true' || form.get('dovoliJavnoObjavo') === 'on'

  const latRaw = get('lat')
  const lngRaw = get('lng')
  const lat = latRaw ? Number(latRaw) : undefined
  const lng = lngRaw ? Number(lngRaw) : undefined

  // --- Validacija ---
  if (!naslov || naslov.length < 3) return err('Vnesi naslov pobude (vsaj 3 znake).')
  if (!KATEGORIJE.includes(kategorija)) return err('Izberi veljavno kategorijo.')
  if (!KRAJI_LIST.includes(kraj)) return err('Izberi veljaven kraj.')
  if (!opis || opis.length < 10) return err('Opiši težavo ali predlog (vsaj 10 znakov).')
  if (!imePriimek) return err('Vnesi ime in priimek.')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err('Vnesi veljaven e-poštni naslov.')
  if (!soglasje) return err('Za oddajo je potrebno soglasje za obdelavo osebnih podatkov.')
  if (lat !== undefined && (Number.isNaN(lat) || lat < 45 || lat > 47))
    return err('Neveljavna lokacija na zemljevidu.')
  if (lng !== undefined && (Number.isNaN(lng) || lng < 13 || lng > 16))
    return err('Neveljavna lokacija na zemljevidu.')

  const payload = await getPayload({ config })

  // --- Neobvezne fotografije (do 4) ---
  const fotoIds: (string | number)[] = []
  const files = form
    .getAll('foto')
    .filter((f): f is File => typeof f === 'object' && f !== null && 'arrayBuffer' in f && (f as File).size > 0)
    .slice(0, 4)
  for (const f of files) {
    if (!f.type.startsWith('image/')) return err('Priložene datoteke morajo biti slike.')
    if (f.size > 8 * 1024 * 1024) return err('Slika je prevelika (največ 8 MB).')
  }
  for (const f of files) {
    try {
      const buffer = Buffer.from(await f.arrayBuffer())
      const media = await payload.create({
        collection: 'media',
        data: { alt: naslov },
        file: { data: buffer, mimetype: f.type, name: f.name || 'pobuda.jpg', size: f.size },
        overrideAccess: true,
      })
      fotoIds.push(media.id)
    } catch (e) {
      console.error('Napaka pri nalaganju slike:', e)
      // Slika ni ključna – nadaljujemo brez nje.
    }
  }

  // --- Ustvari pobudo ---
  let pobudaId: string | number
  try {
    const pobuda = await payload.create({
      collection: 'pobude',
      data: {
        naslov,
        kategorija: kategorija as never,
        kraj: kraj as never,
        opis,
        lat,
        lng,
        imePriimek,
        email,
        telefon: telefon || undefined,
        soglasjeGDPR: true,
        dovoliJavnoObjavo,
        status: 'nova',
        javnoObjavljeno: false,
        ...(fotoIds.length ? { foto: fotoIds } : {}),
      },
      overrideAccess: true,
    })
    pobudaId = pobuda.id
  } catch (e) {
    console.error('Napaka pri shranjevanju pobude:', e)
    return err('Pobude ni bilo mogoče shraniti. Poskusi znova.', 500)
  }

  // --- E-pošta (potrditev predlagatelju + obvestilo adminu) ---
  const kat = kategorijaInfo(kategorija).label
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_FROM
  try {
    await payload.sendEmail({
      to: email,
      subject: 'Prejeli smo tvojo pobudo – Demokrati Radovljica',
      html: `
        <p>Pozdravljeni,</p>
        <p>hvala za oddano pobudo <strong>"${naslov}"</strong> (${kat}, ${kraj}).</p>
        <p>Vašo pobudo bomo pregledali in po potrebi vključili v program. O statusu vas lahko obvestimo na ta e-naslov.</p>
        <p>Lep pozdrav,<br/>Ekipa Demokrati Radovljica</p>
      `,
    })
  } catch (e) {
    console.error('Potrditveni e-mail ni bil poslan:', e)
  }
  if (adminEmail) {
    try {
      await payload.sendEmail({
        to: adminEmail,
        subject: `Nova pobuda: ${naslov} (${kat}, ${kraj})`,
        html: `
          <p>Prejeta je nova pobuda občana.</p>
          <ul>
            <li><strong>Naslov:</strong> ${naslov}</li>
            <li><strong>Kategorija:</strong> ${kat}</li>
            <li><strong>Kraj:</strong> ${kraj}</li>
            <li><strong>Predlagatelj:</strong> ${imePriimek} (${email}${telefon ? ', ' + telefon : ''})</li>
          </ul>
          <p>Odpri v administraciji: <a href="${process.env.NEXT_PUBLIC_SERVER_URL || ''}/admin/collections/pobude/${pobudaId}">pregled pobude</a></p>
        `,
      })
    } catch (e) {
      console.error('Admin obvestilo ni bilo poslano:', e)
    }
  }

  return NextResponse.json({ ok: true, id: pobudaId })
}
