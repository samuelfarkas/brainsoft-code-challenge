import { wrap, type EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import {
  Pokemon as PokemonEntity,
  PokemonRarityEnum,
} from "../modules/pokemon/pokemon.entity";
import PokemonData from "./pokemon.json";
import {
  PokemonTypeAttribute,
  PokemonTypeAttributesEnum,
} from "../modules/pokemon/pokemonTypeAttribute.entity";
import { Type } from "../modules/type/type.entity";
import { PokemonEvolutionRequirement } from "../modules/pokemon/pokemonEvolutionRequirement.entity";
import { EvolutionItem } from "../modules/pokemon/evolutionItem.entity";
import { Classification } from "../modules/pokemon/classification.entity";
import { Attack } from "../modules/pokemon/attack.entity";
import {
  AttackTypeEnum,
  PokemonAttack,
} from "../modules/pokemon/pokemonAttack.entity";

type Pokemon = {
  id: string;
  classification: string;
  name: string;
  fleeRate: number;
  maxCP: number;
  maxHP: number;
  weight: { maximum: string; minimum: string };
  height: { maximum: string; minimum: string };
  resistant: string[];
  weaknesses: string[];
  types: string[];
  MYTHIC?: string;
  LEGENDARY?: string;
  "Previous evolution(s)"?: { id: number; name: string }[];
  evolutions?: { id: number; name: string }[];
  evolutionRequirements?: { amount: number; name: string };
  attacks: {
    fast: { name: string; type: string; damage: number }[];
    special: { name: string; type: string; damage: number }[];
  };
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
    const pokemonsCache: { [key: number]: PokemonEntity } = {};
    const evolutionItemsCache: { [key: string]: EvolutionItem } = {};
    const classificationCache: { [key: string]: Classification } = {};
    const attackCache: { [key: string]: Attack } = {};

    const pokemonsMap = new Map<number, Pokemon>();
    for (const pokemon of PokemonData) {
      pokemonsMap.set(parseInt(pokemon.id), pokemon);
    }

    const getOrCreateEvolutionItem = (name: string) => {
      if (evolutionItemsCache[name]) {
        return evolutionItemsCache[name];
      }
      const instance = new EvolutionItem();
      wrap(instance).assign({
        name,
      });
      evolutionItemsCache[name] = instance;
      em.persist(instance);
      return instance;
    };

    const getOrCreateClassification = (name: string) => {
      if (classificationCache[name] !== undefined) {
        return classificationCache[name];
      }
      const instance = new Classification(name);
      classificationCache[name] = instance;
      em.persist(instance);
      return instance;
    };

    const getOrCreatePokemon = (id: number) => {
      if (pokemonsCache[id]) {
        return pokemonsCache[id];
      }
      const instance = new PokemonEntity();
      const pokemon = pokemonsMap.get(id)!;
      let rarity: PokemonRarityEnum = PokemonRarityEnum.COMMON;
      if (pokemon.MYTHIC) {
        rarity = PokemonRarityEnum.MYTHIC;
      }
      if (pokemon.LEGENDARY) {
        rarity = PokemonRarityEnum.LEGENDARY;
      }
      wrap(instance).assign({
        name: pokemon.name,
        rarity,
        classification: getOrCreateClassification(pokemon.classification),
        catalogId: pokemon.id,
        fleeRate: pokemon.fleeRate,
        maxCP: pokemon.maxCP,
        maxHP: pokemon.maxHP,
        weightKg: rangeJsonToNumbers(pokemon.weight),
        heightMeters: rangeJsonToNumbers(pokemon.height),
      });
      pokemonsCache[id] = instance;
      em.persist(instance);
      return instance;
    };

    const getOrCreateType = (name: string) => {
      if (typesCache[name] !== undefined) {
        return typesCache[name];
      }
      const instance = new Type(name);
      typesCache[name] = instance;
      em.persist(instance);
      return instance;
    };

    const getOrCreateAttack = (name: string, type: string) => {
      if (attackCache[name] !== undefined) {
        return attackCache[name];
      }
      const instance = new Attack();
      wrap(instance).assign({
        name,
        type: getOrCreateType(type),
      });
      attackCache[name] = instance;
      em.persist(instance);
      return instance;
    };

    pokemonsMap.forEach((pokemon, key) => {
      const pokemonInstance = getOrCreatePokemon(key);

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
        let type = getOrCreateType(resistance);

        const attribute = new PokemonTypeAttribute();
        wrap(attribute).assign({
          type,
          attributeType: "resistance" as PokemonTypeAttributesEnum.RESISTANCE,
          pokemon: pokemonInstance,
        });
        em.persist(attribute);
      }

      for (const weakness of pokemon.weaknesses) {
        let type = getOrCreateType(weakness);
        const attribute = new PokemonTypeAttribute();
        wrap(attribute).assign({
          type,
          attributeType: "weakness" as PokemonTypeAttributesEnum.WEAKNESS,
          pokemon: pokemonInstance,
        });
        em.persist(attribute);
      }

      if (pokemon["Previous evolution(s)"]) {
        for (const previousEvolution of pokemon["Previous evolution(s)"]) {
          const previousEvolutionInstance = getOrCreatePokemon(
            previousEvolution.id,
          );
          pokemonInstance.previousEvolutions.add(previousEvolutionInstance);
        }
      }

      if (pokemon.evolutions) {
        for (const evolution of pokemon.evolutions) {
          const evolutionInstance = getOrCreatePokemon(evolution.id);
          pokemonInstance.evolutions.add(evolutionInstance);
        }
      }

      const evolutionRequirement = pokemon.evolutionRequirements;
      if (evolutionRequirement) {
        const evolutionRequirementInstance = new PokemonEvolutionRequirement();
        const evolutionItem = getOrCreateEvolutionItem(
          evolutionRequirement.name,
        );
        wrap(evolutionRequirementInstance).assign({
          amount: evolutionRequirement.amount,
          evolutionItem,
          pokemon: pokemonInstance,
        });
        em.persist(evolutionRequirementInstance);
      }

      for (const fastAttack of pokemon.attacks.fast) {
        const attack = getOrCreateAttack(fastAttack.name, fastAttack.type);
        const pokemonAttack = new PokemonAttack();
        wrap(pokemonAttack).assign({
          pokemon: pokemonInstance,
          attack,
          damage: fastAttack.damage,
          attackType: "fast" as AttackTypeEnum.FAST,
        });
        em.persist(pokemonAttack);
      }

      for (const specialAttack of pokemon.attacks.special) {
        const attack = getOrCreateAttack(
          specialAttack.name,
          specialAttack.type,
        );
        const pokemonAttack = new PokemonAttack();
        wrap(pokemonAttack).assign({
          pokemon: pokemonInstance,
          attack,
          damage: specialAttack.damage,
          attackType: "special" as AttackTypeEnum.SPECIAL,
        });
        em.persist(pokemonAttack);
      }

      em.persist(pokemonInstance);
    });

    await em.flush();
    console.info("🐸 Pokemons Seeded...");
  }
}
