define(function(require) {
    var Stage = require('src/js/Stage.js');    
    var stage3 = new Stage('stage3Tmpl.html');
    var $ = require('jquery');
    var wade = require('wade');
    var hero = $('#hero');
    var isStickGameOpened = false;

    stage3.initEvents = function() {
    	/*
        
            stage3.setStage(3)
        */
    	stage3.setStage(3);
    	stage3.activeInventary(['.detail-1', '.detail-2', '.detail-3', '.detail-4']);
    	$(hero).trigger('hero:initialPosition', {coordinates: {x : 60, y :  456}});
    	$(hero).css ({height:'202px'});
      $('#inventory').show();
      $('#stage3').on('click', moveToRiver);
			$(mainSection).on('inventory:itemAdded', function(event, item) {
	    	if(item.name.indexOf('detail-6') !== -1) {
	        if(!stage3.isStageFinished)  finishStage();

	    	}
			});      
    };

    function finishStage() {
    	stage3.isStageFinished = true;
    	$('#mainSection').trigger('main:stageFinished'); 
    };

    function moveToRiver() {
    	if(isStickGameOpened) return;
    	isStickGameOpened = true;
        if (x <= 611 ) return false;
    	var x = event.pageX;
        var y = event.pageY;

		$(hero).trigger('hero:moveForward', {distance: 285});
		$(hero).on('hero:heroHasCome', openStickGame);    	
    }; 
/* start BUBBLES GAME*/
    function bubbleStart() {
      stage3.getTmpl('stage3Bubblestmpl.html','#stage3', null, initBubblesGame);
    };

    function initBubblesGame() {
      $('.bubbles-popup').hide();
      wade.init('src/js/lib/wade_src/bubbles.js');
    };
    
/* start STICK GAME*/
    function openStickGame() {
		stage3.getTmpl('popupFrameTmpl.html').then(function() {
			stage3.getTmpl('stage3SticksGameTmpl.html','.popup', null, newStickGame);
		});
    };

    function newStickGame() {
    	var newGame = new StickGame();
    	newGame.startGame();
		$('.pickStick').on('click', newGame.playerPicks);
    };

	function StickGame() {
		var currentGame = this;
		var attempts = 2;		
		currentGame.firstPlayer = {
			name : 'player',
			sticks : 0
		};
		currentGame.secondPlayer = {
			name : 'computer',
			sticks : 0
		};	
		currentGame.whoseTurn = currentGame.firstPlayer.name;
		
		currentGame.startGame = function() {
			currentGame.nextPick();
		};

		currentGame.nextPick = function() {		
			if( !(checkGameStatus()) ) {
				$('.pickStick').addClass('disabled') /*DELETE*/
				$('.pickStick').removeAttr('disabled'); /* REMOVE IT*/
	 			currentGame.finishGame();
				return;
			}
			if(currentGame.whoseTurn == 'computer') {
				currentGame.computerPicks();
			}
		};

		currentGame.finishGame = function() {
			var winner = (currentGame.whoseTurn == 'player') ? 'computer' : 'player';

			if(winner == 'computer' && attempts != 0) {
				printWhoWon(winner);
				var timer = setTimeout(function() {
					resetSticks();
					currentGame.startGame();
					attempts--;
				}, 1500);
				
			} else if(attempts == 0 || winner == 'player') {
				printWhoWon(winner);
		    	$('#inventory').trigger('inventory:addItem',{name:'.detail-5'});
		    	bubbleStart();
		    	$(hero).addClass('hideHero');
				setTimeout(function() {
					$('.popupWrap').remove();
					$('.bubbles-popup').show();
				}, 200);

				(winner == 'player') ? stage3.sendTaskResults(2, true) : stage3.sendTaskResults(2, false);
				 /*
        		how avoid this game repetition after page reload
        */
			}  
		};

		function resetSticks() {
			var allSticks = $('.stick');

			$('.stick').remove();
			$('.sticksSection > *').remove();
			$('.sticksSection').append(allSticks);
			currentGame.firstPlayer = {
				name : 'player',
				sticks : 0
			};
			currentGame.secondPlayer = {
				name : 'computer',
				sticks : 0
			};	
		};

		currentGame.playerPicks = function(event) {
			var sticks = event.target.name;
			if(canPick(sticks)) {
				currentGame.firstPlayer.sticks += parseInt(pickSticks(sticks));
				changeTurn();
				changeBtnState(); /*DELETE*/
				currentGame.nextPick();
			} else {
				alert('not enough sticks left');
			}
		};

		currentGame.computerPicks = function() {
			var max = 3;
			var min = 1;
			var sticks = Math.floor(Math.random() * max) + min;
			/*a little bit intellect  for computer. if left less than 3 sticks take them all*/
			var sticksLeft = $('#stickGameWrapp  .sticksSection  .stick').length;
			if(sticksLeft <= 3) {
				sticks = sticksLeft;
			} else if(sticksLeft <= 6) {
				switch(sticksLeft) {
					case 8: 
						sticks = 1;
						break;
					case 7:
						sticks = 3;
						break;
					case 6:
						sticks = 2;
						break;
					case 5: 
						sticks = 1;
						break;
				}
			}
			/* little pause when compute picks*/
			var compPickDelay = setTimeout(function() {
				currentGame.secondPlayer.sticks += pickSticks(sticks);
				changeTurn();
				currentGame.nextPick();
				clearTimeout(compPickDelay);
				changeBtnState(); /*DELETE*/
			}, 1000);
		};
			/* this function checks if is it a game end*/
		function checkGameStatus() {  
			var sticksLeft = $('#stickGameWrapp  .sticksSection  .stick').length;/* here must be strict path to sticks */
			if(sticksLeft) {
				return true;
			}
			return false;
		};

		function changeBtnState() {
			var buttons = $('.pickStick');

			if($(buttons).hasClass('disabled')) { /*disable with css !!!!!!!!! */
				$(buttons).removeAttr('disabled');
				$(buttons).removeClass('disabled');
			} else {
				$(buttons).attr('disabled','disabled');
				$(buttons).addClass('disabled');
			}
		};

		function changeTurn() {
			if(currentGame.whoseTurn == 'player') {
				currentGame.whoseTurn = currentGame.secondPlayer.name;
				visualizeTurn();	
			} else {
				currentGame.whoseTurn = currentGame.firstPlayer.name;
				visualizeTurn();
			}
		};

		function canPick(sticksCount) {
			var sticksLeft = $('#stickGameWrapp  .sticksSection  .stick').length;/* here must be strict path to sticks */
			
			if(sticksCount <= sticksLeft) {
				return true;
			}
			return false;
		};

		function pickSticks(sticksCount) {
			var sticksLeft = $('.mainSection .stick');

			for (var i = sticksCount; i >= 1; i--) {
				var curStick = $(sticksLeft[i - 1]);
				$(curStick).remove();
				addStickBlock(currentGame.whoseTurn, curStick);
			}
			return sticksCount;
		};

		function visualizeTurn() {
			if(currentGame.whoseTurn == 'player') {
				$('.cpuPlace').removeClass('activeCpu');
				$('.playerPlace').addClass('activePlayer');
			} else {
				$('.playerPlace').removeClass('activePlayer');
				$('.cpuPlace').addClass('activeCpu');
			}
		};

	

		function addStickBlock(player, stick) {
			var where = (player == 'player') ? '.playerPlace' : '.cpuPlace';
			$(where + ' > .pickedSticks').append(stick);
		};

		function printWhoWon(winner) {
			$('.sticksSection > *').remove();
			$('.sticksSection').append('<h1>' + winner  + ' won! </h1>');
		};
	};
    return stage3;
});