/**
 * @platform/db — persistence layer (Prisma 7 + pgvector).
 *
 * The deliverable of this package today is `prisma/schema.prisma`: the
 * multi-tenant, pgvector-backed schema that mirrors @platform/core entities.
 *
 * The vertical slice runs on the in-memory store in @platform/core, so this
 * package intentionally exposes no live client yet. The RAG iteration will:
 *   1. add a Prisma driver adapter + connection in `prisma.config.ts`,
 *   2. run `bun run --filter @platform/db generate` and `... migrate`,
 *   3. export a `prisma` singleton here and point
 *      `searchKnowledge()` at pgvector similarity search.
 *
 * Keeping the client out of the slice avoids requiring a running Postgres for
 * `type-check` / local dev of the chat path.
 */
export const SCHEMA_PATH = 'prisma/schema.prisma';
