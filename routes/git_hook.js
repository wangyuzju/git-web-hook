var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/callback', function(req, res, next) {
    //res.render('index', { title: 'Express' });
    console.log(req.body)

    res.json({errCode: 22000});
});

module.exports = router;
