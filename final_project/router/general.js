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
/**
 * Helper function to filter books by a specific property (author or title).
 * Consolidates search logic into a single reusable utility to improve efficiency
 * and eliminate redundant code across routes.
 * 
 * @param {string} property - The object key to filter by ('author' | 'title')
 * @param {string} query - The search string (case-insensitive)
 * @returns {Array} List of matching books with their ISBNs
 */
const getBooksByProperty = (property, query) => {
  const matches = [];
  const normalizedQuery = query.toLowerCase().trim();
  const isbns = Object.keys(books);

  isbns.forEach((isbn) => {
    if (books[isbn][property] && books[isbn][property].toLowerCase() === normalizedQuery) {
      matches.push({ isbn, ...books[isbn] });
    }
  });

  return matches;
};

// Task 4: Get book details based on author using reusable filtering helper
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = getBooksByProperty('author', author);

  if (booksByAuthor.length > 0) {
    return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
  } else {
    return res.status(404).json({ message: "Author not found" });
  }
});

// Task 5: Get all books based on title using reusable filtering helper
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = getBooksByProperty('title', title);

  if (booksByTitle.length > 0) {
    return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
  } else {
    return res.status(404).json({ message: "Title not found" });
  }
});

// Task 6: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: "ISBN not found" });
  }
});

// Task 10: Get all books using async/await with Axios
public_users.get('/async', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books asynchronously" });
  }
});

// Task 11: Get book details based on ISBN using Promises
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
    .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch((err) => res.status(404).json({ message: err }));
});

// Task 12: Get book details based on Author using Promises and reusable filtering
public_users.get('/author-promise/:author', function (req, res) {
  const author = req.params.author;
  const getBooksByAuthor = new Promise((resolve, reject) => {
    const matchingBooks = getBooksByProperty('author', author);
    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("Author not found");
    }
  });

  getBooksByAuthor
    .then((result) => res.status(200).send(JSON.stringify(result, null, 4)))
    .catch((err) => res.status(404).json({ message: err }));
});

// Task 13: Get book details based on Title using Promises and reusable filtering
public_users.get('/title-promise/:title', function (req, res) {
  const title = req.params.title;
  const getBooksByTitle = new Promise((resolve, reject) => {
    const matchingBooks = getBooksByProperty('title', title);
    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("Title not found");
    }
  });

  getBooksByTitle
    .then((result) => res.status(200).send(JSON.stringify(result, null, 4)))
    .catch((err) => res.status(404).json({ message: err }));
});

module.exports.general = public_users;
