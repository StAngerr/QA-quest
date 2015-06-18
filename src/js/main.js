define(function (require) {
	var $ = require('jquery');
	var Quest = require('src/js/Qaquest.js');
	var quest = new Quest();
	var hero = $('#hero');
	var timer;

	if(checkLS()) {
		$(hero).removeClass('hideHero'); 
		quest.startQuest()
	} else {
		$('.startBtn').on('click', function () {
			$(hero).removeClass('hideHero'); 
			clearTimeout(timer);
			quest.startQuest()
		});
	}
	
	function checkLS() {
		if(localStorage.getItem("currentStage")) {
			return true;
		} else {
			timer = setTimeout(function(){
				$(hero).removeClass('hideHero');
				quest.startQuest();
			}, 7000);
			return false;
		}
	};
});


/*




 Module name "jquery" has not been loaded yet for context: _. Use require([])





*/
