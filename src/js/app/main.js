define(function (require) {
	var Quest = require('src/js/app/qaquest.js');
	var quest = new Quest();
	var $ = require('jquery');
	
    
  var currentStage = localStorage.getItem("currentStage");
   (currentStage)? quest.nextStage(currentStage): $('.startBtn').on('click', function() {
        quest.startQuest();
    });

});



