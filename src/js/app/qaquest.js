var lvls = [];
define(function(require) {
    var lvls = require('./levels.js'); 
     var $ = require('jquery');
    var Quest = function() {
       
        this.startQuest = function() {            
            this.nextStage();
        }

        this.nextStage = function(stage) {  
            var currentStage = localStorage.getItem("currentStage")|| -1;

/*            if(currentStage >= STAGES.length - 1) {
                return;
            }*/
            stage ? currentStage = stage : currentStage++;
            localStorage.setItem("currentStage", currentStage);
            clearMainContent();           
            var st = lvls[currentStage];           
            st.openStage();
            st.initEvents(); 
            var that = this;
            $('#mainContent').on('dragon', function() {
                $('body > *').remove();
                $('body').css('background','#cf0');
                alert(this + 'i become a dragon');
            });
            st.finish = function () {
                that.nextStage();
            }             
        }        
    };

    function clearMainContent() {
        $('#mainContent').children().first().remove();
    };

    return Quest;
});