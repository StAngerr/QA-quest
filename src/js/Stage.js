define(function(require) {
    var _ = require('underscore');
    var Stage = function(templ) {
        var currentStage = {};
        this.templateUrl = templ;
        this.initEvents;
        this.finishStage;

        this.openStage = function(stage) {
            this.getTmpl(this.templateUrl);
            currentStage = stage;
        };    

        this.getTmpl = function(tmplName, direction, dataToTempl, doAfterUpload) {
            $.ajax({
                url: 'src/templates/' + tmplName,
                method: 'GET',
                success: function(data) {
                    var target = direction || '#mainContent';                   
                    var content = dataToTempl ? _.template(data)(dataToTempl): data;
                    $(target).prepend(content);
                    (doAfterUpload) ? doAfterUpload() : currentStage.initEvents();
                }
            });
        };       
    };
    return Stage;   
});