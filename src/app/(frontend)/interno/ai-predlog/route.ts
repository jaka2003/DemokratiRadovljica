import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getPayload } from 'payload'
import config from '@payload-config'

// AI pomoč pri pripravi predstavitev kandidatov (spec. razdelek 10).
// Uporablja Anthropic Claude (model claude-opus-4-8). Zaščiteno z Payload prijavo.

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    kratkaPredstavitev: {
      type: 'string',
      description: 'Kratka predstavitev kandidata – 2–3 stavki, prva oseba, naravna slovenščina.',
    },
    podrocjaSodelovanja: {
      type: 'string',
      description: 'Področja sodelovanja kandidata – kratek seznam (3–6 področij), ločen z vejicami.',
    },
    politicnaPredstavitev: {
      type: 'string',
      description: 'Kratka politična oziroma lokalna predstavitev – 1–2 odstavka, dostojanstveno in pozitivno.',
    },
  },
  required: ['kratkaPredstavitev', 'podrocjaSodelovanja', 'politicnaPredstavitev'],
} as const

export async function POST(req: Request) {
  // Avtentikacija prek Payload (kandidat/admin mora biti prijavljen).
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Potrebna je prijava.' }, { status: 401 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { ok: false, error: 'AI ni nastavljen. Administrator naj vnese ANTHROPIC_API_KEY.' },
      { status: 503 },
    )
  }

  const body = await req.json().catch(() => ({}))
  const v = (k: string) => String(body?.[k] ?? '').trim()

  const podatki = [
    ['Poklic', v('poklic')],
    ['Izkušnje', v('izkusnje')],
    ['Področja zanimanja', v('podrocja')],
    ['Lokalne teme', v('lokalneTeme')],
    ['Razlog kandidature', v('razlog')],
    ['Kraj / volilno območje', v('kraj')],
    ['Osebne vrednote', v('vrednote')],
    ['Glavna sporočila', v('sporocila')],
  ]
    .filter(([, val]) => val)
    .map(([k, val]) => `- ${k}: ${val}`)
    .join('\n')

  if (!podatki) {
    return NextResponse.json({ ok: false, error: 'Vnesi vsaj nekaj podatkov za pripravo predstavitve.' }, { status: 400 })
  }

  const client = new Anthropic()

  const system = `Si pomočnik za pripravo političnih predstavitev kandidatov za lokalne volitve v Sloveniji (stranka Demokrati Radovljica).
Pišeš v slovenščini, jasno, dostojanstveno in pozitivno. Besedila so verodostojna, brez praznih fraz in pretiravanj.
Ton je odgovoren, razvojno usmerjen in spoštljiv do vseh občanov. Ne izmišljaj si dejstev, ki niso podana; če podatka ni, ga ne navajaj.`

  const prompt = `Na podlagi spodnjih podatkov o kandidatu pripravi predloge besedil.
Vsako besedilo naj bo primerno za javno objavo in naj kandidat lahko še uredi.

Podatki o kandidatu:
${podatki}

Pripravi tri besedila:
1. kratko predstavitev (2–3 stavki, prva oseba);
2. področja sodelovanja (kratek seznam področij, ločen z vejicami);
3. kratko politično oziroma lokalno predstavitev (1–2 odstavka).`

  try {
    const message = await client.messages.create({
      // Privzeto Opus 4.8; preklopiš prek AI_MODEL (npr. claude-sonnet-4-6 ali claude-haiku-4-5).
      model: process.env.AI_MODEL || 'claude-opus-4-8',
      max_tokens: 16000,
      system,
      output_config: { format: { type: 'json_schema', schema: SCHEMA } },
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    const text = textBlock && 'text' in textBlock ? textBlock.text : ''
    const drafts = JSON.parse(text)

    return NextResponse.json({ ok: true, drafts })
  } catch (e) {
    console.error('AI napaka:', e)
    return NextResponse.json({ ok: false, error: 'AI predloga ni bilo mogoče pripraviti.' }, { status: 500 })
  }
}
