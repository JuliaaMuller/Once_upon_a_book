# Once Upon A Book

Once Upon A Book is a bookstore where sellers can sell their used books, and buyers can contact buyers to make transactions. Think of it as a Kijiji or Facebook Marketplace for used books.

## Final Product

!["Screenshot of homepage"](https://github.com/jjjjjjonathan/better-best-book-store/blob/master/docs/screenshots/homepage.png)

!["Screenshot of messages page"](https://github.com/jjjjjjonathan/better-best-book-store/blob/master/docs/screenshots/messages.png)

!["Screenshot of book listing page"](https://github.com/jjjjjjonathan/better-best-book-store/blob/master/docs/screenshots/buybook.png)

!["Screenshot of favorites page"](https://github.com/jjjjjjonathan/better-best-book-store/blob/master/docs/screenshots/favorites.png)

## Dependencies

- Node.js
- Express
- EJS
- cookie-session
- dontenv
- morgan
- pg
- sass
- timeago.js
- chalk
- nodemon

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `npm run local` command.

## Future Plans

- Implement the use of Google Books API to search by ISBN. That would be able to pull a lot of information on books, like cover, author, description, etc.
- Create a real-time messaging system using some sort of Web Socket system.
- Add analytics to favorited books, views per page, unique visitors per listing, etc.
