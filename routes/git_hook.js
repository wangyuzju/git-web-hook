var fs = require('fs');

var express = require('express');
var router = express.Router();
var _child_process = require('child_process');
var spawn = _child_process.spawn;
var exec = _child_process.exec;
var path = require('path');
var utils = require('../lib/utils.js');
//var config = require('../config.js');

// readFile 和 require 不同，是以启动程序的目录为当前目录的
var CONFIG = {
    RULE_FILE_PATH: 'runtime/data/git_web_hook_rules.json',
    LOG_FILE_PATH: 'runtime/log/git_web_hook'
};


var rules;

var gwhCtrl = {

    /**
     * 调用 exec 运行任务，并返回执行的日志结果
     * @param {string} task
     * @return {string}
     */
    runTask: function(task, cb){
        var output = '--- Start ' + new Date() + '\n';
        output += '=========================================================\n';
        output += task + '\n'
        output += '=========================================================\n'
        output += '>>> :\n';

        exec(task, function(err, stdout, stderr){
            stdout && (output += stdout);
            stderr && (output += stderr);

            output += '## Task End At ' + new Date() + '\n'
            output += '--- End ' + new Date() + '\n\n';
            // write output to output file
            cb(output);
        })
    },

    readLog: function(){
        return utils.readFile(CONFIG.LOG_FILE_PATH, {encoding: 'utf8'}).then(function(data){
            return data;
        }, function(){
            return '暂无日志文件记录';
        })
    },
    saveLog: function(log){
        //fs.readFile(logFilePath, {encoding: 'utf-8'}, function(err, data){
        //    fs.writeFile(logFilePath, log + data);
        //})
        utils.readFile(CONFIG.LOG_FILE_PATH, {encoding: 'utf-8'}).then(function(data){
            return utils.writeFile(CONFIG.LOG_FILE_PATH, log + data);
        }, function(){
            return utils.writeFile(CONFIG.LOG_FILE_PATH, log);
        });
    },

    loadRules: function(){
        return utils.readFile(CONFIG.RULE_FILE_PATH,
            {encoding: 'utf8'}
        ).then(function(str){
            return JSON.parse(str);
        }).then(function(data){
            rules = data;
        }, function(){
            rules = {};
        });
    },
    saveRules: function(config, cb){
        return utils.writeFile(CONFIG.RULE_FILE_PATH, JSON.stringify(config, null, '  ')).then(function(){
            // update rules in memory
            rules = config;
        })
    }
};


gwhCtrl.loadRules();
/********************************************
 * 规则相关
 */

/* 展示规则 */
router.get('/rules', function(req, res, next) {
    res.render('gwh/rules', {
        tplData: {
            rules: rules
        },
        test: 'gg'
    });
});

/* 设置规则 */
router.post('/api/set_rule', function(req, res){

    var data = req.body;

    if(data.password == 'lcmf36'){
        gwhCtrl.saveRules(data.config).then(function(){
            res.api_success();
        }, function(err){
            res.api_fail(22001, err);
        })
    }else{
        res.api_fail(22001, '密码错误');
        //res.json({errorCode: 22001, msg: '密码错误'});
    }

});


router.get('/log', function(req, res, next) {

    gwhCtrl.readLog().then(function(str){
        res.render('gwh/log', {
            title: 'git web hook log',
            content: str
        })
    });

    //fs.readFile(logFilePath, {encoding: 'utf8'}, function(err, data){
    //    var content = err ? err : data;
    //
    //    res.render('gwh/log', {
    //        title: 'git web hook ...',
    //        content: content
    //    });
    //})
});

/* 手动测试跑 task */
router.get('/callback', function(req, res, next) {
    var id = req.query.task_id || 'test';
    var task = rules[id];
    if(task){
        gwhCtrl.runTask(task.script, function(log){
            gwhCtrl.saveLog(log);
            //res.json({data: req.params});
            res.send(log);
        });
    }
});

/* 处理 git web hooks 回调 */
router.post('/callback', function(req, res, next) {
    //res.render('index', { title: 'Express' });
    //console.log(req.body)

    var data = req.body;
    var id;

    console.log(data);
    if(data.payload){
        // bitbucket
        id = webHookHelpers.bitbucket(data);
    }else if(data.repository){
        // github
        id = webHookHelpers.github(data);
    }


    var task = rules[id];
    if(task){
        gwhCtrl.runTask(task.script, function(log){
            gwhCtrl.saveLog('## push event :' + id + '\n' + log);
            console.log(log);
        });
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


    var id = 'bitbucket_'+data.repository.owner + '_' + data.repository.name;
    //console.log(id);
    return id;
};

webHookHelpers.github = function(rawData){
    var data = rawData;
    var id = 'github_' + data.repository.owner.name + '_' + data.repository.name;
    return id;
};
