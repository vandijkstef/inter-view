const express = require('express');
const router = express.Router();
const path = require('path');

/* GET home page. */
router.get('/', function(req, res) {
	console.log('yolos');
	console.log(req.app.get('env'));
	res.sendFile(path.join(__dirname + '/public/index.html'));
});

router.get('/api', function(req, res) {
	res.json({hello: 'world'});
});

module.exports = router;
