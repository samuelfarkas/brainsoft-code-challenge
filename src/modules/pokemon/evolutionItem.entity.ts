import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class EvolutionItem {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;
}
