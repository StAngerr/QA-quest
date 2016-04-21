(function() {
    'use strict';

    var router = require('express').Router(),
        Deferred = require("promised-io/promise").Deferred,
        fs = require('fs');

    router.
        post('/newUser', function(req, res) {
            var userName = req.body.username;
            var password = req.body.password;

            verifyUser(userName, password).then(function(verifyResult) {
                res.type('json');
                verifyResult ? res.cookie('userName', userName) : res.cookie('userName','guest');
                res.end(JSON.stringify({isVerified : verifyResult}));
            });
        });

        function verifyUser(login, pass) {
            var deferred = new Deferred();

            fs.readFile('users/userAccounts.json', 'utf-8', function(err, data) {
                if (err) console.log('error');
                var accounts = JSON.parse(data);

                for (var i = 0; i < accounts.length; i++) {
                    if(accounts[i].username == login && accounts[i].password == pass) {
                        deferred.resolve(true);
                        return;
                    }
                }
                deferred.resolve(false);
            });
            return deferred.promise;
        }
    module.exports = router;
})();

