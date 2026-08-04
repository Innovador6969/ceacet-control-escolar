# Auditoria

Ultima actualizacion: 2026-08-04

## Modelo

`AuditLog` contiene:

- `id`
- `userId`
- `action`
- `entity`
- `entityId`
- `previousData`
- `newData`
- `metadata`
- `createdAt`

## Entidades con endpoint diferido

`/api/catalog-audit/[entity]/[id]` usa una lista cerrada de entidades en `src/lib/services/catalog-audit.ts`. Deben aceptarse solo entidades definidas, no valores arbitrarios de URL.

Entidades documentadas por el codigo:

- `AcademicLevel`
- `Modality`
- `Group`
- `SchoolCycle`
- `AcademicPeriod`
- `Subject`
- `Teacher`
- `Classroom`

## Acciones reales encontradas

- `ACADEMIC_LEVEL_CREATED`
- `ACADEMIC_LEVEL_UPDATED`
- `ACADEMIC_LEVEL_ACTIVATED`
- `ACADEMIC_LEVEL_DEACTIVATED`
- `MODALITY_CREATED`
- `MODALITY_UPDATED`
- `MODALITY_ACTIVATED`
- `MODALITY_DEACTIVATED`
- `GROUP_CREATED`
- `GROUP_UPDATED`
- `GROUP_ACTIVATED`
- `GROUP_DEACTIVATED`
- `SCHOOL_CYCLE_CREATED`
- `SCHOOL_CYCLE_UPDATED`
- `SCHOOL_CYCLE_ACTIVATED`
- `SCHOOL_CYCLE_DEACTIVATED`
- `SCHOOL_CYCLE_SET_CURRENT`
- `ACADEMIC_PERIOD_CREATED`
- `ACADEMIC_PERIOD_UPDATED`
- `ACADEMIC_PERIOD_ACTIVATED`
- `ACADEMIC_PERIOD_DEACTIVATED`
- `SUBJECT_CREATED`
- `SUBJECT_UPDATED`
- `SUBJECT_ACTIVATED`
- `SUBJECT_DEACTIVATED`
- `TEACHER_CREATED`
- `TEACHER_UPDATED`
- `TEACHER_ACTIVATED`
- `TEACHER_DEACTIVATED`
- `CLASSROOM_CREATED`
- `CLASSROOM_UPDATED`
- `CLASSROOM_ACTIVATED`
- `CLASSROOM_DEACTIVATED`
- `STUDENT_CREATED`
- `STUDENT_UPDATED`
- `GUARDIAN_CREATED`
- `GUARDIAN_UPDATED`
- `ACADEMIC_BACKGROUND_CREATED`
- `ACADEMIC_BACKGROUND_UPDATED`
- `STUDENT_DOCUMENT_ADDED`
- `STUDENT_DOCUMENT_UPDATED`

## Componentes

- `src/components/catalog/catalog-audit-accordion.tsx` muestra auditoria desplegable.
- Wrappers por modulo conservan nombres y contexto.

## Que auditar

- Creacion, edicion, activacion y desactivacion de catalogos.
- Cambios relevantes de alumnos.
- Tutor.
- Antecedente academico.
- Documentos del alumno.
- Operaciones financieras criticas cuando se amplien.

## Que no almacenar

- Contrasenas.
- Tokens.
- Cadenas de conexion.
- Archivos completos.
- Datos innecesarios para explicar el cambio.

## Integracion transaccional

Las escrituras de catalogos y alumnos crean `AuditLog` dentro de la misma transaccion que modifica la entidad. Esto evita cambios sin bitacora cuando una operacion falla.

## Carga diferida

La auditoria de catalogos se consulta desde el endpoint cuando el usuario abre el acordeon. Evita cargar historiales completos en el render inicial.
