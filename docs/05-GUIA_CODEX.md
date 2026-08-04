# Guia para trabajar con Codex

Ultima actualizacion: 2026-08-04

## Archivos a leer primero

Para casi cualquier sprint:

1. `docs/00-MASTER_CONTEXT.md`
2. `docs/PROJECT_PRINCIPLES.md`
3. `prisma/schema.prisma`
4. Servicio relacionado en `src/lib/services/`
5. Validacion relacionada en `src/lib/validations/`
6. Pagina o API relacionada en `src/app/`

Para migraciones:

- `prisma/schema.prisma`
- `prisma/migrations/`
- Servicio afectado.
- Consultas reales que justifican indices.

## Nivel de razonamiento recomendado

- Bajo: texto, errores visuales puntuales, labels, cambios de copy.
- Medio: bug localizado, formulario, API concreta, validacion.
- Alto: migraciones, reglas financieras, relaciones historicas, modulos nuevos, refactors grandes.

## Seguridad

- No copiar `.env`.
- No incluir secretos.
- No ejecutar seed, migrate, db push, commit o push sin instruccion explicita.
- No modificar datos directos salvo que el usuario lo pida claramente.
- No usar IDs inventados para auditoria.
- Usar usuarios reales solo cuando la tarea sea modificar datos y lo pida el usuario.

## Migraciones

- Crear migracion nueva si cambia el schema.
- No editar migraciones aplicadas.
- Revisar SQL completo.
- Verificar `onDelete`.
- Verificar nulabilidad y defaults.
- Confirmar que datos existentes no fallan.
- No aplicar migracion sin aprobacion.

## Validaciones finales

- `npx prisma format` si se toco Prisma.
- `npx prisma validate` si se toco Prisma.
- `npm run lint`.
- `npm run build`.

## Evitar gastar creditos innecesarios

- Para bugs puntuales, pedir o revisar solo archivos relacionados.
- No hacer auditorias completas si el problema esta localizado.
- No repetir analisis ya documentado salvo que el codigo haya cambiado.
- Para preguntas simples, usar busquedas puntuales con `rg`.

## Plantillas de prompt

### Bug puntual

```text
Revisa y corrige el bug en [archivo/ruta]. No modifiques otros modulos. Ejecuta lint y build. Reporta causa, archivos modificados y resultados.
```

### Nuevo modulo

```text
Antes de implementar, analiza schema, servicios, validaciones, APIs y UI relacionada. Propón cambios minimos. Luego implementa con auditoria, permisos, validacion servidor, lint y build. No apliques migracion.
```

### Revision de migracion

```text
Revisa solo [migration.sql] y [schema.prisma]. Verifica nulabilidad, defaults, indices, foreign keys y operaciones destructivas. Corrige solo problemas demostrables. No ejecutes migrate.
```

### Refactor

```text
Refactor puntual de [modulo]. No cambies reglas de negocio ni rutas publicas. Reduce duplicacion demostrable. Ejecuta lint y build.
```

### Optimizacion

```text
Analiza consultas reales de [modulo]. Evita N+1, includes excesivos y calculos en memoria. No cambies comportamiento visible. Reporta antes/despues.
```

### Documentacion

```text
Documenta solo funcionalidades reales. Distingue implementado, parcial y pendiente. No incluyas secretos ni credenciales de produccion.
```
