import styles from './page.module.css'
import { PUBLIC_TIER_INFO } from '../lib/tiers'

export default function LandingPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <h1>EventWall Live</h1>
        <p>
          Recuerdos en vivo, personalizados a tu evento: tus invitados suben fotos por QR y
          aparecen al instante en pantalla, con la estética exacta de tu fiesta.
        </p>
      </section>
      <section className={styles.tiers}>
        {PUBLIC_TIER_INFO.map((tier) => (
          <article key={tier.id} className={styles.tier}>
            <h2>{tier.name}</h2>
            <p className={styles.price}>US$ {tier.priceUsd}</p>
            <ul>
              {tier.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a className={styles.cta} href={`/checkout/${tier.id}`}>
              Comprar
            </a>
          </article>
        ))}
      </section>
    </main>
  )
}
