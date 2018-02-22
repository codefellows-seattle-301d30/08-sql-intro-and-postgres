'use strict';

const fs = require('fs');
const express = require('express');
const pg = require('pg');

const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express();

// Windows and Linux users: You should have retained the user/password from the pre-work for this course.
// Your OS may require that your conString is composed of additional information including user and password.
// const conString = 'postgres://USER:PASSWORD@HOST:PORT/DBNAME';

// Mac:
const conString = 'postgres://localhost:5432/articles';

const client = new pg.Client(conString);

// REVIEW: Use the client object to connect to our DB.
client.connect();


// REVIEW: Install the middleware plugins so that our app can use the body-parser module.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));


// REVIEW: Routes for requesting HTML resources
app.get('/new', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Number 5 on the full-stack-diagram, corresponds to the response from the controller to the view. The method of article.js interacting with this is Article.prototype.insertRecord, which allows users to create a new record from the /new page. The part of CRUD enacted by this is 'Read' because it is showing a file to the user.
  response.sendFile('new.html', {root: './public'});
});


// REVIEW: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Numbers 4 and 5 on the full-stack-diagram, corresponds to the response from the model to the controller to the view. The method of article.js interacting with this is Article.fetchAll, since it is the method that populates the /articles page. The part of CRUD enacted by this is 'Read' because it is showing articles to the user.
  client.query('SELECT * FROM articles')
    .then(function(result) {
      response.send(result.rows);
    })
    .catch(function(err) {
      console.error(err);
    });
});

app.post('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Numbers 2 and 3 in the full-stack diagram because this is posting new information from the view to the controller to the model. Method from article.js interacting with this is article.prototype.insertRecord because it is creating a new object to add to the existing table. The part of CRUD being enacted is Create because it is creating a new object.
  client.query(
    `INSERT INTO
    articles(title, author, "authorUrl", category, "publishedOn", body)
    VALUES ($1, $2, $3, $4, $5, $6);
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body
    ]
  )
    .then(function() {
      response.send('insert complete');
    })
    .catch(function(err) {
      console.error(err);
    });
});

app.put('/articles/:id', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Numbers 2 and 3 in the full-stack diagram because this is posting new information from the view to the controller to the model. Method from article.js interacting with this is article.prototype.updateRecord because it is updating an existing object in the table. The part of CRUD being enacted is Update because it is updating an existing object.
  client.query(
    `UPDATE articles (title, author, "authorUrl", category, "publishedOn", body) VALUES($2, $3, $4, $5, $6, $7) WHERE id = $1`,
    [ request.params.id,
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body]
  )
    .then(() => {
      response.send('update complete');
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles/:id', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Numbers 2 and 3 in the full-stack diagram because this is deleting existing information from the view to the controller to the model. Method from article.js interacting with this is article.prototype.deleteRecord because it is deleting an existing object in the table. The part of CRUD being enacted is Delete because it is deleting an existing object.
  client.query(
    `DELETE FROM articles WHERE id=$1;`,
    [request.params.id]
  )
    .then(() => {
      response.send('Delete complete');
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // PNumbers 2 and 3 in the full-stack diagram because this is deleting existing information from the view to the controller to the model. Method from article.js interacting with this is article.prototype.deleteRecord because it is deleting the table. The part of CRUD being enacted is Delete because it is deleting an existing object.
  client.query(
    'DROP TABLE articles'
  )
    .then(() => {
      response.send('Delete complete');
    })
    .catch(err => {
      console.error(err);
    });
});

// COMMENT: What is this function invocation doing?
// This is loading the database into psql.
loadDB();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Number 3 in the full-stack diagram because this is loading data from controller to the model. Method from article.js interacting with this is article.prototype.insertRecord because it is inserting a new record in the table. The part of CRUD being enacted is Create because it is creating new records.
  client.query('SELECT COUNT(*) FROM articles')
    .then(result => {
    // REVIEW: result.rows is an array of objects that PostgreSQL returns as a response to a query.
    // If there is nothing on the table, then result.rows[0] will be undefined, which will make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
    // Therefore, if there is nothing on the table, line 158 will evaluate to true and enter into the code block.
      if(!parseInt(result.rows[0].count)) {
        fs.readFile('./public/data/hackerIpsum.json', 'utf8', (err, fd) => {
          JSON.parse(fd).forEach(ele => {
            client.query(`
              INSERT INTO
              articles(title, author, "authorUrl", category, "publishedOn", body)
              VALUES ($1, $2, $3, $4, $5, $6);`,
            [ele.title, ele.author, ele.authorUrl, ele.category, ele.publishedOn, ele.body]
            );
          });
        });
      }
    });
}

function loadDB() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Number 3 in the full-stack diagram because this is loading data from controller to the model. Method from article.js interacting with this is article.prototype.insertRecord because it is inserting a new database to the model. The part of CRUD being enacted is Create because it is creating a new database.
  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      "authorUrl" VARCHAR (255),
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL);`
  )
    .then(() => {
      loadArticles();
    })
    .catch(err => {
      console.error(err);
    });
}
