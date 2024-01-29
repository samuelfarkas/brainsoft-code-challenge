import { EntityRepository, FilterQuery, Populate } from "@mikro-orm/postgresql";
import { Pokemon } from "./pokemon.entity";

export class PokemonRepository extends EntityRepository<Pokemon> {
  public async paginateById(
    {
      cursor,
      populate,
      ...options
    }: {
      first: number;
      cursor: number;
      populate?: Populate<Pokemon, string>;
    },
    where: FilterQuery<Pokemon> = {},
  ) {
    return this.findByCursor(where, {
      orderBy: { id: "asc" },
      ...(populate
        ? { populate }
        : {
            populate: ["types:ref", "attributes", "attributes.type"],
          }),
      ...(cursor && cursor > 0 && { after: { id: cursor } }),
      ...options,
    });
  }
}
