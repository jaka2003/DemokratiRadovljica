import Link from 'next/link'
import { KlepetNavLink } from './KlepetNavLink'

// Interne povezave v stranskem meniju administracije (vidne vsem prijavljenim).
const POVEZAVE = [
  { href: '/interno/objave', ikona: '📣', label: 'Deli objave' },
  { href: '/interno/seje', ikona: '🗳️', label: 'Dopisne seje (glasovanje)' },
  { href: '/interno/koledar', ikona: '📅', label: 'Koledar' },
  { href: '/interno/plakat', ikona: '📍', label: 'Predlagaj plakatno mesto' },
]

export const InternoNav = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '6px 0' }}>
      <KlepetNavLink />
      {POVEZAVE.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            borderRadius: 8,
            background: '#00bbc1',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          <span aria-hidden>{p.ikona}</span> {p.label}
        </Link>
      ))}
    </div>
  )
}
