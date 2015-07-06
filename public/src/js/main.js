define(function (require) {
	var $ = require('jquery');
	var Quest = require('src/js/Qaquest.js');
	var quest = new Quest();
	var hero = $('#hero');
	var timer;

	function getStage() {
		$.ajax({
			url: '/getStage',
			method: 'GET'
		})
		.done(function(data) {
			if(data.stage != 0)  {
				quest.startQuest(data.stage);
				$(hero).removeClass('hideHero'); 
			} else {
				$('.startBtn').on('click', function () {
					$(hero).removeClass('hideHero'); 
					clearTimeout(timer);
					quest.startQuest();
				});
			}
		})
		.fail(function(jqXHR, textStatus) {
			alert('Request failed:');
		});
	};		
	getStage();

	/*if(checkLS()) {
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
	};*/
});


/*




 Module name "jquery" has not been loaded yet for context: _. Use require([])





*/
