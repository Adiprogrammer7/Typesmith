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
app.use(bodyParser.json());
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
		res.render('index', { username: req.session.username, avatar_character: req.session.avatar, userId: req.session.userId });
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
		res.redirect('/login');
	}
});

app.post('/typing_session', async function(req, res) {
	try{
		const { wpm, accuracy, intervals, interval_wpm, interval_accuracy } = req.body;
		console.log('ajax data of typing session:', wpm, accuracy);
		let result = await Avatar.save_typing_session(wpm, accuracy, req.session.avatar_id);
		console.log(result);
		result = await Avatar.update_avg_stats(req.session.avatar_id);
		console.log(result);
		console.log(intervals, interval_accuracy, interval_wpm);
		result = await Avatar.save_recent_session(intervals, interval_wpm, interval_accuracy, req.session.avatar_id);
		console.log(result);
		await Avatar.plot_recent_stats(req.session.avatar_id);
	}
	catch(e){
		console.log(e);
	}
});

app.get('/plots', async function(req, res) {
	if(req.session.userId){
		let result = await Avatar.read_avg_stats(req.session.avatar_id);
		let wpm = result.avg_wpm;
		let accuracy = result.avg_accuracy;
		wpm = wpm.toFixed(2);
		accuracy = accuracy.toFixed(2);
		console.log(wpm, accuracy);
		let {plotData, layout} = await Avatar.plot_stats(req.session.avatar_id, req.session.username);
		let {recent_plotData, recent_layout} = await Avatar.plot_recent_stats(req.session.avatar_id, req.session.username);
		res.render('plots', {plotData: plotData, layout: layout, recent_plotData: recent_plotData, recent_layout: recent_layout, username: req.session.username, avatar_character: req.session.avatar, wpm: wpm, accuracy: accuracy});
	}
	else{
		res.redirect('login');
	}
});

// to run server on port
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
