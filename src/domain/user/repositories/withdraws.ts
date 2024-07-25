import { Insertable, Kysely, Selectable, Updateable } from 'kysely';
import { Database, Withdraws } from '../../../database';

// types at all. These types can be useful when typing function arguments.
export type SelectableWithdraw = Selectable<Withdraws>;
export type InsertableWithdraw = Insertable<Withdraws>;

export type UpdatableWithdraw = Updateable<Withdraws>;

type Options = {
  trx?: Kysely<Database>;
};

interface IWithdrawRepository {
  update(user: UpdatableWithdraw, options?: Options): Promise<any>;
  create(user: InsertableWithdraw, options?: Options): Promise<any>;
  isProcessing(userId: number, options?: Options): Promise<boolean | undefined>;
}

class WithdrawRepository implements IWithdrawRepository {
  #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  update = async (withdraw: Partial<UpdatableWithdraw>, options: Options) => {
    try {
      const db = options?.trx || this.#db;
      return db
        .updateTable('withdraws')
        .set(withdraw)
        .where('withdraw_id', '=', withdraw.withdraw_id!)
        .returning('withdraw_id')
        .executeTakeFirstOrThrow();
    } catch (err) {
      console.error(err);
    }
  };

  create = async (withdraw: InsertableWithdraw, options: Options) => {
    try {
      const db = options?.trx || this.#db;
      return db
        .insertInto('withdraws')
        .values(withdraw)
        .returning('withdraws.withdraw_id')
        .executeTakeFirstOrThrow();
    } catch (err) {
      console.error(err);
    }
  };

  isProcessing = async (userId: number, options: Options) => {
    try {
      const db = options?.trx || this.#db;
      const withdraw = await db
        .selectFrom('withdraws')
        .selectAll()
        .forShare()
        .where('status', '=', 'processing')
        .where('user_id', '=', userId)
        .executeTakeFirst();

      return !!withdraw;
    } catch (err) {
      console.error(err);
    }
  };
}

export { WithdrawRepository };
export type { IWithdrawRepository };
