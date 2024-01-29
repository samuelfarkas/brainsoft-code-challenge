import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Type } from "./type.entity";

@Entity()
export class Attack {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @ManyToOne()
  type!: Type;
}
