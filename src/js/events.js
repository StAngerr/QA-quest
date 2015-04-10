/* Level 1 events */
var activeItems = [];
function moveToDoor() {	
	if (!word) {
		$('.man').animate({'left' : '750'}, 2000, function() {
		getTemplate('popup.html');
		$('.popup').append('<button class="item gun" onclick="sendMain(event)"></button>');
			appendPopupTask('task1.html');
			return false;
	});
	}	else {
		localStorage.setItem('active', JSON.stringify(activeItems));
		next();
	}	
}

function sendMain(event) {
	$('#stage1Popup1').remove();
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

	$('.gun').removeClass('noItem').addClass('activeItem');
			activeItems.push('.gun');
	

	
	 //addGun();
}

function moveToBox() {
	$('.man').animate({'left' : '450'}, 1000, function() {
		$('.totalLevel').remove();
		getTemplate('popup.html');
		$('.popup').append('<button class="item battery" onclick="closePopup(event)"></button>');
	});
}

// function addBattaries() {
// 	$('.batteries').removeClass('noItem').addClass('activeItem');

// }
// function addGun() {
// 	$('.gun').removeClass('noItem').addClass('activeItem');
// }
// function addOil() {
// 	$('.oil').removeClass('noItem').addClass('activeItem');

// }


function closePopup(event) {
	$('.popupWrap').remove();
	$('.totalLevel').css({'opacity':'1'});
	//addBattaries()
	$('.batteries').removeClass('noItem').addClass('activeItem');
		activeItems.push('.batteries');
	
}
