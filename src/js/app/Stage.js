define(function(require) {
    var _ = require('underscore');

    var Stage = function(templ) {
        this.templateUrl = templ;

        this.openStage = function() {
            this.getTmpl(this.templateUrl);
        };
        this.initEvents;
        this.getTmpl = function(tmplName, direction, dataToTempl) {
            $.ajax({
                url: 'src/templates/' + tmplName,
                method: 'GET',
                async: false,
                success: function(data) {
                    var target = direction || '#mainContent';
                    var content = dataToTempl ? _.template(data, dataToTempl) : data;
                    $(target).prepend(content);
                }
            });
        };
    };

    return Stage;   
});