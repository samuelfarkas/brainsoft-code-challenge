import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { initORM } from "../../database";
import z from "zod";

const type: FastifyPluginAsync = async (fastify) => {
  const db = await initORM();
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    "/",
    {
      schema: {
        tags: ["types"],
        summary: "Get all types",
        response: {
          200: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
            }),
          ),
        },
      },
    },
    async (_, reply) => {
      const types = await db.type.findAll();
      reply.send(types);
    },
  );
};

export default type;
