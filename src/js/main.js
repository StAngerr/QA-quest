 // function to get current stage

 $( document ).ready(function() {
/*start btn event*/
   
    var stage = localStorage.getItem('currentStage');

    $('.startBtn').on('click', startQuest);
    if(stage) next(stage);
    /*       flashlight*/
    /*turn on flashlight only if its second stage*/
    if (localStorage.getItem('currentStage') == 1) {
        turnOffTheLight();
        addFlashLightEvents();
    }
    
  });


var next = (function() {
    var currentStage = localStorage.getItem("currentStage") || -1;
	return function(stage) {
		/*if there are no more stages show result view*/
		if(currentStage >= STAGES.length - 1) {
			alert('end');
		//	endQuest();
			return;
		}
		stage ? currentStage = stage : currentStage++;
		// localstorage
		localStorage.setItem("currentStage", currentStage);

		var stageObj = STAGES[currentStage];
		var level = $('#mainContent')[0];
		clearMainContent();
		getTemplate(stageObj.template);
        getInventroy();
	}
})();

function getInventroy() {
    if(localStorage.getItem('active')) {
        var activeitems = JSON.parse(localStorage.getItem('active'));
        $.each(activeitems, function(index){
            $(activeitems[index]).removeClass('noItem').addClass('activeItem');
        });
    }
}

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