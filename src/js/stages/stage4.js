define(function(require) {
    var Stage = require('src/js/Stage.js');    
    var stage4 = new Stage('stage4Tmpl.html');
    var $ = require('jquery');
    require('jqueryUi');

    stage4.initEvents = function() {
    	 $('#inventory').show();
    	 $('#hero').hide();
    	/* its temporarily until standard control is not define*/
    	var dotGame = new ClickOnDotGame();
    	$('.startGameBtn').on('click', dotGame.startClickGame);
		/*------------------------------------------*/
    };
    function ClickOnDotGame() {
    	var singleGameTime = 3;
		var points = 0;
		var seconds = singleGameTime;
		var totalTime = 1; /*this for reduce total second that adding when click on green dot*/
		var maxLeftCoordinate = 410;
		var maxTopCoordinate = 510;
		/*intervals*/
		var gameTime;

		this.startClickGame = function() {
			onGameInterface();
			createNewDot();
			showVisualization();
			gameTime = setInterval(function() {
				seconds -= 0.1;
				if( seconds <= 0) { 
					clearInterval(gameTime);
					finishGame();
				}
			}, 100);
		};

		function clearVisualTimer() {
			$('.visualTimer').removeClass('addAnimation').removeClass('scaleToZero');
		};

		function showVisualization() {
			$('.visualTimer').hide("scale", {percent: 0, direction: 'horizontal'}, (seconds.toFixed(2) * 1000));
		};

		function resetVisual() {
			$('.visualTimer').stop(true,true).css({'display' : 'block'});
			showVisualization();

		};

		function onGameInterface() {
			$('.playGround > *').remove();
			$('.startGameBtn').addClass('closeBlock');
			$('.clickCounter').removeClass('closeBlock');
			$('.timer').removeClass('closeBlock');
		};

		function onInfoInterface() {
			$('.playGround > *').remove();
			$('.startGameBtn').removeClass('closeBlock');
			$('.clickCounter').addClass('closeBlock');
			$('.timer').addClass('closeBlock');
		};

		function finishGame() {
			onInfoInterface();
			showResults(points);
			clearInterval(gameTime);
			resetTimerAndPoints();
			updatePoints(points);
		};

		function showResults(points) {
			var resultBlock = '<div class="gameResults"><p> Your points: ' + points + '</p></div>';
			$('.playGround').append(resultBlock);
		};

		function resetTimerAndPoints() {
			seconds = singleGameTime;
			points = 0;
			totalTime = 1;
		};

		function createNewDot() {
			if ($('.fakeDot').length) $('.fakeDot').remove();
			var dot = $('<div class="dot"></div>');
			var randomTop = Math.floor( Math.random() * maxTopCoordinate );
			var randomLeft = Math.floor( Math.random() * maxLeftCoordinate );

			$(dot).css({'transform' : 'translate(' + randomLeft + 'px,' + randomTop +'px)' });
			$(dot).on('click', dotClick);	
			$('.playGround').append(dot);
			createTotalDots();
		};

		function createTotalDots() {
			var random = Math.floor( (Math.random() * 100) + 1 );
			var fakeDotsCount = Math.floor( (Math.random() * 100) + 1);
			var dots = (fakeDotsCount < 50) ?  dots = 1 : dots = 2;

			for (var i = 0; i < dots; i++) {
				if (points > 0 && points <= 5) {
					if(random <= 5) createFakeDots(' 5');
				} else if(points <= 10 ) {
					if(random <= 25  ) createFakeDots(' 25');
				} else if(points <= 30) {
					if(random <= 50) createFakeDots('50');
				} else {
					if(random <= 70) createFakeDots('70'); 
				}
			}
		};

		function createFakeDots(perc) {
			var fakeDot = $('<div class="fakeDot"></div>');
			var randomTop = Math.floor( Math.random() * maxTopCoordinate);
			var randomLeft = Math.floor( Math.random() * maxLeftCoordinate);
			var coordinates = correctCoordinates(randomTop, randomLeft);

			$(fakeDot).css({'transform' : 'translate(' + coordinates.left + 'px,' + coordinates.top +'px)' });
			$(fakeDot).on('click', fakeClick);
			decorateFakeDot(fakeDot);
			$('.playGround').append(fakeDot);
		};

		function correctCoordinates(top, left) {
			var realDot = $('.dot');
			var fakeDot = $('.fakeDot');

			switch(chekOnImposition(top, left, realDot)) {
				case 1: 
					((top + 70) > maxTopCoordinate) ? top -= 140 : top += 70;
					break;
				case 2:
					((top + 70) > maxTopCoordinate) ? top -= 140 : top += 70;
				break;
				case 3:
					((top + 140) > maxTopCoordinate) ? top -= 70 : top += 140;
				break;
				case 4:
					((top + 140) > maxTopCoordinate) ? top -= 70 : top += 140;
				break;
			}
			if(fakeDot.length && chekOnImposition(top, left, fakeDot)) {
				var correctState; 

				((left + 160) > maxLeftCoordinate) ? left -= 160 : left += 160;
				correctState = chekOnImposition(top, left, realDot);
				if(correctState == 1 || correctState == 2) ((top + 70) > maxTopCoordinate) ? top -= 140 : top += 70;
				if(correctState == 3 || correctState == 4) ((top + 140) > maxTopCoordinate) ? top -= 70 : top += 140;
			}
			return {
				top: top,
				left: left
			};
		};

		function chekOnImposition(top, left, dotToCompare) {
			var realDot = $('.dot');
			var fakeDot = $('.fakeDot');
			var comparingDotLeft =  parseInt( $(dotToCompare).css('transform').split(',')[4], 10); 
			var comparingDotTop = parseInt( $(dotToCompare).css('transform').split(',')[5], 10);
			var dotHeight = 70;
			var dotWidth = 70;
			var case1 = 1,   /* imposition cases*/
				case2 = 2,
				case3 = 3,
				case4 = 4;

			if(top > comparingDotTop && top < comparingDotTop + dotHeight) {
				if(left >= comparingDotLeft && left <= comparingDotLeft + dotWidth) {
					return case1	
				} else if(left +  dotWidth >= comparingDotLeft &&  left + dotWidth <= comparingDotLeft + dotWidth) {
					return case2
				}
			} else if(top + dotHeight > comparingDotTop && top + dotHeight < comparingDotTop + dotHeight) {
				if(left >= comparingDotLeft && left <= comparingDotLeft + dotWidth) {
					return case3
				} else if(left + dotWidth >= comparingDotLeft &&  left + dotWidth <= comparingDotLeft + dotWidth) {
					return case4
				}
			}
			return 0;		
		};

		function decorateFakeDot(dot) {
						/* yellow      blue        red         orange    */
			var colors = ['#FFDAB9', '#FFFFA3', '#E6E6FA', '#A4D3DB'];
			var randomColor = Math.floor( Math.random() * 4);
			var randomPicture = Math.floor( Math.random() * 4); 

			$(dot).css('background-color', colors[randomColor]);
		};

		function fakeClick() {
			var coordinates = {
				top: parseInt( $(this).css('transform').split(',')[5], 10),
			 	left: parseInt( $(this).css('transform').split(',')[4], 10)
			};
			seconds -= 0.2;
			showClickResult('-0.2 sec', coordinates);
			$(this).remove();
		};

		function removeDot() {
			$('.dot').remove();
		};

		function dotClick () {
			var min = 0.1;
			var max = 2;
			var coordinates = {
				top: parseInt( $(this).css('transform').split(',')[5], 10),
			 	left: parseInt( $(this).css('transform').split(',')[4], 10)
			 };

			(max - (totalTime / 10) > min) ? seconds += max - (totalTime / 10) : seconds += min;
			totalTime++;	
			showClickResult('+' + ((max - (totalTime / 10) > min) ? (max - (totalTime / 10)).toFixed(1) :  min) + ' sec', coordinates);
			removeDot();
			createNewDot();
			points++;	
			updatePoints(points);
			resetVisual();
		}; 

		function updatePoints(points) {
			$('.points').text(points);
		};

		function showClickResult(message, coordinates) {
			var block = '<div class="underDotMsg">' + message + '</div>';
			$('.playGround').append(block);
			$('.underDotMsg')
				.css({'top': coordinates.top + 'px', 'left': coordinates.left + 'px'})
				.animate({'top': coordinates.top - 10 + 'px'}, 300, function() {
					$('.underDotMsg').remove();
				});
		};
    };
    return stage4;
});