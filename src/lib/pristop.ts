// Konstante za pristopno izjavo (včlanitev).

export const SPOL_OPCIJE = [
  { label: 'Moški', value: 'moski' },
  { label: 'Ženska', value: 'zenska' },
] as const

export const POSTA_OPCIJE = [
  { label: 'Stalno prebivališče', value: 'stalno' },
  { label: 'Začasno prebivališče', value: 'zacasno' },
] as const

export const IZOBRAZBA_OPCIJE = [
  { label: 'Osnovna šola', value: 'osnovna' },
  { label: 'Srednja šola', value: 'srednja' },
  { label: 'Višja šola', value: 'visja' },
  { label: 'Visoka šola / univerzitetna', value: 'visoka' },
  { label: 'Magisterij', value: 'magisterij' },
  { label: 'Doktorat', value: 'doktorat' },
] as const

export const PRISTOP_STATUSI = [
  { label: 'Novo', value: 'novo' },
  { label: 'V obravnavi', value: 'v_obravnavi' },
  { label: 'Sprejeto', value: 'sprejeto' },
  { label: 'Zavrnjeno', value: 'zavrnjeno' },
] as const

export const vrednosti = (opcije: readonly { value: string }[]) => opcije.map((o) => o.value)
