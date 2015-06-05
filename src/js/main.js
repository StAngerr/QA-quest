define(function (require) {
	var Quest = require('src/js/qaquest.js');
	var quest = new Quest();
	var $ = require('jquery');
	var timer;

	(checkLS()) ? quest.startQuest() : $('.startBtn').on('click', function () {
		clearTimeout(timer);
		quest.startQuest()
	});
	function checkLS() {
		if(localStorage.getItem("currentStage")) {
			return true;
		} else {
			timer = setTimeout(function(){
				quest.startQuest();
			}, 7000);
			return false;
		}
	};
});



