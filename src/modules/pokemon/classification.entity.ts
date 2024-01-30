import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property
} from '@mikro-orm/core'
import { Pokemon } from './pokemon.entity'

@Entity()
export class Classification {
  @PrimaryKey()
    id!: number

  @Property({ unique: true })
    name!: string

  @OneToMany(() => Pokemon, (pokemon) => pokemon.classification)
    pokemons = new Collection<Pokemon>(this)

  constructor (name: string) {
    this.name = name
  }
}
