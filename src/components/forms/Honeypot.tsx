import { HONEYPOT } from '@/lib/spam'

// Skrito polje proti spam-botom – pravi uporabniki ga ne vidijo in ne izpolnijo.
// Skrito izven zaslona (ne display:none, ki ga nekateri boti preskočijo).
export function Honeypot() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', left: '-9999px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}
    >
      <label htmlFor={HONEYPOT}>Pustite to polje prazno</label>
      <input type="text" id={HONEYPOT} name={HONEYPOT} tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  )
}
