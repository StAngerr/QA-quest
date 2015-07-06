/*If you need to chancge something the best solution is to create a project on WADE console 
	and load scene from lib/wade_src
 	scene1.wsc is the main file for this game
*/
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