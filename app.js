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
					'question' : 'what is my name?',
					'answer' : 'dfhgjkdfhgkjfd'
				},
				{ 
					'question' : ' what is my color?',
					'answer' : 'green'
				}];
		var questionToSend = { 
					'question' : 'what is my name?',
					'letters' : ["a", "b", "c", "d", "e", "e", "e", "e", "e", "e"]
				};
		res.json({question: questionToSend});
	})  
	.post('/wordGame', function(req, res) {
		var word = req.body.word;

		res.status(200).end();
	});

	app.post('/pictureID', function(req, res) {
		res.status(200).end();
	});

app.listen('9009');

console.log('server is running 9009');