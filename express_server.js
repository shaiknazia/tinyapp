const express = require("express");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));//setting bodyParser.
const cookieSession = require('cookie-session');
app.use(cookieSession({ name: 'session', keys: ['userId']}));
app.set("view engine", "ejs"); //setting up ejs
const { generateRandomString, getUserByEmail, checkPassword } = require("./helpers");


const urlsForUser = function(id) {
  const urlsDatabaseMatchUser = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urlsDatabaseMatchUser[url] = urlDatabase[url];
    }
  }
  return urlsDatabaseMatchUser;
};


//userUrlDatabase
const urlDatabase = {
  b6UTxQ: {longURL: "https://www.tsn.ca", userID: "b6UTxQ" },
};

//Registeration data storage
const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "UserId2": {
    id: "UserId2",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


//Function to search for right email
//create main route
app.get("/", (req,res) => {
  res.redirect('/urls');
});

//created json route which displays all key:value pairs in urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//adding route for "/urls"
app.get("/urls", (req, res) => {
  const key = req.session.userId;
  const user = users[key];
  const urlsDatabaseMatchUser = urlsForUser(key);
  let templateVars = {
    urls: urlsDatabaseMatchUser,
    user
  };
  res.render("urls_index.ejs", templateVars);
});


//adding route for /urls/new
app.get("/urls/new", (req, res) => {
  const key = req.session.userId;
  const user = users[key];
  let templateVars = { user };
  if (user) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
  
});
//create 'single URL and its shortForm' display page
//req.params.shortURL will be random short url created


app.get("/login", (req, res) => {
  const key = req.session.userId;
  const user = users[key];
  let templateVars = { user };
  res.render("urls_login", templateVars);
});



app.get("/register", (req, res) => {
  const key = req.session.userId;
  const user = users[key];
  let templateVars = { user };
  res.render("urls_form", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const key = req.session.userId;
  const user = users[key];
  const urlsDatabaseMatchUser = urlsForUser(key);
  let longURL = "";
  if (urlsDatabaseMatchUser[shortURL]) {
    longURL = urlsDatabaseMatchUser[shortURL].longURL;
  } else {
    res.status(400).send("Error 400");
  }
  let templateVars = {
    urls: urlsDatabaseMatchUser,
    user,
    longURL,
    shortURL
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase.hasOwnProperty(shortURL)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(`${longURL}`);
  } else {
    res.send("404 Not Found.")
  }
});

app.get("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const key = req.session.userId;
  const user = users[key];
  const urlsDatabaseMatchUser = urlsForUser(key);
  let longURL = urlsDatabaseMatchUser[shortURL];
  let templateVars = {
    urls: urlsDatabaseMatchUser,
    user,
    shortURL,
    longURL
  };
  res.render("urls_show", templateVars);
});

//POST Routes
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] =  { longURL: req.body.longURL, userID: req.session.userId };
  res.redirect(`urls/${shortURL}`);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const urlsDatabaseMatchUser = urlsForUser(req.session.userId); //checking if user is authentic
  if (urlsDatabaseMatchUser.hasOwnProperty(shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else { //redirect without delete
    res.redirect('/urls');
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const urlsDatabaseMatchUser = urlsForUser(req.session.userId);
  if (urlsDatabaseMatchUser.hasOwnProperty(shortURL)) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  } else { //redirect without editing
    res.redirect('/urls');
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const urlsDatabaseMatchUser = urlsForUser(req.session.userId);
  if (!urlsDatabaseMatchUser[shortURL]) {
    res.redirect('/urls');
  } else {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.userId };
  res.redirect(`urls/${shortURL}`);
});

app.post("/logout", (req, res) => {
  req.session.userId = "";
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const oldUser = getUserByEmail(email, users);
  const oldPassword = checkPassword(email, password, users);
  if (oldUser && oldPassword) {
    req.session.userId = oldUser;
    res.redirect("/urls");
  } else {
    res.send("invalid Login Credentials");
  }
});


app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  const hashedPass = bcrypt.hashSync(password, 10);
  if (email === '' || password === '') {
    res.status(400).send("Please enter username/password");
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("Error 400");
  } else {
    users[id] = {id, email, password : hashedPass};
    req.session.userId = id;
    res.redirect("/urls");
  }
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});





