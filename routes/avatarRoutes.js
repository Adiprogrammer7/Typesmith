const express = require('express');
const Avatar = require('../Avatar');

const router = express.Router();

router.get('/avatar', (req, res) => {
	if(req.session.userId){
		res.render('avatar');
	}
	else{
		res.render('login');
	}
});

router.post('/avatar', async (req, res) => {
	if(!await Avatar.alreadyExists(req.session.userId)){
		const { username, avatar } = req.body;
		console.log(username);
		console.log(avatar);
		const avatar_obj = new Avatar(req.session.userId, username, avatar);
		try {
			await avatar_obj.save();
			req.session.avatar = avatar;
			res.redirect("/");
		} catch (error) {
			console.log(error.message);
		}
	}
	else{
		console.log("Only one avatar per user is allowed!");
		res.redirect("/");
	}
});

module.exports = router;