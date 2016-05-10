(function() {
    'use strict';

    var router = require('express').Router(),
        fs = require('fs');

        router.get('/getTimer', function(req, res) {
            fs.readFile('users/users.json', 'utf-8',function(err,  users) {
                if (err) console.log('error');
                var userName = req.cookies.userName;
                users = JSON.parse(users);
                for (var i = 0; i < users.length; i++) {
                    if (users[i].username == userName) {

                        res.json({timeSpent:  users[i].timeSpent});
                    }
                }
                res.end();
            });

    });

    router.put('/updateTimer', function(req, res) {
        fs.readFile('users/users.json', 'utf-8',function(err,  users) {
            if (err) console.log('error');
            var userName = req.cookies.userName;
            users = JSON.parse(users);
            for (var i = 0; i < users.length; i++) {
                if (users[i].username == userName) {
                    users[i].timeSpent = req.body.timeSpent;
                    fs.readFile('users/users.json', 'utf-8', function(err, data) {
                        if (err) console.log('error');
                        fs.writeFile('users/users.json', JSON.stringify(users), function(err, data) {
                            if (err) return err;
                        });
                    });
                }
            }
            res.end();
        });
    });

    module.exports = router;
})();