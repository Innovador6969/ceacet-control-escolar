# CEACET Control Escolar

Aplicacion web para la primera etapa del sistema de control escolar de CEACET. Esta base cubre administracion inicial de alumnos, inscripciones, expedientes, dashboard, catalogos semilla y preparacion para despliegue en Vercel con Neon PostgreSQL y Prisma.

## Tecnologias

- Next.js con App Router
- TypeScript estricto
- Tailwind CSS
- PostgreSQL en Neon
- Prisma ORM
- Zod
- React Hook Form
- bcryptjs para hash de contrasenas
- Vercel como plataforma de despliegue

## Requisitos

- Node.js 20 o superior
- npm
- Base de datos PostgreSQL en Neon
- Repositorio GitHub conectado a Vercel

## Instalacion local

1. Instala dependencias:

```bash
npm install
```

2. Copia las variables de entorno:

```bash
cp .env.example .env
```

3. Configura las variables:

```bash
DATABASE_URL=<conexion pooled de Neon>
DIRECT_URL=<conexion directa de Neon>
AUTH_SECRET=<secreto largo y aleatorio>
NEXT_PUBLIC_APP_NAME="CEACET Control Escolar"
```

4. Genera Prisma Client:

```bash
npm run db:generate
```

5. Ejecuta migraciones en desarrollo:

```bash
npm run db:migrate
```

6. Carga datos de prueba:

```bash
npm run db:seed
```

7. Inicia el servidor:

```bash
npm run dev
```

La app quedara disponible normalmente en `http://localhost:3000`.

## Credenciales de prueba

- Administrador: `admin@ceacet.test`
- Contrasena: `Admin123!`

Usuario adicional:

- Control escolar: `control@ceacet.test`
- Contrasena: `Control123!`

## Comandos disponibles

- `npm run dev`: servidor de desarrollo
- `npm run build`: genera Prisma Client y crea el build de produccion
- `npm run start`: inicia la app compilada
- `npm run lint`: revision ESLint
- `npm run db:generate`: genera Prisma Client
- `npm run db:migrate`: crea/aplica migraciones en desarrollo
- `npm run db:deploy`: aplica migraciones en produccion con `prisma migrate deploy`
- `npm run db:seed`: ejecuta datos semilla manualmente
- `npm run db:studio`: abre Prisma Studio

## Estructura principal

- `src/app`: rutas App Router, API routes y pantallas administrativas
- `src/components`: layout, dashboard, alumnos, autenticacion y UI reutilizable
- `src/lib/auth`: sesion administrativa y hash/verificacion de contrasenas
- `src/lib/services`: consultas y operaciones con Prisma
- `src/lib/validations`: esquemas Zod
- `prisma/schema.prisma`: modelo de datos
- `prisma/migrations`: migraciones SQL versionadas
- `prisma/seed.ts`: catalogos, usuarios y alumnos de prueba

## Funcionalidades de esta etapa

- Login administrativo con sesion HTTP-only
- Proteccion de rutas administrativas
- Dashboard con indicadores desde PostgreSQL
- Listado de alumnos con busqueda, filtros y paginacion
- Registro de alumnos con validaciones cliente/servidor
- Matricula automatica por nivel y ano
- Expediente individual con resumen, datos personales e inscripcion
- Pantallas preparadas para pagos, documentos, reportes y configuracion
- Endpoint `GET /api/health`

## Base de datos

El esquema inicial incluye:

`User`, `Student`, `Enrollment`, `AcademicLevel`, `Modality`, `Group`, `DocumentType`, `StudentDocument`, `ChargeConcept`, `Charge`, `Payment`, `PaymentApplication`, `Receipt`, `FollowUp` y `AuditLog`.

Para Neon se usan dos URLs:

- `DATABASE_URL`: conexion pooled de Neon para la aplicacion en Vercel.
- `DIRECT_URL`: conexion directa de Neon para migraciones Prisma.

La migracion de produccion se ejecuta con:

```bash
npm run db:deploy
```

No se usa `prisma db push` como mecanismo de produccion.

## Deploy Con GitHub, Vercel Y Neon

1. Sube el proyecto a un repositorio de GitHub.
2. Crea una base de datos PostgreSQL en Neon.
3. Copia desde Neon:

- La cadena pooled para `DATABASE_URL`.
- La cadena directa para `DIRECT_URL`.

4. Importa el repositorio desde Vercel.
5. Configura en Vercel las variables de entorno:

```bash
DATABASE_URL=<conexion pooled de Neon>
DIRECT_URL=<conexion directa de Neon>
AUTH_SECRET=<secreto largo y aleatorio>
NEXT_PUBLIC_APP_NAME="CEACET Control Escolar"
```

6. En Vercel usa la configuracion estandar:

- Install command: `npm install`
- Build command: `npm run build`
- Output framework: Next.js

7. Ejecuta migraciones de produccion manualmente cuando corresponda:

```bash
npm run db:deploy
```

8. Ejecuta el seed manualmente solo cuando quieras cargar datos de prueba:

```bash
npm run db:seed
```

9. Revisa el health check del despliegue:

```text
https://tu-dominio.vercel.app/api/health
```

Debe responder:

```json
{
  "status": "ok",
  "database": "connected"
}
```

## Proximas etapas

- Edicion completa de alumnos
- Captura real de pagos semanales
- Recargos automaticos
- Recibos PDF definitivos
- Reportes exportables
- Importacion desde Excel
- Integracion con Google Drive
- WhatsApp, correos y facturacion
- Portal para alumnos

## Limitaciones conocidas

- Las pantallas de pagos, documentos, reportes y configuracion son placeholders funcionales.
- El estado de cuenta aun redirige al modulo preparado de pagos.
- No hay integraciones externas ni almacenamiento de archivos en esta etapa.
- El seed usa informacion ficticia y correos de ejemplo.
