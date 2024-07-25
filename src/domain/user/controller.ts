import { Context } from 'koa';
import { UserService } from './services/user';
import typia, { tags } from 'typia';
import { SelectPaymentProvider } from '../../common/services/payment/paymentProvider';

type Password = string &
  tags.Format<'password'> &
  tags.MinLength<8> &
  tags.MaxLength<20>;

interface LoginRequest {
  email: string & tags.Format<'email'>;
  password: Password;
}

interface SignUpRequest extends LoginRequest { }

interface UpdateProfileRequest {
  password?: Password;
  nickname?: string &
  tags.MinLength<3> &
  tags.MaxLength<20> &
  tags.Pattern<'^[a-z0-9-]+$'>;
}

interface TopUpRequest {
  paymentProvider: string;
  amount: number & tags.Minimum<0>;
}

interface IUserController {
  login(ctx: Context): Promise<void>;
  logout(ctx: Context): Promise<void>;
  signUp(ctx: Context): Promise<void>;
  getProfile(ctx: Context): Promise<void>;
  updateProfile(ctx: Context): Promise<void>;
}

class UserController implements IUserController {
  userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  login = async (ctx: Context) => {
    const body = <LoginRequest>ctx.request.body;
    const validate = typia.validate<LoginRequest>(body);

    if (!validate.success) {
      ctx.body = {
        error: 'Invalid email or password',
      };
      ctx.response.status = 400;
      return;
    }

    const { success, error, token } = await this.userService.login(
      body.email,
      body.password,
    );

    if (!success) {
      ctx.body = {
        error,
      };
      ctx.response.status = 401;
      return;
    }

    ctx.set('Authorization', token!);
    ctx.body = {
      message: 'Login successful',
    };
    ctx.response.status = 200;
  };

  logout = async (ctx: Context) => {
    ctx.set('Authorization', '');
    ctx.response.status = 200;
  };

  signUp = async (ctx: Context) => {
    try {
      const body = <SignUpRequest>ctx.request.body;
      const validate = typia.validate<LoginRequest>(body);

      if (!validate.success) {
        ctx.body = {
          error: 'Invalid email or password',
        };
        ctx.response.status = 400;
        return;
      }

      const signUpResult = await this.userService.signUp(
        body.email,
        body.password,
      );

      if (!signUpResult.success) {
        ctx.body = { error: signUpResult.error };
        ctx.response.status = 400;
        return;
      }

      ctx.body = {
        message: 'Sign up successful',
      };
      ctx.response.status = 201;
    } catch (err) {
      console.error(err);
      // ctx.throw(500);
    }
  };

  getProfile = async (ctx: Context) => {
    const userId = ctx.state.user.user_id; // from authMiddleware
    const userData = await this.userService.getProfile(userId);

    if (!userData.success) {
      ctx.throw(404);
    }

    ctx.body = userData.user;
    ctx.response.status = 200;
  };

  updateProfile = async (ctx: Context) => {
    try {
      const email = ctx.state.user.email; // from authMiddleware

      const body = <UpdateProfileRequest>ctx.request.body;
      const validate = typia.validate<UpdateProfileRequest>(body);

      if (!validate.success) {
        ctx.body = {
          error: 'Invalid request',
        };
        ctx.response.status = 400;
        return;
      } else if (!body.password && !body.nickname) {
        ctx.body = {
          error: 'No fields to update',
        };
        ctx.response.status = 400;
        return;
      }

      const res = await this.userService.updateProfile(
        email,
        body.password as string,
        body.nickname as string,
      );

      if (!res.success) {
        ctx.throw(400);
      }

      ctx.body = {
        message: 'Profile updated',
      };
      ctx.response.status = 200;
    } catch (err) {
      console.error(err);
      ctx.throw(500);
    }
  };

  topUp = async (ctx: Context) => {
    try {
      const userId = ctx.state.user.user_id; // from authMiddleware

      const body = <TopUpRequest>ctx.request.body;
      const validate = typia.validate<TopUpRequest>(body);

      if (!validate.success) {
        ctx.body = {
          error: 'Invalid request',
        };
        ctx.response.status = 400;
        return;
      }

      const paymentProvider = SelectPaymentProvider.selectPaymentProvider(
        body.paymentProvider,
      );

      if (!paymentProvider) {
        ctx.body = {
          error: 'Invalid payment provider',
        };
        ctx.response.status = 400;
      }

      const amount = body.amount;

      const topUpResult = await this.userService.topUp(
        paymentProvider,
        userId,
        amount,
      );

      if (!topUpResult.success) {
        ctx.body = {
          error: topUpResult.error,
        };
        ctx.response.status = 500;
        return;
      }

      ctx.body = {
        message: 'Top-up successful',
      };
      ctx.response.status = 200;
    } catch (err) {
      console.error(err);
      ctx.throw(500);
    }
  };

  withdraw = async (ctx: Context) => {
    try {
      const userId = ctx.state.user.user_id; // from authMiddleware

      const body = <TopUpRequest>ctx.request.body;
      const validate = typia.validate<TopUpRequest>(body);

      if (!validate.success) {
        ctx.body = {
          error: 'Invalid request',
        };
        ctx.response.status = 400;
        return;
      }

      const paymentProvider = SelectPaymentProvider.selectPaymentProvider(
        body.paymentProvider,
      );

      if (!paymentProvider) {
        ctx.body = {
          error: 'Invalid payment provider',
        };
        ctx.response.status = 400;
      }

      const amount = body.amount;

      const withdrawResult = await this.userService.withdraw(
        paymentProvider,
        userId,
        amount,
      );

      if (!withdrawResult.success) {
        ctx.body = {
          error: withdrawResult.error,
        };
        ctx.response.status = 500;
        return;
      }

      ctx.body = {
        message: 'Withdraw successful',
      };
      ctx.response.status = 200;
    } catch (err) {
      console.error(err);
      ctx.throw(500);
    }
  };
}

export { UserController };
