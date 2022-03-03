const express = require("express");
const router = express.Router();


module.exports = (db) => {

  router.get("/", (req, res) => {
    let queryString = `SELECT favorites.id, favorites.item_id, favorites.user_id, photo_url as photo, items.title as title, items.price as price, items.owner_id as seller, items.genre as genre
    FROM favorites
    JOIN photo_urls ON photo_urls.item_id = favorites.item_id
    JOIN items ON items.id = favorites.item_id
    WHERE favorites.user_id = $1
    ORDER BY favorites.id;`;
    let values = [req.session["user_id"]];
    return db.query(queryString, values)
      .then((data) => {
        const items = data.rows;
        const templateVars = {
          items: items,
          username: req.session["name"],
        };
        res.render("books/favorites", templateVars);
      })
      .catch((err) => console.log(err));
  });
  router.post("/delete/:id", (req, res) => {
    console.log("item id:",req.params["id"]);
    let queryString = `
    DELETE FROM favorites
    WHERE id = $1;`;
    let values = [req.params["id"]];
    console.log(req.params);

    return db.query(queryString, values)
      .then(() => res.redirect(`/favorites`));
  });

  router.post("/:id", (req, res) => {
    let queryString = `
    INSERT INTO favorites(item_id,user_id)
    VALUES ($1, $2)
    RETURNING *;`;
    let values = [req.params["id"],req.session["user_id"]];
    return db.query(queryString, values)
      .then(() => res.redirect(`/favorites`));
  });
  return router;
};

