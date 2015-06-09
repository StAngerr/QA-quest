define(function (require) {
	var Character = function() {
		var positionX = 0;
		var positionY = 0;
		var hero = $('#hero');

		this.moveForward = function(coordinates) {
			
		};	

		this.moveBack = function() {

		};

		this.setStartPosition = function(coordinates) {
			positionY = coordinates.y;
			positionX = coordinates.x;
		};


		function hasСome() {
			var module = $('#mainSection');

			$(module).trigger('main:heroHasCome');
		};
	};
};