
requirejs.config({
    baseUrl: 'src/js',
    paths: {
        app: 'app',
        jquery: 'lib/jquery',
        jqueryUi: 'lib/jquery-ui',
        underscore: 'lib/underscore',
        wade: 'lib/wade'
    }
});

requirejs(['main']);
