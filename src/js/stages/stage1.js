define(function(require) {
    var Stage = require('src/js/Stage.js');    
    var stage1 = new Stage('stage1Tmpl.html');
    var $ = require('jquery');
    var wade = require('wade');
    var wordGameStatus = 'unfinished';
    var manState = 'stand';
    var flowGameStatus = 'unfinished';
    var word = ''; /* temp variable just to access  to stage 2*/
    var that;
    var counter = 0;

    stage1.initEvents = function() {
        $('.door').on('click', function(event) {
            if(manState == 'stand') stage1.moveToDoor();
        });
    };

    stage1.moveToDoor = function() {
        changeManState(); 
        if($('.man').css('left') !== '750px') {
            $('.man').animate({'left' : '750'}, 2000, openWordGame);
        } else {
            openWordGame();
        }  
    };
    function openWordGame() {
        var stage_content = {
            taskDescription: 'Your task is to make a right word with all these letters. You should move them to text field',
            letters : ['e', 'm', 'i', 'c', 'a', 't', 's', 'p', 'c', 'r']
        }; 
        if(wordGameStatus == 'unfinished') {
            stage1.getTmpl('popupFrameTmpl.html');
            $('.popup').append('<button class="item gun"> </button>');
            stage1.getTmpl('stage1WordGameTmpl.html','.popup', stage_content);
            $('.item.gun').on('click', sendDnDWord);
            $('#sendWord').on('click', showWord);
            /*Drag n drop*/
            var leafes = $('.letters');
            var wordSpot = $('.makeWord')[0];
            var fieldToDrop = $('.all-letters')[0];
            $('.letters').attr("draggable","true");
            wordSpot.addEventListener('dragover', allowDrop);
            wordSpot.addEventListener('drop', function(event) {
                counter++;
                drop(event);                
                word += that.children().text();               
            });
            fieldToDrop.addEventListener('dragover', allowDrop);
            fieldToDrop.addEventListener('drop', function(event){
                counter --;
                drop(event);                      
                word =  $('.makeWord').children().children(1).text();             
            });
              
            for (var i = 0; i < leafes.length; i++) {
                leafes[i].addEventListener("dragstart", drag);
                leafes[i].addEventListener("dragover", over);
                leafes[i].addEventListener("dragleave", leave);
            };
            changeManState();
        } else {
            stage1.finishStage();
        }
    };

    stage1.finishStage = function() {
        $('#mainSection').trigger('main:stageFinished');
    };

    function showWord() {  
        $('.gun').show();
    };

    function sendDnDWord(event) {
        $('#stage1Popup1').remove();
        $('.popupWrap').remove();
        $('.door').css('opacity','0');
        $('.totalLevel').css({'display': 'block', 'opacity' : '1'});
        var myVar = setInterval(function() { 
            /*remove leafes*/
            if($('.leafes')) $('.leafes').remove();
            /*flashing box border animation*/
            $('.totalLevel').animate({'opacity': '1'}, 400, function() { $('.totalLevel').animate({'opacity' : '0'}, 400); } );
        }, 830);
        $('.totalLevel').on('click', function() {
            clearInterval(myVar);
           if(manState == 'stand' && flowGameStatus == 'unfinished') moveToBox();
        });
        $('#inventory').trigger('inventory:addGun');
        wordGameStatus = 'finished';
    };

    function moveToBox() {
        changeManState();
        $('.popupWrap').remove();/*!!!*/
        $('.man').animate({'left' : '450'}, 1000, function() {
            $('.totalLevel').remove();
            stage1.getTmpl('popupFrameTmpl.html');
            $('.popupWrap').append('<div id="wade_main_div" width="800" height="600" tabindex="1"></div>'); /* set sizes*/
            $('.popup').append('<button class="item battery"></button>');  
            wade.init('src/js/flow.js');
            $('.popup').on('click', closePopup); 
            $('.popup').on('flowGameFinished', finishFlowGame); 
            changeManState();
        });
    };

    function finishFlowGame() {
         $('#wade_main_div').remove();
         $('.popup').append('<h1>game fineshed</h1>');
         flowGameStatus = 'finished';
    };

    function closePopup(event) {
        $('.popupWrap').remove();
        $('.totalLevel').css({'opacity':'1'});
        $('#inventory').trigger('inventory:addBatteries');
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
        var data =  '<figure class="letters" draggable="true"> ' + event.dataTransfer.getData('text/html') + '</figure>';
        var html =  $(event.target).html();
        $('.makeWord').css ('background-color', '#fff');           
        that.remove();
        $(event.target).html(html + data); 
         var leafes = $('.letters');
          for (var i = 0; i < leafes.length; i++) {
                leafes[i].addEventListener("dragstart", drag);
                leafes[i].addEventListener("dragover", over);
                leafes[i].addEventListener("dragleave", leave);
            };
        if (counter === 10) {          
            $('#sendWord').show();
            return false;
        }       
    };

    function changeManState() {
        (manState == 'stand') ? manState = 'moving' : manState = 'stand';
    };

   return stage1;
});
