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
			const hash = crypto.createHmac('sha256', process.env.SECRET_PASS).update(req.body.password).digest('hex');
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
	case 'scripts_fetch':
		if (req.session.user) {
			const db = new DB();
			db.Select('scripts', (scripts) => {
				if (!scripts) {
					data.err = 'No scripts';
					res.json(data);
				} else {
					data.status = true;
					data.scripts = scripts;
					res.json(data);
				}
			});
		} else {
			data.err = 'Cannot fetch script: Not authenticated';
			res.json(data);
		}
		break;
	case 'script_fetch':
		if (req.session.user) {
			const db = new DB();
			db.Select('scripts', {id: req.body.scriptID}, (script) => {
				if (!script[0]) {
					data.err = `No script for ${req.body.scriptID}`;
					res.json(data);
				} else {
					data.status = true;
					data.script = script[0];
					const db = new DB();
					db.Select('scripts_meta', {script_id: data.script.id}, (metas) => {
						data.script.metas = metas;
						const db = new DB();
						db.Select('questions', {script_id: data.script.id}, (questions) => {
							data.script.questions = questions;
							res.json(data);
						});
					});
				}
			});
		} else {
			data.err = 'Cannot fetch script: Not authenticated';
			res.json(data);
		}
		break;
	case 'script_store':
		if (req.session.user) {
			const db = new DB();
			if (req.body.id === 'new') {
				db.Insert('scripts', {title: req.body.title, description: req.body.description}, (insertID) => {
					data.status = true;
					data.scriptID = insertID;
					req.body.metas.forEach((meta) => {
						const db = new DB(); // Recreate DB so we have a seperate connection, which we can neatly close
						db.Insert('scripts_meta', {script_id: insertID, key: meta.key, type: meta.type, order: meta.order}, () => {
							// Silence is golden..
						});
					});
					req.body.questions.forEach((question) => {
						const db = new DB();
						db.Insert('questions', {script_id: insertID, question: question.text, order: question.order}, () => {
							// Silence is golden..
						});
					});
					res.json(data);
				});
			} else {
				const db = new DB();
				db.Update('scripts', {id: req.body.id, title: req.body.title, description: req.body.description}, (status) => {
					// TODO: Update Meta
					// TODO: Update questions
					data.status = status;
					res.json(data);
				});
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

router.post('/audio', function(req, res) {
	const data = {};
	data.test = 'test';
	res.json(data);
});

module.exports = router;
