# Demokrati Radovljica – spletna platforma

Spletna platforma za lokalno kampanjo **Demokrati Radovljica** (lokalne volitve 2026):
javna predstavitvena stran, interaktivni zemljevid s pobudami občanov, interni del za
kandidate in administrativni sistem za vodstvo kampanje.

## Tehnologija

- **Next.js 15** (App Router) + **React 19**
- **Payload CMS 3** (admin plošča, vloge, mediji, dostopne pravice) – teče znotraj Next.js
- **PostgreSQL** v produkciji, **SQLite** v lokalnem razvoju
- **Tailwind CSS v4**
- **Docker** za deploy na Linux server

Barvna paleta: temno modra `#0f004e`, turkizna `#00bbc1`, bela, svetlo siva/bež.

## Lokalni razvoj (Windows / Mac / Linux)

```bash
npm install
npm run dev
```

- Stran: http://localhost:3000
- Admin: http://localhost:3000/admin (ob prvem obisku ustvariš administratorja)

Lokalno se uporablja SQLite (`demokrati.db`), brez potrebe po Dockerju ali bazi.

> Opomba: ob dodajanju **nove zbirke** v razvoju lahko SQLite samodejna migracija spodleti
> (omejitev SQLite pri poustvarjanju povezovalnih tabel). Rešitev: izbriši `demokrati.db*`
> in znova zaženi `npm run dev` – shema se zgradi na novo, privzeti podatki se samodejno vpišejo.
> Produkcijski PostgreSQL te omejitve nima.

## Produkcija – Linux server z Dockerjem

1. Na strežnik kopiraj repozitorij.
2. Ustvari `.env` (glej `.env.production.example`) in izpolni gesla, `PAYLOAD_SECRET`, domeno, SMTP, AI ključ.
3. Zaženi:

```bash
docker compose up -d --build
```

Aplikacija posluša na `APP_PORT` (privzeto 3000). Pred njo postavi reverse proxy
(npr. Nginx ali Caddy) za HTTPS na domeni `demokratiradovljica.com`.

Postgres podatki in naloženi mediji se hranijo v Docker volumih (`db_data`, `media_data`).

### Varnostne kopije baze

Storitev `backup` v `docker-compose.yml` vsak dan samodejno naredi kopijo PostgreSQL v
mapo `backups/` na strežniku (obdrži zadnjih 14 dni, gzip stisnjeno). Kopije **preživijo**
tudi `docker compose down -v` (so na disku strežnika, ne v Docker volumu).

```bash
# Seznam kopij
ls -lh backups/

# Obnovitev iz kopije (PREPIŠE trenutno bazo!):
gunzip -c backups/demokrati-2026-06-21_00-00.sql.gz | docker compose exec -T db psql -U demokrati -d demokrati
```

> Priporočilo: občasno kopiraj mapo `backups/` tudi izven strežnika (npr. `scp` na svoj računalnik
> ali v oblak), da preživi tudi morebitno okvaro diska.

### Cloudflare + domena

- Domeno (`demokratiradovljica.com` / `.info`) usmeri na IP strežnika (A zapis) prek Cloudflare.
- TLS naj ureja reverse proxy (Caddy samodejno) ali Cloudflare (Full/Strict).

## Struktura

```
src/
  app/
    (frontend)/      # javna stran (domov, podstrani)
    (payload)/       # Payload admin + API (/admin, /api)
  collections/       # Payload zbirke (Users, Media, ...)
  components/        # UI gradniki (site, home, ui)
  lib/               # vsebina strani in ikone
  payload.config.ts  # konfiguracija Payload + izbira baze
docs/                # specifikacija (PDF), mockup, logo
Dockerfile
docker-compose.yml
```

## Faze izdelave (po specifikaciji, razdelek 14)

- [x] **Faza 1** – Temelji + javna začetna stran
- [x] **Faza 2** – Podstran Demokrati Radovljica (ekipa, vrednote, kontakt, prijava za sodelovanje)
- [x] **Faza 3** – Občina in kraji (CMS zbirka, zemljevid s kraji, podstrani krajev)
- [x] **Faza 4** – Kandidat/-ka za župana/-jo (CMS global, video, kontaktni obrazec)
- [x] **Faza 5** – Program (14 področij, CMS, povezane pobude)
- [x] **Faza 6** – Pobude občanov + zemljevid (Leaflet, obrazec, e-pošta, admin upravljanje)
- [x] **Faza 7** – Interna prijava za kandidate (Payload admin, vloge, dostopne pravice)
- [x] **Faza 8** – Kandidatov profil (profil, dokumenti, naloge, sporočila)
- [x] **Faza 9** – Administrativni sistem (nadzorna plošča, CSV izvoz, množična e-pošta)
- [x] **Faza 10** – E-pošta + AI pomoč (Claude `claude-opus-4-8`)

Vse faze iz specifikacije so implementirane. Pred uradnim zagonom: nastavi SMTP in
ANTHROPIC_API_KEY, naloži realne fotografije in preglej/uredi vsebine v adminu.
