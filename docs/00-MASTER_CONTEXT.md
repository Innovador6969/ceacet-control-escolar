# CEACET Control Escolar - Contexto maestro

Ultima actualizacion: 2026-08-04

## Proposito

CEACET Control Escolar es una aplicacion web para administrar una primera etapa de un ERP escolar: alumnos, expedientes, inscripciones, pagos, reinscripciones, calendario academico y catalogos administrativos.

El proyecto busca que control escolar, direccion, caja y usuarios de consulta puedan operar informacion academica y financiera sin perder trazabilidad historica.

## Usuarios esperados

- Administracion y direccion.
- Control escolar.
- Caja.
- Usuarios de solo lectura.
- Desarrolladores que continuen el ERP.

## Stack

- Next.js 15 con App Router.
- React 19.
- TypeScript estricto.
- Tailwind CSS.
- Prisma ORM.
- PostgreSQL en Neon.
- Vercel.
- Zod.
- React Hook Form.
- bcryptjs.

## Estado general

Implementado:

- Login administrativo con cookie HTTP-only.
- Dashboard ejecutivo.
- Listado, registro, edicion y expediente de alumnos.
- Tutor opcional del alumno.
- Formacion academica previa.
- Documentos academicos por tipo, nivel y grado.
- Ficha de inscripcion HTML imprimible.
- Pagos, cargos, aplicaciones de pago y recibos.
- Reinscripciones integradas con pagos.
- Calendario academico y eventos especiales.
- Asignaciones academicas y reglas recurrentes de horario.
- Catalogos administrativos: niveles academicos, modalidades, grupos, ciclos escolares, periodos academicos, materias, docentes y aulas.
- Auditoria para catalogos y alumnos.
- Health check en `/api/health`.

Implementado parcialmente:

- Documentos: existe modelo y vista placeholder `/documentos`; la gestion fina vive principalmente en expediente/registro.
- Reportes: existe ruta placeholder `/reportes`.
- Calendario: muestra eventos y sesiones calculadas; excepciones de horario quedan pendientes.
- Recibos: existe modelo `Receipt`; la generacion PDF definitiva no esta implementada.

Pendiente:

- Asistencia.
- Calificaciones y boletas formales.
- Reportes exportables.
- Portal para alumnos.
- Integraciones externas.
- Almacenamiento formal de archivos.

## Estructura principal

- `src/app/`: paginas App Router y API Routes.
- `src/components/`: componentes de UI por modulo y componentes compartidos.
- `src/lib/db.ts`: singleton de Prisma.
- `src/lib/auth/`: sesion, login y contrasenas.
- `src/lib/services/`: reglas de negocio y acceso a datos.
- `src/lib/validations/`: esquemas Zod.
- `src/lib/catalog-revalidation.ts`: revalidacion de rutas por catalogo.
- `prisma/schema.prisma`: modelo de datos.
- `prisma/migrations/`: migraciones SQL versionadas.
- `docs/`: documentacion maestra.

## Decisiones esenciales

- Despliegue objetivo: Vercel + Neon PostgreSQL.
- `DATABASE_URL` debe ser conexion pooled de Neon.
- `DIRECT_URL` debe ser conexion directa de Neon.
- No usar Railway.
- No usar `prisma db push` para ambientes compartidos o produccion.
- Las migraciones se revisan antes de aplicar.
- Los registros historicos no deben eliminarse fisicamente si tienen valor academico o financiero.
- Usar `id` como identidad en relaciones, filtros y selects.
- No usar nombres como identificadores persistentes.
- Toda escritura relevante debe validarse en servidor.
- Las escrituras con cambios relacionados y auditoria deben ir en transaccion.
- No llamar `prisma.$disconnect()` por request o endpoint.

## Reglas que no deben romperse

- Mantener el singleton Prisma de `src/lib/db.ts`.
- No crear migraciones destructivas sin justificacion y aprobacion.
- No ejecutar seed automaticamente durante deploy.
- No mezclar datos de alumno con datos de tutor.
- No guardar el antecedente academico en la inscripcion actual.
- No crear un evento por cada clase recurrente; usar `ScheduleRule`.
- Mantener `Group.id` como fuente de verdad para grupos.
- Mantener `formatGroupLabel(group)` para etiquetas de grupos.
- No exponer secretos ni errores internos de Prisma.

## Como continuar

1. Leer este documento.
2. Revisar [PROJECT_PRINCIPLES.md](./PROJECT_PRINCIPLES.md).
3. Revisar [01-ARQUITECTURA.md](./01-ARQUITECTURA.md) y [06-MODELO_DE_DATOS.md](./06-MODELO_DE_DATOS.md).
4. Para cambios de negocio, revisar [02-REGLAS_DE_NEGOCIO.md](./02-REGLAS_DE_NEGOCIO.md).
5. Para migraciones, revisar [03-ESTANDARES_DE_DESARROLLO.md](./03-ESTANDARES_DE_DESARROLLO.md) y [10-DEPLOY.md](./10-DEPLOY.md).
6. Antes de programar, ubicar servicios, validaciones y rutas existentes.

## Indice de documentos

- [01 - Arquitectura](./01-ARQUITECTURA.md)
- [02 - Reglas de negocio](./02-REGLAS_DE_NEGOCIO.md)
- [03 - Estandares de desarrollo](./03-ESTANDARES_DE_DESARROLLO.md)
- [04 - Roadmap](./04-ROADMAP.md)
- [05 - Guia Codex](./05-GUIA_CODEX.md)
- [06 - Modelo de datos](./06-MODELO_DE_DATOS.md)
- [07 - Modulos](./07-MODULOS.md)
- [08 - Auditoria](./08-AUDITORIA.md)
- [09 - UI/UX](./09-UI_UX.md)
- [10 - Deploy](./10-DEPLOY.md)
- [Decisiones](./DECISIONES.md)
- [Changelog](./CHANGELOG.md)
- [Principios](./PROJECT_PRINCIPLES.md)
