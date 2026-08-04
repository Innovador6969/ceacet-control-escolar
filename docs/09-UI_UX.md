# UI y UX

Ultima actualizacion: 2026-08-04

## Estilo actual

La interfaz es administrativa, sobria y densa, inspirada en herramientas tipo ClickUp: tarjetas pequenas, tablas, badges, formularios en secciones y navegacion lateral.

## Componentes compartidos

- `Badge`: estado visual.
- `CatalogStatusBadge`: activo/inactivo.
- `CatalogPageHeader`: encabezados de catalogo.
- `CatalogMetadataCard`: metadata.
- `CatalogAuditAccordion`: historial desplegable.
- `CatalogEmptyState`: estados vacios.
- `CatalogStatusDialog`: activar/desactivar.
- `StatCard`: dashboard.

## Formularios

- Los formularios interactivos son Client Components.
- Deben evitar doble envio con estado de guardado.
- Deben mantener mensajes claros de error.
- No deben calcular reglas financieras criticas en cliente.
- El formulario de alumnos tiene paso de revision antes de confirmar.

## Tablas

- Se usan tablas responsivas con filtros locales en algunos modulos.
- Los listados de catalogos usan conteos con `_count`.
- Pendiente: tablas avanzadas con ordenamiento, busqueda servidor y paginacion servidor para volumen alto.

## Acordeones y auditoria

- Auditoria inicia cerrada.
- Muestra conteo, carga, errores y estado vacio.
- No debe mostrar JSON crudo al usuario final.

## Impresion

- La ficha de inscripcion usa HTML imprimible.
- `@media print` oculta navegacion, sidebar y botones.
- No existe generacion PDF server-side estable en esta fase.

## Accesibilidad

- Los botones de estado usan disabled durante procesamiento.
- Los acordeones deben mantener `aria-expanded`.
- Los selects usan `id` como `value`.

## UX pendiente

- Wizard de registro mas guiado.
- Breadcrumbs.
- Busqueda global.
- Toasts.
- Skeletons.
- Captura rapida.
- Mejoras moviles.
- Tablas avanzadas.
