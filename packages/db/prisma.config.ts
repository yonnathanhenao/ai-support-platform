import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 config. The connection URL lives here (and/or is passed to the
 * PrismaClient adapter at runtime) rather than in schema.prisma.
 *
 * The vertical slice runs on the in-memory store in @platform/core, so no
 * database connection is required yet. The RAG iteration wires a driver
 * adapter here and runs `prisma migrate`.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
});
