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
			if(data.stage != 0) {
				quest.startQuest(data.stage);
				$(hero).removeClass('hideHero'); 
			} else {
				$('.startBtn').on('click', function() {
					$(hero).removeClass('hideHero'); 
					clearTimeout(timer);
					quest.startQuest();
				});
				timer = setTimeout(function() {
					$(hero).removeClass('hideHero');
					quest.startQuest();
				}, 36000);
				return false;
			}
		})
		.fail(function(jqXHR, textStatus) {
			alert('Request failed:');
		});
	};		
	getStage();
});


/*




 Module name "jquery" has not been loaded yet for context: _. Use require([])





*/
