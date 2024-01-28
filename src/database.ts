import { MikroORM, Options, EntityManager } from "@mikro-orm/postgresql";
import config from "./mikro-orm.config";

export interface Services {
  orm: MikroORM;
  em: EntityManager;
}

let cache: Services;

export async function initORM(options?: Options): Promise<Services> {
  if (cache) {
    return cache;
  }

  // allow overriding config options for testing
  const orm = await MikroORM.init({
    ...config,
    ...options,
  });

  // save to cache before returning
  return (cache = {
    orm,
    em: orm.em,
  });
}
