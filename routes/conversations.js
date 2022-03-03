const express = require("express");
const timeago = require('timeago.js');
const router = express.Router();

module.exports = db => {
  router.get('/', (req, res) => {
    const userId = req.session.user_id;
    if (!userId) {
      res.render("index");
    } else {
      return db.query(`SELECT conversations.id, MAX(users_1.username) as name1, items.title AS item_title, MAX(users_2.username) as name2, MAX(messages.sent_at) as last_message_time, MAX(users_3.username) as last_sender
      FROM conversations
      JOIN messages ON messages.conversation_id = conversations.id
      JOIN users AS users_1 ON conversations.user1_id = users_1.id
      JOIN users AS users_2 ON conversations.user2_id = users_2.id
      JOIN users AS users_3 ON messages.sender_id = users_3.id
      JOIN items ON messages.item_id = items.id
      WHERE (conversations.user1_id = $1
      OR conversations.user2_id = $1)
      AND messages.id IN (
        SELECT MAX(messages.id)
        FROM messages
        JOIN conversations ON conversations.id = messages.conversation_id
        GROUP BY conversations.id
      )
      GROUP BY conversations.id, items.title;`, [userId])
        .then(data => {
          const messages = data.rows;
          console.log(messages);
          if (messages.length > 0) {
            for (const message of messages) {
              message['last_message_time'] = timeago.format(message['last_message_time']);
            }
            const templateVars = { messages, username: req.session['name'] };
            res.render('conversations/conversations', templateVars);
          } else {
            const templateVars = { messages: null, username: req.session['name'] };
            res.render('conversations/conversations', templateVars);
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  });

  router.post('/', (req, res) => {
    console.log(req.body);
    return db.query(`INSERT INTO conversations (user1_id, user2_id)
    VALUES (${req.session.user_id}, ${req.body.owner_id}) RETURNING id;`)
      .then(data => {
        console.log(data.rows[0], req.body);
        return db.query(`INSERT INTO messages (item_id, sender_id, conversation_id, message_body)
        VALUES (${req.body.item_id}, ${req.session.user_id}, ${data.rows[0].id}, $1)`, [req.body.message])
          .then(() => {
            res.redirect(`/books/${req.body.item_id}`);
          });
      });
  });

  router.get('/:id', (req, res) => {
    return db.query(`SELECT messages.*, items.id AS item_id, users.username as sender, users_1.username as user1, users_2.username as user2, users_1.id as id1, users_2.id as id2, items.title AS item_title, photo_urls.photo_url AS item_photo_url, items.price as item_price
    FROM messages
    JOIN conversations ON conversations.id = messages.conversation_id
    JOIN users ON messages.sender_id = users.id
    JOIN users AS users_1 ON conversations.user1_id = users_1.id
    JOIN users AS users_2 ON conversations.user2_id = users_2.id
    JOIN items ON items.id = messages.item_id
    JOIN photo_urls ON items.id = photo_urls.item_id
    WHERE conversations.id = $1
    ORDER BY sent_at DESC
    LIMIT 10;`, [req.params.id])
      .then(data => {
        const messageThread = data.rows.reverse();
        console.log(messageThread[0]);
        const user = req.session.user_id;
        if (user === messageThread[0].id1 || user === messageThread[0].id2) {
          for (const message of messageThread) {
            message['sent_at'] = timeago.format(message['sent_at']);
          }
          const templateVars = { messageThread, username: req.session['name'] };
          res.render('conversations/thread', templateVars);
        } else {
          res.render('index');
        }
      });
  });

  router.post('/:id', (req, res) => {
    return db.query(`INSERT INTO messages (sender_id, conversation_id, message_body, item_id)
    VALUES ($1, $2, $3, $4);`, [req.session['user_id'], parseFloat(req.params.id), req.body.message, parseFloat(req.body.item_id)])
      .then(() => {
        res.redirect(`/conversations/${req.params.id}`);
      });
  });

  return router;
};
