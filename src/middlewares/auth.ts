import { Context, Next } from 'koa';
import { Jwt } from '../common/services/secure/jwt';

interface UserJwtPayload {
  user_id: string;
  email: string;
  deactivated: boolean;
}

const createAuthMiddleware =
  (jwtService: Jwt) => async (ctx: Context, next: Next) => {
    const token = ctx.headers.authorization;

    if (token) {
      try {
        const decoded = jwtService.verify<UserJwtPayload>(token);
        ctx.state.user = decoded;

        if (decoded.deactivated) {
          ctx.status = 401;
          ctx.body = { error: 'Account deactivated' };
          return;
        }

        await next();
      } catch (err) {
        ctx.status = 401;
        ctx.body = { error: 'Invalid token' };
      }
    } else {
      ctx.status = 401;
      ctx.body = { error: 'No token provided' };
    }
  };

export { createAuthMiddleware };
