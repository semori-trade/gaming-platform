require('dotenv').config();

import Koa from 'koa';
import { bodyParser } from '@koa/bodyparser';

import {
  createUserRouter,
  createInternalUserRouter,
} from './domain/user/router';
import { JwtService } from './common/services/secure/jwt';
import {
  PasswordHashing,
  SecureService,
} from './common/services/secure/password';
import { UserRepository } from './domain/user/repositories/user';
import { db } from './database';
import { WithdrawRepository } from './domain/user/repositories/withdraws';
import { TopUpRepository } from './domain/user/repositories/topUp';
import { Payment } from './domain/user/services/payment';
import { User } from './domain/user/services/user';
import { UserController } from './domain/user/controller';
import { InternalUser } from './domain/user/internal/services/user';
import { InternalUserController } from './domain/user/internal/controller';
import { createAuthMiddleware } from './middlewares/auth';
import { adminAuthMiddleware as createAdminAuthMiddleware } from './middlewares/adminAuth';

const PORT = process.env.PORT || 8081;
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

class App {
  constructor() {
    const app = new Koa();

    app.use(bodyParser());

    const { authMiddleware, adminAuthMiddleware } = this.getMiddlewares();

    const userController = this.createUserController();
    const userRouter = createUserRouter(userController, authMiddleware);
    app.use(userRouter.routes());
    app.use(userRouter.allowedMethods());

    const internalUserController = this.createInternalUserController();
    const internalUserRouter = createInternalUserRouter(
      internalUserController,
      adminAuthMiddleware,
    );
    app.use(internalUserRouter.routes());

    app.listen(PORT, HOSTNAME);
  }

  createUserController = () => {
    const jwtService = new JwtService(process.env.JWT_SECRET!, '1h');
    const passwordService: PasswordHashing = new SecureService();

    const userRepository = new UserRepository(db);
    const withdrawRepository = new WithdrawRepository(db);
    const topUpRepository = new TopUpRepository(db);

    const paymentService = new Payment(
      userRepository,
      withdrawRepository,
      topUpRepository,
    );

    const userService = new User(
      jwtService,
      passwordService,
      paymentService,
      userRepository,
    );

    const userController = new UserController(userService);

    return userController;
  };

  createInternalUserController = () => {
    const userRepository = new UserRepository(db);

    const internalUserService = new InternalUser(userRepository);
    const internalUserController = new InternalUserController(
      internalUserService,
    );

    return internalUserController;
  };

  getMiddlewares = () => {
    const jwtService = new JwtService(process.env.JWT_SECRET!, '1h');
    const authMiddleware = createAuthMiddleware(jwtService);

    return {
      authMiddleware,
      adminAuthMiddleware: createAdminAuthMiddleware,
    };
  };
}

new App();
