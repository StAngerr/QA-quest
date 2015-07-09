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
	var stage = 2;

	res.json({ stage: stage })
	//res.status(404).end();
});

app.post('/gameResult', function(req, res) {
	var result = req.body.taskDone;
	/* do something */
	//console.log(result);
	res.status(200).end();
});

/*temp place for global values 
and fs functions
*/
var user = {}
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
			//!!!!!!!!!!!!!!
			console.log(word + ' ok');
		} else {
			// reduce 10%
			user.result -= 10;
			changeResult(JSON.stringify(user));
		}
		
		res.status(200).end();
	});

	app.post('/pictureID', function(req, res) {
		var id = 4;
		if(req.body.picture !== id) {
			user.result -=10;
			changeResult(JSON.stringify(user));

		}
		res.status(200).end();
	});

app.listen('9009');

console.log('server is running 9009');