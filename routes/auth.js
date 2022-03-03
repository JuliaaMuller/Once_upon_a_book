const express = require("express");
const router = express.Router();



module.exports = db => {
  router.get('/', (req, res) => {

    return db.query(`SELECT * FROM users;`)
      .then(data => {
        const users = data.rows;
        const templateVars = { users: users };
        res.render('auth/login', templateVars);
      })
      .catch(error => {
        console.log(error);
      });
  });
  router.post('/', (req, res) => {
    return db.query(`SELECT * FROM users WHERE id = ${req.body['user_id']}`)
      .then(data => {
        const user = data.rows[0];
        const cookie = req.session;
        cookie['user_id'] = user.id;
        cookie['username'] = user.username;
        cookie['name'] = user.name;
        console.log(`Logging in as: id ${cookie['user_id']}, ${cookie['username']}, ${cookie['name']}`);
        res.redirect('../');
      });

  });
  router.post('/logout', (req, res) => {
    console.log(`Logging out as: id ${req.session['user_id']}. ${req.session['username']}, ${req.session['name']}`);
    req.session = null;
    res.redirect('../');
  });
  return router;
};
