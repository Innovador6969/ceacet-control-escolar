# Principios del proyecto

Ultima actualizacion: 2026-08-04

## Principios vigentes

- Preservar historial academico y financiero.
- Evitar eliminacion fisica de informacion relevante; preferir activar/desactivar.
- Usar `id` como fuente de identidad en selects, filtros, relaciones, keys y values.
- No usar nombres como claves persistentes.
- Evitar informacion duplicada cuando una relacion puede resolverla.
- Mantener una sola fuente de verdad por concepto.
- Auditar escrituras importantes.
- Validar siempre en servidor.
- Mantener reglas de negocio en `src/lib/services/`.
- Usar Zod para validar entradas.
- Usar transacciones en escrituras relacionadas con auditoria o varios modelos.
- Mantener transacciones cortas.
- Optimizar consultas y payloads con `select`, `_count` y limites.
- Preferir Server Components para lecturas y Client Components solo para interaccion.
- Conservar compatibilidad historica al editar catalogos.
- No mostrar catalogos inactivos en operaciones nuevas, salvo que se trate del valor historico ya relacionado.
- Evitar soluciones aisladas que dupliquen reglas existentes.
- Priorizar integridad sobre comodidad.

## Ejemplos en el codigo

- `src/lib/db.ts` centraliza Prisma.
- `src/lib/services/groups.ts` usa `groupLabelSelect` y `Group.id`.
- `src/lib/labels.ts` centraliza `formatGroupLabel(group)`.
- `src/lib/services/academic-calendar.ts` deriva nivel y modalidad de `Group` para asignaciones.
- `src/lib/services/students.ts` separa `Student`, `StudentGuardian` y `StudentAcademicBackground`.
- `src/lib/catalog-revalidation.ts` agrupa rutas que se revalidan por catalogo.

## Limites

Estos principios describen decisiones observadas en el codigo actual. Si una regla nueva entra en conflicto, debe documentarse en [DECISIONES.md](./DECISIONES.md) y reflejarse en servicios, validaciones y migraciones.
