import { wrap, type EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { Pokemon as PokemonEntity } from "../modules/pokemon/pokemon.entity";
import PokemonData from "./pokemon.json";
import {
  PokemonTypeAttribute,
  PokemonTypeAttributesEnum,
} from "../modules/pokemon/pokemonTypeAttribute.entity";
import { Type } from "../modules/pokemon/type.entity";

type Pokemon = {
  id: string;
  name: string;
  fleeRate: number;
  maxCP: number;
  maxHP: number;
  weight: { maximum: string; minimum: string };
  height: { maximum: string; minimum: string };
  resistant: string[];
  weaknesses: string[];
  types: string[];
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
    const typesCache: { [key: string]: Type } = {};
    const pokemons = await Promise.all(
      (PokemonData as Pokemon[]).map(async (pokemon) => {
        const pokemonInstance = new PokemonEntity();
        wrap(pokemonInstance).assign({
          name: pokemon.name,
          catalogId: pokemon.id,
          fleeRate: pokemon.fleeRate,
          maxCP: pokemon.maxCP,
          maxHP: pokemon.maxHP,
          weightKg: rangeJsonToNumbers(pokemon.weight),
          heightMeters: rangeJsonToNumbers(pokemon.height),
        });

        // relate types
        for (const type of pokemon.types) {
          let typeInstance = typesCache[type];
          if (typeInstance === undefined) {
            typesCache[type] = new Type(type);
            typeInstance = typesCache[type];
            em.persist(typesCache[type]);
          }
          typeInstance.pokemons.add(pokemonInstance);
        }

        // relate resistances and weaknesses
        for (const resistance of pokemon.resistant) {
          let type = typesCache[resistance];
          if (type === undefined) {
            typesCache[resistance] = new Type(resistance);
            type = typesCache[resistance];
            em.persist(typesCache[resistance]);
          }

          const attribute = new PokemonTypeAttribute();
          wrap(attribute).assign({
            attributeType: "resistance" as PokemonTypeAttributesEnum.RESISTANCE,
            type: typesCache[resistance],
            pokemon: pokemonInstance,
          });
          em.persist(attribute);
        }

        for (const weakness of pokemon.weaknesses) {
          let type = typesCache[weakness];
          if (type === undefined) {
            typesCache[weakness] = new Type(weakness);
            type = typesCache[weakness];
            em.persist(typesCache[weakness]);
          }
          const attribute = new PokemonTypeAttribute();
          wrap(attribute).assign({
            attributeType: "weakness" as PokemonTypeAttributesEnum.WEAKNESS,
            type: typesCache[weakness],
            pokemon: pokemonInstance,
          });
          em.persist(attribute);
        }

        return pokemonInstance;
      }),
    );

    await em.persistAndFlush(pokemons);
    console.info("🐸 Pokemons Seeded...");
  }
}
