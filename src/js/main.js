define(function (require) {
	var Quest = require('src/js/qaquest.js');
	var quest = new Quest();
	var $ = require('jquery');
	var t;   /*   :D   */

	(checkLS()) ? quest.startQuest() : $('.startBtn').on('click', function () {
		clearTimeout(t);
		quest.startQuest()
	});
	function checkLS() {
		if(localStorage.getItem("currentStage")) {
			return true;
		} else {
			t = setTimeout(function(){
				quest.startQuest();
			}, 7000);
			return false;
		}
	};
});



