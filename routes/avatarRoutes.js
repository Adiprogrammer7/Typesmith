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
	let result = await Avatar.alreadyExists(req.session.userId);
	if(!result){
		const { username, avatar } = req.body;
		console.log(username);
		console.log(avatar);
		const avatar_obj = new Avatar(req.session.userId, username, avatar);
		try {
			await avatar_obj.save();
			result = await Avatar.alreadyExists(req.session.userId);
			console.log(result);
			req.session.username = result.username;
			req.session.avatar_id = result.avatar_id;
			req.session.avatar = result.avatar_character;
			console.log("Avatar id after avatar creation: ", req.session.avatar_id);
			// req.session.avatar = avatar;
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