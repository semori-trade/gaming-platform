import {
  Insertable,
  IsolationLevel,
  Kysely,
  Selectable,
  TransactionBuilder,
  Updateable,
} from 'kysely';
import { Database, Users } from '../../../database';

// types at all. These types can be useful when typing function arguments.
export type SelectableUser = Selectable<Users>;
export type InsertableUser = Insertable<Users>;

export type UpdatableUser = Updateable<Users>;

type Options = {
  trx?: Kysely<Database>;
};

interface IUserRepository {
  getById(
    userId: number,
    options?: Options,
  ): Promise<SelectableUser | undefined>;
  getByEmail(email: string): Promise<SelectableUser | undefined>;
  create(user: InsertableUser): Promise<{
    success: boolean;
    message?: string;
  }>;
  update(user: Partial<UpdatableUser>, options?: Options): Promise<any>;
  prepareSerializableTransaction: (
    isolationLevel: IsolationLevel,
  ) => TransactionBuilder<Database>;
}

class UserRepository implements IUserRepository {
  #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  getById = async (userId: number, options: Options) => {
    try {
      const db = options?.trx || this.#db;
      const row = await db
        .selectFrom('users')
        .selectAll()
        .where('user_id', '=', userId)
        .executeTakeFirst();

      return row;
    } catch (err) {
      console.error(err);
    }
  };

  getByEmail = async (email: string) => {
    try {
      const row = this.#db
        .selectFrom('users')
        .selectAll()
        .where('email', '=', email)
        .executeTakeFirst();

      return row;
    } catch (err) {
      console.error(err);
    }
  };

  create = async (user: InsertableUser) => {
    try {
      await this.#db.insertInto('users').values(user).execute();
      return { success: true };
    } catch (err: any) {
      if (err.code === '23505') {
        return { success: false, error: 'Email already exists' };
      } else {
        return {
          success: false,
          error: 'Unknown Error. Failed to create user',
        };
      }
    }
  };

  update = async (user: Partial<UpdatableUser>, options: Options) => {
    try {
      const db = options?.trx || this.#db;

      return db
        .updateTable('users')
        .set(user)
        .where('email', '=', user.email!)
        .execute();
    } catch (err) {
      console.error(err);
    }
  };

  prepareSerializableTransaction = (isolationLevel: IsolationLevel) => {
    return this.#db.transaction().setIsolationLevel(isolationLevel);
  };
}

export { UserRepository };
export type { IUserRepository };
