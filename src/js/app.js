
requirejs.config({
    baseUrl: 'src/js',
    paths: {
        app: 'app',
        jquery: 'lib/jquery',
        underscore: 'lib/underscore',
        wade: 'lib/wade'
    }
});

requirejs(['main']);
