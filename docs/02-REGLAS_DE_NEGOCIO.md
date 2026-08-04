# Reglas de negocio

Ultima actualizacion: 2026-08-04

## Alumnos

Implementado:

- `Student` guarda datos personales, contacto, domicilio, estatus administrativo y matricula.
- La matricula se genera con `AcademicLevel.code` y anio de inscripcion.
- CURP es unica si se captura.
- El registro crea una `Enrollment` inicial.
- La edicion permite corregir datos del alumno e inscripcion reciente.
- `READ_ONLY` no puede registrar ni editar.

Restricciones:

- No se debe mezclar informacion del tutor en campos del alumno.
- No se debe crear un alumno con nivel, modalidad o grupo incompatible.

## Tutores

Implementado:

- `StudentGuardian` es opcional.
- Tiene nombre completo, parentesco, telefono principal, telefono alternativo, correo y observaciones.
- Se actualiza con upsert por `studentId`, evitando duplicados por guardado.

## Formacion academica previa

Implementado:

- `StudentAcademicBackground` es independiente de `Enrollment`.
- Puede relacionarse con `AcademicLevel` anterior.
- Permite escuela de procedencia, ultimo grado, ciclo anterior y observaciones.

## Documentos y boletas

Implementado:

- `StudentDocument` relaciona alumno y tipo de documento.
- Puede guardar `academicLevelId` y `grade` opcionales.
- La migracion nueva agrega indice unico para evitar duplicado identico por alumno, tipo, nivel y grado.
- No existen columnas separadas por boleta.

Pendiente:

- Flujo completo de carga, almacenamiento y revision de archivos.

## Inscripciones

Implementado:

- `Enrollment` relaciona alumno, nivel, modalidad, grupo opcional, ciclo opcional y periodo opcional.
- `Enrollment.status` usa `ACTIVE`, `FINISHED`, `CANCELLED`.
- La inscripcion puede guardar grado, cuatrimestre, cuotas y fechas.

Restriccion historica:

- Las reinscripciones liquidadas crean una nueva inscripcion, no sobrescriben la anterior.

## Reinscripciones

Implementado:

- `ReEnrollmentStatus`: `DRAFT`, `PENDING`, `PARTIAL`, `PAID`, `OVERDUE`, `WAIVED`, `CANCELLED`.
- Relaciona alumno, ciclo, periodo opcional, nivel, modalidad, grupo opcional, cargo y posible inscripcion resultante.
- Evita reinscripciones no canceladas duplicadas por trayectoria academica.
- Pago de reinscripcion se registra en transaccion con `Payment`, `PaymentApplication`, `Charge`, `ReEnrollment` y `Receipt`.

## Niveles academicos

Implementado:

- CRUD sin eliminacion fisica.
- Activacion/desactivacion.
- Metadata `createdBy`, `updatedBy`, `createdAt`, `updatedAt`.
- Auditoria.
- `Primaria` es catalogo, no hardcode.

## Modalidades

Implementado:

- Pertenecen a `AcademicLevel`.
- CRUD sin eliminacion fisica.
- No se permite desactivar si hay grupos activos.
- No se cambia nivel si hay dependencias relevantes.

## Grupos

Implementado:

- Pertenecen a `AcademicLevel` y `Modality`.
- Se identifican por `Group.id`.
- La etiqueta visible usa `formatGroupLabel(group)`.
- No se eliminan fisicamente.
- Cambio de nivel o modalidad se bloquea si hay dependencias.

## Ciclos escolares

Implementado:

- `SchoolCycle` tiene fechas, `isActive` e `isCurrent`.
- La migracion incluye indice unico parcial para que solo haya un ciclo actual.
- Un ciclo inactivo no puede marcarse como actual.
- Al desactivar un ciclo actual, `isCurrent` queda en `false`.

## Periodos academicos

Implementado:

- `AcademicPeriod` pertenece a `SchoolCycle`.
- Fechas deben estar dentro del ciclo.
- `displayOrder` ordena periodos por ciclo.
- Se bloquea desactivacion cuando hay operaciones activas relacionadas.

## Materias, docentes y aulas

Implementado:

- Catalogos con metadata, auditoria y activar/desactivar.
- Materias pueden estar asociadas a nivel y modalidad opcional.
- Docentes y aulas se usan en asignaciones y eventos.

## Asignaciones y horarios

Implementado:

- `AcademicAssignment` relaciona materia, grupo, docente, aula opcional y periodo.
- Nivel y modalidad se derivan del grupo.
- `ScheduleRule` representa clases recurrentes.
- Se validan traslapes por docente, grupo, aula, dia, rango de fechas y periodo.

Pendiente:

- `ScheduleException`.

## Calendario

Implementado:

- `AcademicCalendarEvent` guarda eventos especiales: examenes, inicios, fines, dias feriados, suspensiones, fechas de calificacion, institucionales y otros.
- Las vistas combinan eventos con ocurrencias calculadas de `ScheduleRule`.
- Eventos cancelados no deben aparecer como activos.

## Cargos, pagos y recibos

Implementado:

- `Charge` guarda base, recargo, descuento, balance y estado.
- `Payment` usa `PaymentStatus.APPLIED` o `CANCELLED`.
- `PaymentApplication` aplica pagos a cargos.
- `Receipt` se relaciona uno a uno con `Payment`.

Restriccion:

- No calcular balance o estado financiero solo en cliente.

## Auditoria

Implementado:

- Catalogos y alumnos escriben `AuditLog`.
- La auditoria no debe guardar secretos ni informacion sensible innecesaria.
