define(function (require) {
	var Quest = require('src/js/app/qaquest.js');
	var quest = new Quest();
	var $ = require('jquery');

    $('.startBtn').on('click', function() {
        quest.startQuest();
    });
});
