define(function(require) {
App = function() {
    var $ = require('jquery');

	this.init = function() {
        // load a scene
		wade.loadScene('scene1.wsc', true);
	};
}
	return App;
});