define(function(require) {
    var Stage = require('src/js/app/Stage.js');    
    var stage1 = new Stage('stage1.html');
    var $ = require('jquery');
    var wade = require('wade');
    var word = 0; /* temp variable just to access  to stage 2*/
    var that;
    var counter = 0;

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
                $('#sendWord').on('click', showWord);
                /*Drag n drop*/
                var leafes = $('.letters');
                var wordSpot = $('.makeWord')[0];
                $('.letters').attr("draggable","true");
                wordSpot.addEventListener('dragover', allowDrop);
                wordSpot.addEventListener('drop', drop);
                for (var i = 0; i < leafes.length; i++) {
                    leafes[i].addEventListener("dragstart", drag);
                    leafes[i].addEventListener("dragover", over);
                    leafes[i].addEventListener("dragleave", leave);
                };
            });
        } else {
            stage1.finishStage();
        }       
    };

    stage1.finishStage = function() {
        $('#mainContent').trigger('main:stageFinished');
    }

    function showWord() {  
        $('.gun').show();
    };

    function sendDnDWord(event) {
        $('#stage1Popup1').remove();
        $('.popupWrap').remove();
        $('.door').css('opacity','1');
        $('.totalLevel').css({'display': 'block', 'opacity' : '1'});
        var myVar = setInterval(function() { 
            /*remove leafes*/
            if($('.leafes')) $('.leafes').remove();
            /*flashing box border animation*/
            $('.totalLevel').animate({'opacity': '1'}, 400, function() { $('.totalLevel').animate({'opacity' : '0'}, 400); } );
        }, 830);
        $('.totalLevel').on('click', function() {
            clearInterval(myVar);
            moveToBox();
        });
        $('.gun').removeClass('noItem').addClass('activeItem');
    };

    function moveToBox() {
        $('.popupWrap').remove();/*!!!*/
        $('.man').animate({'left' : '450'}, 1000, function() {
            $('.totalLevel').remove();
            stage1.getTmpl('popup.html');
            $('.popupWrap').append('<div id="wade_main_div" width="800" height="600" tabindex="1"></div>'); /* set sizes*/
            $('.popup').append('<button class="item battery"></button>');  
            wade.init('src/js/app/flow.js');
            $('.popup').on('click', closePopup); 
            $('.popup').on('flowGameFinished', finishFlowGame); 
        });
    };

    function finishFlowGame() {
         $('#wade_main_div').remove();
         $('.popup').append('<h1>game fineshed</h1>');
    };

    function closePopup(event) {
        $('.popupWrap').remove();
        $('.totalLevel').css({'opacity':'1'});
        $('.batteries').removeClass('noItem').addClass('activeItem');
    };

    function allowDrop(event) {
        event.preventDefault();
    };

    function drag(event) {      
        event.dataTransfer.setData('text/html', $(event.target).html()); 
        that = $(event.target);       
        return false;
    };

    function over(event) {
        event.preventDefault();
        that.css('opacity', '0.5');     
        return false;
    };

    function leave(event) {
        event.preventDefault();
        that.css('opacity', '1');
        $('.makeWord').css ('background-color', 'yellow');
        return false;       
    };

    function drop(event) {
        event.preventDefault();
        var data =  '<figure class="letters" ondragover="nodrop(event)"> '+ event.dataTransfer.getData('text/html') + '</figure>';
        var html =  $(event.target).html();
        $('.makeWord').css ('background-color', '#fff');
        word += that.children().text();   
        that.hide();
        counter ++;
        $(event.target).html(html + data); 
        if (counter === 10) {
            $('#sendWord').show();
            return false;
        }       
    };
   return stage1;
});

 