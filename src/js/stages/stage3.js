define(function(require) {
    var Stage = require('src/js/Stage.js');    
    var stage3 = new Stage('stage3Tmpl.html');
    var $ = require('jquery');
    var wade = require('wade');

    stage3.initEvents = function() {
    	/* it temporarily until standard control is not define*/
    		var heroChange = {
          left : '40px',
          top:'530px',
          height: '130px'
        };
        $('#hero').css( heroChange );
        $('#hero').show();
        $('#stage3').on('click', function(e){
        	var x = e.pageX;
          var y = e.pageY;

          if(x <= 811 ) return false;

          $('.man').animate({'left' : '285'}, 1300, function() {
          	stage3.getTmpl('popupFrameTmpl.html');
       			stage3.getTmpl('stage3SticksGameTmpl.html','.popup');
       			var newGame = new StickGame();
						newGame.startGame();
						$('.pickStick').on('click', newGame.playerPicks);
          });         	
        });
       
		/*------------------------------------------*/
    };

	function bubbleStart() {

		$('.popupWrap').remove();/*!!!*/ 
		  $('#stage3').append('<div class="bubbles-popup"><div id="wade_main_div" width="800" height="600" tabindex="1" margin="0"></div></div>'); /* set sizes*/
       wade.init('src/js/lib/wade_src/bubbles.js');      
    };

	function StickGame() {
		var currentGame = this;
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
			printWhoWon(winner);
			/*CHECK WHO IS WINNER*/
			
			setTimeout(function(){
				 bubbleStart();
				  //$('#mainSection').trigger('main:stageFinished');
			}, 1500);
		};

		currentGame.playerPicks = function(event) {
			var sticks = event.target.name;
			if(canPick(sticks)) {
				logPick(currentGame.whoseTurn, sticks);
				currentGame.firstPlayer.sticks += pickSticks(sticks);
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
				logPick(currentGame.whoseTurn, sticks);
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
			var sticksLeft = $('.stick');

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

		function logPick(player, sticks) {
			var who = (player == 'player') ? 'Player' : 'Computer';
			var message ='<p class="singleLog"><span class="log' + who + '">' + player + '</span> took ' + sticks + ((sticks == 1) ? ' stick' : ' sticks') + '.</p>'
			$('.logs').append(message);
		};

		function addStickBlock(player, stick) {
			var where = (player == 'player') ? '.playerPlace' : '.cpuPlace';
			$(where + ' > .pickedSticks').append(stick);
		};

		function printWhoWon(winner) {
			$('.sticksSection > *').remove();
			$('.sticksSection').append('<h1>' + winner  + ' won! </h1>')
		};
	};
    return stage3;
});