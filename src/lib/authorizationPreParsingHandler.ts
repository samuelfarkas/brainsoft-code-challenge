import { AuthError } from "./authError";
import { User } from "../modules/user/user.entity";

export const authorizationPreParsingHandler = async <T extends { user?: User }>(
  request: T,
) => {
  if (request.user === undefined) {
    throw new AuthError();
  }
};
