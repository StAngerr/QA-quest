var express = require('express');
var path = require('path');
var fs = require('fs');
var sync = require('synchronize');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var jsonToXls = require('json2xls');
var app = express();
var mainRouter = require('./router/mainRouter.js');
var loginRouter = require('./router/loginRouter.js');
var accountManaging = require('./router/accountManaging.js');

sync(fs, 'readFile', 'writeFile');

app.use(cookieParser());
app.use(express.static(__dirname + path.normalize('/ui-app')));
app.use(bodyParser.json());

app.use(mainRouter);
app.use(loginRouter);
app.use(accountManaging);

app.use(function(req, res, next) {
	sync.fiber(next);
});




app
	.post('/time', function(req, res) {
		console.log(req.body.seconds);
		res.end();
	})
	.get('/time', function (req, res) {
		var  seconds = 0;
		res.json({seconds: seconds});
	});

app.listen('9009');
console.log('server is running 9009');