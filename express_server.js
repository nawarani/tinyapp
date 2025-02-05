const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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


app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening in on port ${PORT}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { 
    id: req.params.id,
    user: users[req.cookies["user_id"]]
  };
  res.render("register.ejs", templateVars);
});

function generateRandomString() {
  const str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let id = '';
  for(let c = 0; c < 6; c++) {
    let i = Math.floor(Math.random()*str.length);
    id += str[i];
  }
  return id;
};
app.post("/urls", (req, res) => {
  console.log(req.body);// Log the POST request body to the console
  let id = generateRandomString();
  while (urlDatabase[id]) {
    id = generateRandomString();
    console.log("generating new id", id, urlDatabase[id]);
  }
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = req.params.id;
  res.redirect(urlDatabase[longURL]);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id]
  res.redirect(`/urls`);
});

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls`);
});

// app.post("/login", (req, res) => {
//   res.cookie("username", req.body.username);
//   res.redirect(`/urls`);
// });

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});

const getUserByEmail = function(email) {
  if (email !== '') {
    for (id in users) {
      if (users[id].email === email) {
        return users[id];
      }
    }
  }
  return null;
};

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Email or password cannot be empty');
  } else if (getUserByEmail(req.body.email)) {
    res.status(400).send('User already exists, please log in');
  } else {
    let email = req.body.email;
    let password = req.body.password;
    let id = generateRandomString();
    while (users[id]) {
      id = generateRandomString();
    }
    let user = {
      id: id,
      email: email,
      password: password
    };
    users[id] = user;
    res.cookie("user_id", id);
    res.redirect(`/urls`);
  }
  console.log('users database: ', users);
});


