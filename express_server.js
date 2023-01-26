const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "456",
  },
};

function generateRandomString(length) {
  let shortURL = '';
  let range = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    shortURL += range[Math.floor(Math.random() * range.length)];
  }
  return shortURL;
}

function userFinder(newEmail) {
  let foundUser = null;
  for (let userId in users) {
    const user = users[userId];
    if (user['email'] === newEmail) {
      foundUser = user;
    }
  }
  return foundUser;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  console.log(templateVars.user)
  console.log(req.cookies["user_id"])
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  let user = users[req.cookies["user_id"]];
  if (user) {
    res.render("urls_new", user);
  }
  res.redirect("/login");
});
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let id = generateRandomString(6);
  let user = users[req.cookies["user_id"]]
  if (user) {
    urlDatabase[id] = longURL;
    res.redirect(`/urls/${id}`)
  } else {
    res.send("Please log in or register");
  };
});
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.newLongURL;
  console.log(req.body)
  res.redirect("/urls");
});
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = userFinder(email);
  const id = user.id;
  if (!user) {
    return res.status(403).send("Email is not found")
  } else if (user["password"] !== password) {
    return res.status(403).send("Incorrect password")
  }
  res
    .cookie('user_id', id)
    .redirect("/urls");
});
app.get("/login", (req, res) => {
  let user = users[req.cookies["user_id"]]
  if (user) {
    res.redirect("/urls")
  }
  res.render("login", { user })
});
app.post("/logout", (req, res) => {
  res
    .clearCookie('user_id')
    .redirect("/login");
});
app.get("/register", (req, res) => {
  let user = users[req.cookies["user_id"]]
  if (user) {
    res.redirect("/urls");
  }
  res.render("register", { user });
});
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString(5);
  const user = userFinder(email);

  if (!email || !password) {
    return res.status(400).send("Please provide a email and a password")
  }
  if (user) {
    return res.status(400).send("This email is already registered")
  }

  const newUser = {
    id,
    email,
    password
  }
  users[id] = newUser;

  res.cookie("user_id", id);
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});