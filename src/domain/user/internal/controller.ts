import { Context } from 'koa';
import { InternalUserService } from './services/user';
import typia from 'typia';

interface IInternalUserController {
  deactivateAccount(ctx: Context): Promise<void>;
  activateAccount(ctx: Context): Promise<void>;
  verifyAccount(ctx: Context): Promise<void>;
}

class InternalUserController implements IInternalUserController {
  #userService: InternalUserService;

  constructor(userService: InternalUserService) {
    this.#userService = userService;
  }

  deactivateAccount = async (ctx: Context) => {
    const body = <{ email: string }>ctx.request.body;
    const validate = typia.validate<{ email: string }>(body);

    if (!validate.success) {
      ctx.throw(400);
    }

    await this.#userService.deactivateAccount(body.email);

    ctx.response.status = 200;
  };

  activateAccount = async (ctx: Context) => {
    const body = <{ email: string }>ctx.request.body;
    const validate = typia.validate<{ email: string }>(body);

    if (!validate.success) {
      ctx.throw(400);
    }

    await this.#userService.activateAccount(body.email);

    ctx.response.status = 200;
  };

  verifyAccount = async (ctx: Context) => {
    const body = <{ email: string }>ctx.request.body;
    const validate = typia.validate<{ email: string }>(body);

    if (!validate.success) {
      ctx.throw(400);
    }

    await this.#userService.verifyAccount(body.email);

    ctx.response.status = 200;
  };
}

export { InternalUserController };
