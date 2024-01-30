import { FastifyPluginAsync } from "fastify";
import { initORM } from "../../database";
import z from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { Collection } from "@mikro-orm/core";
import { Pokemon, PokemonRarityEnum } from "./pokemon.entity";
import { authorizationPreParsingHandler } from "../../lib/authorizationPreParsingHandler";
import { AuthError } from "../../lib/authError";

const simplePokemonCollectionSchema = z
  .instanceof(Collection<Pokemon>)
  .transform((collection) =>
    collection.getItems().map((pokemon) => ({
      id: pokemon.id,
      name: pokemon.name,
    })),
  );

const itemSchema = z.object({
  id: z.number(),
  name: z.string(),
  rarity: z.nativeEnum(PokemonRarityEnum),
  catalogId: z.string(),
  fleeRate: z.number(),
  maxCP: z.number(),
  maxHP: z.number(),
  classification: z.object({
    id: z.number(),
    name: z.string(),
  }),
  weightKg: z
    .object({
      maximum: z.number(),
      minimum: z.number(),
    })
    .optional(),
  heightMeters: z
    .object({
      maximum: z.number(),
      minimum: z.number(),
    })
    .optional(),
  weaknesses: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    }),
  ),
  resistant: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    }),
  ),
  attacks: z.object({
    fast: z.array(
      z.object({
        attack: z.object({
          id: z.number(),
          name: z.string(),
          type: z.object({
            id: z.number(),
            name: z.string(),
          }),
        }),
        damage: z.number(),
      }),
    ),
    special: z.array(
      z.object({
        attack: z.object({
          id: z.number(),
          name: z.string(),
          type: z.object({
            id: z.number(),
            name: z.string(),
          }),
        }),
        damage: z.number(),
      }),
    ),
  }),
  types: z.instanceof(Collection<{ id: number; name: string }>),
  evolutionRequirements: z
    .object({
      amount: z.number(),
      evolutionItem: z.object({
        id: z.number(),
        name: z.string(),
      }),
    })
    .nullable(),
});

const responseItem = itemSchema.extend({
  evolutions: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
      }),
    )
    .optional(),
  previousRevolutions: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
      }),
    )
    .optional(),
});

const pokemon: FastifyPluginAsync = async (fastify) => {
  const db = await initORM();
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    "/",
    {
      schema: {
        tags: ["pokemons"],
        summary: "List pokemons - supports cursor pagination",
        querystring: z.object({
          first: z.coerce.number().min(1).optional().default(10),
          cursor: z.coerce.number().optional().default(0),
          search: z.string().optional(),
          type: z.coerce.number().optional(),
          favorite: z.coerce.boolean().optional(),
        }),
        response: {
          200: z.object({
            totalCount: z.number(),
            hasNextPage: z.boolean(),
            hasPrevPage: z.boolean(),
            items: z.array(responseItem),
          }),
          401: z.object({
            message: z.literal("Unauthorized"),
          }),
          500: z.object({
            message: z.literal("Internal Server Error"),
          }),
        },
      },
    },
    async (request, reply) => {
      if (request.query.favorite && request.user === undefined) {
        throw new AuthError();
      }

      let ids: number[] = [];
      if (request.query.favorite) {
        await request.user!.favoritePokemons.init();
        ids = request.user!.favoritePokemons.getIdentifiers();
      }

      const data = await db.pokemon.paginateById(request.query, {
        ...(request.query.favorite && {
          id: {
            $in: ids,
          },
        }),
        ...(request.query.type && {
          types: {
            $some: { id: request.query.type },
          },
        }),
        ...(request.query.search && {
          name: {
            // pg_tgrm would be better for this usecase, but lets keep it simple
            $ilike: `${request.query.search}%`,
          },
        }),
      });
      const items = z
        .array(
          itemSchema.extend({
            evolutions: simplePokemonCollectionSchema.optional(),
            previousEvolutions: simplePokemonCollectionSchema.optional(),
          }),
        )
        .parse(data.items);

      reply.send({
        ...data,
        items,
      });
    },
  );

  app.get(
    "/:id",
    {
      schema: {
        tags: ["pokemons"],
        summary: "Get pokemon by id",
        params: z.object({
          id: z.coerce.number(),
        }),
        response: {
          200: responseItem,
          404: z.object({
            message: z.literal("Not Found"),
          }),
          500: z.object({
            message: z.literal("Internal Server Error"),
          }),
        },
      },
    },
    async (request, reply) => {
      const pokemon = await db.pokemon.findById(request.params.id);
      reply.send(itemSchema.parse(pokemon));
    },
  );

  app.patch(
    "/:id/favorite",
    {
      preParsing: authorizationPreParsingHandler,
      schema: {
        tags: ["pokemons"],
        summary: "Add pokemon to user's favorites",
        params: z.object({
          id: z.coerce.number(),
        }),
        response: {
          204: z.undefined(),
          401: z.object({
            message: z.literal("Unauthorized"),
          }),
          404: z.object({
            message: z.literal("Not Found"),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = request.user!;
      const pokemon = await db.pokemon.findOneOrFail(request.params.id);
      await user.favoritePokemons.init();
      if (!user.favoritePokemons.contains(pokemon)) {
        user.favoritePokemons.add(pokemon);
        await db.em.persistAndFlush(user);
      }
      reply.status(204);
    },
  );

  app.delete(
    "/:id/favorite",
    {
      preParsing: authorizationPreParsingHandler,
      schema: {
        tags: ["pokemons"],
        summary: "Add pokemon to user's favorites",
        params: z.object({
          id: z.coerce.number(),
        }),
        response: {
          204: z.undefined(),
          404: z.object({
            message: z.literal("Not Found"),
          }),
          401: z.object({
            message: z.literal("Unauthorized"),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = request.user!;
      const pokemon = await db.pokemon.findOneOrFail(request.params.id);
      await user.favoritePokemons.init();
      user.favoritePokemons.remove(pokemon);
      await db.em.persistAndFlush(user);
      reply.status(204);
    },
  );

  app.get(
    "/name/:name",
    {
      schema: {
        tags: ["pokemons"],
        summary: "Get pokemon by name",
        params: z.object({
          name: z.string(),
        }),
        response: {
          200: responseItem,
          404: z.object({
            message: z.literal("Not Found"),
          }),
          500: z.object({
            message: z.literal("Internal Server Error"),
          }),
        },
      },
    },
    async (request, reply) => {
      const pokemon = await db.pokemon.findByName(request.params.name);
      reply.send(itemSchema.parse(pokemon));
    },
  );
};

export default pokemon;
