import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isAdmin } from '@/access/roles'
import { resolveUdelezenci } from '@/lib/seje-server'

const esc = (s: unknown) =>
  String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string))
const nl = (s: unknown) => esc(s).replace(/\n/g, '<br/>')

function err(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

type Media = { url?: string; filename?: string }

function sejaEmailHtml(seja: Record<string, unknown>, base: string): string {
  const link = `${base}/interno/seje/${seja.id}`
  const rok = seja.rokGlasovanja
    ? new Date(seja.rokGlasovanja as string).toLocaleString('sl-SI', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: 'Europe/Ljubljana',
      })
    : ''
  const tocke = (Array.isArray(seja.tocke) ? seja.tocke : []) as { naslov?: string }[]
  const dnevni = tocke.length
    ? `<p style="margin:16px 0 4px"><strong>Predlog dnevnega reda:</strong></p><ol>${tocke
        .map((t) => `<li>${esc(t.naslov)}</li>`)
        .join('')}</ol>`
    : ''
  const gradivo = (Array.isArray(seja.gradivo) ? seja.gradivo : []) as Media[]
  const gradivoSeznam = gradivo.filter((m) => m && m.url).length
    ? `<p style="margin:16px 0 4px"><strong>Gradivo:</strong></p><ul>${gradivo
        .filter((m) => m && m.url)
        .map((m) => `<li><a href="${base}${m.url}">${esc(m.filename || 'dokument')}</a></li>`)
        .join('')}</ul>`
    : ''

  return `
    <div style="font-family:Arial,sans-serif;color:#1b1b1b;line-height:1.5">
      <p>${esc(seja.emailUvod || 'Spoštovani,')}</p>
      <p>${nl(seja.emailGlavno || '')}</p>
      <p style="margin-top:16px"><strong>${esc(seja.naslov)}</strong>${
        seja.stevilka ? ` — ${esc(seja.stevilka)}` : ''
      }</p>
      ${rok ? `<p><strong>Rok za glasovanje:</strong> ${esc(rok)}</p>` : ''}
      ${dnevni}
      ${gradivoSeznam}
      <p style="margin:22px 0">
        <a href="${link}" style="display:inline-block;background:#00bbc1;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700">Odpri sejo in glasuj</a>
      </p>
      <p style="font-size:12px;color:#888">Če gumb ne deluje, odprite povezavo: ${link}</p>
      <p style="margin-top:16px">${nl(seja.emailZakljucek || '')}</p>
      ${seja.emailPodpis ? `<p style="margin-top:18px"><strong>${esc(seja.emailPodpis)}</strong></p>` : ''}
    </div>
  `
}

// Najboljši poskus: priloži datoteke gradiva iz medijev (z diska). Če ne uspe, e-pošta gre brez prilog
// (gradivo je vedno dostopno tudi v sistemu prek povezave).
async function zberiPriloge(seja: Record<string, unknown>) {
  const att: { filename: string; content: Buffer }[] = []
  const gradivo = (Array.isArray(seja.gradivo) ? seja.gradivo : []) as Media[]
  let skupno = 0
  for (const m of gradivo) {
    if (!m || !m.filename) continue
    try {
      const p = path.join(process.cwd(), 'media', m.filename)
      const content = await fs.readFile(p)
      if (skupno + content.length > 15 * 1024 * 1024) break
      skupno += content.length
      att.push({ filename: m.filename, content })
    } catch {
      /* preskoči – datoteka je dostopna prek povezave v sistemu */
    }
  }
  return att
}

export async function POST(req: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isAdmin(user)) return err('Dostop zavrnjen.', 403)

  const body = await req.json().catch(() => ({}))
  const id = body?.id
  const nacin = body?.nacin === 'test' ? 'test' : body?.nacin === 'poslji' ? 'poslji' : 'predogled'
  if (!id) return err('Najprej shrani sejo.')

  let seja: Record<string, unknown>
  try {
    seja = (await payload.findByID({ collection: 'seje', id, depth: 1, overrideAccess: true })) as Record<
      string,
      unknown
    >
  } catch {
    return err('Seja ni najdena.', 404)
  }

  const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const html = sejaEmailHtml(seja, base)
  const subject = String(seja.emailZadeva || 'Sklic dopisne seje')

  if (nacin === 'predogled') {
    return NextResponse.json({ ok: true, html, subject })
  }

  const attachments = await zberiPriloge(seja)

  if (nacin === 'test') {
    try {
      await payload.sendEmail({ to: user!.email, subject: `[TEST] ${subject}`, html, attachments })
      return NextResponse.json({ ok: true, test: true })
    } catch (e) {
      console.error(e)
      return err('Testnega sporočila ni bilo mogoče poslati.', 500)
    }
  }

  // Pošlji vsem udeležencem.
  const udelezenci = await resolveUdelezenci(payload, seja)
  const emails = [...new Set(udelezenci.map((u) => u.email).filter(Boolean))] as string[]
  if (!emails.length) return err('Ni prejemnikov z e-naslovom – dodaj udeležence (skupine ali posameznike).')

  let sent = 0
  for (const to of emails) {
    try {
      await payload.sendEmail({ to, subject, html, attachments })
      sent++
    } catch (e) {
      console.error('Vabilo ni bilo poslano:', to, e)
    }
  }

  // Po pošiljanju je seja »V teku«.
  try {
    await payload.update({
      collection: 'seje',
      id,
      data: { status: 'v_teku', poslanoOb: new Date().toISOString() },
      overrideAccess: true,
    })
  } catch (e) {
    console.error(e)
  }

  return NextResponse.json({ ok: true, sent, total: emails.length })
}
