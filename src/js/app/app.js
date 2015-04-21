
requirejs.config({
    baseUrl: 'src/js/app',
    paths: {
        app: 'app',
        jquery: 'lib/jquery',
        underscore: 'lib/underscore',
        wade: 'lib/wade'
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['main']);
