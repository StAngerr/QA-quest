/* Level 1 events */
function moveToDoor() {
	$('.man').animate({'left' : '750'}, 2000, function() {
		getTemplate('popup.html');
		$('.popup').append('<button class="item gun" onclick="sendMain()"></button>');
	});
}
function sendMain() {
	$('.popupWrap').remove();
	$('.door').css('opacity','1');
	$('.totalLevel').css({'display': 'block', 'opacity':'1'});
	var myVar = setInterval(function() { 
		/*remove leafes*/
		if($('.leafes')) $('.leafes').remove();
		/*flashing box border animation*/
		$('.totalLevel').animate({'opacity': '1'}, 400, function() { $('.totalLevel').animate({'opacity' : '0'},400); } );
	}, 830);

	$('.totalLevel').on('click', function() {
		clearInterval(myVar);
		moveToBox();
	});
	addGun();
}

function moveToBox() {
	$('.man').animate({'left' : '450'}, 1000, function() {
		$('.totalLevel').remove();
		getTemplate('popup.html');
		$('.popup').append('<button class="item battery" onclick="closePopup()"></button>');
	});
}

function addBattaries() {
	setTimeout($('.itemContainer').animate({'background-color' : 'red'}, 1500, function() {});
	$('.batteries').removeClass('noItem').addClass('activeItem');
}
function addGun() {
	setTimeout($('.itemContainer').animate({'background-color' : 'red'}, 1500);
	$('.gun').removeClass('noItem').addClass('activeItem');
}

function closePopup() {
	$('.popupWrap').remove();
	$('.totalLevel').css({'opacity':'1'});
	addBattaries();
}
