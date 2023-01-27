const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// let urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };

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

function userFinder(newEmail) {
  let foundUser = null;
  for(let userId in users) {
    const user = users[userId];
    if (user['email'] === newEmail) {
      foundUser = user;
    }
  }
  return foundUser;
}

function urlFinder(userId) {
  let urlData = null;
  for (let urlId in urlDatabase) {
    const info = urlDatabase[urlId];
    if (info['userID'] === userId) {
      urlData = info;
    }
  }
  return urlData;
}


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls", (req, res) => {

  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };

  res.render("urls_index", templateVars);
});


app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString(6);
  const user = users[req.cookies["user_id"]]
  const userId = user["id"]
  const newURL = {
    longURL,
    userId
  }

  if (user) {
    urlDatabase[id] = newURL;
    res.redirect(`/urls/${id}`)
  } else {
    res.send("Please log in or register");
  };
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
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const id = req.params.id;
  if (!Object.keys(urlDatabase).includes(id)) {
     return res.send("URL is not found")
  }
  const longURL = urlDatabase[id]["longURL"]
  const templateVars = {
    id,
    longURL,
    user: users[userID]
  };

    res.render("urls_show", templateVars);
});


app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;
  const urlObject = urlDatabase[id];
  urlObject["longURL"] = newLongURL;
  res.redirect("/urls");
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
  console.log(email)
  console.log(password)
  console.log(user)
  console.log(users)
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