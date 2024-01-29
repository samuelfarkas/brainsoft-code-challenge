import {
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { Pokemon } from "./pokemon.entity";
import { EvolutionItem } from "./evolutionItem.entity";

@Entity()
export class PokemonEvolutionRequirement {
  @PrimaryKey()
  id!: number;

  @OneToOne(() => Pokemon, (pokemon) => pokemon.evolutionRequirements)
  pokemon!: Pokemon;

  @ManyToOne()
  evolutionItem!: EvolutionItem;

  @Property()
  amount!: number;
}
