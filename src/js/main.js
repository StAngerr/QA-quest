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
        this.getTmpl(this.templateUrl);
    };
    this.initEvents;
    this.getTmpl = function(tmplName, direction, dataToTempl) {
        $.ajax({
            url: 'src/templates/' + tmplName,
            method: 'GET',
            async: false,
            success: function( data ) {
                var target = direction || '#mainContent';
                var content = dataToTempl ? _.template(data, dataToTempl) : data;
                $(target).prepend(content);
            }
        });
    };
};

/* Stage 1 */
var stage1 = new Stage('stage1.html');

stage1.initEvents = function() {
    $('.door').on('click', function() {
        stage1.moveToDoor();
    });
};


stage1.moveToDoor = function() {
    var stage_content = {
            taskDescription: 'Your task is to make a right word with all these letters. You should move them to text field',
            letters : ['e', 'm', 'i', 'c', 'a', 't', 's', 'p', 'c', 'r']
    }; 
    if (!word) {
        $('.man').animate({'left' : '750'}, 2000, function() {
            stage1.getTmpl('popup.html');
            $('.popup').append('<button class="item gun"> </button>');
            stage1.getTmpl('task1.html','.popup', stage_content);
            $('.item.gun').on('click', sendDnDWord);

            return false;  /* what for ???/*/
        });
    } else {
        //localStorage.setItem('active', JSON.stringify(activeItems));
        //next();
    }

    function sendDnDWord(event) {
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
            $('.popupWrap').append('<div id="wade_main_div" width="800" height="600" tabindex="1"></div>'); /* set sizes*/
            $('.popup').append('<button class="item battery"></button>');  
            wade.init('flow.js');
            $('.popup').on('click',closePopup);  
        });
    }
    function closePopup(event) {
        $('.popupWrap').remove();
        $('.totalLevel').css({'opacity':'1'});
        $('.batteries').removeClass('noItem').addClass('activeItem');
        activeItems.push('.batteries'); 
    }
   
};


lvls.push(stage1);
/*     - - -- - - - - - - -- -*/