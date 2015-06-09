define(function(require) {
    var Stage = require('src/js/Stage.js');    
    var stage1 = new Stage('stage1Tmpl.html');
    var $ = require('jquery');
    var DragNDrop = require('src/js/dragndrop.js');
    var wade = require('wade');
    var wordGameStatus = 'unfinished';
    var flowGameStatus = 'unfinished';
    var dragNdrop = new DragNDrop();
    var manState = 'stand';

    stage1.initEvents = function() {
        $('#hero').show();
        $('#inventory').show();
        $('.door').on('click', function(event) {
            if(manState == 'stand') moveToDoor();
        });
    };
    
    stage1.finishStage = function() {
        $('#mainSection').trigger('main:stageFinished');
    };

    function moveToDoor() {
        changeManState(); 
        if($('.man').css('left') !== '750px') {
            $('.man').animate({'left' : '750'}, 2000, openWordGame);
        } else {
            openWordGame();
        }  
    };
    //stage1.dragNdrop = new DragNDrop();
    function openWordGame() {
        var stage_content = {
            letters : ['e', 'm', 'i', 'c', 'a', 't', 's', 'p', 'c', 'r']
        };

        if(wordGameStatus == 'unfinished') {
            stage1.getTmpl('popupFrameTmpl.html').then(function(n) {
                stage1.getTmpl('stage1WordGameTmpl.html','.popup', stage_content, startWordGame);  
            });   
            changeManState();
        } else {
            stage1.finishStage();
        }
    };

    function  startWordGame() {
        $('#sendWord').on('click', sendWord);
        var letters = $('.letters');
        var wordSpot = $('.makeWord')[0];
        var fieldToDrop = $('.all-letters')[0];

        $(letters).attr("draggable","true");
        wordSpot.addEventListener('dragover', dragNdrop.allowDrop);
        wordSpot.addEventListener('drop', function(event) {                        
            dragNdrop.drop(event, addNewLetter);      
        });
        fieldToDrop.addEventListener('dragover', dragNdrop.allowDrop);
        fieldToDrop.addEventListener('drop', function(event) {          
            dragNdrop.drop(event, addNewLetter);   
        });
        for (var i = 0; i < letters.length; i++) {
            letters[i].addEventListener("dragstart",dragNdrop.drag);
            letters[i].addEventListener("dragover", dragNdrop.over);
            letters[i].addEventListener("dragleave", dragNdrop.leave);
        };          
    };

    function addNewLetter () {
        var target = event.target;
        var data = dragNdrop.data; 

        if ($(target)[0].nodeName !== 'DIV') {
            if (target.html() !== '') {                   
                $(target).closest('div').append(data.context);                                                   
            } else {
                $(target).closest('div').html(data);
            }          
        } else if ($(target).html() !== '') {
            $(target).append(data.context);           
        }      
    };

    function sendWord(event) {
        var totalLevel = $('.totalLevel');

        $('#inventory').trigger('inventory:addItem', {name:'.detail-1'});  
        $('.door').addClass('transparentDoor');
        if($('.leafes')) $('.leafes').remove();
        $(totalLevel).addClass('blinkAnimation');
        $(totalLevel).on('click', function() {   /*   change man movement*/
            $(totalLevel).removeClass('blinkAnimation');
            if(manState == 'stand' && flowGameStatus == 'unfinished') moveToBox();
        });
        wordGameStatus = 'finished';
        stage1.closePopup();  
    };

    function moveToBox() {
        changeManState();
        $('.man').animate({'left' : '450'}, 1000, function() {
            stage1.getTmpl('popupFrameTmpl.html').then(function(n) {
                stage1.getTmpl('stage1FlowGameTmpl.html', '.popup', null, addFlowGame);
            });
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
        flowGameStatus = 'finished';
        $('#inventory').trigger('inventory:addItem', {name:'.detail-2'});  
        $('.totalLevel').remove();  
        stage1.closePopup();
    };

    function changeManState() {
        (manState == 'stand') ? manState = 'moving' : manState = 'stand';
    };
   return stage1;
});
