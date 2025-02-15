const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

// helper functions
const helpers = require("./helpers");
const generateRandomString = helpers.generateRandomString;
const getUserByEmail = helpers.getUserByEmail;
const loggedIn = helpers.loggedIn;
const urlsForUser = helpers.urlsForUser;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['ksjdhfjasdghfk']
}));

// data 
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "default"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "default"
  }
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

app.listen(PORT, () => {
  console.log(`Example app listening in on port ${PORT}`);
});

// routes
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  if (!loggedIn(req, res, users)) {
    res.send("Please log in to view list of short urls");
  } else {
    const templateVars = { 
      urls: urlsForUser(req.session.user_id, urlDatabase),
      user: users[req.session["user_id"]]
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (!loggedIn(req, res, users)) {
    res.redirect(`/login`);
  } else {
    const templateVars = { 
      user: users[req.session["user_id"]]
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  console.log("obj keys ine output: ", Object.keys(urlsForUser(req.session.user_id, urlDatabase)));
  if (!loggedIn(req, res, users)) {
    res.send("Please log in to view the url");
  } else if (!Object.keys(urlsForUser(req.session.user_id, urlDatabase)).includes(req.params.id)) {
    res.send("You can only access your short urls");
  } else {
    const templateVars = { 
      id: req.params.id, 
      longURL: urlDatabase[req.params.id].longURL,
      user: users[req.session["user_id"]]
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/register", (req, res) => {
  if (loggedIn(req, res, users)) {
    res.redirect(`/urls`);
  } else {
    const templateVars = { 
      id: req.params.id,
      user: users[req.session["user_id"]]
    };
    res.render("register.ejs", templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (!users[req.session["user_id"]]) {
    res.send("Only registered users can shorten URLs, please register first");
  }
  console.log(req.body);// Log the POST request body to the console
  let id = generateRandomString();
  while (urlDatabase[id]) {
    id = generateRandomString();
    console.log("generating new id", id, urlDatabase[id]);
  }
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
  };
  console.log("urlDatabase after adding new url: ", urlDatabase);
  res.redirect(`/urls/${id}`);
});

app.get("/u/:id", (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    res.send("Please enter a valid short url");
  } else {
    const URLid = req.params.id;
    res.redirect(urlDatabase[URLid].longURL);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (!Object.keys(urlDatabase).includes(id)) {
    res.send("id does not exist");
  } else if (!loggedIn(req, res, users)) {
    res.send("please log in");
  } else if (!Object.keys(urlsForUser(req.session.user_id, urlDatabase)).includes(id)){
    res.send("You can only edit your own urls");
  } else {
    delete urlDatabase[id]
    res.redirect(`/urls`);
  }
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (!Object.keys(urlDatabase).includes(id)) {
    res.send("id does not exist");
  } else if (!loggedIn(req, res, users)) {
    res.send("please log in");
  } else if (!Object.keys(urlsForUser(req.session.user_id, urlDatabase)).includes(id)){
    res.send("You can only edit your own urls");
  } else {
    urlDatabase[id].longURL = req.body.longURL;
    res.redirect(`/urls`);
  }
});

app.get("/login", (req, res) => {
  if (loggedIn(req, res, users)) {
    res.redirect(`/urls`);
  } else {
    const templateVars = { 
      user: users[req.session.user_id]
    };
    res.render("login.ejs", templateVars);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (email === '' || password === ''){
    res.status(403).send("Email or password cannot be left empty");
  } else if (user === null) {
    res.status(403).send("Email not registered");
  } else if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send("wrong email or password");
  } else {
    req.session.user_id = user.id;
    res.redirect(`/urls`);
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Email or password cannot be empty');
  } else if (getUserByEmail(req.body.email, users)) {
    res.status(400).send('User already exists, please log in');
  } else {
    let email = req.body.email;
    let password = bcrypt.hashSync(req.body.password, 10);
    let id = generateRandomString();
    while (users[id]) {
      id = generateRandomString();
    }
    let user = {
      id: id,
      email: email,
      password: password
    };
    // store it inside the users database
    users[id] = user;
    //set cookie
    req.session.user_id = user.id;
    res.redirect(`/urls`);
  }
  console.log('users database: ', users);
});

app.get("/", (req, res)=> {
  res.redirect("/login");
});


