const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const authRoutes = require('./routes/auth');
const avatarRoutes = require('./routes/avatarRoutes');
var cookieParser = require("cookie-parser")
var flash = require('connect-flash');


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use('/', authRoutes);
app.use('/', avatarRoutes);
app.use(cookieParser("your-secret-key"));
app.use(flash());

app.use(function(req, res, next){
    res.locals.success = req.flash("success");
  	res.locals.error = req.flash("error");
    next();
});

app.get("/", (req, res) => {
	if(req.session.userId){
		res.render('index', { message: req.session.avatar });
	}
	else{
		res.render('login');
	}
});


// to run server on port
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
