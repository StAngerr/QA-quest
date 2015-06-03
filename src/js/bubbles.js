define(function(require) {
App = function() {
    var $ = require('jquery');

	this.init = function() {
        // load a scene
		wade.loadScene('scene1.wsc', true);
	};

	this.finish = function() {
		$('.bubbles-popup').remove();
		$('.detail-6').show();
    	setTimeout(function () {
    		 $('#inventory').trigger('inventory:addItem',{data:'.detail-6'}); 
    		$('#mainSection').trigger('main:stageFinished'); 
    	}, 2500);
    	 

	}
	
}
	return App;
});