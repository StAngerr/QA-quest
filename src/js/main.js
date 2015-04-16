 // function to get current stage

 $( document ).ready(function() {
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
        turnOffTheLight();
        $(document).mousemove(function(e) {
            $('body').css({'-webkit-clip-path' : 'circle(100px at ' + e.pageX + 'px ' + e.pageY + 'px)'});
            $('.MEGA1').css({'top': (e.pageY - 400) + 'px', 'left' : (e.pageX - 105) + 'px'});
        });
}
  });

(function() {
	$('.startBtn').on('click', function() {
		startQuest();
	});
})();


var currentStage = -1;
var next = (function() {
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



