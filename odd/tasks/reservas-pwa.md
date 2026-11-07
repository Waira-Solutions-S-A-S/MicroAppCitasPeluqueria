# Reservas PWA — micro app de turnos para servicios recurrentes

- **Objetivo:** PWA de reservas para peluquería/uñas/color, con panel de negocio y backend real, corriendo 100% local.
- **Branch:** `feat/reservas-pwa` · **Delivery:** local (sin PR) · **Test runner:** `npm run build` + smoke HTTP de endpoints.

## Specs

- **S1** — "necesito una pwa para reservas de corte de pelo uñas o lo que sea": PWA instalable (manifest + service worker + fallback offline) para reservar turnos de servicios como corte de pelo o uñas.
- **S2** — "un servicio recurrente como tintes": el cliente puede reservar un turno recurrente, por ejemplo un tinte cada N semanas durante X ocurrencias; la serie se crea completa o se rechaza completa (atómica).
- **S3** — "si damelo el que tienes pero en local": stack Next.js (App Router) + TypeScript + Tailwind + Prisma + SQLite, sin cuentas ni servicios externos obligatorios; `npm install && npm run db:setup && npm run dev` debe alcanzar.
- **S4** — "Con backend real": el negocio administra desde un panel con login, base de datos persistente y autenticación; las reservas se cargan desde el panel autenticado.
- **S5** — "que en el apnel admin se puedan poner los servicios y los posibles que atiendas": el panel permite gestionar servicios y asignar a cada profesional qué servicios atiende; el wizard y la disponibilidad solo ofrecen profesionales habilitados para el servicio elegido.
- **S6** — "LA LANDING ES SOLO INFORMATIVA Y TIENE NUESTROS PRECIOS Y SERVICIOS Y UN EJEMPLO EN IMAGENES O BUENO DEMO PERO SOLO ESO NO ES MAS" y "PARA RESERVAR DEBE TENER SU PANEL DE MANEJO DESPUES DE INGRESAR": la landing muestra únicamente servicios con precios y una galería demo; no inicia reservas. El wizard de reserva vive dentro del panel autenticado.

### Criterios de aceptación

- **S1:** `/` es informativa e instalable; `app/manifest.ts` + `public/sw.js` registrado; `/offline` disponible; iconos 192/512.
- **S2:** el formulario permite activar repetición (cada N semanas, X veces) y crea la serie completa; si una ocurrencia choca, no se crea ninguna.
- **S3:** SQLite en `prisma/dev.db`, seed idempotente, README con comandos; sin dependencias de red para funcionar.
- **S4:** `/api/services`, `/api/availability`, `POST /api/bookings`; `/admin/*` protegido por cookie de sesión; agenda con confirmar/cancelar/completar; CRUD de servicios; horarios por profesional; ajustes del negocio; las reservas se cargan desde el panel.
- **S5:** en "Equipo y horarios" cada profesional tiene checkboxes de servicios; la disponibilidad y el POST rechazan combinaciones profesional/servicio no asignadas.
- **S6:** `/` muestra servicios con precios y una galería demo, sin CTAs de reserva; `/reservar` redirige a `/admin/reservar`; "Nueva reserva" aparece en la navegación del panel y en la agenda; el wizard embebido no muestra su header público.

### Restricciones e invariantes

- Zona horaria única del negocio: las horas se guardan como "wall clock" codificado en UTC.
- Nunca dos turnos activos solapados para el mismo profesional.
- Toda entrada se valida con zod; el panel exige sesión válida.
- Los turnos cancelados liberan el horario.

## Tasks

| ID | Specs | Ruta | Estado | Evidencia |
| --- | --- | --- | --- | --- |
| T1 | S3, S4 | inline | hecho | `prisma/schema.prisma` + `prisma/seed.ts` + `prisma/dev.db` |
| T2 | S4 | inline | hecho | `src/lib/password.ts` (scrypt) + `src/lib/auth.ts` (jose, cookie httpOnly) |
| T3 | S1, S2, S4 | inline | hecho | `/api/services`, `/api/availability`, `/api/bookings` |
| T4 | S1, S2 | inline | hecho | `src/app/page.tsx` + `src/app/reservar` + `booking-wizard.tsx` |
| T5 | S1, S4 | inline | hecho | `/reserva/[id]`, cancelación pública, `/offline` |
| T6 | S4 | inline | hecho | `/admin/login` + `requireAdmin` + layout del panel |
| T7 | S4 | inline | hecho | `/admin` resumen + `/admin/agenda` con estados |
| T8 | S4 | inline | hecho | `/admin/servicios`, `/admin/horarios`, `/admin/ajustes` |
| T9 | S1 | inline | hecho | `manifest.ts`, `public/sw.js`, iconos 192/512/maskable |
| T10 | S3 | inline | hecho | `README.md` + build + smoke HTTP |
| T11 | S5 | inline | hecho | asignación servicio↔profesional + fix de selección doble |
| T12 | S4 | inline | hecho | landing pública con funcionalidades + `/salir`; `/admin` sigue protegido |
| T13 | S4 | inline | hecho | landing separada del manejo: reservar, confirmación y POST de reservas requieren sesión |
| T14 | S6 | inline | hecho | landing informativa (servicios + precios + galería demo) y wizard movido a `/admin/reservar` |

## Log

### L1 — pedido original (verbatim)

> micro app necesito una pwa para reservas de corte de pelo uñas o lo que sea un sertvicio recurrente como tintes

### L2 — decisión (verbatim)

> si damelo el que tienes pero en local

Elegido: Next.js 16 + TypeScript + Tailwind v4 + Prisma 6 + SQLite. Auth propia (scrypt + jose), sin servicios externos.

### L3 — implementación

Se implementaron las 10 tareas inline. El sandbox bloquea escribir `.env`, así que la URL de SQLite quedó literal en `schema.prisma` y `AUTH_SECRET` tiene fallback de desarrollo con override por variable de entorno.

### L4 — verificación

- `npm run build` OK; 16 rutas generadas (públicas, API, panel, manifest, offline).
- `GET /api/services`: 5 servicios y 2 profesionales desde el seed.
- `GET /api/availability`: 76 slots para un día laborable.
- Reserva simple: 201. Repetir el mismo slot: 409.
- Serie de 3 turnos cada 4 semanas: creada completa (`occurrences=3`).
- Atomicidad: serie cuya segunda ocurrencia choca → 409 y el primer slot sigue libre.
- Auth: `verifyPassword("admin123")` OK y contraseña incorrecta rechazada; `/admin` 200 con sesión, 307 a login sin sesión; las 5 secciones del panel responden 200.
- Confirmación `/reserva/[id]`: 200 con los datos del cliente; `/offline`: 200; manifest con 3 iconos y `display: standalone`.
- Bug corregido: el límite de anticipación comparaba hora además de fecha y rechazaba la última ocurrencia de una serie en el borde. Ahora compara por día y el default pasó de 60 a 180 días.
- Pendiente: no hay prueba automatizada de UI en navegador; la verificación fue HTTP contra el servidor real.

### L5 — corrección y ajuste de admin (verbatim)

> corrijamos errores primero dame panel admin con citas y damelo con clave y correo ademas cuando estoy seleccionando en tarde y noche se marca doble la selecci0on porque no se toca solucionar y recuerda es una micro app sencilla, que en el apnel admin se puedan poner los servicios y los posibles que atiendas

- Bug: la selección del horario se comparaba solo por `startAt`; Camila y Martina comparten la misma hora, así que se pintaban las dos. Ahora la clave es `startAt + staffId` y se resetea al cambiar de servicio o profesional.
- Nuevo: relación muchos-a-muchos `Service` ↔ `StaffMember`. En "Equipo y horarios" cada profesional tiene checkboxes de servicios; el seed asigna todos a los existentes.
- `getAvailability` filtra profesionales por servicio; `createBooking` rechaza un profesional no habilitado; `/api/services` y el wizard reciben `serviceIds`.
- Verificación: `npm run build` OK; `/api/services` devuelve 5 servicios y 2 profesionales con 5 servicios cada uno; página de login 200.
- Credenciales del panel: `admin@estudio.local` / `admin123`.

### L6 — landing y cierre de sesión

- La landing `/` es pública, muestra las funcionalidades (reserva online, recurrentes, panel, PWA) y no exige login.
- `/salir` borra la cookie de sesión y redirige a `/`; el panel `/admin` sigue redirigiendo a login sin sesión.
- Verificado: `/` 200 con "Funcionalidades"; `/salir` 307 a `/` con cookie expirada; `/admin` sin sesión 307 a login.
- Sin sesión el header muestra `Ingresar`; con sesión muestra `Panel` y `Salir`. `/salir` redirige a `/?sesion=cerrada` y la landing muestra el aviso "Sesión cerrada".

### L7 — separación landing / manejo

- La landing `/` es la única página pública de la app.
- `/reservar`, `/reserva/[id]` y `POST /api/bookings` requieren sesión: redirigen a `/admin/login?next=...` o devuelven 401.
- El login acepta `next` y vuelve al destino original después de ingresar; por defecto va a `/admin`.
- Sin sesión, el CTA del hero dice "Ingresar"; con sesión dice "Reservar ahora".
- Verificado: `/reservar` 307 a login con `next=%2Freservar`; `/reserva/test-id` 307 a login; POST de reserva 401; `/salir` 307 a `/?sesion=cerrada`; landing 200 con CTA "Ingresar".

### L8 — landing informativa y reserva dentro del panel (verbatim)

> ESTA PARTE DEBE SER DE EJEMPLO PERO PARA RESERVAR DEBE TENER SU PANEL DE MANEJO DESPUES DE INGRESAR LA LANDING ES SOLO INFORMATIVA Y TIENE NUESTROS PRECIOS Y SERVICIOS Y UN EJEMPLO EN IMAGENES O BUENO DEMO PERO SOLO ESO NO ES MAS

- Landing `/` reducida a información: hero, servicios con precios y galería demo (tarjetas con gradientes e iconos). Se quitaron las secciones de funcionalidades y equipo, y las tarjetas de servicios ya no enlazan a reservar.
- El CTA del hero quedó en "Ingresar" (sin sesión) o "Ir al panel" (con sesión); la landing no inicia reservas.
- Wizard movido a `/admin/reservar` dentro del layout del panel, con prop `embedded` para ocultar el header público y volver a `/admin/agenda?fecha=...` al confirmar.
- "Nueva reserva" agregado a la navegación del panel y como botón en la cabecera de la agenda.
- `/reservar` ahora redirige a `/admin/reservar`; el enlace "Nueva reserva" de la confirmación apunta al panel.
- Verificado: build OK; `/` 200 con "Galería demo" y sin "Reservar ahora"; `/reservar` 307 a `/admin/reservar`; `/admin/reservar` sin sesión 307 a login y con sesión 200 con el wizard embebido; agenda 200 con el botón "Nueva reserva".

