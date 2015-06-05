define(function() {
	var Inventory = function() {
		this.activateItem = function(event, item) {			
			$(item).removeClass('noItem').addClass('activeItem');	 
		};

		this.addItem = function(event, itemName) {
			var timeout;
			
			$(itemName).addClass('addAnimation');
			timeout = setTimeout(function() {
				$('#mainContent').trigger('main:itemAdded', {name: itemName});
			}, 2100);
		};		
	}
	return Inventory;
});