const express = require('express');
const router = express.Router();
const path = require('path');

/* GET home page. */
router.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/index.html'));
});

router.post('/api', function(req, res) {
	console.log()
	res.json({hello: 'world'});
});

module.exports = router;
