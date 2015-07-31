var express = require('express');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

/*    */

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
	if(user) {
	
		//changeResult(JSON.stringify(user));
		res.json({ stage: user.stage })
	}
});
app.post('/setStage', function(req, res) {
		user.stage = req.body.stage;
		changeResult(JSON.stringify(user));
		res.status(200).end();
});

app.post('/gameResult', function(req, res) {
	var result = req.body.taskDone;
	var index = req.body.task;
	if(result === false) {
		user.sceneTasks[index] = false;
		changeResult(JSON.stringify(user));
		console.log(result)
	}
	/* do something */
	res.status(200).end();
});

/*temp place for global values 
and fs functions
*/
var user;
var userQuestion = {};
fs.readFile('./questions.json', 'utf-8', function(err, data) {
			if (err) return err;
			var question = JSON.parse(data);
			var index = Math.round(Math.min(question.length-1, Math.random()*10))
			
			userQuestion = question[index]
});
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
app
	.get('/wordGame', function(req, res) {
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
  	sendData = {
  		question: userQuestion.question,
  		letters: shuffle((userQuestion.answer).split(''))
  	}
		res.json({question: sendData});
	})
	.post('/wordGame', function(req, res) {
		var word = req.body.word;
		if(userQuestion.answer.toUpperCase() === word.toUpperCase()) {
			user.sceneTasks[0] = true;
		} else {
			// reduce 10%
			user.sceneTasks[0] = false;

		}
		// user.stage = 2;
		res.status(200).end();
	});

	app.post('/pictureID', function(req, res) {
		var id = 'picture4';
		if(req.body.picture !== id) {
			user.sceneTasks[1] = false;
		} else {
			user.sceneTasks[1] = true;
		}
		res.status(200).end();

	});

	app.get('/getCombination', function(req, res) {
		var ar = ['blueSquare','blueTriangle','yellowCircle']
		res.json({combination: ar});
	});

	app.get('/badge', function(req, res) {
		var result = getUserResult(user)
		var badge;
		if(result >= 90) {
			badge = {
					'title' : 'Sherlock',
					'src':'sherlock_180x180.png'
			}
		} else if(result >= 70 && result < 90) {
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
		
	});

function getUserResult(user) {
		var reduce = 0;
		 user.sceneTasks.map(function(answer) {
			if (answer == false) reduce ++;
		});
		 var result =  user.result - (10*reduce)
		 return result
}

app.listen('9009');

console.log('server is running 9009');