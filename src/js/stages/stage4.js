define(function(require) {
    var Stage = require('src/js/Stage.js');    
    var stage4 = new Stage('stage4Tmpl.html');
    var $ = require('jquery');
    require('jqueryUi');
    var isDotGameOpened = false;
    var hero = $('#hero');
    var cabinTimer;
    var is404Opened = false;
    var combination = [];


    stage4.initEvents = function() {
    	insideCabin();
    	$(hero).removeClass('hideHero');
    	$(hero).trigger('hero:initialPosition', {coordinates: {x : 50, y :  530}});
    	$('#inventory').show();
    	$('.ladder').on('click', moveToLadder);
    	$(mainSection).on('inventory:itemAdded', function(event, item) {
	    	if(item.name.indexOf('detail-7') !== -1) {
	    	$('#inventory').trigger('inventory:addAllItems'); 
	    	$('#mainSection').on('inventory:allItemsAdded', function() {
		       	$('.ladder').addClass('show-ladder');
	       		$('.ladder').on('click', climbUpToShip);   
	    	});
	      }
		}); 
    };

    function climbUpToShip() {
    	$(hero).trigger('hero:climbUp');
    	$(hero).on('hero:heroHasCome', insideCabin);
    };

    function stageFinished() {

    };

    function insideCabin() {
    	$(hero).addClass('hideHero');
			stage4.getTmpl('popupFrameTmpl.html').then(function() {
				$('.popupWrap').addClass('dark-bg')
				stage4.getTmpl('stage4BotCabinTmpl.html','.popup', null, start404Task);
		});	
	};
		
	function start404Task() {
		startTimer();
		$('.startButton').on('click', function() {
			if(!is404Opened) {
				load404Page();
			} else { 
				(checkCombination()) ? alert('Right combination') : alert('Wrong combination');
				loadFinalStage();
			}
		});
		$('.panelButton').on('click', function() {
			if($('.pressed').length == 4 && !$(this).hasClass('pressed')) return;
			($(this).hasClass('pressed')) ? removeForomCombination(this.id) : combination.push(this.id);
			$(this).toggleClass('pressed');
				switchOnLamp();
		});
		$('.popup-btn').on('click', function() {
			stage4.closePopup();
		});
		$('.close404Btn').on('click', function() {
			$('.error-page-frame').remove();
			$('.popup > .cabin > *').toggleClass('closeBlock');
			$('.cabin').toggleClass('hideCabin');
		});
	};

	function loadFinalStage() {
	  stage4.closePopup();
	  $('#stage4').remove();
	  stage4.getTmpl('finalStageTmpl.html','#mainContent', null);
 }
 
	function switchOnLamp () {
		var allLamps = $('.lamp');
		var len = $('.pressed').length
		for (var i=0; i<len; i++) {
			if(!$(allLamps[i]).hasClass('switch-on')) {
				$(allLamps[i]).toggleClass('switch-on')
			}
		}
	}

	function switchOffLamp () {
		var allLamps = $('.lamp');
		var len = $('.pressed').length
		for (var i=0; i<len; i++) { 	
			if($(allLamps[i]).hasClass('switch-on')) {
				$(allLamps[i]).toggleClass('switch-on')
			}
		}
	}

	function removeForomCombination(id) {
		var tempArray = [];

		for (var i = 0; i < combination.length; i++) {
			if(combination[i] != id) tempArray.push(combination[i]);
		}
		combination = tempArray.map(function(num) {
			return num;
		});
			switchOffLamp();
	};

	function checkCombination() {
		var someCombination = '0123';
		if(combination.join('') == someCombination) return true;
		return false;
	};

	function startTimer() {
		var generalTimeMinutes = 3;
		var generalTimeMS = generalTimeMinutes * 60 * 1000;
		var minutes = $('.timer > .minutes');
		var seconds = $('.timer > .seconds');
		var minutesLeftvar;
		var secondsLeft;

		cabinTimer = setInterval(function() {
			if(generalTimeMS == 0) {
				clearInterval(cabinTimer);
				stage4.closePopup();
			}
			minutesLeft = (generalTimeMS / 60000).toString()[0];
			secondsLeft = (generalTimeMS - (minutesLeft * 60000)) / 1000;
			$(minutes).text(minutesLeft);
			$(seconds).text(secondsLeft);
			generalTimeMS -= 1000;
		}, 1000);
	};

	function load404Page() {
		is404Opened = true;
		$('.popup > .cabin > *').toggleClass('closeBlock');
		$('.cabin').toggleClass('hideCabin');
		stage4.getTmpl('iframeWith404.html', '.popup');
	};

    function moveToLadder() {
			if(isDotGameOpened) return;
			isDotGameOpened = true;
			$(hero).trigger('hero:moveForward', {distance: 625});
			$(hero).on('hero:heroHasCome', loadDotGame);	
    };

    function loadDotGame() {
    	$(hero).trigger('hero:clearHasComeEvent');
			stage4.getTmpl('popupFrameTmpl.html').then(function() {
			stage4.getTmpl('stage4DotGameTmpl.html','.popup', null, startDotGame);
		});
    };

    function startDotGame() {
    	var dotGame = new ClickOnDotGame();

    	$('.startGameBtn, .retryBtn').on('click', dotGame.startClickGame); 
    };

    function ClickOnDotGame() {
    	var singleGameTime = 1;
			var points = 0;
			var seconds = singleGameTime;
			var totalTime = 1; /*this for reduce total second that adding when click on green dot*/
			var maxLeftCoordinate = 567;
			var maxTopCoordinate = 275;
			var minTop = 70; /*correction because there are stat-blocks on the top of game field*/
			/*intervals*/
			var gameTime;
			var attempts = 1;

			this.startClickGame = function() {
				onGameInterface();
				createNewDot();
				showVisualization();
				attempts--;
				gameTime = setInterval(function() {
					seconds -= 0.1;
					if( seconds <= 0) { 
						clearInterval(gameTime);
						if((points >= 30) || (attempts == 0)) {
							finishGame();
						} else {
							onInfoInterface();
							resetTimerAndPoints();
						}
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
			$('.visualTimer').stop(true, true).css({'display' : 'block'});	
		};

		function onGameInterface() {
			$('.playGround .gameResults').addClass('closeBlock');
			$('.playGround').removeClass('infoBackground');
			$('.startGameBtn').addClass('closeBlock');
			$('.retryBtn').addClass('closeBlock');
			$('.clickCounter').removeClass('closeBlock');
			$('.timer').removeClass('closeBlock');
			$('.attempts').addClass('closeBlock');
		};

		function onInfoInterface() {
			$('.playGround > .dot, .playGround > .fakeDot').remove();
			$('.playGround .gameResults').removeClass('closeBlock');
			$('.retryBtn').removeClass('closeBlock');
			$('.attempts').removeClass('closeBlock');
			$('.clickCounter').addClass('closeBlock');
			$('.timer').addClass('closeBlock');
		};

		function finishGame() {
			resetVisual();
			onInfoInterface();
			clearInterval(gameTime);
			resetTimerAndPoints();
			stage4.closePopup();
			$('#inventory').trigger('inventory:addItem', {name:'.detail-7'});
		};

		function resetTimerAndPoints() {
			resetVisual();
			seconds = singleGameTime;
			points = 0;
			totalTime = 1;
			$('.clickCounter .points').text(points);
			$('.attempts .attemptCount').text(attempts);
		};

		function createNewDot() {
			if ($('.fakeDot').length) $('.fakeDot').remove();
			var dot = $('<div class="dot"></div>');
			var randomTop = Math.floor( Math.random() * (maxTopCoordinate - minTop) + minTop);
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
			var randomTop = Math.floor( Math.random() * (maxTopCoordinate - minTop)) + minTop;
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
					((top + 50) > maxTopCoordinate) ? top -= 100 : top += 50;
					break;
				case 2:
					((top + 50) > maxTopCoordinate) ? top -= 100 : top += 50;
					break;
				case 3:
					((top + 100) > maxTopCoordinate) ? top -= 50 : top += 100;
					break;
				case 4:
					((top + 100) > maxTopCoordinate) ? top -= 50 : top += 100;
					break;
			}
			if(fakeDot.length && chekOnImposition(top, left, fakeDot)) {
				var correctState; 

				((left + 120) > maxLeftCoordinate) ? left -= 120 : left += 120;
				correctState = chekOnImposition(top, left, realDot);
				if(correctState == 1 || correctState == 2) ((top + 50) > maxTopCoordinate) ? top -= 100 : top += 50;
				if(correctState == 3 || correctState == 4) ((top + 100) > maxTopCoordinate) ? top -= 50 : top += 100;
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
			var dotHeight = 50;
			var dotWidth = 50;
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
			var colors = ['#e5d943', '#2dafbc', '#d95d5d', '#faae1a'];
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
			showVisualization();
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