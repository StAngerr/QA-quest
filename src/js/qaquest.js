define(function(require) {
    var $ = require('jquery');
    var allStages = require('./levels.js'); 
    var Invetory = require('./Inventory.js');

    var Quest = function() {         
        var quest = this;
        quest.currentStage = 0;
        quest.inventory = new Invetory();
       

        quest.startQuest = function() {         
            initMainModuleEvents();
            initInventoryModuleEvents();   
            quest.nextStage( getStageFromLS() );
        };

        quest.nextStage = function(stageFromLS) {  
            var stageObj = {};
            
            (parseInt(stageFromLS)) ? quest.currentStage = stageFromLS : quest.currentStage++;
            writeStageToLS(quest.currentStage);
            clearMainContent();           
            stageObj = allStages[quest.currentStage - 1];  /* -1 because 1st stage in allStages array has zero index*/         
            stageObj.openStage(stageObj);
            
        };

        function writeStageToLS(stage) {
            localStorage.setItem("currentStage", stage);
        };

        function getStageFromLS() {
           return parseInt(localStorage.getItem("currentStage"), 10) || 0;
        };

        function initMainModuleEvents() {
            var module = $('#mainSection');  

            $(module).on('main:stageFinished', quest.nextStage);
        };

        function initInventoryModuleEvents() {  
            var module = $('#inventory');         
            
            $(module).on('inventory:addItem', function (event, item) {
                quest.inventory.addItem(event, item.name);
            });
        }; 

        function clearMainContent() {
            $('#mainContent > *').remove();
        };
    };   
    return Quest;
});