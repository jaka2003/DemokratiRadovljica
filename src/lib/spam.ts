// Honeypot zaščita pred spam-boti: skrito polje, ki ga pravi uporabnik ne izpolni,
// boti pa pogosto. Če je izpolnjeno, oddajo tiho zavrnemo (vrnemo navidezno uspeh).
export const HONEYPOT = 'spletnaStran'

export function jeSpam(form: FormData): boolean {
  return String(form.get(HONEYPOT) ?? '').trim().length > 0
}
