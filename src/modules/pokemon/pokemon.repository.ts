import { EntityRepository, FilterQuery } from "@mikro-orm/postgresql";
import { Pokemon } from "./pokemon.entity";

export class PokemonRepository extends EntityRepository<Pokemon> {
  public async paginateById(
    {
      cursor,
      ...options
    }: {
      first: number;
      cursor: number;
    },
    where: FilterQuery<Pokemon> = {},
  ) {
    return this.findByCursor(where, {
      after: { id: cursor },
      orderBy: { id: "asc" },
      ...options,
    });
  }
}
