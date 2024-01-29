import { FastifyPluginAsync } from "fastify";
import { initORM } from "../../database";
import z from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { Collection } from "@mikro-orm/core";
import { Pokemon, PokemonRarityEnum } from "./pokemon.entity";

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
        tags: ["pokemon"],
        summary: "List pokemons - supports cursor pagination",
        querystring: z.object({
          first: z.coerce.number().min(1).optional().default(10),
          cursor: z.coerce.number().optional().default(0),
          search: z.string().optional(),
          type: z.coerce.number().optional(),
        }),
        response: {
          200: z.object({
            totalCount: z.number(),
            hasNextPage: z.boolean(),
            hasPrevPage: z.boolean(),
            items: z.array(responseItem),
          }),
        },
      },
    },
    async (request, reply) => {
      const data = await db.pokemon.paginateById(request.query, {
        ...(request.query.type && {
          types: {
            $some: { id: request.query.type },
          },
        }),
        ...(request.query.search && {
          name: {
            // pg_tgrm would be better for this usecase, but lets keep it simple
            $ilike: `%${request.query.search}%`,
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

      reply.status(200).send({
        ...data,
        items,
      });
    },
  );
};

export default pokemon;
