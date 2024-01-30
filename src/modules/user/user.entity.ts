import {
  Collection,
  Entity,
  ManyToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { Pokemon } from "../pokemon/pokemon.entity";

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @ManyToMany(() => Pokemon)
  favoritePokemons = new Collection<Pokemon>(this);
}
