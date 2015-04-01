(function() {
	$('.startBtn').on('click', function(){
		startQuest();
	});
})();
var curStage = 0;

function startQuest() {
	nextStage(STAGES[curStage]);

	$('.startBtn').hide(0);
}


function nextStage(stage) {
	var level = $('#mainContent')[0];
	var door = $('#mainContent > .door')[0];

	$(level).css('background-image', 'url(' + stage.background + ')');
	$(door).css('background', stage.doorBackground);
	if( !($('.door:visible').length) ) {
		$(door).show(0);
		$(door).on('click', function() {
			curStage++;
			nextStage(STAGES[curStage]);
		});
	}
}


var next = (function() {
	var currentStage = 0;

	return function() {
		/*if there are no more stages show result view*/
		if(curStage > STAGES.length - 1) {
			endQuest();
			return;
		}
		var stage = STAGES[currentStage];
		var level = $('#mainContent')[0];
		var door = $('#mainContent > .door')[0];
		/*change backgrounds*/
		$(level).css('background-image', 'url(' + stage.background + ')');
		$(door).css('background', stage.doorBackground);
		/*change positions*/
	}
})();