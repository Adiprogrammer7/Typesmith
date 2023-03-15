const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const authRoutes = require('./routes/auth');
const avatarRoutes = require('./routes/avatarRoutes');
var cookieParser = require("cookie-parser")
var flash = require('connect-flash');

const Avatar = require('./Avatar');

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

app.get("/", async (req, res) => {
	if(req.session.userId){
		// console.log(typing_session);
		res.render('index', { avatar_character: req.session.avatar, userId: req.session.userId });
		// let data =  await typing_session();
		// if(data){
		// 	console.log("data");
		// }
		// else{
		// 	console.log("nopeee");
		// }
		// console.log("after render");
	}
	else{
		res.render('login');
	}
});

app.post('/typing_session', async function(req, res) {
	try{
		let wpm = req.body.wpm;
		let accuracy = req.body.accuracy;
		console.log('ajax data of typing session:', wpm, accuracy);
		let result = await Avatar.save_typing_session(wpm, accuracy, req.session.avatar_id);
		console.log(result);
		result = await Avatar.update_avg_stats(req.session.avatar_id);
		console.log(result);
	}
	catch(e){
		console.log(e.message());
	}
});

// to run server on port
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
