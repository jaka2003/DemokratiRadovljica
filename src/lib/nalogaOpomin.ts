import type { Payload } from 'payload'

const esc = (s: unknown) =>
  String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string))

const rokBesedilo = (rok?: string) => {
  if (!rok) return ''
  try {
    return new Date(rok).toLocaleDateString('sl-SI', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

type Naloga = { id: string | number; naslov?: string; status?: string; rok?: string }

// Pošlje osebi opomin za neopravljene naloge. Če je podan nalogaId, opomni za točno to nalogo,
// sicer za VSE odprte (status ≠ zaključena). urgentno = poudarjen (nujen) ton. Vrne število nalog v opominu.
export async function posljiOpomin(
  payload: Payload,
  { userId, nalogaId, urgentno }: { userId: string | number; nalogaId?: string | number; urgentno?: boolean },
): Promise<number> {
  const u = (await payload.findByID({ collection: 'users', id: userId, depth: 0, overrideAccess: true })) as {
    email?: string
    ime?: string
  }
  if (!u?.email) throw new Error('Oseba nima e-naslova.')

  const where = nalogaId
    ? { and: [{ id: { equals: nalogaId } }, { kandidat: { equals: userId } }] }
    : { and: [{ kandidat: { equals: userId } }, { status: { not_equals: 'zakljucena' } }] }
  const res = await payload.find({
    collection: 'naloge',
    where,
    depth: 0,
    overrideAccess: true,
    limit: 100,
    sort: 'rok',
  })
  const naloge = res.docs as Naloga[]
  if (naloge.length === 0) throw new Error('Ni odprtih nalog za opomin.')

  const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const pozdrav = u.ime ? `Pozdravljen/-a, ${esc(u.ime)},` : 'Pozdravljen/-a,'
  const ena = naloge.length === 1
  const subject = urgentno
    ? ena
      ? `⏰ URGENTNO – naloga: ${naloge[0].naslov}`
      : '⏰ URGENTNO – odprte naloge'
    : ena
      ? `Opomnik – naloga: ${naloge[0].naslov}`
      : 'Opomnik – odprte naloge'

  const uvod = urgentno
    ? 'prosimo za <strong>čimprejšnjo</strong> izpolnitev naslednje(-ih) naloge(-nalog) – <strong>nujno</strong>:'
    : ena
      ? 'vljuden opomnik, da te še čaka naslednja naloga:'
      : 'vljuden opomnik, da te še čakajo naslednje naloge:'

  const vrstice = naloge
    .map((n) => {
      const r = rokBesedilo(n.rok)
      return `<li style="margin-bottom:6px"><strong>${esc(n.naslov)}</strong>${
        r ? ` — <span style="color:${urgentno ? '#b00020' : '#555'}">rok: ${esc(r)}</span>` : ''
      }</li>`
    })
    .join('')

  const barva = urgentno ? '#b00020' : '#00bbc1'
  await payload.sendEmail({
    to: u.email,
    subject,
    html: `
      <p>${pozdrav}</p>
      <p>${uvod}</p>
      <ul style="padding-left:18px">${vrstice}</ul>
      <p><a href="${base}/admin" style="display:inline-block;background:${barva};color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600">Odpri portal</a></p>
      <p style="font-size:13px;color:#555">Ko nalogo opraviš, ji v portalu spremeni status na »Zaključena«.</p>
      <p>Lep pozdrav,<br/>Ekipa Demokrati Radovljica</p>
    `,
  })
  return naloge.length
}
