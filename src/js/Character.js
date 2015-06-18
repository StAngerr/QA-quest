define(function (require) {
	var Character = function() {
		var positionX = 0;
		var positionY = 426;
		var hero = $('#hero');
		var animationTime = 1; /* seconds */

		this.moveForward = function(distance) {
			if(checkPosition(distance)) return;
			clearClasses();
			$(hero).addClass('move-right');
			moveAnimation(distance);
		};	

		this.moveBack = function(distance) {
			if(checkPosition(distance)) return;
			clearClasses();
			$(hero).addClass('move-left');
			moveAnimation(distance);	 
		};

		function moveAnimation(distance) {
			var fps = 50;
			var forward = (distance > positionX) ? true : false;
			var timer = setInterval(animation, 1000 / fps);
			positionX = distance;

			function animation() {
				var curY = parseInt($(hero).css('transform').split(',')[5]);
				var curX = parseInt($(hero).css('transform').split(',')[4]);
				var step = (forward) ? curX + 5 : curX - 5;
				
				if( (forward && curX >= distance) || (!forward && curX <= distance)) {
					clearInterval(timer);
					clearClasses();
					(forward) ? $(hero).addClass('stand-right') : $(hero).addClass('stand-left');
					hasСome();
					return;
				}
				$(hero).css('-webkit-transform', 'translate(' + (step) + 'px, ' + positionY + 'px)');	
			};
		};

		function clearClasses() {
			var classList = $(hero).attr('class').split(/\s+/);
			var pattern = /stand-|move-/;
			
			$.each(classList, function(index, item){
				if(pattern.test(item)) $(hero).removeClass(item);
			});
		};

		this.climbUp = function() {
			clearClasses();
			$(hero).addClass('climb-up');
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