const express = require("express");
var cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


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

function findUserbyEmail(email) {
  for (const userId in users) {
    const userDb = users[userId];
    if (userDb.email === email) {
      return userDb;
    }
    return null;
  }
}

function generateRandomString() {
  let string = '';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  for (var i = 0; i < 6; i++) {
    string += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return string;
}

function urlsForUser(id) {
  let list = {};
  for (const shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      list[shortURL] = urlDatabase[shortURL];
    }
  }
  return list;
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
  const userId = req.cookies["user_id"];
  const urls = urlsForUser(userId);
  const email = users[userId]?.email;
  const templateVars = { urls: urls, email };

  if (!email) {
    return res.send('Please <a href=/register>register</a> or <a href=/login>sign in</a>.');
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const email = users[req.cookies["user_id"]]?.email;

  if (!email) {
    return res.redirect(`/login`);
  }

  res.render("urls_new", { email });
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  const urls = urlsForUser(userId);

  // if user is not logged in
  if (!userId) {
    return res.send("You are not logged in. Please <a href=/register>register</a> or <a href=/login>sign in</a>.");
  }

  // if short url does not exist in database
  if (!urlDatabase[req.params.id]) {
    return res.send("This shorten URL does not exist.");
  }

  const urlData = urlDatabase[req.params.id]

  // if user does not own the URL
  if (userId !== urlDatabase[req.params.id].userID){
    return res.send("You do not own this URL.");
  }

  const templateVars = { urls : {id : req.params.id, longURL: urlData.longURL}, email : users[req.cookies["user_id"]]?.email}

  // const templateVars = { urls: urls, email: users[req.cookies["user_id"]]?.email };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {

  // if user is not logged in
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.send("You are not logged in. Please <a href=/register>register</a> or <a href=/login>sign in</a>.");
  }

  // creates new URL and add into database
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = {
    longURL,
    userID: req.cookies["user_id"]
  };

  res.redirect(`/urls/${id}`);
});

app.get("/register", (req, res) => {
  const email = users[req.cookies["user_id"]]?.email;

  if (email) {
    res.redirect(`/urls`);
  }

  res.render("registration", { email });
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('Please include both email and password');
  }

  const userDb = findUserbyEmail(email);
  if (userDb) {
    return res.status(400).send('Sorry! This email is taken!');
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
  console.log(hash)
  // check if new user matches with the users database
  // console.log(users);

  res.cookie('user_id', newUserId);
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.cookies["user_id"];

  // if user is not logged in
  if (!userId) {
    return res.send("You are not logged in. Please <a href=/register>register</a> or <a href=/login>sign in</a>.");
  }

  // if shortURL doesn't exist in database
  if (!urlDatabase[req.params.id]) {
    return res.send('This URL does not exist!');
  }

  // // if user doesnt own the URL
  if (userId !== urlDatabase[req.params.id].userID){
    return res.send("You do not own this URL.");
  }

  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect(`/urls`);
});

app.post("/urls/:id/edit", (req, res) => {
  const newURL = req.body.newURL;
  const userId = req.cookies["user_id"];

  // if user is not logged in
  if (!userId) {
    return res.send("You are not logged in. Please <a href=/register>register</a> or <a href=/login>sign in</a>.");
  }

  // if shortURL doesn't exist in database
  if (!urlDatabase[req.params.id]) {
    return res.send('This URL does not exist!');
  }

  // // if user doesnt own the URL
  if (userId !== urlDatabase[req.params.id].userID){
    return res.send("You do not own this URL.");
  }

  // creates new URL in database
  urlDatabase[req.params.id] = {
    longURL: newURL,
    userID: req.cookies["user_id"]
  };
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  const email = users[req.cookies["user_id"]]?.email;
  const templateVars = { email };

  if (email) {
    res.redirect(`/urls`);
  }

  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.send('Please include both email and password.');
  }

  const user = findUserbyEmail(email);
  if (!user) {
    return res.send('This email does not exist.');
  }

  const result = bcrypt.compareSync(password, user.password);
  if (!bcrypt.compareSync(password, user.password)) {
    return res.send('This password is incorrect.');
  }

  res.cookie('user_id', user.id);

  res.redirect(`/urls`);
});

app.post("/urls/login", (req, res) => {
  const email = req.body.email;
  res.cookie('user_id', userDb.id);
  res.redirect(`/urls`);
});

app.post("/urls/logout", (req, res) => {
  res.clearCookie('user_id', req.body.email);
  res.redirect(`/urls`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});