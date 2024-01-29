import { EntityRepository, FilterQuery, Populate } from "@mikro-orm/core";
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
            strategy: "joined",
            populate: [
              "types",
              "classification",
              "attributes.type",
              "evolutions.id",
              "evolutions.name",
              "previousEvolutions.id",
              "evolutionRequirements",
              "evolutionRequirements.evolutionItem",
            ],
          }),
      ...(cursor && cursor > 0 && { after: { id: cursor } }),
      ...options,
    });
  }
}
