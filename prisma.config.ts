// Prisma 7 CLI config (generate, migrate, db push, studio, seed).
// Prisma 7 no longer reads connection URLs from schema.prisma, and the CLI doesn't load .env automatically.
import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx scripts/safe-seed.ts',
  },
  datasource: {
    // Prisma 7 config has no `directUrl`. The CLI runs migrations, so give it the direct
    // (non-pooled) connection when one exists. The app's runtime connection is set in lib/db.ts.
    // Using process.env instead of env() means `prisma generate` still works with no DB configured (CI).
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
})
