define(function(require) {
    var _ = require('underscore');
    var Stage = function(templ) {
        var currentStage = {};
        var stageLoad = true;
        this.templateUrl = templ;
        this.initEvents;
        this.finishStage;

        this.openStage = function(stage) {
            this.getTmpl(this.templateUrl);
            currentStage = stage;
        };    

        this.getTmpl = function(tmplName, direction, dataToTempl, doAfterUpload) {
            return $.ajax({
                url: 'src/templates/' + tmplName,
                method: 'GET',
                success: function(data) {
                    var target = direction || '#mainContent';                   
                    var content = dataToTempl ? _.template(data)(dataToTempl): data;

                    $(target).prepend(content);
                    if(stageLoad) {
                        currentStage.initEvents();
                        stageLoad = false;
                    } else {
                        if(doAfterUpload) doAfterUpload();
                    }
                }
            });
        };       
    };
    return Stage;   
});