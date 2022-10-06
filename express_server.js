const express = require("express");
var cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function findUserbyEmail(email) {
  for (const userId in users) {
  const userDb = users[userId];
  if (userDb.email === email) {
  return userDb;
  }
  return null;
}}

function generateRandomString() {
  let string = '';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  for (var i = 0; i < 6; i++) {
    string += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return string;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const email = users[req.cookies["user_id"]]?.email
  const templateVars = { urls: urlDatabase, email } ;
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const email = users[req.cookies["user_id"]]?.email
  const templateVars = { email } ;
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], email: users[req.cookies["user_id"]]?.email };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL
  res.redirect(`/urls/${id}`); 
});

app.get("/register", (req, res) => {
  const email = users[req.cookies["user_id"]]?.email;
  const templateVars = { email } ;
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email
  const password = req.body.password

  if (!email || !password) {
    return res.status(400).send('Please include both email and password');
  }

  const userDb = findUserbyEmail(email)
  if (userDb) {
    return res.status(400).send('Sorry! This email is taken!');
  }

  const newUserId = generateRandomString();

  users[newUserId] = {
    id: newUserId,
    email,
    password
  };

  res.cookie('user_id', newUserId)
  res.redirect(`/urls`); 
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id
  delete urlDatabase[id];
  res.redirect(`/urls`); 
});

app.post("/urls/:id/edit", (req, res) => {
  const newURL = req.body.newURL
  const id = req.params.id
  urlDatabase[id] = newURL
  res.redirect(`/urls`); 
});

app.post("/urls/login", (req, res) => {
  const email = req.body.email

  res.cookie('user_id', userDb.id)
  res.redirect(`/urls`); 
});

app.post("/urls/logout", (req, res) => {
  res.clearCookie('user_id', req.body.email)
  res.redirect(`/urls`); 
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});