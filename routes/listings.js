const express = require("express");
const router = express.Router();

module.exports = (db) => {
  //list of all items that user sell route
  router.get("/", (req, res) => {
    const userId = req.session.user_id;
    if (!userId) {
      res.redirect("/");
    }
    return db
      .query(
        `SELECT items.* , photo_urls.photo_url FROM items LEFT JOIN photo_urls ON item_id = items.id JOIN users ON users.id = items.owner_id WHERE users.id = $1 AND items.sold_status = $2 GROUP BY items.id, photo_urls.id, users.id;`,
        [req.session.user_id, "FALSE"]
      )
      .then((data) => {
        const users = data.rows;
        console.log("this is user", users);
        const templateVars = {
          username: req.session.name,
          items: users,
        };
        res.render("listings/listings", templateVars);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  //create new items to sell routes
  router.get("/new", (req, res) => {
    const userId = req.session.user_id;
    if (!userId) {
      res.redirect("/");
    }
    const templateVars = { username: req.session["name"] };
    res.render("listings/new", templateVars);
  });

  router.post("/new", (req, res) => {
    const userId = req.session.user_id;
    if (!userId) {
      res.redirect("/");
    }
    db.query(
      `INSERT INTO items (owner_id, title, description, price, genre) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      [
        req.session["user_id"],
        req.body.title,
        req.body.description,
        parseFloat(req.body.price),
        req.body.genre,
      ]
    )
      .then((item) => {
        console.log("this is item:", item);
        db.query(`INSERT INTO photo_urls (item_id,photo_url) VALUES ($1,$2);`, [
          item.rows[0].id,
          "",
        ]);
      })
      .then(() => {
        res.redirect("../");
      });
  });
  //list of all user sold items route
  router.get("/sold", (req, res) => {
    const userId = req.session.user_id;
    if (!userId) {
      res.redirect("/");
    }
    return db
      .query(
        `SELECT items.* , photo_urls.photo_url
        FROM items LEFT JOIN photo_urls ON item_id = items.id
        JOIN users ON users.id = items.owner_id
        WHERE users.id = $1 AND items.sold_status = $2
        GROUP BY items.id, photo_urls.id, users.id;`,
        [req.session.user_id, "TRUE"]
      )
      .then((data) => {
        const users = data.rows;
        const templateVars = {
          username: req.session.name,
          items: users,
        };
        res.render("listings/mark_sold", templateVars);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  router.post("/sold/:id", (req, res) => {
    console.log(req.params.id);
    const userId = req.session.user_id;
    if (!userId) {
      res.redirect("/");
    }
    return db
      .query(`UPDATE items SET sold_status = TRUE WHERE items.id = $1;`, [
        req.params.id,
      ])
      .then(() => {
        res.redirect("/listings");
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  //route for delete item from the user sell items list and from database
  router.post("/delete/:item_id", (req, res) => {
    console.log("this is req.params.item_id", req.params);
    const userId = req.session.user_id;
    if (!userId) {
      res.redirect("/");
    }
    return db
      .query(`DELETE FROM items WHERE items.id = $1`, [req.params.item_id])
      .then((data) => {
        res.redirect(`/listings`);
      });
  });

  //edit item from user selling lists route
  router.get(`/:id`, (req, res) => {
    const itemId = req.params.id;
    const userId = req.session.user_id;
    if (!userId) {
      res.redirect("/");
    }
    return db
      .query(
        `SELECT items.* , photo_urls.photo_url FROM items LEFT JOIN photo_urls ON item_id = items.id WHERE items.id = $1 GROUP BY items.id, photo_urls.id;`,
        [itemId]
      )
      .then((data) => {
        const items = data.rows[0];
        const templateVars = {
          id: items.id,
          cover: items.photo_url,
          Title: items.title,
          Description: items.description,
          Price: items.price,
          sold_status: items.sold_status,
          Genre: items.genre,
          username: req.session.name,
        };
        res.render(`listings/edit`, templateVars);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  router.post("/:id", (req, res) => {
    const itemId = req.params.id;
    const itemBody = req.body;
    const userId = req.session.user_id;
    if (!userId) {
      res.redirect("/");
    }
    return db
      .query(
        `UPDATE items SET title = $1,description = $2, price = $3, genre = $4 WHERE items.id = $5 ;
         `,
        [
          itemBody.Title,
          itemBody.Description,
          itemBody.Price,
          itemBody.Genre,
          itemId,
        ]
      )
      .then(() => {
        return db.query(
          `UPDATE photo_urls SET photo_url = $1 WHERE item_id = $2;`,
          [itemBody.photo_url, itemId]
        );
      })
      .then(() => {
        const templateVars = {
          id: itemId,
          cover: itemBody.photo_url,
          Title: itemBody.Title,
          Description: itemBody.Description,
          Price: itemBody.Price,
          sold_status: itemBody.Sold_status,
          Genre: itemBody.Genre,
          username: req.session.name,
        };
        console.log("templateVars:", templateVars);
        res.render(`listings/edit`, templateVars);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });



  return router;
};
