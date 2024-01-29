import {
  Collection,
  Entity,
  EntityRepositoryType,
  HiddenProps,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
  types,
} from "@mikro-orm/core";
import { PokemonRepository } from "./pokemon.repository";
import {
  PokemonTypeAttribute,
  PokemonTypeAttributesEnum,
} from "./pokemonTypeAttribute.entity";
import { Type } from "./type.entity";

@Entity({ repository: () => PokemonRepository })
export class Pokemon {
  [EntityRepositoryType]?: PokemonRepository;
  [HiddenProps]?: "attributes";

  @PrimaryKey()
  id!: number;

  @Property({ index: true })
  name!: string;

  @Property()
  catalogId!: string;

  @Property({ type: types.float })
  fleeRate!: number;

  @Property()
  maxCP!: number;

  @Property()
  maxHP!: number;

  @Property({ type: types.json, nullable: true })
  weightKg?: { maximum: number; minimum: number };

  @Property({ type: types.json, nullable: true })
  heightMeters?: { maximum: number; minimum: number };

  @ManyToMany(() => Type, (type) => type.pokemons, {
    owner: true,
  })
  types = new Collection<Type>(this);

  @OneToMany(() => PokemonTypeAttribute, (attr) => attr.pokemon, {
    hidden: true,
  })
  attributes = new Collection<PokemonTypeAttribute>(this);

  @Property({ persist: false })
  get resistant(): Type[] {
    return this.attributes
      .filter(
        (attr) => attr.attributeType === PokemonTypeAttributesEnum.RESISTANCE,
      )
      .map((attr) => attr.type);
  }

  @Property({ persist: false })
  get weaknesses(): Type[] {
    return this.attributes
      .filter(
        (attr) => attr.attributeType === PokemonTypeAttributesEnum.WEAKNESS,
      )
      .map((attr) => attr.type);
  }
}
