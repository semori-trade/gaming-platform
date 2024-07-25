import { Insertable, Kysely, Selectable, Updateable } from 'kysely';
import { Database, Topups } from '../../../database';

// types at all. These types can be useful when typing function arguments.
export type SelectableTopUp = Selectable<Topups>;
export type InsertableTopUp = Insertable<Topups>;

export type UpdatableTopUp = Updateable<Topups>;

type CreateTopUpResponse =
  | {
    topup_id: number;
  }
  | undefined;

type UpdateTopUpResponse = CreateTopUpResponse;

type Options = {
  trx?: Kysely<Database>;
};

interface ITopUpRepository {
  update(user: UpdatableTopUp, options: Options): Promise<UpdateTopUpResponse>;
  create(user: InsertableTopUp, options: Options): Promise<CreateTopUpResponse>;
  isProcessing(userId: number, options: Options): Promise<boolean | undefined>;
}

class TopUpRepository implements ITopUpRepository {
  #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  update = async (topUp: Partial<UpdatableTopUp>, options: Options) => {
    try {
      const db = options?.trx || this.#db;
      return db
        .updateTable('topups')
        .set(topUp)
        .where('topups.topup_id', '=', topUp.topup_id!)
        .returning('topups.topup_id')
        .executeTakeFirstOrThrow();
    } catch (err) {
      console.error(err);
    }
  };

  create = async (topUp: InsertableTopUp, options: Options) => {
    try {
      const db = options?.trx || this.#db;
      return db
        .insertInto('topups')
        .values(topUp)
        .returning('topups.topup_id')
        .executeTakeFirstOrThrow();
    } catch (err) {
      console.error(err);
    }
  };

  isProcessing = async (userId: number, options: Options) => {
    try {
      const db = options?.trx || this.#db;
      const topUp = await db
        .selectFrom('topups')
        .selectAll()
        .forShare()
        .where('status', '=', 'processing')
        .where('user_id', '=', userId)
        .executeTakeFirst();

      return !!topUp;
    } catch (err) {
      console.error(err);
    }
  };
}

export { TopUpRepository };
export type { ITopUpRepository };
