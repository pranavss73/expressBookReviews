const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(JSON.stringify(books[isbn],null,4));
  } else {
    return res.status(404).json({message: "ISBN not found"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let booksByAuthor = [];
  let isbns = Object.keys(books);
  isbns.forEach((isbn) => {
    if (books[isbn]["author"].toLowerCase() === author.toLowerCase()) {
      booksByAuthor.push({"isbn": isbn, ...books[isbn]});
    }
  });
  if (booksByAuthor.length > 0) {
    res.send(JSON.stringify(booksByAuthor, null, 4));
  } else {
    return res.status(404).json({message: "Author not found"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let booksByTitle = [];
  let isbns = Object.keys(books);
  isbns.forEach((isbn) => {
    if (books[isbn]["title"].toLowerCase() === title.toLowerCase()) {
      booksByTitle.push({"isbn": isbn, ...books[isbn]});
    }
  });
  if (booksByTitle.length > 0) {
    res.send(JSON.stringify(booksByTitle, null, 4));
  } else {
    return res.status(404).json({message: "Title not found"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({message: "ISBN not found"});
  }
});

// Task 10 - Get all books using async-await with Axios
public_users.get('/async', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/');
    res.send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    res.status(500).json({message: "Error fetching books"});
  }
});

// Task 11 - Get book details based on ISBN using Promises
public_users.get('/isbn-promise/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("ISBN not found");
    }
  });
  getBookByISBN
    .then((book) => res.send(JSON.stringify(book, null, 4)))
    .catch((err) => res.status(404).json({message: err}));
});

// Task 12 - Get book details based on Author using Promises
public_users.get('/author-promise/:author', function (req, res) {
  const author = req.params.author;
  const getBooksByAuthor = new Promise((resolve, reject) => {
    let booksByAuthor = [];
    let isbns = Object.keys(books);
    isbns.forEach((isbn) => {
      if (books[isbn]["author"].toLowerCase() === author.toLowerCase()) {
        booksByAuthor.push({"isbn": isbn, ...books[isbn]});
      }
    });
    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject("Author not found");
    }
  });
  getBooksByAuthor
    .then((result) => res.send(JSON.stringify(result, null, 4)))
    .catch((err) => res.status(404).json({message: err}));
});

// Task 13 - Get book details based on Title using Promises
public_users.get('/title-promise/:title', function (req, res) {
  const title = req.params.title;
  const getBooksByTitle = new Promise((resolve, reject) => {
    let booksByTitle = [];
    let isbns = Object.keys(books);
    isbns.forEach((isbn) => {
      if (books[isbn]["title"].toLowerCase() === title.toLowerCase()) {
        booksByTitle.push({"isbn": isbn, ...books[isbn]});
      }
    });
    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject("Title not found");
    }
  });
  getBooksByTitle
    .then((result) => res.send(JSON.stringify(result, null, 4)))
    .catch((err) => res.status(404).json({message: err}));
});

module.exports.general = public_users;
