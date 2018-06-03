const express = require('express');
const router = express.Router();
const path = require('path');
const uniqid = require('uniqid');

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
		if (req.session.authcode) {
			data.err = 'Authcode already set in session';
			data.authcode = req.session.authcode;
			res.json(data);
		} else if (req.body.username) {
			req.session.authcode = uniqid();
			req.session.save((err) => {
				if (err) {
					console.log(err);
				} else {
					data.authcode = req.session.authcode;
					res.json(data);
				}
			});
		} else {
			data.err = 'Invalid login';
			res.json(data);
		}
		break;
	case 'testauth':
		if (req.session.authcode === req.body.authcode) {
			data.status = true;
		}
		res.json(data);
		break;
	default:
		data.err = 'Not implemented: ' + req.body.action;
		res.json(data);
		break;
	}
	
});

module.exports = router;
