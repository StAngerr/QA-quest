define(function() {
	var $ = require('jquery');
	var DragNDrop = function () {
		that = this;        

		this.makeDragabble = function (arr) {
			$(arr).each(function(index) {
				$(arr[index]).attr("draggable","true");
				arr[index].addEventListener('dragstart',that.drag);
        arr[index].addEventListener('dragover', that.over);
        arr[index].addEventListener('dragleave', that.leave);
			});
		};

		this.makeDroppable = function (arr, callback) {
			$(arr).each(function(index) {
				arr[index].addEventListener('dragover', that.allowDrop);
        arr[index].addEventListener('drop', function(event) {
        		that.drop(event, callback);
        });       
			});
		};

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
			var name = event.target.className;
			if (name === "field-to-drop" || name === "pictures-to-choose" || name === "makeWord" || name === "all-letters") {
				if ($(event.target)[0].nodeName === 'DIV' && $(event.target).html() == '') {
					$(event.target).html(that.data);
				} else {
					callback(event,that.data );
					return false;
				}
			}
		};
	}
	return DragNDrop;
});