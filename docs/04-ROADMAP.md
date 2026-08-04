# Roadmap

Ultima actualizacion: 2026-08-04

## Implementado

- Autenticacion administrativa con cookie HTTP-only.
- Roles `ADMIN`, `MANAGEMENT`, `CASHIER`, `SCHOOL_CONTROL`, `READ_ONLY`.
- Dashboard ejecutivo con metricas desde PostgreSQL.
- Alumnos: listado, filtros, registro, edicion, expediente y ficha imprimible.
- Tutor opcional y formacion academica previa.
- Documentos academicos asociados a alumno, tipo, nivel y grado.
- Pagos: cargos, pagos, aplicaciones, recibos y pestañas de pagos.
- Reinscripciones con cargo, pagos parciales/totales y creacion de inscripcion resultante.
- Calendario academico con vistas mes, semana y lista.
- Asignaciones academicas con reglas recurrentes.
- Catalogos: niveles, modalidades, grupos, ciclos, periodos, materias, docentes y aulas.
- Auditoria en catalogos y alumnos.
- Deploy preparado para Vercel + Neon.

## Implementado parcialmente

- Documentos: falta flujo completo de archivos y revision documental.
- Recibos: existe modelo y creacion logica; PDF final no esta implementado.
- Calendario: falta manejo de excepciones a horarios recurrentes.
- Reportes: ruta placeholder.
- Dashboard: base ejecutiva implementada, puede crecer con graficas y tendencias.
- UX: formularios funcionales, pero faltan toasts, skeletons y breadcrumbs.

## Siguiente prioridad

- Consolidar flujo documental: carga, validacion, estado y almacenamiento seguro.
- Implementar reportes operativos basicos.
- Mejorar recibos imprimibles o PDF si se define infraestructura.
- Agregar excepciones de horario (`ScheduleException`) para suspensiones o cambios puntuales.
- Revisar permisos por rol con mas granularidad.

## Mediano plazo

- Asistencia.
- Calificaciones.
- Boletas academicas.
- Exportaciones.
- Busqueda global.
- Importacion desde Excel.
- Mejoras moviles.

## Largo plazo

- Portal de alumnos.
- Portal de docentes.
- Integraciones con almacenamiento externo.
- Notificaciones por correo o mensajeria.
- Facturacion, si aplica legalmente.
- Analitica academica y financiera avanzada.

## Deuda tecnica

- Unificar manejo de errores entre APIs de alumnos y APIs de catalogos.
- Reusar mas componentes de auditoria en modulos que aun tienen wrappers especificos.
- Revisar si algunos includes de detalle pueden convertirse a DTOs mas pequenos.
- Revisar indices cuando existan datos voluminosos reales.
- Convertir placeholders de `/documentos` y `/reportes` en modulos funcionales.
