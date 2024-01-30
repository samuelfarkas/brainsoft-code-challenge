import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { initORM } from "../../database";
import { createToken, verifyToken } from "./token";
import { User } from "./user.entity";
import z from "zod";

const user: FastifyPluginAsync = async (fastify) => {
  const db = await initORM();
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    "/token",
    {
      schema: {
        tags: ["user"],
        summary: "Get user bearer token",
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (_, reply) => {
      const user = new User();
      await db.em.persistAndFlush(user);
      const token = createToken(user.id);
      reply.status(201).send({ token });
    },
  );

  app.get(
    "/",
    {
      schema: {
        tags: ["user"],
        summary: "Get user",
        headers: z.object({
          authorization: z.string().includes("Bearer "),
        }),
        response: {
          200: z.object({
            id: z.number(),
            createdAt: z.date(),
            updatedAt: z.date(),
          }),
          401: z.object({
            message: z.literal("Unauthorized"),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const userData = verifyToken(
          request.headers.authorization.split(" ")[1],
        );
        const user = await db.em.findOneOrFail(User, userData.userId);
        reply.send(user);
      } catch (e) {
        reply.status(401).send({
          message: "Unauthorized",
        });
      }
    },
  );
};

export default user;
