DROP TABLE IF EXISTS conversations CASCADE;

CREATE TABLE conversations (
  id SERIAL PRIMARY KEY NOT NULL,
  user1_id INTEGER REFERENCES users(id),
  user2_id INTEGER REFERENCES users(id)
);
