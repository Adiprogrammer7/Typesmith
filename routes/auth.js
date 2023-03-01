const express = require('express');
const User = require('../User');
const Avatar = require('../Avatar');

const router = express.Router();

router.get('/login', (req, res) => {
	res.render('login');
});

router.post('/login', async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findByEmail(email);
	if (user && await user.comparePassword(password)) {
		req.session.userId = user.id;
		console.log("login done, id: ", user.id);
		let result = await Avatar.alreadyExists(req.session.userId);
		req.session.avatar = result.avatar_character;
		console.log(req.session.avatar);
		res.redirect('/');
	} else {
		res.render('login', { error: 'Invalid email or password.' });
	}
});

router.get('/signup', (req, res) => {
	res.render('signup');
});

router.post('/signup', async (req, res) => {
	const { email, password, confirmPassword } = req.body;
	if(password == confirmPassword){
		const user = new User(email, password);

		try {
			await user.save();
			console.log(user.id);
			req.session.userId = user.id;
			res.redirect('/avatar');
		} catch (err) {
			res.render('signup', { error: err.message });
		}
	}
	else{
		req.flash('error', "Passwords don't match!");
        res.render('signup');
	}
});

router.get('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/');
});

module.exports = router;
