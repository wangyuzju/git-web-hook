var express = require('express');
var router = express.Router();
var spawn = require('child_process').spawn;

/**
 * 初始化响应规则
 */
var rules;
try {
    rules = require('../runtime/data/git_web_hook_rules.json');
}catch (e){
    rules = {};
}


/**
 * 设置规则
 */
router.get('/rules', function(req, res, next) {
    res.render('gwh/rules', { title: 'Express ...' });
});



/* 处理 git web hooks 回调 */
router.post('/callback/', function(req, res, next) {
    //res.render('index', { title: 'Express' });
    //console.log(req.body)

    var data = req.body;
    var id;

    if(data.payload){
        // bitbucket
        id = webHookHelpers.bitbucket(data);
    }


    var task = rules[id];
    if(task){
        spawn(task.script)
    }
    //console.log(id);
    //console.log();
    res.json({errCode: 22000});
});

module.exports = router;


var webHookHelpers = {};


// { payload: '{"repository": {"website": null, "fork": false, "name": "test", "scm": "git", "owner": "wangyuzju", "absolute_url": "/wangyuzju/test/", "slug": "test", "is_private": true}, "truncated": false, "commits": [{"node": "fa7633d5b317", "files": [{"type": "modified", "file": "README.md"}], "raw_author": "wangyuzju <wangyu0248@gmail.com>", "utctimestamp": "2015-02-14 15:27:39+00:00", "author": "wangyuzju", "timestamp": "2015-02-14 16:27:39", "raw_node": "fa7633d5b317a29c691b19d4a7d55edd2fcdba2f", "parents": ["94f1cb164565"], "branch": "master", "message": " upload test code\\n", "revision": null, "size": -1}], "canon_url": "https://bitbucket.org", "user": "wangyuzju"}' }
webHookHelpers.bitbucket = function(rawData){
    //console.log()
    var data = JSON.parse(rawData.payload);


    var id = 'bitbucket_'+data.user + '_' + data.repository.name;
    //console.log(id);
    return id;
};
