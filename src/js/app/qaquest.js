var lvls = [];
define(function(require) {
    var lvls = require('./levels.js'); 
    var STAGES = require('./stagesObj.js');  

    var Quest = function() {

        this.startQuest = function() {
            this.nextStage();
        }

        this.nextStage = function(stage) {
            var currentStage = localStorage.getItem("currentStage") || -1;
            if(currentStage >= STAGES.length - 1) {
                return;
            }
            stage ? currentStage = stage : currentStage++;
            localStorage.setItem("currentStage", currentStage);

            clearMainContent();       
            var st1 = lvls[0];
            st1.openStage();
            st1.initEvents();   
        }

        this.finishQuest = function() {
            
        }
    };

    function clearMainContent() {
    $('#mainContent').children().first().remove();
}

    return Quest;
});