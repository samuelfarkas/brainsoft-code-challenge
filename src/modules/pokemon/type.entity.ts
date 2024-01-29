import {
  Collection,
  Entity,
  ManyToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { Pokemon } from "./pokemon.entity";

@Entity()
export class Type {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true, index: true })
  name!: string;

  @ManyToMany(() => Pokemon, (pokemon) => pokemon.types)
  pokemons = new Collection<Pokemon>(this);

  constructor(name: string) {
    this.name = name;
  }
}
