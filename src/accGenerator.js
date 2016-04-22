(function() {
    'use strict';


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



    function createUserInfoData(address) {
        var users = [];

        for (var i = 0; i < address.length; i++) {
            var singleUserObj = {};

            singleUserObj.username = address[i].split('@')[0].toLowerCase();
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

        fs.writeFile('users/users.json', JSON.stringify(users), function(err, data) {
            if (err) return err;
        });
    }

})();