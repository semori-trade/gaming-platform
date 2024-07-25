import { Context, Next } from 'koa';

const adminAuthMiddleware = async (ctx: Context, next: Next) => {
  const token = ctx.headers.authorization;

  if (token && token === process.env.ADMIN_TOKEN) {
    await next();
  } else {
    ctx.status = 401;
    ctx.body = { error: 'No token provided' };
  }
};

export { adminAuthMiddleware };
