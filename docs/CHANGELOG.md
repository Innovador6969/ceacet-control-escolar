# Changelog

Ultima actualizacion: 2026-08-04

Este changelog reconstruye el historial tecnico desde commits disponibles, migraciones y estado actual del codigo. No representa releases publicados.

## Unreleased

### Added

- Documentacion maestra en `docs/`.
- Modulo de expediente ampliado con tutor, antecedente academico, documentos por nivel/grado y ficha imprimible.
- Migracion pendiente `20260803000100_student_registration_expediente`.

### Changed

- README apunta a la documentacion maestra.

### Security

- Documentacion evita incluir secretos o cadenas de conexion.

## 5657e5f - Simplify academic assignment group context

### Changed

- El formulario de asignaciones academicas usa grupo como fuente de verdad para nivel y modalidad.

## 0c450f8 - Add school cycles and academic periods management

### Added

- Modulos de ciclos escolares y periodos academicos.
- Metadata y auditoria para esos catalogos.

## 6d828a5 - Refactor academic catalogs and optimize audit loading

### Changed

- Componentes compartidos de catalogos.
- Auditoria desplegable y carga diferida.

## 620b2f8 - Add academic level management with metadata and audit history

### Added

- Administracion de niveles academicos.
- Auditoria y metadata.

## 65a18aa - Fix modality filtering in group form

### Fixed

- Selector de modalidad en grupos filtra por nivel academico real.

## cb03292 - Add group management module with metadata and audit support

### Added

- Administracion de grupos.
- Metadata y auditoria.

## 7cdeaf5 - Centralize group handling across academic modules

### Changed

- `formatGroupLabel(group)` centraliza etiquetas de grupo.
- Uso de `group.id` en filtros y selects.

## 7b43c73 - Protect academic history from cascading deletes

### Fixed

- Relaciones historicas protegidas contra cascadas destructivas.

## 8257c74 - Add reenrollments and academic calendar

### Added

- Reinscripciones.
- Calendario academico.
- Asignaciones academicas.
- Reglas de horario recurrente.

## 4eabee2 - Configure Neon and Vercel deployment

### Changed

- Configuracion de despliegue hacia Vercel + Neon.
- Uso de `DATABASE_URL` pooled y `DIRECT_URL` directa.

## 7985827 - Primera etapa de CEACET Control Escolar

### Added

- Base inicial Next.js, Prisma y PostgreSQL.
- Autenticacion administrativa.
- Alumnos, inscripciones, documentos, cargos, pagos, recibos, seguimientos y auditoria inicial.
