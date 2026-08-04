# Deploy

Ultima actualizacion: 2026-08-04

## Entorno local

Requisitos:

- Node.js 20 o superior.
- npm.
- PostgreSQL en Neon.

Instalacion:

```bash
npm install
```

Configurar `.env` a partir de `.env.example`. No copiar secretos a documentacion.

Variables:

- `DATABASE_URL`: conexion pooled de Neon para la app.
- `DIRECT_URL`: conexion directa de Neon para migraciones.
- `AUTH_SECRET`: secreto largo y aleatorio.
- `NEXT_PUBLIC_APP_NAME`: nombre publico de la app.

## Comandos

```bash
npm run db:generate
npm run lint
npm run build
npm run dev
```

## Migraciones

Antes de aplicar:

```bash
npx prisma migrate status
```

Aplicar en produccion solo con aprobacion:

```bash
npm run db:deploy
```

No usar:

```bash
prisma db push
```

## Seed

`npm run db:seed` debe ejecutarse manualmente solo para datos de prueba o carga aprobada. No forma parte automatica del deploy.

## Vercel

- Conectar repositorio GitHub.
- Framework: Next.js.
- Install command: `npm install`.
- Build command: `npm run build`.
- Configurar variables en Vercel sin exponer valores.

## Neon

- Usar conexion pooled en `DATABASE_URL`.
- Usar conexion directa en `DIRECT_URL`.
- Revisar backups antes de migraciones relevantes.

## Health check

Ruta:

```text
/api/health
```

Debe comprobar conexion a base de datos.

## Error EPERM en Windows

Si `npm run build` falla con `EPERM` al renombrar `query_engine-windows.dll.node`, normalmente `next dev` esta bloqueando Prisma Client.

Solucion:

1. Detener `npm run dev` o procesos `node` del proyecto.
2. Repetir `npm run build` una vez.

## Recuperacion basica

- Revisar `migrate status`.
- Revisar logs de Vercel.
- Verificar variables en Vercel.
- Verificar conectividad de Neon.
- No ejecutar `db push` para intentar reparar produccion.
