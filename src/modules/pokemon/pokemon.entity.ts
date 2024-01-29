import {
  Collection,
  Entity,
  EntityRepositoryType,
  HiddenProps,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
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
import { PokemonEvolutionRequirement } from "./pokemonEvolutionRequirement.entity";
import { Classification } from "./classification.entity";

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

  @ManyToMany(() => Pokemon)
  previousEvolutions = new Collection<Pokemon>(this);

  @ManyToMany(() => Pokemon)
  evolutions = new Collection<Pokemon>(this);

  @OneToOne(() => PokemonEvolutionRequirement, (req) => req.pokemon, {
    owner: true,
    nullable: true,
  })
  evolutionRequirements?: PokemonEvolutionRequirement;

  @ManyToOne()
  classification!: Classification;

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
