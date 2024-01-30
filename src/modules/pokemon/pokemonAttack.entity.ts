import { Entity, Enum, ManyToOne, PrimaryKeyProp, Property } from '@mikro-orm/core'
import { Pokemon } from './pokemon.entity'
import { Attack } from './attack.entity'

export enum AttackTypeEnum {
  FAST = 'fast',
  SPECIAL = 'special',
}

@Entity()
export class PokemonAttack {
  [PrimaryKeyProp]?: ['pokemon', 'attack']

  @Enum({
    items: () => AttackTypeEnum,
    nativeEnumName: 'attack_type'
  })
    attackType!: AttackTypeEnum

  @Property()
    damage!: number

  @ManyToOne({ primary: true })
    pokemon!: Pokemon

  @ManyToOne({ primary: true })
    attack!: Attack
}
