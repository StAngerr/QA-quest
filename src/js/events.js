/* Level 1 events */
function openDoor(event) {
	moveToDoor();
}

function moveToDoor() {
	$('.man').animate({'left' : '750'}, 2000, function() {
		getTemplate('popup.html');
	});
}

function moveToBox() {

}

function sendMain() {
	$('.popupWrap').remove();
	$('.door').css('opacity','1');
	$('.totalLevel').css({'display': 'block', 'opacity':'1'});
	var myVar = setInterval(function(){ 
		$('.totalLevel').animate({'opacity': '1'}, 600, function() { $('.totalLevel').animate({'opacity' : '0'},600); } );
	}, 1230);

	$('.totalLevel').on('click', function() {
		clearInterval(myVar);
		/*man movement*/
		$('.man').animate({'left' : '450'}, 2000, function() {
			$('.totalLevel').css({'display': 'block', 'opacity':'1'});
			getTemplate('popup.html');
		});

	});
}

function closePopup() {
	$('.popupWrap').remove();
	$('.totalLevel').css({'opacity':'1'});
}
