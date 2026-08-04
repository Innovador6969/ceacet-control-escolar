# Decisiones arquitectonicas

Ultima actualizacion: 2026-08-04

## 2026-07-28

- Decision: crear la primera etapa de CEACET Control Escolar.
- Contexto: commit `7985827 Primera etapa de CEACET Control Escolar`.
- Motivo: establecer base con Next.js, Prisma, PostgreSQL, alumnos, inscripciones y autenticacion.
- Consecuencias: schema inicial y seed de prueba.
- Estado: vigente.

## Fecha no documentada

- Decision: usar Vercel + Neon PostgreSQL en lugar de Railway.
- Contexto: README y configuracion usan `DATABASE_URL` pooled y `DIRECT_URL` directa.
- Motivo: despliegue serverless con Neon y Vercel.
- Consecuencias: no crear `railway.json`; no usar instrucciones Railway.
- Estado: vigente.

## 2026-07-29

- Decision: agregar reinscripciones y calendario academico.
- Contexto: migracion `20260729000100_reenrollments_academic_calendar`.
- Motivo: soportar reinscripcion financiera y planeacion academica.
- Consecuencias: modelos `ReEnrollment`, `AcademicCalendarEvent`, `AcademicAssignment`, `ScheduleRule`.
- Estado: vigente.

## 2026-07-29

- Decision: proteger historial academico contra cascadas.
- Contexto: commit `7b43c73 Protect academic history from cascading deletes`.
- Motivo: evitar borrar historial por eliminar entidades padre.
- Consecuencias: relaciones como `ReEnrollment -> Student` y `AcademicPeriod -> SchoolCycle` usan `Restrict`.
- Estado: vigente.

## Fecha no documentada

- Decision: `Group.id` es fuente de verdad.
- Contexto: correcciones de pagos y calendario.
- Motivo: existen grupos validos con el mismo nombre.
- Consecuencias: selects usan `group.id`; etiquetas usan `formatGroupLabel(group)`.
- Estado: vigente.

## Fecha no documentada

- Decision: centralizar etiquetas de grupo.
- Contexto: `src/lib/labels.ts`.
- Motivo: evitar opciones ambiguas como `A`.
- Consecuencias: formato `[nombre] - [nivel academico] - [modalidad]` usando la funcion central.
- Estado: vigente.

## 2026-07-29

- Decision: agregar modulos de grupos, modalidades y niveles con metadata y auditoria.
- Contexto: commits `cb03292`, `65a18aa`, `620b2f8`.
- Motivo: administrar catalogos sin modificar datos manualmente.
- Consecuencias: rutas administrativas, APIs, auditoria y activacion/desactivacion.
- Estado: vigente.

## Fecha no documentada

- Decision: auditoria con carga diferida.
- Contexto: componentes `CatalogAuditAccordion` y endpoint `/api/catalog-audit/[entity]/[id]`.
- Motivo: reducir payload inicial.
- Consecuencias: historiales se cargan al abrir acordeon.
- Estado: vigente.

## 2026-07-30

- Decision: ciclos escolares y periodos academicos como catalogos administrables.
- Contexto: commit `0c450f8 Add school cycles and academic periods management`.
- Motivo: soportar operaciones por ciclo y periodo.
- Consecuencias: modelos con metadata, auditoria e indices.
- Estado: vigente.

## Fecha no documentada

- Decision: indice unico parcial para ciclo actual.
- Contexto: migracion `20260730000100_add_school_cycles_periods_metadata`.
- Motivo: garantizar en PostgreSQL un solo `SchoolCycle.isCurrent = true`.
- Consecuencias: restriccion SQL personalizada.
- Estado: vigente.

## 2026-07-30

- Decision: modulos de materias, docentes y aulas.
- Contexto: migracion `20260730000200_add_academic_resource_catalogs_metadata`.
- Motivo: administrar recursos academicos para asignaciones.
- Consecuencias: catalogos con metadata, auditoria e indices unicos parciales.
- Estado: vigente.

## 2026-08-03

- Decision: eliminar nivel/modalidad redundantes del formulario de asignaciones.
- Contexto: commit `5657e5f Simplify academic assignment group context`.
- Motivo: el grupo ya pertenece a nivel y modalidad.
- Consecuencias: el formulario usa grupo como fuente de verdad; el servicio deriva nivel y modalidad.
- Estado: vigente.

## Fecha no documentada

- Decision: ficha de inscripcion HTML imprimible en lugar de PDF server-side.
- Contexto: ruta `/alumnos/[id]/ficha-inscripcion`.
- Motivo: no existe infraestructura estable de PDF server-side.
- Consecuencias: el navegador imprime o guarda PDF.
- Estado: vigente.

## Fecha no documentada

- Decision: Primaria como catalogo, no hardcode.
- Contexto: `AcademicLevel` administrable.
- Motivo: evitar niveles fijos en codigo.
- Consecuencias: formularios consumen niveles activos desde base de datos.
- Estado: vigente.

## Fecha no documentada

- Decision: usar `cache()` por solicitud para catalogos activos.
- Contexto: servicios de catalogos.
- Motivo: evitar consultas duplicadas dentro de una misma solicitud.
- Consecuencias: no usar cache persistente sin estrategia de invalidacion.
- Estado: vigente.
