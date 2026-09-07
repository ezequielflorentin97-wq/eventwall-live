# EventWall Live

Plataforma self-service (etapa MVP) para el generador de photo-wall en vivo para eventos.
Ver el spec técnico en `../docs/specs/2026-09-04-eventwall-mvp-saas-design.md`.

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local   # completar con tus credenciales de test
npm run dev
npm run test    # tests unitarios (vitest)
npm run build   # build de producción + typecheck
npm run lint
```

## Variables de entorno requeridas

Configurar en `.env.local` (desarrollo) y en Vercel → Project Settings → Environment
Variables (producción):

| Variable | Dónde conseguirla | Notas |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Pública |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | Pública, usada por el login del admin |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API | **Secreta** — nunca exponerla al cliente |
| `MERCADOPAGO_ACCESS_TOKEN` | Mercado Pago → Tus integraciones → Credenciales | **Secreta** — usar la de **test** hasta validar el flujo completo |
| `MERCADOPAGO_WEBHOOK_SECRET` | Mercado Pago → Tus integraciones → Webhooks → Firma secreta | **Secreta** — valida que las notificaciones vengan realmente de MP |
| `MP_ARS_PER_USD` | Definido a mano | Los precios están en USD como referencia (ver brief de negocio); MP Argentina solo cobra en ARS, así que esto define la conversión. Actualizar periódicamente, no se calcula solo. |
| `NEXT_PUBLIC_BASE_URL` | — | URL pública del dominio elegido (o `http://localhost:3000` en desarrollo) |

## Deploy

1. Aplicar `supabase/migrations/0001_events.sql` en el SQL editor del proyecto Supabase.
   Habilita Row Level Security en `events` sin políticas — solo el cliente server-side
   (service role key) puede leer/escribir esa tabla; un anon key filtrado no alcanza para
   leer datos de eventos.
2. Crear el usuario admin en Supabase → Authentication → Users → Invite user, con tu email.
   Es el único usuario que puede entrar a `/admin`.
3. En Mercado Pago, configurar la notification URL del webhook a
   `https://<tu-dominio>/api/mp-webhook` y copiar la **firma secreta** a
   `MERCADOPAGO_WEBHOOK_SECRET`.
4. `vercel link` (una vez) y `vercel --prod` para deployar. Vercel emite el certificado
   HTTPS automáticamente para el dominio (Let's Encrypt, renovación automática) — no hay
   nada manual que gestionar ahí. La cámara del navegador (`getUserMedia`, usada en la
   vista de subida) requiere HTTPS para funcionar, así que no probar la cámara real sobre
   `http://` salvo `localhost`.
5. Probar el flujo completo primero con credenciales de **test** de Mercado Pago (tarjetas
   de prueba) antes de pasar a producción. El checkout de test no mueve dinero real.

## Seguridad — qué ya está resuelto y qué falta

**Resuelto en este MVP:**
- `/admin/*` está protegido por middleware server-side (verifica sesión de Supabase Auth
  en cada request, no solo en el login) — sin esto, cualquiera podía entrar a `/admin`
  directo sin loguearse.
- La tabla `events` tiene Row Level Security habilitada sin políticas — un `anon key`
  filtrado no puede leer ni escribir eventos; solo el `service role key` (server-only)
  puede.
- El webhook de Mercado Pago verifica la firma HMAC (`x-signature`/`x-request-id`) antes
  de confiar en cualquier notificación — sin esto, cualquiera podría llamar al webhook y
  crear eventos "pagados" falsos.
- El webhook es idempotente por `mp_payment_id` — reintentos de MP no duplican eventos.
- Ninguna credencial secreta (`SUPABASE_SERVICE_ROLE_KEY`, `MERCADOPAGO_ACCESS_TOKEN`,
  `MERCADOPAGO_WEBHOOK_SECRET`) se referencia desde código que corre en el browser — los
  módulos que las usan están marcados con el paquete `server-only`, que rompe el build si
  alguna vez se importan desde un componente cliente.
- Dependencias sin vulnerabilidades conocidas al momento del build (`npm audit`: 0), tras
  actualizar el scaffold inicial de Next.js 14 (5 CVEs altas conocidas) a la versión
  estable actual.

**Pendiente / fuera de alcance de este MVP:**
- No hay AFIP/facturación — Mercado Pago resuelve el cobro, no la factura.
- El wizard de configuración es de uso interno únicamente; no hay self-service para el
  cliente final todavía.
- La convención `middleware.ts` está deprecada a favor de `proxy.ts` en Next 16 (sigue
  funcionando, es solo un warning de build) — migrar cuando haya tiempo dedicado a
  probarlo, no se hizo en este MVP para no arriesgar código ya verificado.
- Falta un job que marque eventos como `vencido` automáticamente pasado el evento —
  hoy ese estado existe en el schema pero nada lo setea todavía.
