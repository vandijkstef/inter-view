const express = require('express');
const router = express.Router();
const path = require('path');
const DB = require('../scripts/DB.js');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const multer = require('multer');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, __basedir + '/uploads/');
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname + '-' + Date.now() + '.wav');
	}
});
const upload = multer({ storage: storage });

function AuthError(data, res) {
	data.autherror = true;
	res.json(data);
}

function SendMail(to, subject, html) {
	let transporter = nodemailer.createTransport({
		host: process.env.MAIL_HOST,
		port: process.env.MAIL_PORT,
		secure: false,
		auth: {
			user: process.env.MAIL_FROM,
			pass: process.env.MAIL_PASS
		},
		tls: {
			rejectUnauthorized: false
		}
	});

	let mailOptions = {
		from: '"Fred Foo 👻" <iview@vandijkstef.nl>',
		to: to,
		subject: subject,
		text: html, // TODO: strip html
		html: html
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
		console.log('Message sent: %s', info.messageId);
	});
	console.log(process.env.MAIL_FROM, process.env.MAIL_PASS);
}

router.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/index.html'));
});

router.get('/audio/:file', function(req, res) {
	if (req.session.user) {
		// TODO: test if file exsists and properly handle error
		res.sendFile(path.join(__basedir + '/uploads/' + req.params.file));
	} else {
		// res.status(403);
		// res.send('Sorry, thats not allowed');
		res.redirect('/');
	}
});

router.get('/testmail', function(req, res) {

	SendMail('vandijkstef@gmail.com', 'testing', 'with some content');
	res.json('send');
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
						id: userData[0].id,
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
					AuthError(data, res);
				}
			});
		} else {
			data.err = 'Invalid login data';
			AuthError(data, res);
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
			AuthError(data, res);
		}
		break;
	case 'script_fetch':
		if (req.session.user) {
			const db = new DB();
			db.Select('scripts', {id: req.body.scriptID}, (script) => {
				if (!script[0]) {
					data.err = `No script for ${req.body.scriptID}`;
					data.NOSCRIPT = true;
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
			AuthError(data, res);
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
						db.Insert('scripts_meta', {script_id: insertID, key: meta.key, type: meta.type, order: meta.order, post: meta.post}, () => {
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
					req.body.metas.forEach((meta) => {
						const db = new DB();
						if (meta.id === 'new') {
							db.Insert('scripts_meta', {script_id: req.body.id, key: meta.key, type: meta.type, order: meta.order, post: meta.post}, () => {
								// Silence is golden..
							});
						} else {
							db.Update('scripts_meta', {id: meta.id, script_id: req.body.id, key: meta.key, type: meta.type, order: meta.order, post: meta.post}, () => {
								// Silence is golden...
							});
						}
					});
					req.body.questions.forEach((question) => {
						const db = new DB();
						if (question.id === 'new') {
							db.Insert('questions', {script_id: req.body.id, question: question.text, order: question.order}, () => {
								// Silence is golden..
							});
						} else { 
							db.Update('questions', {script_id: req.body.id, question: question.text, order: question.order}, () => {
								// Silence is golden
							});
						}
					});
					data.status = status;
					res.json(data);
				});
			}
		} else {
			data.err = 'Cannot store script: Not authenticated';
			AuthError(data, res);
		}
		break;
	case 'new_respondent':
		if (req.session.user) {
			const db = new DB();
			let pseudo = null;
			req.body.meta.forEach((meta) => {
				if (meta.key === 'pseudo' && meta.value.length > 0) {
					pseudo = meta.value;
				}
			});
			if (pseudo === null) {
				pseudo = 'John Doe';
			}
			db.Insert('respondent', {psuedo: pseudo, script_id: req.body.script}, (insertID) => {
				data.insertID = insertID;
				data.status = true;
				req.body.meta.forEach((meta) => {
					if (meta.key !== 'pseudo') {
						const db = new DB();
						db.Insert('respondent_meta', {
							respondent_id: insertID,
							meta_id: meta.key.split('_')[1],
							value: meta.value
						}, () => {
							// Silence is golden...
						});
					}
				});
				res.json(data);
			});
		} else {
			data.err = 'Cannot set respondent id: Not authenticated';
			AuthError(data, res);
		}
		break;
	case 'new_answer':
		if (req.session.user) {
			const db = new DB();
			db.Insert('response', {
				question_id: req.body.question,
				respondent_id: req.body.respondent,
				interviewer_id: req.session.user.id,
				rating: req.body.rating
				// TODO: Tags
			}, () => {
				data.status = true;
				res.json(data);
			});
		} else {
			data.err = 'Cannot store answer: Not authenticated';
			res.json(data);
		}
		break;
	case 'get_respondents':
		if (req.session.user) {
			const db = new DB();
			db.Select('respondent', {'respondent.script_id': req.body.script}, (respondents) => {
				data.status = true;
				// data.respondents = respondents;
				const resData = {};
				respondents.forEach((response) => {
					if (!resData[response.id]) {
						resData[response.id] = {};
						resData[response.id].id = response.id;
						resData[response.id].pseudo = response.psuedo;
						resData[response.id].notes = response.notes;
						resData[response.id].answers = {};
						resData[response.id].metas = {};
					}
					if (response.meta_id) {
						resData[response.id].metas[response.meta_id] = {
							meta_id: response.meta_id,
							value: response.value,
							key: response.key
						};
					}
					if (response.audiofile) {
						resData[response.id].answers[response.question_id] = {
							question_id: response.question_id,
							audio: response.audiofile,
							question: response.question,
							rating: response.rating,
							notes: response.notes
						};
					}
				});
				data.resData = resData;
				res.json(data);
			}, {
				JOIN: 'LEFT JOIN response ON respondent.`id` = response.`respondent_id` LEFT JOIN respondent_meta ON respondent.`id` = respondent_meta.`respondent_id` LEFT JOIN scripts_meta ON scripts_meta.`id` = respondent_meta.`meta_id` LEFT JOIN questions ON questions.`id` = response.`question_id`',
				ORDER: 'respondent.`id`',
				SELECT: '`respondent`.*, `response`.`question_id`, `response`.`interviewer_id`, `response`.`audiofile`, `response`.`rating`, `response`.`notes`, `respondent_meta`.`meta_id`, `respondent_meta`.`value`, `scripts_meta`.`key`, `questions`.`question`'
			});
		} else {
			data.err = 'Cannot get respondents: Not authenticated';
			AuthError(data, res);
		}
		break;
	case 'get_responses': // TODO: Currently unused?
		console.log('I have the idea I aint using this..');
		if (req.session.user) {
			const db = new DB();
			if (req.body.respondent) { // Return data on single respondent
				db.Select('response', {respondent_id: req.body.respondent}, (responses) => {
					data.status = true;
					data.responses = responses;
					res.json(data);
				});
			} else {
				data.err = 'Cannot get responses: No respondent set';
				res.json(data);
			}
		} else {
			data.err = 'Cannot get responses: Not authenticated';
			AuthError(data, res);
		}
		break;
	case 'post_meta':
		if (req.session.user) {
			req.body.meta.forEach((meta) => {
				const db = new DB();
				db.Insert('respondent_meta', {
					respondent_id: req.body.respondent,
					meta_id: meta.key.split('_')[1],
					value: meta.value
				}, () => {
					// Silence is golden...
				});
			});
			data.status = true;
			res.json(data);
		} else {
			data.err = 'Cannot store post meta: Not authenticated';
			AuthError(data, res);
		}
		break;
	case 'update_responses':
		if (req.session.user) {
			console.log(req.body);
			const db = new DB();
			db.Update('respondent', {
				id: req.body.respondent,
				notes: req.body.respondent_notes
			}, () => {
				req.body.responses.forEach((response) => {
					const db = new DB();
					db.Select('response', {
						question_id: response.id,
						respondent_id: req.body.respondent
					}, (dbResponse) => {
						const db = new DB();
						db.Update('response', {
							id: dbResponse[0].id,
							notes: response.notes,
							rating: response.rating
						}, () => {
							// Silence is golden...
						});
					});
				});
			});
			data.status = true;
			res.json(data);
		} else {
			data.err = 'Cannot update responses: Not authenticated';
			AuthError(data, res);
		}
		break;
	case 'remove_question':
		if (req.session.user) {
			const db = new DB();
			db.Remove('questions', {id: req.body.id}, (results) => {
				console.log(results);
				data.status = results;
				res.json(data);
			});
		} else {
			data.err = 'Cannot remove question: Not authenticated';
			AuthError(data, res);
		}
		break;
	default:
		data.err = 'Action not available: ' + req.body.action;
		data.req = req.body;
		res.json(data);
		break;
	}
	
});

router.post('/audio', upload.single('audio'), function(req, res) {
	const data = {};
	if (req.file) {
		const db = new DB();
		const ids = req.file.originalname.split('-');
		db.Select('response', {
			question_id: ids[2],
			respondent_id: ids[3]
		}, (responseData) => {
			if (responseData[0]) {
				const db = new DB();
				db.Update('response', {
					id: responseData[0].id,
					audiofile: req.file.filename
				}, () => {
					data.status = true;
					res.json(data);
				});
			} else {
				console.log('Response not yet in database: audio not linked');
				res.json(data);
			}
		});
	}
});

module.exports = router;
