// load .env data into process.env
require("dotenv").config();

// Web server config
const PORT = process.env.PORT || 8080;
const sassMiddleware = require("./lib/sass-middleware");
const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const timeago = require("timeago.js");
const { randomFeaturedItems } = require('./public/scripts/helpers');

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  "/styles",
  sassMiddleware({
    source: __dirname + "/styles",
    destination: __dirname + "/public/styles",
    isSass: false, // false => scss, true => sass
  })
);

app.use(express.static("public"));

app.use(
  cookieSession({
    name: "session",
    keys: [
      "40ed1e00-25ea-4136-bc6b-e7451fb3d11a",
      "f92c5252-5913-4bfa-82a6-1cffe026956f",
    ],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const listingsRoutes = require("./routes/listings");
const conversationRoutes = require("./routes/conversations");
const favoriteRoutes = require("./routes/favorites");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/auth", authRoutes(db));
app.use("/books", bookRoutes(db));
app.use("/listings", listingsRoutes(db));
app.use("/conversations", conversationRoutes(db));
app.use("/favorites", favoriteRoutes(db));

// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

// app.get("/", (req, res) => {
//   const templateVars = { username: req.session.name };
//   res.render("index", templateVars);
// });

app.get("/", (req, res) => {
  return db.query(`SELECT items.id AS item_id, items.title AS item_title, items.price AS item_price, users.username AS seller, items.created_at AS post_date, photo_urls.photo_url AS item_photo
  FROM items
  JOIN users ON users.id = items.owner_id
  JOIN photo_urls ON photo_urls.item_id = items.id
  WHERE users.super_seller = true
  AND items.sold_status = false;`)
    .then((data) => {
      const items = data.rows;
      for (const item of items) {
        item['post_date'] = timeago.format(item['post_date']);
      }
      const i = randomFeaturedItems(items.length);
      const templateVars = {
        username: req.session["name"],
        feature0: items[i[0]],
        feature1: items[i[1]],
        feature2: items[i[2]],
        feature3: items[i[3]],
        feature4: items[i[4]]
      };
      res.render("index", templateVars);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
