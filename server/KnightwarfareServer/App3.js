
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
    var score1 = parseInt(req.query.score1);
    var score2 = parseInt(req.query.score2);
    var score3 = parseInt(req.query.score3);

    UpdateScore(name,stage,score1,score2,score3,function(err,result){
        res.end(result);
    }); 
});

app.get('/top10user1', function (req, res) {
    queryTopTen1(function(err,result){
        res.end(result);
    });
});

app.get('/top10user2', function (req, res) {
    queryTopTen2(function(err,result){
        res.end(result);
    });
});

app.get('/top10user3', function (req, res) {
    queryTopTen3(function(err,result){
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

    var sql = 'insert into user(username, password, score1, score2, score3, savestate) values ?';

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

function UpdateScore(name, stage, score1,score2,score3, callback){
    var sql = util.format('UPDATE user SET savestate = %s, score1 = IF(score1 < %s, %s, score1), score2 = IF(score2 < %s, %s, score2), score3 = IF(score3 < %s, %s, score3) WHERE username = "%s" AND savestate <= %s', stage, score1, score1, score2, score2, score3, score3, name, stage);

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

function queryTopTen1(callback){
    var json = '';
    connection.query("SELECT username, score1 FROM user ORDER BY score1 DESC LIMIT 10;",
        function (err, rows, fields) {
            if (err) throw err;

            json = JSON.stringify(rows);

            callback(null, json);
        });
}

function queryTopTen2(callback){
    var json = '';
    connection.query("SELECT username, score2 FROM user ORDER BY score2 DESC LIMIT 10;",
        function (err, rows, fields) {
            if (err) throw err;

            json = JSON.stringify(rows);

            callback(null, json);
        });
}

function queryTopTen3(callback){
    var json = '';
    connection.query("SELECT username, score3 FROM user ORDER BY score3 DESC LIMIT 10;",
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
