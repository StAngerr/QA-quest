define(function (require) {
	var $ = require('jquery'),
		timerCtrl = require('src/js/timerController.js'),
		Quest = require('src/js/Qaquest.js'),
		quest = new Quest(),
		hero = $('#hero'),
		timer;

	$.ajax({
        url: 'src/templates/logForm.html',
        method: 'GET',
        success: function(data) {
            var target = '#mainContent';

            $('#mainContent').prepend(data);
            $('.loginBtn').on('click', newUser)
        }
    });
      $(window).on('click', function(e) {
        if($('body').hasClass('disabledScene') && $('#coverBlock').length < 1) {
          location.reload();
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
				timerCtrl.getTimer().then(timerCtrl.startTimer);
				timerCtrl.pauseMode();
				// saves time value when the page is unload
				window.onbeforeunload = function(e) {
					timerCtrl.updateTimer();
				};

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
		});
	};		

});


/*




 Module name "jquery" has not been loaded yet for context: _. Use require([])





*/
