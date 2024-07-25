import type { ColumnType } from 'kysely';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Chatchannels {
  chat_channel_id: Generated<number>;
  created_at: Generated<Timestamp | null>;
  displayname: string | null;
  name: string | null;
}

export interface Gamerolls {
  bet: number | null;
  created_at: Generated<Timestamp | null>;
  game_id: number | null;
  game_roll_id: Generated<number>;
  payback: number | null;
  risk: number | null;
  roll_hash: string | null;
  user_id: number | null;
}

export interface Games {
  created_at: Generated<Timestamp | null>;
  game_id: Generated<number>;
  gamesrcurl: string | null;
  name: string | null;
  provider: string | null;
  updated_at: Generated<Timestamp | null>;
}

export interface Messages {
  author_id: number | null;
  chat_channel_id: number | null;
  created_at: Generated<Timestamp | null>;
  message_id: Generated<number>;
  text: string | null;
}

export interface Notificationchannels {
  created_at: Generated<Timestamp | null>;
  displayname: string | null;
  name: string | null;
  notification_channel_id: Generated<number>;
}

export interface Notifications {
  created_at: Generated<Timestamp | null>;
  game_roll_id: number | null;
  notification_channel_id: number | null;
  notification_id: Generated<number>;
}

export interface Topups {
  amount: number | null;
  created_at: Generated<Timestamp | null>;
  status: string | null;
  topup_id: Generated<number>;
  updated_at: Generated<Timestamp | null>;
  user_id: number | null;
}

export interface Users {
  avatarsrc: string | null;
  ballance: Generated<number | null>;
  created_at: Generated<Timestamp | null>;
  deactivated: Generated<boolean | null>;
  email: string | null;
  nickname: string | null;
  password: string;
  rank: number | null;
  updated_at: Generated<Timestamp | null>;
  user_id: Generated<number>;
  verified: Generated<boolean | null>;
}

export interface Withdraws {
  amount: number | null;
  created_at: Generated<Timestamp | null>;
  status: string | null;
  updated_at: Generated<Timestamp | null>;
  user_id: number | null;
  withdraw_id: Generated<number>;
}

export interface Database {
  chatchannels: Chatchannels;
  gamerolls: Gamerolls;
  games: Games;
  messages: Messages;
  notificationchannels: Notificationchannels;
  notifications: Notifications;
  topups: Topups;
  users: Users;
  withdraws: Withdraws;
}

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
  dialect,
});
