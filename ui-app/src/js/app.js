requirejs.config({
    baseUrl: 'src/js/',
    paths: {
        app: 'app',
        jquery: 'vendors/jquery/dist/jquery',
        jqueryUi: 'vendors/jquery-ui/jquery-ui',
        underscore: 'vendors/underscore/underscore',
        wade: 'lib/wade'
    }
});
requirejs(['main']);
