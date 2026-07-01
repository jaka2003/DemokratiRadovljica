import Script from 'next/script'

// Zasebna, BREZPIŠKOTNA analitika (Umami ali Plausible). Vklopi se prek env spremenljivk;
// če ni nastavljena, se ne izriše nič. Oba sledilnika ne uporabljata piškotkov in ne zbirata
// osebnih podatkov → ne potrebuje soglasja (GDPR-prijazno). Bere se ob izrisu na strežniku,
// zato zadošča nastavitev v okolju (brez ponovne gradnje).
export function Analytics() {
  const umamiSrc = process.env.ANALYTICS_UMAMI_SRC
  const umamiId = process.env.ANALYTICS_UMAMI_ID
  const plausibleDomain = process.env.ANALYTICS_PLAUSIBLE_DOMAIN
  const plausibleSrc = process.env.ANALYTICS_PLAUSIBLE_SRC || 'https://plausible.io/js/script.js'

  if (umamiSrc && umamiId) {
    return <Script src={umamiSrc} data-website-id={umamiId} strategy="afterInteractive" defer />
  }
  if (plausibleDomain) {
    return <Script src={plausibleSrc} data-domain={plausibleDomain} strategy="afterInteractive" defer />
  }
  return null
}
