import Link from 'next/link'
import styles from '../../page.module.css'

export default function CheckoutGraciasPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <h1>¡Gracias por tu compra! 🎉</h1>
        <p>
          Ya registramos tu pago. En las próximas horas nos contactamos por email para armar el
          diseño de tu evento (colores, logo, textos) y coordinar los detalles antes de la fecha.
        </p>
        <p>
          <Link href="/">← Volver al inicio</Link>
        </p>
      </section>
    </main>
  )
}
