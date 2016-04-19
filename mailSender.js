var nodemailer = require('nodemailer');
var fs = require('fs');

var emailOptions = {
    service: 'Gmail',
    debug: true,
    auth: {
        user: 'questtestepam@gmail.com',
        pass: 'questTest123'
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
		    from: 'fenomenseed1@gamail.com',
		    to: address[i],
		    subject: 'QA quest',
		    html : '<table border="0" cellpadding="0" cellspacing="0" style="margin:0; padding:0"><tr><td style="border: 5px solid rgb(90,74,66); bgcolor: rgb(140,172,79); background: rgb(140,172,79); padding:50px"><center style="max-width: 480px; width: 100%;">'+
        '<table cellpadding="0" cellspacing="0" style="border: 1px solid rgb(90,74,66); margin:0; padding:0"><tr><td style="background: rgb(220,230,202); bgcolor: rgb(220,230,202); padding:20px"><div style=" font-family: \'MS Sans Serif\', Geneva, sans-serif; font-style:italic; font-size: 1.6em; line-height: 1.4em; text-align:center">'+
		    '<h3 style="color:rgb(226,95,93); font-size: 1.7em; text-align:center">Welcome to QAQuest!</h3> Hello,  '  + 
		     users[i].username + '. <br/><br/>Your account\'s all set up and you\'re ready to start discovering <br/> QAQuest game - just quickly verify your credentials to sign in: <p style="margin-left:15%; text-align:left;"><span style="color:rgb(226,95,93);">Username: </span> ' + 
		     users[i].username + '<br/><span style="color:rgb(226,95,93); ">Password: </span> ' + 
		     users[i].password + '</p> If you\'re heading out to explore, please,  <a href="#">follow the link</a>  <br/><br/> <br/>Have fun out there, <br/> The QAQuest Team</div></td></tr></table>'+
      '</center></td></tr></table>'
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
