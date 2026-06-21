import { Sparkles, Check, Send, UserPlus } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { Button } from '@/components/ui/Button'

export const metadata = {
  title: 'Mladi Demokrati Radovljica',
  description:
    'Nova energija, nove ideje, sodobna občina – Mladi Demokrati Radovljica. Sodeluj, predlagaj, soustvarjaj pri razvoju občine.',
}

const IZHODISCA = [
  'več možnosti za mlade pri iskanju prvega doma in gradnji v domači občini',
  'boljša povezanost šol, podjetij, obrtnikov in mladih',
  'več priložnosti za prakso, mentorstvo, podjetništvo in digitalne poklice',
  'sodobnejša komunikacija občine z mladimi',
  'digitalna orodja za pobude, predloge in spremljanje občinskih projektov',
  'več prostora za šport, kulturo, druženje in ustvarjalnost',
  'vključevanje mladih v pripravo lokalnega programa in občinskih odločitev',
  'podpora prostovoljstvu, društvom, inovativnosti in novim idejam',
]

export default function MladiDemokratiPage() {
  return (
    <section className="py-12 lg:py-16">
      <Container>
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} /> Mladi Demokrati Radovljica
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">
            Mladi Demokrati Radovljica
          </h1>
          <p className="mt-3 text-lg font-semibold text-teal-700">Nova energija. Nove ideje. Sodobna občina.</p>
        </div>

        {/* Uvodni odstavki */}
        <div className="mx-auto mt-10 max-w-3xl space-y-5 text-[17px] leading-relaxed text-navy/85">
          <p>
            Mladi Demokrati Radovljica želimo, da imajo mladi v naši občini več kot le lepo okolje za odraščanje.
            Želimo, da imajo tukaj tudi realno prihodnost: možnost izobraževanja, dobrega dela, prvega doma, aktivnega
            preživljanja prostega časa in sodelovanja pri odločitvah, ki oblikujejo naš vsakdan.
          </p>
          <p>
            Verjamemo, da občina prihodnosti ne nastaja brez mladih. Nastaja z mladimi, ki poznajo sodobna orodja,
            razumejo digitalni svet, imajo podjetniške ideje, želijo ustvarjati in niso pripravljeni samo čakati, da
            bodo drugi odločali namesto njih.
          </p>
          <p>
            Zato želimo v občino prinesti novo energijo, več digitalizacije, boljšo dostopnost informacij in
            sodobnejše načine sodelovanja z občani.
          </p>
        </div>

        {/* Izhodišča */}
        <div className="mx-auto mt-12 max-w-3xl rounded-[var(--radius-card)] border border-line bg-white p-7 shadow-card sm:p-9">
          <h2 className="text-xl font-bold text-navy">Naša izhodišča so jasna</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {IZHODISCA.map((t, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <span className="text-[15px] leading-snug text-navy/85">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Zaključek */}
        <div className="mx-auto mt-12 max-w-3xl space-y-5 text-[17px] leading-relaxed text-navy/85">
          <p>
            Mladim ne želimo govoriti, naj počakajo na svojo priložnost. Želimo, da jo soustvarjajo že danes.
          </p>
          <p>
            Če imaš idejo za svoj kraj, če vidiš težavo, ki jo je mogoče rešiti, če te zanimajo digitalizacija,
            podjetništvo, šport, kultura, okolje ali razvoj občine – pridruži se nam.
          </p>
        </div>

        {/* Poziv k sodelovanju */}
        <div className="mx-auto mt-10 max-w-3xl rounded-[var(--radius-card)] border border-line bg-gradient-to-br from-cloud to-white p-8 text-center sm:p-10">
          <p className="text-lg font-semibold text-navy">
            Uspešna Radovljica 2026–2034 potrebuje tudi glas mladih.
          </p>
          <p className="mt-2 text-2xl font-extrabold text-teal-700">Sodeluj. Predlagaj. Soustvarjaj.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/demokrati" variant="primary">
              <UserPlus className="h-4 w-4" strokeWidth={2} /> Pridruži se nam
            </Button>
            <Button href="/pobude" variant="outline">
              <Send className="h-4 w-4" strokeWidth={2} /> Oddaj pobudo
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
