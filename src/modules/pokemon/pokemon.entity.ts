import {
  Entity,
  EntityRepositoryType,
  PrimaryKey,
  Property,
  types,
} from "@mikro-orm/core";
import { PokemonRepository } from "./pokemon.repository";

@Entity({ repository: () => PokemonRepository })
export class Pokemon {
  [EntityRepositoryType]?: PokemonRepository;

  @PrimaryKey()
  id!: number;

  @Property()
  catalogId!: string;

  @Property()
  fleeRate!: number;

  @Property()
  maxCP!: number;

  @Property()
  maxHP!: number;

  @Property({ type: types.json, nullable: true })
  weightKg?: { maximum: number; minimum: number };

  @Property({ type: types.json, nullable: true })
  heightMeters?: { maximum: number; minimum: number };
}
