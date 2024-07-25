import Router from '@koa/router';
import { UserController } from './controller';
import { InternalUserController } from './internal/controller';
import { Middleware } from 'koa';

const createUserRouter = (
  userController: UserController,
  authMiddleware: Middleware,
) => {
  const userRouter = new Router({
    prefix: '/user',
  });

  // Unthorisized routes
  userRouter.post('/login', userController.login);
  userRouter.post('/sign-up', userController.signUp);

  // Authorized routes
  userRouter.post('/logout', authMiddleware, userController.logout);
  userRouter.get('/profile', authMiddleware, userController.getProfile);
  userRouter.put('/profile', authMiddleware, userController.updateProfile);
  userRouter.post('/top-up', authMiddleware, userController.topUp);
  userRouter.post('/withdraw', authMiddleware, userController.withdraw);

  return userRouter;
};

const createInternalUserRouter = (
  internalUserController: InternalUserController,
  adminAuthMiddleware: Middleware,
) => {
  const internalUserRouter = new Router({
    prefix: '/user/internal',
  });

  internalUserRouter.put(
    '/deactivate-account',
    adminAuthMiddleware,
    internalUserController.deactivateAccount,
  );
  internalUserRouter.put(
    '/activate-account',
    adminAuthMiddleware,
    internalUserController.activateAccount,
  );
  internalUserRouter.put(
    '/verify-account',
    adminAuthMiddleware,
    internalUserController.verifyAccount,
  );

  return internalUserRouter;
};

export { createUserRouter, createInternalUserRouter };
