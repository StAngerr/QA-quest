function  openTotal(event) {
	$('.totalLevel').toogle();
}

function openDoor(event) {
	$('.door').css('opacity','1');

	setTimeout(function() {
		$('.totalLevel').toggle();
	}, 2000)
}
