(function() {
    'use strict';

    var router = require('express').Router(),
        fs = require('fs'),
        path = require('path'),
        jsonToXls = require('json2xls');

    router.get('/manageStage', function(req, res) {
        res.sendFile('/dataMngLogin.temp.html', {root: __dirname + '../../public' });
    });

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
                        tempObj[key] = userData[key]
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
                dataToReturn.push(tempObj)
            }
            return dataToReturn;
        }
    });

    //dataManageView
    router.get('/dataManageView', function(req, res) {
        res.sendFile('dataManager.temp.html', {root: __dirname + path.normalize('../../public') });

    });

    router.get('/dataUsers', function(req, res) {
        res.sendFile('users/users.json', {root: __dirname + path.normalize('../../') });

    });
    module.exports = router;
})();