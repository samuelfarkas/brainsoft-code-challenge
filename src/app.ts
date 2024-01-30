import { join } from "path";
import { RequestContext } from "@mikro-orm/postgresql";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { FastifyPluginAsync, FastifyServerOptions } from "fastify";
import { initORM } from "./database";
import { env } from "./env";

export interface AppOptions
  extends FastifyServerOptions,
    Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts,
): Promise<void> => {
  const db = await initORM();
  // register request context hook
  fastify.addHook("onRequest", (_request, _reply, done) => {
    RequestContext.create(db.em, done);
  });

  // shut down the connection when closing the app
  fastify.addHook("onClose", async () => {
    await db.orm.close();
  });
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  // swagger
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Brainsoft Pokedex API",
        description: "Code challenge backend service",
        version: "1.0.0",
      },
      tags: [{ name: "pokemons", description: "pokemon related end-points" }],
    },
    transform: jsonSchemaTransform,
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: "/documentation",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "modules"),
    options: opts,
    dirNameRoutePrefix: (_, folderName) => `${folderName}s`,
  });

  if (env.NODE_ENV === "development") {
    fastify.after(() => {
      console.log("🚀 Swagger ready at http://localhost:3000/documentation");
      console.log("🚀 Server ready at http://localhost:3000");
    });
  }
};

export default app;
export { app, options };
