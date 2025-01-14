const MongoStore = require('connect-mongo');
const session = require('express-session');

module.exports = (mongoURI) => session({
  secret: process.env.SESSION_SECRET || 'jooj',
  resave: true,
  saveUninitialized: true,
  cookie: { httpOnly: true },
  store: MongoStore.create({
    mongoUrl: mongoURI,
    collectionName: 'sessions',
  }),
});

