define(function(require) {
    var Stage = require('src/js/Stage.js');    
    var stage1 = new Stage('stage1Tmpl.html');
    var $ = require('jquery'); 
    var DragNDrop = require('src/js/dragndrop.js');
    var wade = require('wade');
    var dragNdrop = new DragNDrop();
    var hero = $('#hero');
    // these variables help us to control game appearance
    var isWordGameFinished = false;
    var isWordGameOpened = false;
    var isFlowGameOpened = false;
    var isFlowGameFinished = false;


    stage1.initEvents = function() {
                /*
            write to user obj that it is 1 stage now
        */
        stage1.setStage(1);
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
        if ((!isFlowGameFinished && isFlowGameOpened) ) return;
        isFlowGameOpened = true;
        if(checkPosition(moveTo)) {
            openFlowGame();
        } else {
            $(hero).trigger('hero:moveForward', {distance: moveTo});
            $(hero).on('hero:heroHasCome', openFlowGame);
        }
    };

    function checkPosition(posX) {
        var coordinateX = $(hero).css('transform').split(',')[4];

        if(coordinateX == posX) return true;
        return false; 
    };
/* start FLOW GAME*/
    function openFlowGame() {
        if(!isFlowGameFinished) {
            stage1.getTmpl('popupFrameTmpl.html').then(function() {
                stage1.getTmpl('stage1FlowGameTmpl.html', '.popup', null, addFlowGame);
            });
        } else {
            if(isWordGameFinished){
                if(!stage1.isStageFinished) finishStage();
            } else {
                return;
            }            
        }
    };

/* start WORD GAME*/
    function  startWordGame() { 
        var wordSpot = $('.makeWord')[0];
        var fieldToDrop = $('.all-letters')[0];

        dragNdrop.makeDragabble($('.letters'));
        dragNdrop.makeDroppable([fieldToDrop, wordSpot], addNewLetter);
         $('#sendWord').on('click', sendWord); 
        
        // create an observer instance
            var observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                console.log(mutation.type);
                console.log(mutation)
                if(mutation.type === 'childList') {
                    if(mutation.addedNodes.length > 0) {
                        $('#sendWord').prop('disabled', false)
                    }else {
                        $('#sendWord').prop('disabled', true)
                    }
                }
              });    
            });
             
            // configuration of the observer:
            var config = { childList: true };             
            // pass in the target node, as well as the observer options
            observer.observe(wordSpot, config);             
            // later, you can stop observing
            // observer.disconnect();
    };

    function addNewLetter (event) {
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
        var wordToSend = $('.makeWord').children().children('span').text();
        if(!wordToSend) {
            $('#sendWord').attr('disabled', true)
            return false;
        }
        stage1.closePopup();
        isWordGameFinished = true;
        $('#inventory').trigger('inventory:addItem', {name:'.detail-1'});  
        $('.door').addClass('transparentDoor');       
        $('#mainSection').trigger('main:saveTime');
        $.ajax({
            url: '/wordGame',
            method: 'POST',
            contentType: "application/json",
            data: JSON.stringify({word : wordToSend })
        });
    };

    function moveToBox() {        
        var stage_content = {};/*{
            letters : ['e', 'm', 'i', 'c', 'a', 't', 's', 'p', 'c', 'r']
        };  */     
        $.ajax({
            url: '/wordGame',
            method: 'GET'
        })
        .done(function(data) {
            stage_content = data.question;
            $(hero).trigger('hero:moveBack', {distance: 450});
            $(hero).trigger('hero:clearHasComeEvent');
            $(hero).on('hero:heroHasCome', function() {
            if (isWordGameFinished ) return;
            stage1.getTmpl('popupFrameTmpl.html').then(function(n) {
                stage1.getTmpl('stage1WordGameTmpl.html','.popup', stage_content, startWordGame); 
                $('.totalLevel').remove(); 
            });
        });
        })
        .fail(function(req, res) {

        });
       /* $(hero).trigger('hero:moveBack', {distance: 450});
        $(hero).trigger('hero:clearHasComeEvent');
        $(hero).on('hero:heroHasCome', function() {
            if (isWordGameFinished ) return;
            stage1.getTmpl('popupFrameTmpl.html').then(function(n) {
                stage1.getTmpl('stage1WordGameTmpl.html','.popup', stage_content, startWordGame); 
                $('.totalLevel').remove(); 
            });
        });        */
    };
        /* init FLOW GAME*/
    function addFlowGame() {
        isFlowGameOpened = true;
        $(hero).off('hero:heroHasCome');
        wade.init('src/js/flow.js');
        $('.popup').on('flowGameFinished', finishFlowGame); 
        $('.popup').addClass('fixForFlowGame');       
    };

    function finishFlowGame() {
        isFlowGameFinished = true;
        $('#inventory').trigger('inventory:addItem', {name:'.detail-2'}); 
        if($('.leafes')) $('.leafes').remove();
        var totalLevel = $('.totalLevel');
        $(totalLevel).addClass('blinkAnimation');
        $(totalLevel).on('click', function() {  
            $(totalLevel).removeClass('blinkAnimation');
            if(isFlowGameFinished) moveToBox();
        });    
        stage1.closePopup();       
    };
    return stage1;
});
