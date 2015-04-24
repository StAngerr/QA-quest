define(function (require) {
	var Quest = require('src/js/qaquest.js');
	var quest = new Quest();
	var $ = require('jquery');

	( checkLS() ) ? quest.startQuest() : $('.startBtn').on('click', quest.startQuest);
	function checkLS() {
		if(localStorage.getItem("currentStage")) {
			return true;
		} else {
			return false;
		}
	}
});



