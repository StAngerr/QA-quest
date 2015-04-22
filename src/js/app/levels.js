define(function(require) {
	var st1 = require('src/js/app/stages/stage1.js');
	var st2 = require('src/js/app/stages/stage2.js');
	var levels = [];

	levels.push(st1);
	levels.push(st2);
	
	return levels;
});