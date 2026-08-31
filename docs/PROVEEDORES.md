# Proveedores de PM App

Quién hace qué, y cómo se conectan entre sí.

## Resumen visual

```
GitHub (código + historial)
   │  push a "main"
   ▼
Vercel (hosting + despliegue automático)
   │
   ├─► Supabase (base de datos + autenticación + backend)
   │      │
   │      ├─► Resend (envío del email con el código de acceso)
   │      └─► Stripe (desde las Edge Functions, para cobrar la suscripción)
   │
   └─► Stripe (desde el navegador, para iniciar el pago)
```

## GitHub

**Qué es:** donde vive el código con su historial de cambios.

**Usuario:** `vinztiempoarte-sys`
**Repositorio:** `pm-app` (privado)
**Conexión con el resto:** Vercel está enlazado a este repositorio — cada
`git push` a la rama `main` dispara un despliegue automático.

## Vercel

**Qué es:** aloja la aplicación y la sirve al público en una URL real.

**Cuenta:** `vinztiempoarte-6711`
**Proyecto:** `pmapp-fitline` (nombre interno del proyecto en Vercel)
**URL pública:** https://pmapp-crm.vercel.app
**Conexión con el resto:**
- Recibe el código desde GitHub y lo compila (`next build`)
- Tiene guardadas las claves públicas de Supabase como variables de
  entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY`) para que la app compilada sepa a qué
  Supabase conectarse

## Supabase

**Qué es:** el backend — base de datos (Postgres), autenticación de
usuarios, y las funciones que corren en el servidor (Edge Functions).

**Proyecto:** `eqscgvgmrfocxnsrxzyc`
**Conexión con el resto:**
- La app (en Vercel) le habla directamente desde el navegador del
  usuario, usando la `anon key` (pública, protegida por las políticas
  de seguridad de cada tabla — RLS)
- El envío de emails (código de acceso) lo delega en Resend, configurado
  como servidor SMTP dentro de Supabase Auth
- Las Edge Functions (`create-checkout-session`, `stripe-webhook`,
  `delete-account`, `check-recompras`) hablan con Stripe usando la
  clave secreta de Stripe, guardada como secreto en Supabase — nunca
  llega al navegador

## Resend

**Qué es:** el servicio que envía de verdad los emails con el código de
8 dígitos para entrar en la app.

**Conexión con el resto:** no se llama desde el código de la app — está
configurado dentro de Supabase (Authentication → Email → SMTP
Settings) como el proveedor de correo saliente. Supabase le pide "envía
este código a este email" y Resend lo entrega.

## Stripe

**Qué es:** gestiona el cobro de la suscripción mensual (97 €/mes).

**Cuenta:** modo Test (de prueba) por ahora, pendiente de pasar a modo
Live cuando se lance de verdad.

**Conexión con el resto:**
- El navegador llama a la Edge Function `create-checkout-session` (en
  Supabase), que a su vez le pide a Stripe una sesión de pago y
  devuelve la URL de Checkout
- Cuando el pago se completa, Stripe avisa directamente a la Edge
  Function `stripe-webhook` (en Supabase), que actualiza el estado de
  la suscripción en la base de datos

## USB (copia de seguridad)

No es un "proveedor" online, pero es parte del circuito: una copia
completa del código (sin `.env`, sin `node_modules`) que se sincroniza
a mano después de cada cambio importante, como red de seguridad física
además de GitHub.
