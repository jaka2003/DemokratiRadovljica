import Link from 'next/link'

// Povezava v stranskem meniju administracije do interne strani za predlaganje plakatnih mest.
// Vidna vsem prijavljenim (kandidati/člani), ne le administratorju.
export const PlakatNavLink = () => {
  return (
    <Link
      href="/interno/plakat"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        margin: '6px 0',
        padding: '8px 10px',
        borderRadius: 8,
        background: '#00bbc1',
        color: '#fff',
        fontWeight: 600,
        fontSize: 13,
        textDecoration: 'none',
      }}
    >
      <span aria-hidden>📍</span> Predlagaj plakatno mesto
    </Link>
  )
}
