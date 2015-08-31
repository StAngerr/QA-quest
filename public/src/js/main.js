define(function (require) {
	var $ = require('jquery');
	var Quest = require('src/js/Qaquest.js');
	var quest = new Quest();
	var hero = $('#hero');
	var timer;

	$.ajax({
        url: 'src/templates/logForm.html',
        method: 'GET',
        success: function(data) {
            var target = '#mainContent';

            $('#mainContent').prepend(data);
            $('.loginBtn').on('click', newUser)
        }
    });

	function newUser(event) {
		event.preventDefault();
		var userName = $('.loginUsername')[0].value;
		var password = $('.loginPassword')[0].value;

		$.ajax({
	        url: '/newUser',
	        method: 'POST',
            contentType: "application/json",
			data: JSON.stringify({username : userName, password : password })
    	})
    	.done(function(data) {
    		var result = data;

    		if(result.isVerified) {
    			$('.popupWrap').remove();
    			$('.home').removeClass('hideHome');
				$('.loginPassword, .loginUsername').removeClass('failedValidation');
    			getStage();
    		} else {
  				$('.loginPassword, .loginUsername').addClass('failedValidation');
          return false;
    		}
        
    	});
	};

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

});


/*




 Module name "jquery" has not been loaded yet for context: _. Use require([])





*/
