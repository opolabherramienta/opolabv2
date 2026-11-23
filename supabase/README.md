# OPOLAB Security Foundation (local)

`config.toml`, `migrations/<timestamp>_<name>.sql` y `tests/database/*.sql`
siguen la estructura de Supabase CLI. No hay proyecto remoto enlazado ni semillas.
No se ha ejecutado `supabase init`, ni instalado/iniciado un stack local.

Las dos migraciones son **incrementales**: necesitan las once tablas existentes.
No incluyen un esquema base inventado y no pueden arrancar una base vacía.
`db.major_version = 17` es una selección local provisional; verificar la versión
del baseline antes de iniciar el stack. No representa una versión remota confirmada.

Consultar [la entrega y los bloqueos](../docs/security-foundation.md).
No aplicar ni desplegar sin la autorización del usuario y la validación pendiente.

Cuando exista una base **local desechable**, con baseline revisado y migraciones
instaladas, la suite pgTAP se ejecuta con `supabase test db --local`.
No usar `--linked`, `--db-url` remoto, credenciales reales ni datos de estudiantes.
La suite usa usuarios sintéticos dentro de una transacción terminada en ROLLBACK.
Los tests JavaScript no necesitan ninguna base: `npm run test:security`.
