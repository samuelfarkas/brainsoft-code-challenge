import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Pokemon {
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

  @Property()
  maxWeight!: number;

  @Property()
  minWeight!: number;

  @Property()
  maxHeight!: number;

  @Property()
  minHeight!: number;
}
