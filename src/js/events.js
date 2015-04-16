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
	} else {
		localStorage.setItem('active', JSON.stringify(activeItems));
		next();
	}	
}

function sendMain(event) {
	$('#stage1Popup1').remove();
	$('.popupWrap').remove();

	$('.door').css('opacity','1');
	$('.totalLevel').css({'display': 'block', 'opacity' : '1'});
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
}

function moveToBox() {
	$('.popupWrap').remove();/*!!!*/
	$('.man').animate({'left' : '450'}, 1000, function() {
		$('.totalLevel').remove();
		getTemplate('popup.html');
		$('.popupWrap').append('<div id="wade_main_div" width="800" height="600" tabindex="1"></div>');
		$('.popup').append('<button class="item battery" onclick="closePopup(event)"></button>');  
            wade.init('flow.js');  
	});
}

function finishGame() {
	 $('#wade_main_div').remove();
	 $('.popup').append('<h1>game fineshed</h1>');
}

function addBattaries() {
	setTimeout(function() {
		$('.itemContainer').animate({'background-color' : 'red'});
	}, 1500);
	$('.batteries').removeClass('noItem').addClass('activeItem');
}
function addGun() {
	setTimeout(function() {
		$('.itemContainer').animate({'background-color' : 'red'});
	}, 1500);
	$('.gun').removeClass('noItem').addClass('activeItem');
}

function closePopup(event) {
	$('.popupWrap').remove();
	$('.totalLevel').css({'opacity':'1'});
	//addBattaries()
	$('.batteries').removeClass('noItem').addClass('activeItem');
		activeItems.push('.batteries');

	
}


/*Stage 2*/


/*flashlight*/
function turnOffTheLight() {
	$('html').addClass('lightOff');		
	$('body').addClass('flashLight');
	$('body').append('<div class="flashLightShadow"></div>');
}

/*    Move events to flash light*/
function addFlashLightEvents() {
    $(document).mousemove(function(e) {
        $('body').css({'-webkit-clip-path' : 'circle(100px at ' + e.pageX + 'px ' + e.pageY + 'px)'});
        $('.flashLightShadow').css({'top': (e.pageY - 100) + 'px', 'left' : (e.pageX + 102) + 'px'});
    });
}
function removeFlashLightEvents() {
     $(document).off('mousemove');
     	$('html').removeClass('lightOff');		
	$('body').removeClass('flashLight');
	$('.flashLightShadow').remove();
}
/*    s*/
