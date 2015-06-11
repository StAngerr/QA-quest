define(function(require) {
    var Stage = require('src/js/Stage.js');    
    var stage1 = new Stage('stage1Tmpl.html');
    var $ = require('jquery');
    var DragNDrop = require('src/js/dragndrop.js');
    var wade = require('wade');
    var isWordGameFinished = false;
    var isWordGameOpened = false;
    var isFlowGameOpened = false;
    var dragNdrop = new DragNDrop();
    var hero = $('#hero');

    stage1.initEvents = function() {
        $(hero).trigger('hero:initialPosition', {coordinates: {x : 30, y :  426}});
        $('#inventory').show();
        $('.door').on('click', moveToDoor);
    };
    
     function finishStage() {
        stage1.isStageFinished = true;
        $(hero).trigger('hero:clearHasComeEvent');
        $('#mainSection').trigger('main:stageFinished');
    };

    function moveToDoor() {
        var moveTo = 750;
        
        if(isWordGameOpened && !isWordGameFinished) return;
        isWordGameOpened = true;
        if(checkPosition(moveTo)) {
            openWordGame();
        } else {
            $(hero).trigger('hero:moveForward', {distance: moveTo});
            $(hero).on('hero:heroHasCome', openWordGame);
        }
    };

    function checkPosition(posX) {
        var coordinateX = $(hero).css('transform').split(',')[4];

        if(coordinateX == posX) return true;
        return false; 
    };

    function openWordGame() {
        var stage_content = {
            letters : ['e', 'm', 'i', 'c', 'a', 't', 's', 'p', 'c', 'r']
        };

        if(!isWordGameFinished) {
            stage1.getTmpl('popupFrameTmpl.html').then(function() {
                stage1.getTmpl('stage1WordGameTmpl.html','.popup', stage_content, startWordGame);  
            });
        } else {
            if(!stage1.isStageFinished) finishStage();
        }
    };

    function  startWordGame() {
        $('#sendWord').on('click', sendWord);       
        var wordSpot = $('.makeWord')[0];
        var fieldToDrop = $('.all-letters')[0];

        dragNdrop.makeDragabble($('.letters'));
        dragNdrop.makeDroppable([fieldToDrop, wordSpot], addNewLetter);
    };

    function addNewLetter () {
        var target = event.target;
        var data = dragNdrop.data; 

        if ($(target)[0].nodeName !== 'DIV') {
            if ($(target).html() !== '') {                   
                $(target).closest('div').append(data.context);                                                   
            } else {
                return false;
            }          
        } else if ($(target).html() !== '') {
            $(target).append(data.context);           
        }      
    };

    function sendWord(event) {
        var totalLevel = $('.totalLevel');

        stage1.closePopup();
        isWordGameFinished = true;
        $('#inventory').trigger('inventory:addItem', {name:'.detail-1'});  
        $('.door').addClass('transparentDoor');
        if($('.leafes')) $('.leafes').remove();
        $(totalLevel).addClass('blinkAnimation');
        $(totalLevel).on('click', function() {  
            $(totalLevel).removeClass('blinkAnimation');
            if(!isFlowGameOpened) moveToBox();
        });    
    };

    function moveToBox() {
        isFlowGameOpened = true;
        $(hero).trigger('hero:moveBack', {distance: 450});
        $(hero).trigger('hero:clearHasComeEvent');
        $(hero).on('hero:heroHasCome', function() {
            stage1.getTmpl('popupFrameTmpl.html').then(function(n) {
                stage1.getTmpl('stage1FlowGameTmpl.html', '.popup', null, addFlowGame);
            });
        });
    };

    function addFlowGame() {
        $(hero).off('hero:heroHasCome');
        wade.init('src/js/flow.js');
        $('.popup').on('flowGameFinished', finishFlowGame); 
        $('.popup').addClass('fixForFlowGame');
    };

    function finishFlowGame() {
        stage1.closePopup();
        $('#inventory').trigger('inventory:addItem', {name:'.detail-2'});  
        $('.totalLevel').remove();   
    };
   return stage1;
});
