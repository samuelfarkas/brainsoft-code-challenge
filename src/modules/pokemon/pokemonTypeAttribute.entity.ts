import { Entity, Enum, ManyToOne, PrimaryKeyProp } from '@mikro-orm/core'
import { Pokemon } from './pokemon.entity'
import { Type } from '../type/type.entity'

export enum PokemonTypeAttributesEnum {
  WEAKNESS = 'weakness',
  RESISTANCE = 'resistance',
}

@Entity()
export class PokemonTypeAttribute {
  [PrimaryKeyProp]?: ['pokemon', 'type']

  @Enum({
    items: () => PokemonTypeAttributesEnum,
    nativeEnumName: 'attribute_type_enum'
  })
    attributeType!: PokemonTypeAttributesEnum

  @ManyToOne({ primary: true })
    pokemon!: Pokemon

  @ManyToOne({ primary: true })
    type!: Type
}
