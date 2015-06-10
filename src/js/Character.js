define(function (require) {
	var Character = function() {
		var positionX = 0;
		var positionY = 426;
		var hero = $('#hero');
		var animationTime = 2; /* seconds */

		this.moveForward = function(distance) {
			$(hero).css('-webkit-transform', 'translate(' + distance + 'px, ' + positionY + 'px)');
			var timer = setTimeout(function() {
				hasСome();
				clearTimeout(timer);
			}, (animationTime * 1000) + 10);
		};	

		this.moveBack = function(distance) {
			$(hero).css('-webkit-transform','translate(' + distance + 'px, ' + positionY + 'px)');
			var timer = setTimeout(function() {
				hasСome();
				clearTimeout(timer);
			}, (animationTime * 1000) + 10);
		};

		this.setStartPosition = function(coordinates) {
			positionY = coordinates.y;
			positionX = coordinates.x;
			$(hero).css('-webkit-transform', 'translate(' + positionX + 'px, ' + positionY + 'px)');
		};

		function hasСome() {
			$(hero).trigger('hero:heroHasCome');

		};
	};
	return Character;
});