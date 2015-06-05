define(function() {
	var $ = require('jquery');
	var DragNDrop = function () {
		that = this;        

		this.allowDrop = function(event) {          
		 	event.preventDefault();
		 	return false;
		};

		this.drag = function(event) { 
			event.dataTransfer.setData('text/html', $(event.target).html()); 
			if ($(event.target)[0].nodeName !== 'FIGURE') {
				that.data = $(event.target).parent(); 
			} else{
				that.data = $(event.target);
			}		  
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

		this.drop = function(event, callback) {
			event.preventDefault();			
			if ($(event.target)[0].nodeName === 'DIV' && $(event.target).html() == '') {
				$(event.target).html(that.data);
			} else {
				callback();
				return false;		
			}       
		};
	}
	return DragNDrop;
});