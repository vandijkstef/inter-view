const express = require('express');
const router = express.Router();
const path = require('path');
const DB = require('../scripts/DB.js');
const crypto = require('crypto');

/* GET home page. */
router.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/index.html'));
});

router.post('/api', function(req, res) {
	const data = {
		status: false
	};
	switch (req.body.action) {
	case 'auth':
		if (req.session.user) {
			data.err = 'User already logged in';
			data.status = true;
			res.json(data);
		} else if (req.body.username && req.body.password) {
			const db = new DB();
			const hash = crypto.createHmac('sha256', process.env.SECRET).update(req.body.password).digest('hex');
			db.Select('users', {username: req.body.username, password: hash}, (userData) => {
				if (userData.length === 1) {
					req.session.user = {
						name: userData[0].displayname
					};
					data.status = true;
					data.user = req.session.user;
					req.session.save((err) => {
						if (err) {
							console.log(err);
							res.json(data);
						} else {
							res.json(data);
						}
					});
				} else {
					data.err = 'Invalid login';
					res.json(data);
				}
			});
		} else {
			data.err = 'Invalid login data';
			res.json(data);
		}
		break;
	case 'testauth':
		if (req.session.user) {
			data.status = true;
		}
		res.json(data);
		break;
	case 'script_store':
		if (req.session.user) {
			console.log(req.body);
			const db = new DB();
			if (req.body.id === 'new') {
				// INSERT
				db.Insert('scripts', {title: req.body.title, description: req.body.description}, (insertID) => {
					console.log(insertID);
					data.status = true;
					data.scriptID = insertID;
					// TODO: Meta values
					// TODO: Questions
					res.json(data);
				});
			} else {
				// UPDATE
				res.json(data);
			}
		} else {
			data.err = 'Cannot store script: Not authenticated';
			res.json(data);
		}
		break;
	default:
		data.err = 'Not implemented: ' + req.body.action;
		data.req = req.body;
		res.json(data);
		break;
	}
	
});

module.exports = router;
