import { IUserRepository } from '../../repositories/user';

interface CanManageAccount {
  verifyAccount(email: string): Promise<void>;
  deactivateAccount(email: string): Promise<void>;
  activateAccount(email: string): Promise<void>;
}

interface InternalUserService extends CanManageAccount { }

class InternalUser implements CanManageAccount {
  #userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.#userRepository = userRepository;
  }

  verifyAccount(email: string) {
    return this.#userRepository.update({
      email,
      verified: true,
      updated_at: new Date(),
    });
  }

  deactivateAccount(email: string) {
    return this.#userRepository.update({
      email,
      deactivated: true,
      updated_at: new Date(),
    });
  }

  activateAccount(email: string) {
    return this.#userRepository.update({
      email,
      deactivated: false,
    });
  }
}

export { InternalUser };
export type { CanManageAccount, InternalUserService };
