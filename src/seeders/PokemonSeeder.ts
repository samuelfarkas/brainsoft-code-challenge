import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { Pokemon as PokemonEntity } from "../modules/pokemon/pokemon.entity";
import PokemonData from "./pokemon.json";

type Pokemon = {
  id: string;
  fleeRate: number;
  maxCP: number;
  maxHP: number;
  weight: { maximum: string; minimum: string };
  height: { maximum: string; minimum: string };
};

const rangeJsonToNumbers = (range: { maximum: string; minimum: string }) => {
  return {
    maximum: parseFloat(
      range.maximum.split(/([0-9]+\.?[0-9]*)/).filter(Boolean)[0],
    ),
    minimum: parseFloat(
      range.minimum.split(/([0-9]+\.?[0-9]*)/).filter(Boolean)[0],
    ),
  };
};
export class PokemonSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const repository = em.getRepository(PokemonEntity);

    (PokemonData as Pokemon[]).forEach((pokemon) => {
      repository.create({
        catalogId: pokemon.id,
        fleeRate: pokemon.fleeRate,
        maxCP: pokemon.maxCP,
        maxHP: pokemon.maxHP,
        weightKg: rangeJsonToNumbers(pokemon.weight),
        heightMeters: rangeJsonToNumbers(pokemon.height),
      });
    });
    console.info("🐸 Pokemons Seeded...");
  }
}
