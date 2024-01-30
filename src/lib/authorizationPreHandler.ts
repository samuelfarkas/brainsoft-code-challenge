import { preParsingHookHandler } from "fastify";
import { AuthError } from "./authError";

export const authorizationPreParsingHandler: preParsingHookHandler = (
  request,
  reply,
  _payload,
  done,
) => {
  if (request.user === undefined) {
    reply.status(401);
    done(new AuthError());
  }
  done();
};
