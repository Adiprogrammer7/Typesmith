const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const authRoutes = require('./routes/auth');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));

app.set("view engine", "ejs");
app.use(express.static('public'));
app.use('/', authRoutes);

app.get("/", (req, res) => {
    res.render('index');
});

// // Database connection
// const { Client } = require('pg');

// const client = new Client({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'resort_db',
//   password: 'Hack1137@postgres',
//   port: 5432,
// });

// client.connect();

// client.query('SELECT * FROM customer', (err, res) => {
//   console.log(res.rows);
//   client.end();
// });


// to run server on port
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
