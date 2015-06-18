define(function() {
	var Inventory = function() {
		this.addItem = function(event, itemName) {
			var timeout;
			var module = $('#mainSection');
			
			$(itemName).addClass('addAnimation').removeClass('noItem');
			timeout = setTimeout(function() {
				$(module).trigger('inventory:itemAdded', {name: itemName});
				clearTimeout(timeout);
			}, 2600);			
		};

		this.addAllItemsAnimation = function() {
			var allItems = $('.itemIcon');

			$(allItems).removeClass('addAnimation');
			$(allItems).addClass('allToTopAnimation');
			setTimeout(function() {
				$(allItems).remove()
				closeInventory();
			}, 1300);
		};		
		
		function closeInventory() {
			$('#inventory').animate({'opacity':'0'}, 300, function() {
				$(this).remove();
			});
		};
	}
	return Inventory;
}); 