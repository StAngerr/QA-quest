define(function(require) {
    var Stage = require('src/js/Stage.js');    
    var stage1 = new Stage('stage1Tmpl.html');
    var $ = require('jquery');
    var DragNDrop = require('src/js/dragndrop.js');
    var wade = require('wade');
    var wordGameStatus = 'unfinished';
    var flowGameStatus = 'unfinished';
    var dragNdrop = new DragNDrop();
    var hero = $('#hero');

    stage1.initEvents = function() {
        $(hero).trigger('hero:initialPosition', {coordinates: {x : 30, y :  426}});
        $('#inventory').show();
        $('.door').on('click', moveToDoor);
    };
    
    stage1.finishStage = function() {
        $(hero).trigger('hero:clearHasComeEvent');
        $('#mainSection').trigger('main:stageFinished');
    };

    function moveToDoor() {
        var moveTo = 750;
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

        if(wordGameStatus == 'unfinished') {
            stage1.getTmpl('popupFrameTmpl.html').then(function(n) {
                stage1.getTmpl('stage1WordGameTmpl.html','.popup', stage_content, startWordGame);  
            });
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
        $(totalLevel).on('click', function() {  
            $(totalLevel).removeClass('blinkAnimation');
            if(flowGameStatus == 'unfinished') moveToBox();
        });
        wordGameStatus = 'finished';
        stage1.closePopup();  
    };

    function moveToBox() {
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
        flowGameStatus = 'finished';
        $('#inventory').trigger('inventory:addItem', {name:'.detail-2'});  
        $('.totalLevel').remove();   
    };
   return stage1;
});
