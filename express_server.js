const { findUserbyEmail, urlsForUser, generateRandomString } = require('./helpers');
const express = require("express");
const cookieSession = require('cookie-session');

const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

// config
app.set("view engine", "ejs");

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'cookie',
  keys: ['randomkeyslsjdfsdv']
}));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  sgq3y6: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$6/9Sff5M1/9XtbCMtWhs9urT/O1XfQvqMjBpp47e1iJAkln1B7aS6",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$HxptVMBx0GGOR8UyAqVSfOF6lcL89nEHtbD1MlzcUFk8fxcu.fZtu",
  },
};

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId]
  // if user is not logged in
  if (!user) {
    return res.render("error.ejs", { email: users[req.session.user_id]?.email });
  }

  const urls = urlsForUser(userId, urlDatabase);
  const email = users[userId]?.email;
  const templateVars = { urls: urls, email };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId]
  // if user is not logged in
  if (!user) {
    return res.redirect(`/login`);
  }

  res.render("urls_new", { email });
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId]
  // if user is not logged in
  if (!user) {
    return res.render("error.ejs", { email: users[req.session.user_id]?.email });
  }

  const shortURL = urlDatabase[req.params.id];
  // if short url does not exist in database
  if (!shortURL) {
    return res.send("This shorten URL does not exist.");
  }

  // if user does not own the URL
  if (userId !== shortURL.userID) {
    return res.send("You do not own this URL.");
  }

  // const urls = urlsForUser(userId, urlDatabase);
  const templateVars = { urls: { id: req.params.id, longURL: urlDatabase.longURL }, email: users[req.session.user_id]?.email };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {

  // if user is not logged in
  const userId = req.session.user_id;
  if (!userId) {
    return res.render("error.ejs", { email: users[req.session.user_id]?.email });
  }

  // creates new URL and add into database
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = {
    longURL,
    userID: req.session.user_id
  };

  res.redirect(`/urls/${id}`);
});

app.get("/register", (req, res) => {
  const email = users[req.session.user_id]?.email;

  if (email) {
    res.redirect(`/urls`);
  }

  res.render("registration", { email });
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.send('Please include both email and password');
  }

  const userDb = findUserbyEmail(email, users);
  if (userDb) {
    return res.send('Oops! This email is taken. Please use a different one.');
  }

  // create new user
  const newUserId = generateRandomString();
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  users[newUserId] = {
    id: newUserId,
    email,
    password: hash
  };

  // check if new user matches with the users database
  // console.log(users);

  req.session.user_id = newUserId;
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId]
  // if user is not logged in
  if (!user) {
    return res.render("error.ejs", { email: users[req.session.user_id]?.email });
  }

  // if shortURL doesn't exist in database
  if (!urlDatabase[req.params.id]) {
    return res.send('This URL does not exist!');
  }

  // // if user doesnt own the URL
  if (userId !== urlDatabase[req.params.id].userID) {
    return res.send("You do not own this URL.");
  }

  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId]
  // if user is not logged in
  if (!user) {
    return res.render("error.ejs", { email: users[req.session.user_id]?.email });
  }

  // if shortURL doesn't exist in database
  if (!urlDatabase[req.params.id]) {
    return res.send('This URL does not exist!');
  }

  // // if user doesnt own the URL
  if (userId !== urlDatabase[req.params.id].userID) {
    return res.send("You do not own this URL.");
  }

  const newURL = req.body.newURL;
  // creates new URL in database
  urlDatabase[req.params.id] = {
    longURL: newURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId]

  console.log(users)
  // if user is logged in
  if (user) {
    res.redirect(`/urls`);
  }

  const email = users[req.session.user_id]?.email;
  const templateVars = { email };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // if missing email or password
  if (!email || !password) {
    return res.send('Please include both email and password.');
  }
  // if email does not exist in database
  const user = findUserbyEmail(email, users);
  if (!user) {
    return res.send('This email does not exist.');
  }
  // checks password
  const result = bcrypt.compareSync(password, user.password);
  if (!bcrypt.compareSync(password, user.password)) {
    return res.send('This password is incorrect. Please try again.');
  }
  // creates a cookie
  req.session.user_id = user.id;
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  // removes the cookie
  req.session = null;
  res.redirect(`/urls`);
});

app.get("/u/:id", (req, res) => {
  // if URL doesn't exist in database
  if (req.params.id !== urlDatabase[req.params.id]) {
    return res.send('This URL does not exist!');
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId]
  // if user is not logged in
  if (!user) {
    return res.render("error.ejs", { email: users[req.session.user_id]?.email });
  }

    // if user is logged in
    if (userId) {
      res.redirect(`/urls`);
    }
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

