define(function (require) {
	var Character = function() {
		var positionX = 0;
		var positionY = 426;
		var hero = $('#hero');
		var animationTime = 2; /* seconds */

		this.moveForward = function(distance) {
			if(checkPosition(distance)) return;
			positionX = distance;
			$('#hero')
				.removeClass('stand-right')
				.removeClass('stand-left')
				.removeClass('move-right')   
				.removeClass('move-left'); 
			$('#hero').addClass('move-right');
			$(hero).css('-webkit-transform', 'translate(' + distance + 'px, ' + positionY + 'px)');
			var timer = setTimeout(function() {
				$('#hero').removeClass('move-right').addClass('stand-right');
				hasСome();
				clearTimeout(timer);
			}, (animationTime * 500) + 10);
		};	

		this.moveBack = function(distance) {
			if(checkPosition(distance)) return;
			positionX = distance;
			$('#hero')
				.removeClass('stand-right')
				.removeClass('stand-left')
				.removeClass('move-right')   
				.removeClass('move-left');
			$('#hero').addClass('move-left');	 
			$(hero).css('-webkit-transform','translate(' + distance + 'px, ' + positionY + 'px)');
			var timer = setTimeout(function() {
				$('#hero').removeClass('move-left').addClass('stand-left');	 
				hasСome();
				clearTimeout(timer);
			}, (animationTime * 500) + 10);
		};

		this.climbUp = function() {
			$('#hero')
				.removeClass('stand-right')
				.removeClass('stand-left')
				.removeClass('move-right')   
				.removeClass('move-left');
			$('#hero').addClass('climb-up');
			console.log('X: ' + positionX, 'Y: ' + positionY);
			$(hero).css('-webkit-transform','translate(' + positionX + 'px, ' + 100 + 'px)');
			var timer = setTimeout(function() {
				hasСome();
				clearTimeout(timer);
			}, (animationTime * 1000) + 10);						
		};

		this.setStartPosition = function(coordinates) { 
			positionY = coordinates.y;
			positionX = coordinates.x;
			$(hero).addClass('animFix').css('-webkit-transform', 'translate(' + positionX + 'px, ' + positionY + 'px)');
			setTimeout(function() {
				$(hero).removeClass('animFix');	
			}, 10);	
		};

		this.clearHasComeEvent = function() {
			$(hero).off('hero:heroHasCome');
		};

		function hasСome() {
			$(hero).trigger('hero:heroHasCome');
		};

		function checkPosition(posX) {
	        var coordinateX = $(hero).css('transform').split(',')[4];
	        if(coordinateX == posX) return true;
	        return false; 
    	};
	};
	return Character;
});