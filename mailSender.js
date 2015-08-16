var nodemailer = require('nodemailer');
var fs = require('fs');

var emailOptions = {
    service: 'Gmail',
    debug: true,
    auth: {
        user: 'violet.infierno@gmail.com',
        pass: 'Sb5101EEqE1'
    }
};

function getAddress() {
	fs.readFile('emails/emails.txt', 'utf-8', function(err, data) {
		if (err) return err;
		var addressArray = data.split(/\r?\n/); 
		createAccounts(addressArray);
		createUserInfoData(addressArray);
	});
}

getAddress();


function sendEmails(address, users) {
	var transporter  = nodemailer.createTransport("SMTP", emailOptions);
	for (var i = 0; i < address.length; i++) {
		var email = {
		    from: 'violet.infierno@gmail.com',
		    to: address[i],
		    subject: 'QA quest',
		    html: '<div style="border: 2px solid #DDD; text-align: center;"><h1>Welcome!</h1>\nBro  :D\n <div>Your credentials:</div>\n <h3>Username: ' + users[i].username + '\n</h3><h3> Password: ' + users[i].password + '\n</h3></div>'
		};
		//transporter
		transporter.sendMail(email, function(error, info){
		    if(error){
		        return console.log(error);
		    }
			
		});	 
	}
	transporter.close();
}

function createAccounts(address) {
	var accounts = [];

	for (var i = 0; i < address.length; i++) {
		var singleAccount = {};

		singleAccount.username = address[i].split('@')[0].toLowerCase();
		singleAccount.password = generatePassword();

		accounts.push(singleAccount);
	}
	fs.writeFile('users/userAccounts.json', JSON.stringify(accounts), function(err, data) {
		if (err) return err;

		sendEmails(address, accounts);
	});
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
};

function createUserInfoData(address) {
	var users = [];

	for (var i = 0; i < address.length; i++) {
		var singleUserObj = {};
		
		singleUserObj.username = address[i].split('@')[0].toLowerCase();
		singleUserObj.currentStage = 0;
		singleUserObj.totalPoints = 100;

		users.push(singleUserObj);
	}

	fs.writeFile('users/users.json', JSON.stringify(users), function(err, data) {
		if (err) return err;
	});
}
