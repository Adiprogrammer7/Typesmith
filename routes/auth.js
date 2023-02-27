const express = require('express');
const User = require('../User');

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
		res.redirect('/');
	} else {
		res.render('login', { error: 'Invalid email or password.' });
	}
});

router.get('/signup', (req, res) => {
	res.render('signup');
});

router.post('/signup', async (req, res) => {
	const { email, password } = req.body;
	const user = new User(email, password);

	try {
		await user.save();
		console.log(user.id);
		req.session.userId = user.id;
		res.redirect('/');
	} catch (err) {
		res.render('signup', { error: err.message });
	}
});

router.get('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/');
});

module.exports = router;
