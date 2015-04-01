(function() {
	$('.startBtn').on('click', function(){
		startQuest();
	});
})();
var next = (function() {
	var currentStage = -1;

	return function() {
		/*if there are no more stages show result view*/
		if(currentStage >= STAGES.length - 1) {
			alert('end');
		//	endQuest();
			return;
		}
		currentStage++;

		var stage = STAGES[currentStage];
		var level = $('#mainContent')[0];
		var door = $('#mainContent > .door')[0];
		/*change backgrounds*/
		$(level).css('background-image', 'url(' + stage.background + ')');
		$(door).css('background-image', 'url(' + stage.doorBackground + ')');
		/*add popups*/
		$('.popup').remove();
		if(stage.components.length) {
			for (var i = 0; i < stage.components.length; i++) getPopups(stage.components[i].tmplName);
		} 
	}
})();

function startQuest() {
	next();
	if( !($('.door:visible').length) ) {
		$('.door').show(0);
		$('.door').on('click', function() {
			next();
		});
	}
	$('.startBtn').remove();
}

function getPopups(popupName) {
	var templUrl = 'src/templates/' + popupName; 

	$.ajax({
        url: templUrl,
        method: 'GET',
        async: false,
        success: function(data) {
        	appendPopups(data);
        }
    });

    function appendPopups(content) {
    	$('#mainContent').append(content);
    }
}