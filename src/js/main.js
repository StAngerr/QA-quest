 // function to get current stage

 $( document ).ready(function() {
/*start btn event*/
    $('.startBtn').on('click', function() {
        startQuest();
    });

    if(!localStorage.getItem('currentStage')) {
    	return false;
    } else {
    	if(localStorage.getItem('active')) {
    		var activeitems = JSON.parse(localStorage.getItem('active'));
    		$.each(activeitems, function(index){
    				$(activeitems[index]).removeClass('noItem').addClass('activeItem');
    		});
    	}
    	clearMainContent();
    	getTemplate(STAGES[localStorage.getItem('currentStage')].template);
        /*       flashlight*/
        /*turn on flashlight only if its second stage*/
        if (localStorage.getItem('currentStage') == 1) {
            turnOffTheLight();
            addFlashLightEvents();
        }
    }
  });


var next = (function() {
    var currentStage = localStorage.getItem("currentStage") || -1;
	return function() {
		/*if there are no more stages show result view*/
		if(currentStage >= STAGES.length - 1) {
			alert('end');
		//	endQuest();
			return;
		}
		currentStage++;
		// localstorage
		localStorage.setItem("currentStage", currentStage);

		var stage = STAGES[currentStage];
		var level = $('#mainContent')[0];
		clearMainContent();
		getTemplate(stage.template);
	}
})();

function clearMainContent() {
	$('#mainContent').children().first().remove();
}

function startQuest() {
	next();
}

function getTemplate(tmplName) {
	var templUrl = 'src/templates/' + tmplName; 

	$.ajax({
        url: templUrl,
        method: 'GET',
        async: false,
        success: function(data) {
        	appendPopups(data);
        }
    });

    function appendPopups(content) {
    	$('#mainContent').prepend(content);
    }
}


