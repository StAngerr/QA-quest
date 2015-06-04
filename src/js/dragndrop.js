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
			if ($(event.target).nodeName !== 'FIGURE') {
				that.data = $(event.target).parent(); 
			} else{
				that.data = $(event.target)
			}
			 
			console.log(that.data)       
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
		this.drop = function(event) {
			event.preventDefault();
			
			if ($(event.target)[0].nodeName === 'DIV')  {
				$(event.target).html(that.data);
			} else {
				$(event.target).closest('div').html(that.data);				
			}       
		}
	}
	return DragNDrop;
});