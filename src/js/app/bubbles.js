define(function(require) {
App1 = function() {
    var $ = require('jquery');
   
  


	this.init = function() {
        // load a scene
		wade.loadScene('scene1.wsc', true, function()
        {
            // the scene has been loaded, do something here
            alert('bubble');

        });
	};
}
	return App1;
});