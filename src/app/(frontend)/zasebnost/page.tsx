import { Container } from '@/components/site/Container'
import SimpleForm from '@/components/forms/SimpleForm'

export const metadata = {
  title: 'Politika zasebnosti',
  description: 'Politika zasebnosti in varstvo osebnih podatkov – Demokrati Radovljica (GDPR).',
}

export default function ZasebnostPage() {
  return (
    <section className="py-12 lg:py-16">
      <Container className="max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-navy">Politika zasebnosti</h1>
        <p className="mt-3 text-muted">
          Varstvo osebnih podatkov jemljemo resno. Spodaj je opisano, katere podatke zbiramo, zakaj
          in kako jih varujemo, skladno s Splošno uredbo o varstvu podatkov (GDPR).
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-navy/85">
          <div>
            <h2 className="text-lg font-bold text-navy">1. Upravljavec podatkov</h2>
            <p className="mt-2">
              Upravljavec osebnih podatkov je lokalni odbor Demokrati Radovljica. Za vprašanja glede
              zasebnosti nas kontaktirajte prek e-pošte, navedene na strani Demokrati Radovljica.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-navy">2. Kateri podatki se zbirajo</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>pri oddaji pobude: ime in priimek, e-pošta, neobvezno telefon, vsebina in lokacija pobude;</li>
              <li>pri prijavi za sodelovanje: ime in priimek, e-pošta, telefon, kraj, sporočilo;</li>
              <li>pri kontaktnem obrazcu: ime in priimek, e-pošta, telefon, sporočilo;</li>
              <li>pri kandidatih (interni del): podatki profila in naloženi dokumenti.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-navy">3. Namen in pravna podlaga</h2>
            <p className="mt-2">
              Podatke obdelujemo na podlagi vaše privolitve, za namen obravnave pobud, komunikacije in
              organizacije lokalne kampanje. Privolitev lahko kadarkoli prekličete.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-navy">4. Javni prikaz pobud</h2>
            <p className="mt-2">
              Pobuda se lahko na javnem zemljevidu prikaže izključno <strong>anonimizirano</strong> in
              le, če ste za to dali soglasje ter jo je administrator odobril. Osebni podatki
              predlagatelja se nikoli ne prikažejo javno.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-navy">5. Hramba in varnost</h2>
            <p className="mt-2">
              Podatki se hranijo varno, z omejenimi dostopnimi pravicami in rednimi varnostnimi
              kopijami. Dostop imajo le pooblaščene osebe kampanje. Podatke hranimo le toliko časa,
              kolikor je potrebno za navedene namene.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-navy">6. Vaše pravice</h2>
            <p className="mt-2">
              Imate pravico do vpogleda, popravka, izbrisa in omejitve obdelave svojih podatkov ter do
              odjave od obvestil. Zahtevo lahko oddate prek spodnjega obrazca.
            </p>
          </div>
        </div>

        {/* Zahteva za izbris / vpogled */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-navy">Zahteva glede osebnih podatkov</h2>
          <p className="mt-2 text-sm text-muted">
            Oddaj zahtevo za vpogled, popravek, izbris ali odjavo. Obravnavamo jo v skladu z GDPR.
          </p>
          <div className="mt-5">
            <SimpleForm
              action="/zasebnost/izbris"
              submitLabel="Oddaj zahtevo"
              gdprLabel="Potrjujem, da želim uveljaviti pravico glede svojih osebnih podatkov."
              successTitle="Zahteva oddana"
              successText="Vašo zahtevo bomo obravnavali v skladu z GDPR."
              fields={[
                { name: 'imePriimek', label: 'Ime in priimek' },
                { name: 'email', label: 'E-pošta', type: 'email', required: true },
                { name: 'sporocilo', label: 'Opis zahteve (izbris, vpogled, odjava …)', type: 'textarea' },
              ]}
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
