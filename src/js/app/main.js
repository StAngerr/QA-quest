define(function (require) {
	var Quest = require('src/js/app/qaquest.js');
	var quest = new Quest();
	var $ = require('jquery');
	QQQ('popup.html');
    $('.startBtn').on('click', function() {
        quest.startQuest();
    });
});


function QQQ(varr) {
	$.ajax({
        url: 'src/templates/' + varr,
        method: 'GET',
        async: false,
        success: function(data) {
            $('#mainContent').prepend(data);
            addGameField();
        }
    });
}

function addGameField() {
	$.ajax({
        url: 'src/templates/' + 'sticksGameTmpl.html',
        method: 'GET',
        async: false,
        success: function(data) {
            $('.popup').append(data);
         
        }
    });
}