(function() {
    'use strict';

    var router = require('express').Router(),
        fs = require('fs'),
        path = require('path'),
        url = require('url'),
        accGenerator = require('../accGenerator.js'),
        querystring = require('querystring'),
        jsonToXls = require('json2xls');

    router.get('/manageStage', function(req, res) {
        res.sendFile('/dataMngLogin.temp.html', {root: path.normalize(__dirname + '../../../ui-app')});
    });
    // make xls report
    // it'll be downloaded automatically

    router.use(jsonToXls.middleware);
    router.get('/report', function(req, res) {
        var json;
        fs.readFile('users/users.json', 'utf-8', function(err, data) {
            if (err) console.log('error');
            json = JSON.parse(data);
            var xls = jsonToXls(json2(json));
            fs.writeFileSync('qaQuestReport.xlsx', xls, 'binary');
            res.xls('qaQuestReport.xlsx', json2(json))
        });

        var json2 = function(arr){
            var dataToReturn = [];
            var res;
            for (var i = 0; i < arr.length; i++) {
                var userData = arr[i];
                res = 100;
                var tempObj = {};
                for (var key in userData) {
                    if( typeof(userData[key]) !== 'object') {
                        if(key === 'timeSpent') {
                            tempObj[key + ', s'] = parseInt(userData[key],10)/ 1000;
                        }else {
                            tempObj[key] = userData[key]
                        }
                        
                    }else {
                        for(var k in userData[key]) {
                            tempObj[k] = userData[key][k]['result'];
                            if(userData[key][k]['result'] === false){
                                res -= 10;
                            }
                        }
                    }
                }
                tempObj['points'] = res;
                if(tempObj.currentStage < 5){
                    tempObj.badge = "Not completed";
                }else {
                    if(res >= 90) {
                        tempObj.badge =  'Sherlock';
                    } else if(res >= 70 && res < 90) {
                        tempObj.badge =  'Expert';
                    } else {
                        tempObj.badge ='Finder';
                    }
                }

                dataToReturn.push(tempObj)
            }
            return dataToReturn;
        }
    });

    //dataManageView
    router.get('/dataManageView', function(req, res) {
        res.sendFile('dataManager.temp.html', {root: path.normalize(__dirname + '../../../ui-app') });

    });
    router.get('/resetResults', function(req, res) {
       fs.readFile('users/users.json', 'utf-8', function(err, data) {
                if (err) console.log('error');
                var users = JSON.parse(data);
                var userName = req.cookies.userName;
                for (var i = 0; i < users.length; i++) {
                    if (users[i].username == userName) {
                        users[i].timeSpent = 0;
                        for ( var key in users[i].gameData){
                            users[i].gameData[key].result = false;
                        }
                    }
                }
                fs.writeFile('users/users.json', JSON.stringify(users), function(err, data) {
                        if (err) return err;
                });
                res.status(200).end();
            });
    });

    router.get('/dataUsers', function(req, res) {
        res.sendFile('users/users.json', {root: path.normalize( __dirname + '../../../') });

    });

    router.get('/generateAccounts', function(req, res) {
        var params = querystring.parse((url).parse(req.url).query),
            accounts = '',
            sufix = '@example.com';

        if ( params.count && Number(params.count) && (Number(params.count) > 0  && params.count < 10e2 ) ) {
            for (var i = 0; i < params.count; i++) {
                accounts += generateRandomString() + sufix + '\r\n';
            }
            fs.writeFile('emails/emails.txt', accounts, function(err) {
                if( !err ) {
                    accGenerator.createAccounts(accounts.split(/\r?\n/))
                        .then(accGenerator.createUserInfoData);
                    res.end(params.count + ' accounts created');
                }
                res.end(err);
            });

        } else {
            res.end();
        }

        function generateRandomString() {
            var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
                min = 4,
                max = 16,
                str = '';

            for( var i =  0; i < Math.floor(Math.random() * (max - min) + min); i++ ) {
                str += letters.charAt(Math.floor(Math.random() * letters.length));
            }
            return str;
        }
    });
    module.exports = router;
})();