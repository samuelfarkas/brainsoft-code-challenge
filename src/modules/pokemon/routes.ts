import { FastifyPluginAsync } from "fastify";
import { initORM } from "../../database";
import z from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";

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
        }),
        response: {
          200: z.object({
            totalCount: z.number(),
            hasNextPage: z.boolean(),
            hasPrevPage: z.boolean(),
            items: z.array(
              z.object({
                id: z.number(),
                catalogId: z.string(),
                fleeRate: z.number(),
                maxCP: z.number(),
                maxHP: z.number(),
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
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const data = await db.pokemon.paginateById(request.query);
      reply.status(200).send(data);
    },
  );
};

export default pokemon;
