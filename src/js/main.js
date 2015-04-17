 // function to get current stage

 $( document ).ready(function() {
/*start btn event*/
   var quest = new Quest();

    var stage = localStorage.getItem('currentStage');

    $('.startBtn').on('click',function() {
        quest.startQuest();
    });
    //if(stage) next(stage);
    /*       flashlight*/
    /*turn on flashlight only if its second stage*/
   /* if (localStorage.getItem('currentStage') == 1) {
        turnOffTheLight();
        addFlashLightEvents();
    }*/
    
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



var lvls = [];



var Quest = function() {

    this.startQuest = function() {
        this.nextStage();
    }

    this.nextStage = function(stage) {
        var currentStage = localStorage.getItem("currentStage") || -1;
        if(currentStage >= STAGES.length - 1) {
            return;
        }
        stage ? currentStage = stage : currentStage++;
        localStorage.setItem("currentStage", currentStage);

        clearMainContent();       
        var st1 = lvls[0];
        st1.openStage();
        st1.initEvents();   
    }

    this.finishQuest = function() {

    }
};

var Stage = function(templ) {
    this.templateUrl = templ;

    this.openStage = function() {
        getTmpl(this.templateUrl);
    };

    this.initEvents;

    function getTmpl(tmplName) {
        $.ajax({
            url: 'src/templates/' + tmplName,
            method: 'GET',
            async: false,
            success: function( data ) {
                $('#mainContent').prepend(data);
            }
        });
    };
};


var stage1 = new Stage('stage1.html');


stage1.initEvents = function() {
    $('.door').on('click', function() {
        stage1.moveToDoor();
    });
};


stage1.moveToDoor = function() { 
    if (!word) {
        $('.man').animate({'left' : '750'}, 2000, function() {
        getTemplate('popup.html');
        $('.popup').append('<button class="item gun" onclick="sendMain(event)"></button>');
            appendPopupTask('task1.html');
            return false;
        });
    } else {
        //localStorage.setItem('active', JSON.stringify(activeItems));
        //next();
    }   
};


lvls.push(stage1);
