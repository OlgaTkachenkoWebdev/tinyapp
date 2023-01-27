const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, urlsForUser, checkingAccess } = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["lasidfhaklwjf;lksdjf;klasjd;l", "aksjdf;kajshdlfhaklsjdhflkajshfl"],
}));

let urlDatabase = {};
let users = {};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
  //adds new short URL to the database
  const longURL = req.body.longURL;
  const id = generateRandomString(6);
  const user = users[req.session.user_id];
  const userID = user["id"];
  const newURL = {
    longURL,
    userID
  };
  //checks if user logged in
  if (user) {
    urlDatabase[id] = newURL;
    res.redirect(`/urls/${id}`);
  } else {
    res.send("Please log in or register");
  }
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  //checks if user logged in
  if (!user) {
    return res.send("Please log in");
  }
  //information about user and saved URLS that will be displayed on the /urls page
  const userId = req.session.user_id;
  const usersUrls = urlsForUser(userId, urlDatabase);

  const templateVars = {
    urls: usersUrls,
    user
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  //info about user that will be displayed inside header
  const user = users[req.session.user_id];
  const templateVars = {
    user
  };

  if (user) {
    return res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  /*helper function that checks if URL exists, user logged in, owns URL and
  sends apropriate message. Returns true if everythig OK
  */
  if (checkingAccess(req, res, urlDatabase)) {
    delete urlDatabase[id];
    res.redirect("/urls");
  }
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;
  //checkig if user have access to the URL
  if (checkingAccess(req, res, urlDatabase)) {
    const longURL = urlDatabase[id]["longURL"];
    //providing information that will be used in header and on the page
    const templateVars = {
      id,
      longURL,
      user: users[userID]
    };

    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  //checking if user have access to the URL
  if (checkingAccess(req, res, urlDatabase)) {
    const newLongURL = req.body.newLongURL;
    const urlObject = urlDatabase[id];
    //adding edited long URL to database
    urlObject["longURL"] = newLongURL;
    res.redirect("/urls");
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]["longURL"];
  const id = req.params.id;
  //checking if shortURL exists in the database
  if (!Object.keys(urlDatabase).includes(id)) {
    return res.send("URL is not found");
  }
  res.redirect(longURL);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  /* helper function that returns an object with user's information
  (user ID, email, password)
  */
  const user = getUserByEmail(email, users);
  // verifying if information provided by user found in the database
  if (!user) {
    return res.status(403).send("Email is not found");
  } else if (!bcrypt.compareSync(password, user["hashedPassword"])) {
    return res.status(403).send("Incorrect password");
  }
  //creating encrypted cookies
  const id = user["id"];
  req.session.user_id = id;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  //checking if user has been found in the database
  if (user) {
    res.redirect("/urls");
  }
  res.render("login", { user });
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  //checking if user found in the system
  if (user) {
    res.redirect("/urls");
  }
  res.render("register", { user });
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString(5);
  //checking if user provided email or password
  if (!email || !password) {
    return res.status(400).send("Please provide a email and a password");
  }
  //checking if provided email is already in the database
  const user = getUserByEmail(email, users);
  if (user) {
    return res.status(400).send("This email is already registered");
  }
  //adding new user to the database
  const newUser = {
    id,
    email,
    hashedPassword
  };
  users[id] = newUser;
  //creating encrypted cookies
  req.session.user_id = id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});