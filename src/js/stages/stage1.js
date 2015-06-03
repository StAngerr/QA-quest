define(function (require) {
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

    stage1.initEvents = function () {
        $('#inventory').show();
        $('#hero').show();
        $('.door').on('click', function (event) {
            if (manState == 'stand') stage1.moveToDoor();
        });
    };

    stage1.moveToDoor = function () {
        changeManState();
        if ($('.man').css('left') !== '750px') {
            $('.man').animate({
                'left': '750'
            }, 2000, openWordGame);
        } else {
            openWordGame();
        }
    };

    stage1.dragNdrop = new DragNDrop();


    function openWordGame() {
        var stage_content = {
            taskDescription: 'Your task is to make a right word with all these letters. You should move them to text field',
            letters: ['e', 'm', 'i', 'c', 'a', 't', 's', 'p', 'c', 'r']
        };
        if (wordGameStatus == 'unfinished') {
            stage1.getTmpl('popupFrameTmpl.html');
            stage1.getTmpl('stage1WordGameTmpl.html', '.popup', stage_content);
            $('#sendWord').on('click', showWord);
            /*Drag n drop*/
            var leafes = $('.letters');
            var wordSpot = $('.makeWord')[0];
            var fieldToDrop = $('.all-letters')[0];
            $('.letters').attr("draggable", "true");
            wordSpot.addEventListener('dragover', stage1.dragNdrop.allowDrop);
            wordSpot.addEventListener('drop', function (event) {
                event.preventDefault();
                event.stopPropagation();
                counter++;
                drop(event);
                word += that.children().text();
                return false;

            });
            fieldToDrop.addEventListener('dragover', stage1.dragNdrop.allowDrop);
            fieldToDrop.addEventListener('drop', function (event) {

                event.preventDefault();
                event.stopPropagation();
                counter--;
                drop(event);
                word = $('.makeWord').children().children(1).text();
                return false;
            });

            for (var i = 0; i < leafes.length; i++) {
                leafes[i].addEventListener("dragstart", stage1.dragNdrop.drag);
                leafes[i].addEventListener("dragover", stage1.dragNdrop.over);
                leafes[i].addEventListener("dragleave", stage1.dragNdrop.leave);
            };
            changeManState();
        } else {
            stage1.finishStage();
        }
    };

    stage1.finishStage = function () {
        $('#mainSection').trigger('main:stageFinished');
    };

    function showWord() {
        $('#stage1Popup1').remove();
        $('.popupWrap').remove();
        $('.detail-1').show();
        setTimeout(sendDnDWord, 2000);


    };

    function sendDnDWord(event) {
        // add the first inventory
        $('#inventory').trigger('inventory:addItem', {
            data: '.detail-1'
        });
        $('.item.detail-1').remove();

        $('.door').css('opacity', '0');
        $('.totalLevel').css({
            'display': 'block',
            'opacity': '1'
        });
        var myVar = setInterval(function () {
            /*remove leafes*/
            if ($('.leafes')) $('.leafes').remove();
            /*flashing box border animation*/
            $('.totalLevel').animate({
                'opacity': '1'
            }, 400, function () {
                $('.totalLevel').animate({
                    'opacity': '0'
                }, 400);
            });
        }, 830);
        $('.totalLevel').on('click', function () {
            clearInterval(myVar);
            if (manState == 'stand' && flowGameStatus == 'unfinished') moveToBox();
        });

        wordGameStatus = 'finished';
    };

    function moveToBox() {
        changeManState();
        $('.popupWrap').remove(); /*!!!*/
        $('.man').animate({
            'left': '450'
        }, 1000, function () {
            $('.totalLevel').remove();
            stage1.getTmpl('popupFrameTmpl.html');
            $('.popupWrap').append('<div id="wade_main_div" width="800" height="600" tabindex="1"></div>'); /* set sizes*/
            wade.init('src/js/flow.js');
            $('.popup').on('flowGameFinished', finishFlowGame);
            changeManState();
        });
    };

    function finishFlowGame() {
        $('#wade_main_div').remove();
        $('.popupWrap').remove();
        $('.detail-2').show();
        flowGameStatus = 'finished';
        setTimeout(closePopup, 2000);
    };

    function closePopup(event) {
        $('#inventory').trigger('inventory:addItem', {
            data: '.detail-2'
        });
        $('.item.detail-2').remove();
        $('.totalLevel').css({
            'opacity': '1'
        });

    };


    function drop(event) {
        event.preventDefault();
        event.stopPropagation();

        that = stage1.dragNdrop.data;

        var data = '<figure class="letters" draggable="true"> ' + event.dataTransfer.getData('text/html') + '</figure>';
        var html = $(event.target).html();
        var targetNodeName = $(event.target)[0].nodeName;
        $('.makeWord').css('background-color', '#fff');
        if ($(event.target)[0].className != $(that).parent()[0].className) {
            if ($(event.target).parent().parent()[0].className != $(that).parent()[0].className) {
                if (targetNodeName == 'SPAN' || targetNodeName == "IMG") {
                    html = $(event.target).parent().parent().html()
                    $(event.target).parent().parent().html(html + data);
                } else if (targetNodeName == 'FIGURE') {
                    html = $(event.target).parent().html();
                    $(event.target).parent().html(html + data);
                } else {
                    $(event.target).html(html + data);
                }
                that.remove();
                var leafes = $('.letters');
                for (var i = 0; i < leafes.length; i++) {
                    leafes[i].addEventListener("dragstart", stage1.dragNdrop.drag);
                    leafes[i].addEventListener("dragover", stage1.dragNdrop.over);
                    leafes[i].addEventListener("dragleave", stage1.dragNdrop.leave);
                };

                if (counter === 10) {
                    $('#sendWord').show();
                    return false;
                }
            }

        } else {
            that.css('opacity', '1');
            return false;

        }
    };

    function changeManState() {
        (manState == 'stand') ? manState = 'moving': manState = 'stand';
    };

    return stage1;
});