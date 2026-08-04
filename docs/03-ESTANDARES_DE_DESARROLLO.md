# Estandares de desarrollo

Ultima actualizacion: 2026-08-04

## Reglas generales

- Analizar antes de modificar.
- Leer schema, servicios, validaciones y APIs relacionados.
- No ejecutar migraciones automaticamente.
- No usar `prisma db push`.
- No ejecutar seed sin aprobacion explicita.
- No hacer commit ni push automaticamente.
- Revisar SQL completo de cualquier migracion.
- No modificar migraciones ya aplicadas.
- Usar `id` como identidad.
- Preservar registros historicos.
- No usar `any` innecesario.
- No usar `@ts-ignore`.
- No desactivar ESLint globalmente.

## Prisma y migraciones

- Crear migracion nueva para cambios de schema.
- Evitar `DROP TABLE`, `DROP COLUMN`, `DELETE` y `TRUNCATE`.
- Usar defaults seguros o campos opcionales para datos existentes.
- Preferir `onDelete: Restrict` en relaciones historicas.
- Usar `onDelete: SetNull` para metadata de usuario creador/modificador.
- Mantener indices relacionados con consultas reales.
- Los indices parciales de PostgreSQL se documentan en SQL porque Prisma Schema no siempre los expresa.

## Servicios

- Mantener reglas de negocio en `src/lib/services/`.
- Usar transacciones para escrituras relacionadas.
- Mantener transacciones cortas.
- No usar `Promise.all` dentro de transacciones si rompe orden o seguridad.
- Validar compatibilidad de relaciones en servidor.
- No confiar en datos calculados por el cliente para finanzas.

## Consultas

- Usar `select` cuando no se necesita toda la entidad.
- Evitar `include` excesivo.
- Usar `_count` para conteos.
- Evitar N+1.
- Limitar listados y actividad reciente.
- Filtrar en SQL cuando sea posible.
- Usar `cache()` por solicitud para catalogos activos cuando sea seguro.

## APIs

- Proteger APIs con `requireUser()` o `getCurrentUser()`.
- `READ_ONLY` no debe escribir.
- Usar codigos:
  - 400: validacion.
  - 401: no autenticado.
  - 403: sin permiso.
  - 404: no encontrado.
  - 409: conflicto de negocio o duplicado.
  - 500: error inesperado.
- No exponer errores internos de Prisma.

## UI

- Mantener textos en espanol.
- Evitar doble envio.
- Deshabilitar botones durante guardado.
- No usar `event.currentTarget` despues de un `await`; guardar referencia antes.
- Usar Client Components solo para interaccion.
- No pasar objetos Prisma completos al cliente si basta un DTO.

## Checklist de cierre de sprint

- [ ] Revisar archivos tocados y dependencias reales.
- [ ] Revisar SQL si hay migracion.
- [ ] Confirmar que no se ejecuto seed ni migrate sin aprobacion.
- [ ] Confirmar que no se modificaron datos salvo que el usuario lo pidiera.
- [ ] Ejecutar `npx prisma format` si se modifico Prisma.
- [ ] Ejecutar `npx prisma validate` si se modifico Prisma.
- [ ] Ejecutar `npm run lint`.
- [ ] Ejecutar `npm run build`.
- [ ] Reportar archivos creados y modificados.
- [ ] Reportar pasos manuales pendientes.
