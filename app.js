var express = require('express');
var path = require('path');
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
	var stage = 0;

	res.json({ stage: stage })
	//res.status(404).end();
});

app.post('/gameResult', function(req, res) {
	var result = req.body.taskDone;
	/* do something */
	//console.log(result);
	res.status(200).end();
});

/*temp place for global values */
	var userQuestion = {};

//-----------------
app
	.get('/wordGame', function(req, res) {
				// read file and choose some object
		userQuestion = {
    "question":"The process of confirming that a component, system or person complies with its specified requirements, e.g., by passing an exam",
    "answer": "Certification"
  	};

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
			console.log(word + ' ok');
		} else {
			// reduce 10%
			console.log(word + ' no');
		}
		
		res.status(200).end();
	});

	app.post('/pictureID', function(req, res) {
		console.log(req.body.picture);
		res.status(200).end();
	});

app.listen('9009');

console.log('server is running 9009');