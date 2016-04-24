(function() {
    'use strict';

    var fsp  = require("q-io/fs"),
        accGenerator = {
            createUserInfoData: createUserInfoData,
            createAccounts: createAccounts,
            getAccounts: getAccounts
        },
        accounts = [];

    function getAccounts() {
        return accounts;
    }

    function createAccounts(address) {
        if(!address.length) return;

        for (var i = 0; i < address.length; i++) {
            var singleAccount = {};

            singleAccount.username = address[i].split('@')[0].toLowerCase();
            singleAccount.password = generatePassword();

            accounts.push(singleAccount);
        }
        return fsp.write('users/userAccounts.json', JSON.stringify(accounts));
    }

    function generatePassword() {
        var password = '';
        var passLength = Math.floor((Math.random() * (17 - 10)) + 10);
        var letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var numbers = '0123456789';

        for (var i = 0; i < passLength; i++) {
            if((Math.floor((Math.random() * 100) + 1)) <= 70) {
                password += numbers.charAt(Math.floor((Math.random() * 10)));
            } else {
                password += letters.charAt(Math.floor((Math.random() * 52)));
            }
        }

        return password;
    }

    function createUserInfoData() {
        var users = [];

        if (!accounts || !accounts.length) {
            console.error('No accounts.');
            return;
        }

        for (var i = 0; i < accounts.length; i++) {
            var singleUserObj = {};

            singleUserObj.username = accounts[i].username;
            singleUserObj.currentStage = 0;
            singleUserObj.gameData = {
                wordGame: {
                    data: '',
                    result: false
                },
                pictureGame: {
                    data: 'picture4',
                    result: false
                },
                bashe: {
                    data: '',
                    result: false
                },
                dotGame: {
                    data: '',
                    result: false
                },
                combination:{
                    data: '',
                    result: false
                }
            };

            users.push(singleUserObj);
        }

        return fsp.write('users/users.json', JSON.stringify(users));
    }

    module.exports = accGenerator;
})();