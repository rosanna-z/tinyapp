const express = require("express");
var cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

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
  const username = req.cookies === undefined ? "" : req.cookies["username"];
  const templateVars = { urls: urlDatabase, username } ;
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies === undefined ? "" : req.cookies["username"];
  const templateVars = { username } ;
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies === undefined ? "" : req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the consol
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL
  res.redirect(`/urls/${id}`); 
});

app.get("/register", (req, res) => {
  const username = req.cookies === undefined ? "" : req.cookies["username"];
  const templateVars = { username } ;
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  
  res.redirect(`/urls`); 
});

function generateRandomString() {
  let string = '';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  for (var i = 0; i < 6; i++) {
    string += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return string;
}

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id
  console.log(urlDatabase)
  delete urlDatabase[id];
  console.log(urlDatabase)
  res.redirect(`/urls`); 
});

app.post("/urls/:id/edit", (req, res) => {
  const newURL = req.body.newURL
  const id = req.params.id
  urlDatabase[id] = newURL
  res.redirect(`/urls`); 
});

app.post("/urls/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect(`/urls`); 
});

app.post("/urls/logout", (req, res) => {
  res.clearCookie('username', req.body.username)
  res.redirect(`/urls`); 
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});