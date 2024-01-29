import {
  Cascade,
  Entity,
  Enum,
  ManyToOne,
  PrimaryKeyProp,
} from "@mikro-orm/core";
import { Pokemon } from "./pokemon.entity";
import { Type } from "./type.entity";

export enum PokemonTypeAttributesEnum {
  WEAKNESS = "weakness",
  RESISTANCE = "resistance",
}

@Entity()
export class PokemonTypeAttribute {
  [PrimaryKeyProp]?: ["pokemon", "type"];

  @Enum({
    items: () => PokemonTypeAttributesEnum,
    nativeEnumName: "attribute_type_enum",
  })
  attributeType!: PokemonTypeAttributesEnum;

  @ManyToOne({ primary: true, cascade: [Cascade.REMOVE] })
  pokemon!: Pokemon;

  @ManyToOne({ primary: true, cascade: [Cascade.REMOVE] })
  type!: Type;
}
