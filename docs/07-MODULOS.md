# Modulos

Ultima actualizacion: 2026-08-04

## Autenticacion

- Rutas: `/login`, `/api/auth/login`, `/api/auth/logout`.
- Servicios: `src/lib/auth/session.ts`, `src/lib/auth/password.ts`.
- Modelos: `User`.
- Estado: implementado.

## Dashboard

- Ruta: `/`.
- Servicio: `src/lib/services/dashboard.ts`.
- Componentes: `src/components/dashboard/stat-card.tsx`.
- Modelos: `Student`, `Enrollment`, `ReEnrollment`, `Charge`, `Payment`, `AcademicCalendarEvent`.
- Estado: implementado con metricas ejecutivas.

## Alumnos

- Rutas: `/alumnos`, `/alumnos/[id]`, `/alumnos/[id]/editar`, `/alumnos/[id]/ficha-inscripcion`, `/registrar-alumno`.
- APIs: `/api/students`, `/api/students/[id]`.
- Servicio: `src/lib/services/students.ts`.
- Validacion: `src/lib/validations/student.ts`.
- Componentes: `student-registration-form`, `student-filters-table`, `print-button`.
- Modelos: `Student`, `StudentGuardian`, `StudentAcademicBackground`, `StudentDocument`, `Enrollment`.
- Auditoria: `STUDENT_CREATED`, `STUDENT_UPDATED`, `GUARDIAN_CREATED`, `GUARDIAN_UPDATED`, `ACADEMIC_BACKGROUND_CREATED`, `ACADEMIC_BACKGROUND_UPDATED`, `STUDENT_DOCUMENT_ADDED`, `STUDENT_DOCUMENT_UPDATED`.
- Permisos: `READ_ONLY` no escribe.
- Estado: implementado.

## Pagos

- Ruta: `/pagos`.
- APIs: `/api/reenrollments/payments`.
- Componentes: `src/components/payments/payments-tabs.tsx`.
- Modelos: `Charge`, `Payment`, `PaymentApplication`, `Receipt`, `ReEnrollment`.
- Estado: implementado para pagos y reinscripciones; puede crecer en otros conceptos.

## Reinscripciones

- API: `/api/reenrollments`.
- Servicio: `src/lib/services/reenrollments.ts`.
- Validacion: `src/lib/validations/reenrollment.ts`.
- Modelos: `ReEnrollment`, `Charge`, `Enrollment`, `Payment`, `Receipt`.
- Estado: implementado.

## Calendario academico

- Rutas: `/calendario-academico`, `/calendario-academico/asignaciones`.
- APIs: `/api/academic-calendar/events`, `/api/academic-assignments`.
- Servicio: `src/lib/services/academic-calendar.ts`.
- Validacion: `src/lib/validations/academic-calendar.ts`.
- Componentes: `academic-calendar-view`, `event-form`, `assignment-form`.
- Modelos: `AcademicCalendarEvent`, `AcademicAssignment`, `ScheduleRule`.
- Estado: implementado parcialmente; falta excepcion de horario.

## Niveles academicos

- Rutas: `/configuracion-academica/niveles-academicos`, `/configuracion-academica/niveles-academicos/[id]`.
- APIs: `/api/academic-levels`, `/api/academic-levels/[id]`.
- Servicio: `src/lib/services/academic-levels.ts`.
- Validacion: `src/lib/validations/academic-level.ts`.
- Componentes: `src/components/academic-levels/`.
- Auditoria: `ACADEMIC_LEVEL_CREATED`, `ACADEMIC_LEVEL_UPDATED`, `ACADEMIC_LEVEL_ACTIVATED`, `ACADEMIC_LEVEL_DEACTIVATED`.
- Estado: implementado.

## Modalidades

- Rutas: `/configuracion-academica/modalidades`, `/configuracion-academica/modalidades/[id]`.
- APIs: `/api/modalities`, `/api/modalities/[id]`.
- Servicio: `src/lib/services/modalities.ts`.
- Validacion: `src/lib/validations/modality.ts`.
- Auditoria: `MODALITY_CREATED`, `MODALITY_UPDATED`, `MODALITY_ACTIVATED`, `MODALITY_DEACTIVATED`.
- Estado: implementado.

## Grupos

- Rutas: `/configuracion-academica/grupos`, `/configuracion-academica/grupos/[id]`.
- APIs: `/api/groups`, `/api/groups/[id]`.
- Servicio: `src/lib/services/groups.ts`.
- Validacion: `src/lib/validations/group.ts`.
- Componentes: `src/components/groups/`.
- Auditoria: `GROUP_CREATED`, `GROUP_UPDATED`, `GROUP_ACTIVATED`, `GROUP_DEACTIVATED`.
- Estado: implementado.

## Ciclos escolares

- Rutas: `/configuracion-academica/ciclos-escolares`, `/configuracion-academica/ciclos-escolares/[id]`.
- APIs: `/api/school-cycles`, `/api/school-cycles/[id]`.
- Servicio: `src/lib/services/school-cycles.ts`.
- Validacion: `src/lib/validations/school-cycle.ts`.
- Auditoria: `SCHOOL_CYCLE_CREATED`, `SCHOOL_CYCLE_UPDATED`, `SCHOOL_CYCLE_ACTIVATED`, `SCHOOL_CYCLE_DEACTIVATED`, `SCHOOL_CYCLE_SET_CURRENT`.
- Estado: implementado.

## Periodos academicos

- Rutas: `/configuracion-academica/periodos-academicos`, `/configuracion-academica/periodos-academicos/[id]`.
- APIs: `/api/academic-periods`, `/api/academic-periods/[id]`.
- Servicio: `src/lib/services/academic-periods.ts`.
- Validacion: `src/lib/validations/academic-period.ts`.
- Auditoria: `ACADEMIC_PERIOD_CREATED`, `ACADEMIC_PERIOD_UPDATED`, `ACADEMIC_PERIOD_ACTIVATED`, `ACADEMIC_PERIOD_DEACTIVATED`.
- Estado: implementado.

## Materias

- Rutas: `/configuracion-academica/materias`, `/configuracion-academica/materias/[id]`.
- APIs: `/api/subjects`, `/api/subjects/[id]`.
- Servicio: `src/lib/services/subjects.ts`.
- Validacion: `src/lib/validations/subject.ts`.
- Auditoria: `SUBJECT_CREATED`, `SUBJECT_UPDATED`, `SUBJECT_ACTIVATED`, `SUBJECT_DEACTIVATED`.
- Estado: implementado.

## Docentes

- Rutas: `/configuracion-academica/docentes`, `/configuracion-academica/docentes/[id]`.
- APIs: `/api/teachers`, `/api/teachers/[id]`.
- Servicio: `src/lib/services/teachers.ts`.
- Validacion: `src/lib/validations/teacher.ts`.
- Auditoria: `TEACHER_CREATED`, `TEACHER_UPDATED`, `TEACHER_ACTIVATED`, `TEACHER_DEACTIVATED`.
- Estado: implementado.

## Aulas

- Rutas: `/configuracion-academica/aulas`, `/configuracion-academica/aulas/[id]`.
- APIs: `/api/classrooms`, `/api/classrooms/[id]`.
- Servicio: `src/lib/services/classrooms.ts`.
- Validacion: `src/lib/validations/classroom.ts`.
- Auditoria: `CLASSROOM_CREATED`, `CLASSROOM_UPDATED`, `CLASSROOM_ACTIVATED`, `CLASSROOM_DEACTIVATED`.
- Estado: implementado.

## Documentos y reportes

- Rutas: `/documentos`, `/reportes`.
- Componentes: `src/components/sections/coming-soon-section.tsx`.
- Estado: placeholders.
