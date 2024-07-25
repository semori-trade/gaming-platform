CREATE TABLE IF NOT EXISTS Users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  nickname VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  ballance INTEGER DEFAULT 0,
  avatarSrc VARCHAR(255),
  rank INTEGER, -- note: '0-5 how much money spent'
  verified BOOLEAN DEFAULT false,
  deactivated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Not implemented
-- CREATE TABLE IF NOT EXISTS Games (
--   game_id SERIAL PRIMARY KEY,
--   name VARCHAR(255) UNIQUE,
--   gameSrcUrl VARCHAR(255),
--   provider VARCHAR(255),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
-- 
-- CREATE TABLE IF NOT EXISTS GameRolls (
--   game_roll_id SERIAL PRIMARY KEY,
--   game_id INTEGER REFERENCES Games(game_id),
--   user_id INTEGER REFERENCES Users(user_id),
--   roll_hash VARCHAR(255) UNIQUE,
--   bet INTEGER,
--   risk INTEGER,
--   payback INTEGER,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
-- 
-- 
-- CREATE TABLE IF NOT EXISTS ChatChannels (
--   chat_channel_id SERIAL PRIMARY KEY,
--   name VARCHAR(255) UNIQUE,
--   displayName VARCHAR(255),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
-- 
-- CREATE TABLE IF NOT EXISTS Messages (
--   message_id SERIAL PRIMARY KEY,
--   author_id INTEGER REFERENCES Users(user_id),
--   chat_channel_id INTEGER REFERENCES ChatChannels(chat_channel_id),
--   text VARCHAR(255),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
-- 
-- 
-- CREATE TABLE IF NOT EXISTS Notifications (
--   notification_id SERIAL PRIMARY KEY,
--   notification_channel_id INTEGER REFERENCES NotificationChannels(notification_channel_id),
--   game_roll_id INTEGER REFERENCES GameRolls(game_roll_id),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
-- 
-- CREATE TABLE IF NOT EXISTS NotificationChannels (
--   notification_channel_id SERIAL PRIMARY KEY,
--   name VARCHAR(255) UNIQUE,
--   displayName VARCHAR(255),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

CREATE TABLE IF NOT EXISTS Topups (
  topup_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Users(user_id),
  amount INTEGER,
  status VARCHAR(255), -- note: 'processing | success | failure'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Withdraws (
  withdraw_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Users(user_id),
  amount INTEGER,
  status VARCHAR(255), -- note: 'processing | success | failure'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
