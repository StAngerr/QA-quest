define(function(require) {
	App = function() {
	    var $ = require('jquery');

		this.init = function() {
	        // load a scene
			wade.loadScene('scene1.wsc', true);
		};

		this.finish = function() {
			wade.stop();
			$('.bubbles-popup').remove();
			$('#inventory').trigger('inventory:addItem',{name:'.detail-6'}); 
		}	
	};
	return App;
});