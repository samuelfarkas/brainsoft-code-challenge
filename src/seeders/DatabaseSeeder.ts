import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { PokemonSeeder } from './PokemonSeeder'

export class DatabaseSeeder extends Seeder {
  async run (em: EntityManager): Promise<void> {
    return await this.call(em, [PokemonSeeder])
  }
}
