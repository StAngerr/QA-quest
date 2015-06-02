define( function() {
	var $ = require('jquery');
	var DragNDrop = function () {
		that = this;        

		this.allowDrop = function(event) {          
		 	event.preventDefault();
		 	return false;
		};

		this.drag = function(event) {      
			event.dataTransfer.setData('text/html', $(event.target).html()); 
			that.data = $(event.target);         
			return false;
		};

	   this.over =  function (event) {
			event.preventDefault();        
			return false;
		};

	   this.leave =  function (event) {
			event.preventDefault();        
			return false;       
		};
	}
	return DragNDrop;
});