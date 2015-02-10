var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/callback', function(req, res, next) {
    //res.render('index', { title: 'Express' });
    res.json(req.body);
});

module.exports = router;
