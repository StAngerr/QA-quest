define(function (require) {
	var Quest = require('src/js/app/qaquest.js');
	var quest = new Quest();
	var $ = require('jquery');
	QQQ('popup.html');
    $('.startBtn').on('click', function() {
        quest.startQuest();
    });
});


function QQQ(varr) {
	$.ajax({
        url: 'src/templates/' + varr,
        method: 'GET',
        async: false,
        success: function(data) {
            $('#mainContent').prepend(data);
            addGameField();
            $('#home').remove(); /* ATANTION !!!!! */
        }
    });
}

function addGameField() {
	$.ajax({
        url: 'src/templates/' + 'sticksGameTmpl.html',
        method: 'GET',
        async: false,
        success: function(data) {
            $('.popup').append(data);
            var newGame = new StickGame();
            newGame.startGame();
            $('.pickStick').on('click', newGame.playerPicks);
        }
    });
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
			currentGame.finishGame();
			return;
		}
		if(currentGame.whoseTurn == 'computer') {
			currentGame.computerPicks();
			
		}
	};

	currentGame.finishGame = function() {
		var winner = (currentGame.whoseTurn == 'player') ? 'computer' : 'player';
		alert(winner + ' won!');	
	};

	currentGame.playerPicks = function(event) {
		var sticks = event.target.name;
		if(canPick(sticks)) {
			logPick(currentGame.whoseTurn, sticks);
			currentGame.firstPlayer.sticks += pickSticks(sticks);
			changeTurn();
			currentGame.nextPick();
			//changeBtnState();
		} else {
			alert('not enough sticks left');
		}
	};

	currentGame.computerPicks = function() {
		var max = 3;
		var min = 1;
		var sticks = Math.floor(Math.random() * max) + min;
		/*loop  util computer will find need count of sticks*/
		while(!canPick(sticks)) {
			sticks = Math.floor(Math.random() * max--) + min;
		}
		/* little pause when compute picks*/
		var compPickDelay = setTimeout(function() {
			logPick(currentGame.whoseTurn, sticks);
			currentGame.secondPlayer.sticks += pickSticks(sticks);
			changeTurn();
			currentGame.nextPick();
			clearTimeout(compPickDelay);
		}, 1000);
	};
		/* this function checks if is it a game end*/
	function checkGameStatus() {  
		var sticksLeft = $('.stick').length;
		if(sticksLeft) {
			return true;
		}
		return false;
	}

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
			changeBtnState(); /*DELETE*/
			visualizeTurn();	
		} else {
			currentGame.whoseTurn = currentGame.firstPlayer.name;
			changeBtnState(); /*DELETE*/
			visualizeTurn();
		}
	};

	function canPick(sticksCount) {
		var sticksLeft = $('.stick').length;
		
		if(sticksCount <= sticksLeft) {
			return true;
		}
		return false;
	};

	function pickSticks(sticksCount) {
		var sticksLeft = $('.stick');

		for (var i = sticksCount; i >= 1; i--) {
			$(sticksLeft[i - 1]).remove();
			console.log('deleted')
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
		var message ='<p class="singleLog"><span class="log' + who + '">' + player + '</span> took ' + sticks + ' sticks.</p>'
		$('.logs').append(message);
	}

}; 


