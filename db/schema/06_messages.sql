DROP TABLE IF EXISTS messages CASCADE;

CREATE TABLE messages (
  id SERIAL PRIMARY KEY NOT NULL,
  item_id INTEGER REFERENCES items(id),
  sender_id INTEGER REFERENCES users(id),
  conversation_id INTEGER REFERENCES conversations(id),
  message_body TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT now()
);
