
var express = require('express');
var app = express();
var mysql = require('mysql');
var util = require('util');

var connection = mysql.createConnection({
    host: 'ec2-13-229-131-107.ap-southeast-1.compute.amazonaws.com',
    user: 'ninekoki',
    password: '1460110158',
    database: 'knightwarfareDB'
});

connection.connect(function (err) {
    if (err) {
        console.log('Error Connecting', err.stack);
        return;
    }
    console.log('Connected as id', connection.threadId);

});

app.get('/users',function(req,res){
    queryAllUser(function(err,result){
        res.end(result);
    });
});

app.get('/user/add/user', function (req, res) {
    
    var name = req.query.name;
    var password = req.query.pass;

    var user = [[name,password,0,0,0,0]];

    InsertUser(user,function(err,result){
        res.end(result);
    }); 
});

app.get('/user/update', function (req, res) {
    
    var name = req.query.name;
    var stage = parseInt(req.query.stage);
    var score = parseInt(req.query.score);

    UpdateScore(name,stage,score,function(err,result){
        res.end(result);
    }); 
});

app.get('/top10users', function (req, res) {
    queryTopTen(function(err,result){
        res.end(result);
    });
});

app.get('/login/:name/:password', function (req, res) {

    var name = req.params.name;
    var password = req.params.password;

    loginUser(function(err,result){
        res.end(result);
    }, name, password);
    
});

var server = app.listen(8081, function () {
    console.log('Server: Running');
});

function loginUser(callback, name, password) {

    var json = '';
    var sql = util.format('SELECT username,score1,score2,score3,savestate FROM user WHERE username = "%s" AND password = "%s"', name, password);
    connection.query(sql,
        function (err, rows, fields) {
            if (err) throw err;

            json = JSON.stringify(rows);

            callback(null, json);
        });
}

function InsertUser(user,callback) {

    var sql = 'insert into user(username, password, score1, score2, score2, savestate) values ?';

    connection.query(sql,[user],
        function (err) {

            var result = '[{"success":"true"}]'

            if (err){
                result = '[{"success":"false"}]'
                throw err;

            }

            callback(null, result);
        });
}

function UpdateScore(name, stage, score, callback){
    var sql = util.format('UPDATE user SET stage = %s, score = IF(score < %s, %s, score) WHERE username = "%s" AND stage <= %s', stage, score, score, name, stage);

    connection.query(sql,
        function (err) {

            var result = '[{"success":"true"}]'

            if (err){
                result = '[{"success":"false"}]'
                throw err;

            }

            callback(null, result);
        });
}

function queryTopTen(callback){
    var json = '';
    connection.query("SELECT username, stage, score FROM user ORDER BY stage DESC, score DESC LIMIT 10;",
        function (err, rows, fields) {
            if (err) throw err;

            json = JSON.stringify(rows);

            callback(null, json);
        });
}

function queryAllUser (callback)
{
    var json = '';
    connection.query('SELECT * FROM user',
    function (err, rows, fields)
    {
        if (err) throw err;
        
        json = JSON.stringify(rows);

        callback(null,json);
    });
}
