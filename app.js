var express = require('express');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var app = express();

app.use(cookieParser());
app.use(express.static(__dirname + path.normalize('/public')));
app.use(bodyParser.json());

app
	.post('/time', function(req, res) {
		console.log(req.body.seconds);
		res.end();
	})
	.get('/time', function (req, res) {
		var  seconds = 0;

		res.json({seconds: seconds});
	});

app.get('/getStage', function(req, res) {
	fs.readFile('users/users.json', 'utf-8', function(err, data) {
		if (err) console.log('error');		
		var users = JSON.parse(data);
		var userName = req.cookies.userName;

		for (var i = 0; i < users.length; i++) {
			if (users[i].username == userName) {
				res.json({ stage: users[i].currentStage });
			}
		}	
	});
});
app.post('/setStage', function(req, res) {
	fs.readFile('users/users.json', 'utf-8', function(err, data) {
		if (err) console.log('error');		
		var users = JSON.parse(data);
		var userName = req.cookies.userName;

		for (var i = 0; i < users.length; i++) {
			if (users[i].username == userName) {
				users[i].currentStage  = req.body.stage;
				fs.writeFile('users/users.json', JSON.stringify(users), function(err, data) {
					if (err) return err;
				});
			}
		}	
	});
	res.status(200).end();
});

app.post('/gameResult', function(req, res) {
	var userTaskDone = req.body.taskDone;
	console.log(userTaskDone)
	if(userTaskDone.result) {
		fs.readFile('users/users.json', 'utf-8', function(err, data) {
			if (err) console.log('error');		
			var users = JSON.parse(data);
			var userName = req.cookies.userName;

			for (var i = 0; i < users.length; i++) {
				if (users[i].username == userName) {
					 users[i].gameData[userTaskDone.game].result = true;
							
					fs.writeFile('users/users.json', JSON.stringify(users), function(err, data) {
						if (err) return err;
					});
				}
			}
			res.status(200).end();	
		});
	}
});

/*temp place for global values 
and fs functions
*/
var user;

fs.readFile('./fakeuser.json', 'utf-8', function(err, data) {
	if (err) return err;
	user = JSON.parse(data);
});

function changeResult(user) {
	fs.writeFile('./fakeuser.json', user, function(err, data) {
		if (err) return err;
	});
}
//----------------------------------




app	.get('/wordGame', function(req, res) {
		// maybe this function should be replaced?
	  	function shuffle(array) {
		    var counter = array.length, temp, index;
		    // While there are elements in the array
		    while (counter > 0) {
		        // Pick a random index
		        index = Math.floor(Math.random() * counter);
		        // Decrease counter by 1
		        counter--;
		        // And swap the last element with it
		        temp = array[counter];
		        array[counter] = array[index];
		        array[index] = temp;
		    }
		    return array;
		}
		var userQuestion = {};

		fs.readFile('./questions.json', 'utf-8', function(err, data) {
			if (err) return err;
			var question = JSON.parse(data);
			var index = Math.round(Math.min(question.length-1, Math.random() * 10));
			
			userQuestion = question[index]
		  	sendData = {
		  		question: userQuestion.question,
		  		letters: shuffle((userQuestion.answer).split(''))
		  	};
		  	fs.readFile('users/users.json', 'utf-8', function(err, data) {
				if (err) console.log('error');
				var users = JSON.parse(data);
				var userName = req.cookies.userName;

				for (var i = 0; i < users.length; i++) {
					if (users[i].username == userName) {
						users[i].gameData.wordGame.data = userQuestion.answer.toLowerCase();
						fs.writeFile('users/users.json', JSON.stringify(users), function(err, data) {
							if (err) return err;
						});
					}
				}	
			});
			res.json({question: sendData});
		});
	})
	.post('/wordGame', function(req, res) {
		var word = req.body.word;

		fs.readFile('users/users.json', 'utf-8', function(err, data) {
			if (err) console.log('error');		
			var users = JSON.parse(data);
			var userName = req.cookies.userName;
					console.log(word)
			for (var i = 0; i < users.length; i++) {
				if (users[i].username == userName) {
					if(word.toLowerCase() === users[i].gameData.wordGame.data) {
						users[i].gameData.wordGame.result = true;
						fs.writeFile('users/users.json', JSON.stringify(users), function(err, data) {
							if (err) return err;
						});
					} 
				}
			}
			res.status(200).end();	
		});
	});

app.post('/pictureID', function(req, res) {
	var id = 'picture4';
	if(req.body.picture == id) {
		fs.readFile('users/users.json', 'utf-8', function(err, data) {
			if (err) console.log('error');		
			var users = JSON.parse(data);
			var userName = req.cookies.userName;

			for (var i = 0; i < users.length; i++) {
				if (users[i].username == userName) {			
					users[i].gameData.pictureGame.result = true;
					fs.writeFile('users/users.json', JSON.stringify(users), function(err, data) {
						if (err) return err;
					});
				}
			}
			res.status(200).end();	
		});
	} 
});

var ar = ['blueSquare','blueTriangle','yellowCircle', 'yellowSquare']
app.get('/getCombination', function(req, res) {
		res.json({combination: ar});
});
app.post('/combination', function(req, res) {
	var result = false;
	var userCombination = req.body.combination;
	for (var i=0; i<userCombination.length;i++) {
		if(arr[i] !== userCombination[i]){
			return false
		} 
			result = true;
		
		
	}
})

app.get('/badge', function(req, res) {
	fs.readFile('users/users.json', 'utf-8', function(err, data) {
		if (err) console.log('error');		
		var users = JSON.parse(data);
		var userName = req.cookies.userName;
		var userResult = 100;
		for (var i = 0; i < users.length; i++) {
			if (users[i].username == userName) {
				 	
				 for (var key in users[i].gameData) {
 					if (key.result == false) {
 							userResult -= 10;
 					}
				}

			
				var badge;
				if(userResult >= 90) {
					badge = {
						'title' : 'Sherlock',
						'src':'sherlock_180x180.png'
					}
				} else if(userResult >= 70 && result < 90) {
					badge = {
						'title' : 'Expert',
						'src':'expert_180x180.png'
					}
				} else {
					badge = {
						'title' : 'Finder',
						'src':'finder_180x180.png'
					}
				}
				res.json({badge: badge});
			}
		}
		res.status(200).end();	
	});
});

/*Login functionality*/
var Deferred = require("promised-io/promise").Deferred;
app.
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
};

app.listen('9009');
console.log('server is running 9009');