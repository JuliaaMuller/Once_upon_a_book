DROP TABLE IF EXISTS favorites CASCADE;

CREATE TABLE favorites (
  id SERIAL PRIMARY KEY NOT NULL,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);


SELECT items.id AS id, photo_urls.photo_url AS photo_url, items.title AS title, items.description AS description, items.price AS price, items.sold_status AS sold_status, items.genre AS genre, users.username AS seller, favorites.user_id AS favorite_user
FROM items
LEFT JOIN favorites ON items.id = favorites.item_id
JOIN photo_urls ON items.id = photo_urls.item_id
JOIN users ON users.id = items.owner_id
WHERE items.id = 11
GROUP BY items.id, photo_urls.id, users.id, favorites.id;
