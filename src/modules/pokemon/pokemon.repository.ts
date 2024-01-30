import {
  EntityRepository,
  FilterQuery,
  FindOneOrFailOptions,
  Populate,
  raw
} from '@mikro-orm/core'
import { Pokemon } from './pokemon.entity'

const relations = [
  'types',
  'resistant',
  'weaknesses',
  'pokemonAttacks',
  'pokemonAttacks.attack',
  'pokemonAttacks.attack.type',
  'classification',
  'attributes.type',
  'evolutions.id',
  'evolutions.name',
  'previousEvolutions.id',
  'evolutionRequirements',
  'evolutionRequirements.evolutionItem'
] as const

export class PokemonRepository extends EntityRepository<Pokemon> {
  public async paginateById (
    {
      cursor,
      populate,
      ...options
    }: {
      first: number
      cursor: number
      populate?: Populate<Pokemon, string>
    },
    where: FilterQuery<Pokemon> = {}
  ) {
    return await this.findByCursor(where, {
      orderBy: { id: 'asc' },
      ...(populate
        ? { populate }
        : {
            strategy: 'joined',
            populate: relations
          }),
      ...(cursor && cursor > 0 && { after: { id: cursor } }),
      ...options
    })
  }

  public async findById (
    id: number,
    { populate, ...options }: FindOneOrFailOptions<Pokemon> = {}
  ) {
    return await this.findOneOrFail(
      {
        id
      },
      {
        ...(populate
          ? { populate }
          : {
              strategy: 'joined',
              populate: relations
            }),
        ...options
      }
    )
  }

  public async findByName (
    name: string,
    { populate, ...options }: FindOneOrFailOptions<Pokemon> = {}
  ) {
    return await this.findOneOrFail(
      {
        [raw((alias) => `LOWER(${alias}.name)`)]: name.toLowerCase()
      },
      {
        ...(populate
          ? { populate }
          : {
              strategy: 'joined',
              populate: relations
            }),
        ...options
      }
    )
  }
}
