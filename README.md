# Estudio Nube — PWA de reservas

Micro app para reservar turnos de peluquería, uñas y color, con PWA instalable y panel
del negocio. Corre 100% local: no necesita cuentas ni servicios externos.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Prisma 6 + SQLite (`prisma/dev.db`)
- Auth propia: contraseñas con `scrypt` y sesión en cookie firmada con `jose`
- Service worker + manifest para instalar como PWA

## Puesta en marcha

```bash
npm install
npm run db:setup   # crea la base y carga datos de ejemplo
npm run dev
```

Abrí <http://localhost:3000>.

### Acceso al panel

- URL: <http://localhost:3000/admin>
- Email: `admin@estudio.local`
- Contraseña: `admin123`

Cambiá la contraseña desde **Ajustes → Seguridad**.

## Qué incluye

**Cliente (PWA)**

- Landing con servicios y equipo.
- Reserva en 4 pasos: servicio → profesional → fecha y horario → datos.
- Reservas recurrentes: tinte o mantenimiento cada N semanas durante X turnos, creados
  de forma atómica (si una fecha choca, no se crea ninguna).
- Confirmación con enlace para consultar y cancelar.
- Instalable en el celular, con pantalla offline.

**Panel del negocio**

- Login con sesión.
- Resumen del día: turnos, pendientes e ingreso estimado.
- Agenda por día con confirmar / completar / cancelar.
- CRUD de servicios (precio, duración, color, pausar).
- Profesionales y horarios por día de la semana.
- Ajustes: nombre, moneda, zona horaria, paso de horarios, buffer, anticipación mínima y
  máxima.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run db:setup` | `prisma db push` + seed |
| `npm run db:seed` | Carga datos de ejemplo (idempotente) |
| `npm run db:studio` | Prisma Studio |
| `npm run icons` | Regenera los iconos PNG de la PWA |

## Notas técnicas

- **Zona horaria:** las horas se guardan como hora local del negocio codificada en UTC.
  Así el cálculo de disponibilidad no depende de conversiones de zona y funciona bien en
  Colombia. La zona se configura en Ajustes.
- **Anti doble reserva:** la creación de un turno vuelve a verificar conflictos dentro de
  una transacción, además de validar horario laboral, anticipación y buffer.
- **Variables de entorno:** el proyecto no necesita `.env`. La URL de SQLite está en
  `prisma/schema.prisma` y hay un secreto de desarrollo en `src/lib/auth.ts`. Para
  producción definí `AUTH_SECRET` (mínimo 32 caracteres) y cambiá la base a Postgres si
  hace falta.
- **Producción:** `npm run build && npm run start`. Si desplegás en un host efímero,
  movés la base a un volumen persistente o a Postgres.

## Estructura

```
prisma/            schema + seed
src/app/
  page.tsx         landing
  reservar/        wizard de reserva
  reserva/[id]/    confirmación pública
  admin/           panel (login + rutas protegidas)
  api/             services, availability, bookings
  manifest.ts      manifest PWA
  offline/         fallback sin conexión
src/components/    wizard, PWA register, tarjetas de turno
src/lib/           auth, time, availability, booking, validación
public/sw.js       service worker
scripts/gen-icons  generador de iconos sin dependencias
```
