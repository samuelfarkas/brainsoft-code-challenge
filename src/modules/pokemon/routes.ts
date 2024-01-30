import { FastifyPluginAsync } from "fastify";
import { initORM } from "../../database";
import z from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { Collection, NotFoundError } from "@mikro-orm/core";
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
        tags: ["pokemons"],
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
          500: z.object({
            message: z.literal("Internal Server Error"),
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
        summary: "Get pokemon by name",
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
      try {
        const pokemon = await db.pokemon.findById(request.params.id);
        reply.send(itemSchema.parse(pokemon));
      } catch (error) {
        if (error instanceof NotFoundError) {
          reply.status(404).send({
            message: "Not Found",
          });
        }
        reply.status(500).send({
          message: "Internal Server Error",
        });
      }
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
      try {
        const pokemon = await db.pokemon.findByName(request.params.name);
        reply.send(itemSchema.parse(pokemon));
      } catch (error) {
        if (error instanceof NotFoundError) {
          reply.status(404).send({
            message: "Not Found",
          });
        }
        reply.status(500).send({
          message: "Internal Server Error",
        });
      }
    },
  );
};

export default pokemon;
