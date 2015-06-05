define(function() {
	var Inventory = function() {
		this.activateItem = function(event, item) {			
			$(item).removeClass('noItem').addClass('activeItem');	 
		};

		this.addItem = function(event, itemName) {
			var timeout;
			var module = $('#mainSection');
			
			$(itemName).addClass('addAnimation');
			timeout = setTimeout(function() {
				$(module).trigger('first:itemAdded', {name: itemName});
				clearTimeout(timeout);
			}, 2600);			
		};		
	}
	return Inventory;
});