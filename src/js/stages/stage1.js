define(function(require) {
    var Stage = require('src/js/Stage.js');    
    var stage1 = new Stage('stage1Tmpl.html');
    var $ = require('jquery');
    var DragNDrop = require('src/js/dragndrop.js');
    var wade = require('wade');
    var wordGameStatus = 'unfinished';
    var manState = 'stand';
    var flowGameStatus = 'unfinished';
    var word = ''; /* temp variable just to access  to stage 2*/
    var that;
    var counter = 0;

    stage1.initEvents = function() {
        $('#hero').show();
        $('#inventory').show();
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

    stage1.dragNdrop = new DragNDrop();

    function openWordGame() {
        var stage_content = {
            taskDescription: 'Your task is to make a right word with all these letters. You should move them to text field',
            letters : ['e', 'm', 'i', 'c', 'a', 't', 's', 'p', 'c', 'r']
        }; 
        if(wordGameStatus == 'unfinished') {
            stage1.getTmpl('popupFrameTmpl.html');

            stage1.getTmpl('stage1WordGameTmpl.html','.popup', stage_content, startWordGame);

            changeManState();
        } else {
            stage1.finishStage();
        }
    };

    function  startWordGame() {
        $('#sendWord').on('click', showWord);
        /*Drag n drop*/
        var leafes = $('.letters');
        var wordSpot = $('.makeWord')[0];
        var fieldToDrop = $('.all-letters')[0];
        $('.letters').attr("draggable","true");
        wordSpot.addEventListener('dragover', stage1.dragNdrop.allowDrop);
        wordSpot.addEventListener('drop', function(event) {                        
            stage1.dragNdrop.drop(event, addNewLetter); 
                 
        });
        fieldToDrop.addEventListener('dragover', stage1.dragNdrop.allowDrop);
        fieldToDrop.addEventListener('drop', function(event) {          
            stage1.dragNdrop.drop(event, addNewLetter);   
        });

        for (var i = 0; i < leafes.length; i++) {
            leafes[i].addEventListener("dragstart",stage1.dragNdrop.drag);
            leafes[i].addEventListener("dragover", stage1.dragNdrop.over);
            leafes[i].addEventListener("dragleave", stage1.dragNdrop.leave);
        };          
       
    };

    function addNewLetter () {
        that = stage1.dragNdrop.data;               
        if ($(event.target)[0].nodeName !== 'DIV') {
            var target = $(event.target).closest('div');

            if (target.html() !== '') {                   
                $(event.target).closest('div').append(that.context);                                                   
            } else {
                $(event.target).closest('div').html(that);
            }          
        } else if ($(event.target).html() !== '') {
            $(event.target).append(that.context);           
        }      
    };

    stage1.finishStage = function() {
        $('#mainSection').trigger('main:stageFinished');
    };

    function showWord() {  
        word =  $('.makeWord').children().children(1).text();        
        $('#stage1Popup1').remove();
        $('.popupWrap').remove();
        $('.detail-1').show();         
        sendDnDWord(); 
    };

    function sendDnDWord(event) {
        // add the first inventory
        $('#inventory').trigger('inventory:addItem', {name:'.detail-1'});  
        $('.item.detail-1').remove();
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
        wordGameStatus = 'finished';
    };

    function moveToBox() {
        changeManState();
        $('.popupWrap').remove();/*!!!*/
        $('.man').animate({'left' : '450'}, 1000, function() {
            $('.totalLevel').remove();
            stage1.getTmpl('popupFrameTmpl.html');
            stage1.getTmpl('stage1FlowGameTmpl.html', '.popup', null, addFlowGame);
            changeManState();
        });
    };

    function addFlowGame() {
        wade.init('src/js/flow.js');
        $('.popup').on('flowGameFinished', finishFlowGame); 
        $('.popup').addClass('fixForFlowGame');
    };

    function finishFlowGame() {
        $('#wade_main_div').remove();
        $('.popupWrap').remove();
        $('.detail-2').show();
        flowGameStatus = 'finished';
        closePopup(); 
    };

    function closePopup(event) {
        $('#inventory').trigger('inventory:addItem', {name:'.detail-2'});  
        $('.item.detail-2').remove();
        $('.totalLevel').css({'opacity':'1'});   
    };

  

    function changeManState() {
        (manState == 'stand') ? manState = 'moving' : manState = 'stand';
    };
   return stage1;
});
