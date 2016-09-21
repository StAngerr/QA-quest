var nodemailer = require('nodemailer');
var fs = require('fs');
var accGenerator = require('./src/accGenerator.js');

var emailOptions = {
    service: 'Gmail',
    debug: true,
    auth: {
        user: 'questtestepam@gmail.com',
        pass: 'questTest123'
    },
	headers: {
		'Precedence': 'bulk'
	}
};

runNewSession();

function runNewSession() {
	fs.readFile('emails/emails.txt', 'utf-8', function(err, data) {
		if (err) return err;
		var addressArray = data.split(/\r?\n/);
		accGenerator.createAccounts(addressArray)
			.then(accGenerator.createUserInfoData)
			.then(function() {
				sendEmails(addressArray, accGenerator.getAccounts());

			});
	});
}

function sendEmails(address, users) {
	var transporter  = nodemailer.createTransport("SMTP", emailOptions);
	for (var i = 0; i < address.length; i++) {
		var email = {
		    from: 'QAQuest Team',
		    to: address[i],
		    subject: 'QA quest',
		    html : '<table border="0" cellpadding="0" cellspacing="0" style="margin:0; padding:0; font-size:12px; font-family: \'Noto Sans\', sans-serif;"><tr><td style="border: 5px solid \nrgb(90,74,66); bgcolor: rgb(140,172,79); background: rgb(140,172,79); padding:50px"><center style="max-width: 550px; width: 100%;">'+
        '<table cellpadding="0" cellspacing="0" style="border: 1px solid rgb(90,74,66); margin:0; padding:0"><tr><td style="background: rgb(220,230,202); bgcolor: rgb(220,230,202); padding: 20px 35px"><div style=" font-family: \'NotoSans Italic/Bold Italic\', Geneva, sans-serif; font-style:italic; color: rgb(90,74,66); font-size: 1.2em; line-height: 1.3em; text-align:center">'+
		    '<h3 style="color:rgb(226,95,93); font-size: 1.2em; text-align:center">Welcome to QAQuest!</h3> Hello,  '  + 
		     users[i].username + '. <br/><br/>Your account\'s all set up and you\'re ready to start discovering <br/> QAQuest game - just quickly verify your credentials to sign in: <p style="margin-left:15%; text-align:left;"><span style="color:rgb(226,95,93);">Username: </span> ' + 
		     users[i].username + '<br/><span style="color:rgb(226,95,93); ">Password: </span> ' + 
		     users[i].password + '</p> <p>If you\'re heading out to explore, please,  <a \n            href="http://epualvil0181.kyiv.epam.com:9009/">follow the \n        link</a></p>\n    <p style="color:rgb(226,95,93);">We recommend using Google Chrome browser while \n        playing</p><br/>\n    Have fun out there, <br/> The QAQuest Team</div></td></tr></table>'+
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