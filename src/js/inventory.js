define(function() {
	var Inventory = function() {
		this.activateItem = function(event, item) {			
			$(item).removeClass('noItem').addClass('activeItem');	 
		};		
}
	return Inventory;
});