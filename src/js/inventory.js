define(function() {
	var Inventory = function() {
		this.activateItem = function(event, item) {
					 $(item).removeClass('noItem').addClass('activeItem');	 
		};

		// this.activateBatteries = function() {
		// 	 $('.battery').removeClass('noItem').addClass('activeItem');	 
		// };
		// this.activateGun = function() {
		// 			$('.gun').removeClass('noItem').addClass('activeItem');						
		// };

		// this.activateOil = function() {
		// 	$('.oil').removeClass('noItem').addClass('activeItem');				
		// };

		// this.activateJoyStick = function() {
		// 	$('.joystick').removeClass('noItem').addClass('activeItem');			
		// };
}
	return Inventory;
});

