import {
  defineConfig,
  GeneratedCacheAdapter,
  Options
} from '@mikro-orm/postgresql'
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'
import { SeedManager } from '@mikro-orm/seeder'
import { Migrator } from '@mikro-orm/migrations'
import { existsSync, readFileSync } from 'node:fs'
import { env } from './env'

const options = {} as Options

if (
  process.env.NODE_ENV === 'production' &&
  existsSync('./temp/metadata.json')
) {
  options.metadataCache = {
    enabled: true,
    adapter: GeneratedCacheAdapter,
    // temp/metadata.json can be generated via `npx mikro-orm-esm cache:generate --combine`
    options: {
      data: JSON.parse(
        readFileSync('./temp/metadata.json', { encoding: 'utf8' })
      )
    }
  }
} else {
  options.metadataProvider =
    require('@mikro-orm/reflection').TsMorphMetadataProvider
}

export default defineConfig({
  dbName: env.POSTGRES_DB,
  password: env.POSTGRES_PASSWORD,
  user: env.POSTGRES_USER,
  host: env.POSTGRES_HOST,
  // folder based discovery setup, using common filename suffix
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  // enable debug mode to log SQL queries and discovery information
  debug: process.env.NODE_ENV !== 'production',
  // for vitest/jest to get around `TypeError: Unknown file extension ".ts"` (ERR_UNKNOWN_FILE_EXTENSION)
  dynamicImportProvider: async (id) => await import(id),
  // for highlighting the SQL queries
  highlighter: new SqlHighlighter(),
  extensions: [SeedManager, Migrator],
  ...options
})
