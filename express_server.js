const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let urlDatabase = {
  b6UTxQ/*url ID*/: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "123",
  },
  Ozzy: {
    id: "Ozzy",
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
//returns an object with user's information
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

//returns object with shortURL as a key and longURL as a value
function urlsForUser(userId) {
  let urlData = {};
  for (let urlId in urlDatabase) {
    const info = urlDatabase[urlId];
    if (info['userID'] === userId) {
      urlData[urlId] = info["longURL"];
    }
  }
  return urlData;
}
// checks if url exists, if user is logged in or if url belongs to user
function checkingAccess(req, res) {
  const id = req.params.id;
  if (!Object.keys(urlDatabase).includes(id)) {
    res.send("URL is not found");
    return false;
  }
  const userID = req.cookies["user_id"];
  if (!userID) {
    res.send("Please log in");
    return false;
  }
  const usersUrl = urlDatabase[id];
  if (usersUrl["userID"] !== userID) {
    res.send("You don't have access")
    return false;
  }
  return true;
}


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString(6);
  const user = users[req.cookies["user_id"]]
  const userID = user["id"]
  const newURL = {
    longURL,
    userID
  }
  if (user) {
    urlDatabase[id] = newURL;
    res.redirect(`/urls/${id}`)
  } else {
    res.send("Please log in or register");
  };
});


app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];

  if (!user) {
    return res.send("Please log in");
  }

  const userId = req.cookies["user_id"];
  const usersUrls = urlsForUser(userId);

  const templateVars = {
    urls: usersUrls,
    user: users[req.cookies["user_id"]]
  };

  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user
  }

  if (user) {
    return res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});


app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (checkingAccess(req, res)) {
    delete urlDatabase[id];
    res.redirect("/urls");
  }
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.cookies["user_id"];
  if (checkingAccess(req, res)) {
    const longURL = url["longURL"]

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
  if (checkingAccess(req, res)) {
    const newLongURL = req.body.newLongURL;
    const urlObject = urlDatabase[id];
    urlObject["longURL"] = newLongURL;
    res.redirect("/urls");
  }
});


app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]["longURL"];
  const id = req.params.id;

  if (!Object.keys(urlDatabase).includes(id)) {
    return res.send("URL is not found")
  }
  res.redirect(longURL);
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = userFinder(email);

  if (!user) {
    return res.status(403).send("Email is not found")
  } else if (user["password"] !== password) {
    return res.status(403).send("Incorrect password")
  }

  const id = user["id"];
  res
    .cookie('user_id', id)
    .redirect("/urls");
});


app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]]

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
  const user = users[req.cookies["user_id"]];

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
    return res.status(400).send("Please provide a email and a password");
  }
  if (user) {
    return res.status(400).send("This email is already registered");
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