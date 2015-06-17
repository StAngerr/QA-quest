define(function (require) {
	var Character = function() {
		var positionX = 0;
		var positionY = 426;
		var hero = $('#hero');
		var animationTime = 1; /* seconds */

		this.moveForward = function(distance) {
			if(checkPosition(distance)) return;
			positionX = distance;
			$('#hero')
				.removeClass('stand-right')
				.removeClass('stand-left')
				.removeClass('move-right')   
				.removeClass('move-left'); 
			$('#hero').addClass('move-right');
			test(distance);
/*			$(hero).css('-webkit-transform', 'translate(' + distance + 'px, ' + positionY + 'px)');
			var timer = setTimeout(function() {
				$('#hero').removeClass('move-right').addClass('stand-right');
			
				clearTimeout(timer);
					hasСome();
			}, (animationTime * 1000) + 10);*/
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
			test1(distance);	 
/*			$(hero).css('-webkit-transform','translate(' + distance + 'px, ' + positionY + 'px)');
			var timer = setTimeout(function() {
				$('#hero').removeClass('move-left').addClass('stand-left');	 
				hasСome();
				clearTimeout(timer);
			}, (animationTime * 1200) + 50);*/
		};

		function test(distance) {
			var fps = 50;
			var timer = setInterval(some, 1000/fps);
			
			function some() {
				var curY = parseInt($(hero).css('transform').split(',')[5]);
				var curX = parseInt($(hero).css('transform').split(',')[4]);
				
				if(curX >= distance) {
					clearInterval(timer);
					$('#hero').removeClass('move-right').addClass('stand-right');
					hasСome();
					return;
				}
				$(hero).css('-webkit-transform', 'translate(' + (curX + 5) + 'px, ' + positionY + 'px)');	
			}
		};


		function test1(distance) {
			var fps = 50;
			var timer = setInterval(some, 1000/fps);
			
			function some() {
				var curY = parseInt($(hero).css('transform').split(',')[5]);
				var curX = parseInt($(hero).css('transform').split(',')[4]);
				
				if(curX <= distance) {
					clearInterval(timer);
					$('#hero').removeClass('move-right').addClass('stand-right');
					hasСome();
					return;
				}
				$(hero).css('-webkit-transform', 'translate(' + (curX - 5) + 'px, ' + positionY + 'px)');
			}
		};


		this.climbUp = function() {
			$('#hero')
				.removeClass('stand-right')
				.removeClass('stand-left')
				.removeClass('move-right')   
				.removeClass('move-left');
			$('#hero').addClass('climb-up');
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
			setTimeout(function() {
				$(hero).trigger('hero:heroHasCome');
			}, 600);
			
		};

		function checkPosition(posX) {
	        var coordinateX = $(hero).css('transform').split(',')[4];
	        if(coordinateX == posX) return true;
	        return false; 
    	};
	};
	return Character;
});