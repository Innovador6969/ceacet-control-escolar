# CEACET Control Escolar

Aplicacion web para la primera etapa del sistema de control escolar de CEACET. Esta base cubre administracion inicial de alumnos, inscripciones, expedientes, dashboard, catalogos semilla y preparacion para despliegue en Railway con PostgreSQL y Prisma.

## Tecnologias

- Next.js con App Router
- TypeScript estricto
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Zod
- React Hook Form
- bcryptjs para hash de contrasenas
- Railway como plataforma principal de despliegue

## Requisitos

- Node.js 20 o superior
- npm
- PostgreSQL local o un servicio PostgreSQL en Railway

## Instalacion local

1. Instala dependencias:

```bash
npm install
```

2. Copia las variables de entorno:

```bash
cp .env.example .env
```

3. Configura `DATABASE_URL` con tu base PostgreSQL y cambia `AUTH_SECRET` por un valor largo y aleatorio.

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
- `npm run build`: build de produccion
- `npm run start`: inicia la app compilada
- `npm run lint`: revision ESLint
- `npm run db:generate`: genera Prisma Client
- `npm run db:migrate`: crea/aplica migraciones en desarrollo
- `npm run db:deploy`: aplica migraciones en produccion con `prisma migrate deploy`
- `npm run db:seed`: ejecuta datos semilla
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

La migracion de produccion se ejecuta con:

```bash
npm run db:deploy
```

No se usa `prisma db push` como mecanismo de produccion.

## Deploy en Railway

1. Crea un proyecto en Railway.
2. Agrega un servicio PostgreSQL administrado.
3. Agrega el servicio de la aplicacion desde este repositorio.
4. Configura variables:

```bash
DATABASE_URL=<la URL interna de PostgreSQL generada por Railway>
AUTH_SECRET=<secreto largo y aleatorio>
NEXT_PUBLIC_APP_NAME="CEACET Control Escolar"
```

5. Railway usara `railway.json` para:

- Construir con Nixpacks.
- Ejecutar `npm run db:deploy && npm run start`.
- Validar `/api/health` como health check.

6. Para cargar datos de prueba en Railway, ejecuta en la consola del servicio:

```bash
npm run db:seed
```

7. Configura el dominio desde la seccion Networking de Railway.
8. Revisa `https://tu-dominio/api/health`; debe responder:

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
