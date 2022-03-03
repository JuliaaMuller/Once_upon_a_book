-- Drop and recreate Widgets table (Example)
DROP TABLE IF EXISTS items CASCADE;

CREATE TABLE items (
  id SERIAL PRIMARY KEY NOT NULL,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  sold_status BOOLEAN DEFAULT FALSE,
  created_at DATE DEFAULT now(),
  genre VARCHAR(255) NOT NULL
);
