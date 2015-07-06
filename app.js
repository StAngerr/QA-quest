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


app
	.get('/wordGame', function(req, res) {
		var questions = [
				{
    "question":"The process of confirming that a component, system or person complies with its specified requirements, e.g., by passing an exam",
    "answer": "Certification"
  },
				{ 
					'question' : ' what is my color?',
					'answer' : 'green'
				}];
		var questionToSend = { 
					'question' : 'The process of confirming that a component, system or person complies with its specified requirements, e.g., by passing an exam',
					'letters' : ["i","r", "t", "c", "c", "e", "i", "a", "t", "i", "f", "n","o"]
				};
		res.json({question: questionToSend});
	})  
	.post('/wordGame', function(req, res) {
		var word = req.body.word;
		console.log(word);
		res.status(200).end();
	});

	app.post('/pictureID', function(req, res) {
		console.log(req.body.picture);
		res.status(200).end();
	});

app.listen('9009');

console.log('server is running 9009');