(function() {
    'use strict';

    var fs = require('fs'),
        queue = [],
        processing = false;

    var fsService = {
        writeFile: writeFile,
        readFile: readFile
    };

    function writeFile(path, content, cb) {
        queue.push(fsSyncWrite.apply(this, arguments));
        nextCall();
    }

    function readFile(path, cb) {
        queue.push(fsSyncRead.apply(this, arguments));
        nextCall();
    }

    function nextCall() {
        if ( queue.length > 0) {
            queue.shift()();
        }
    }

    function fsSyncWrite(path, content, cb) {
        return function () {
            var data;
            if (fs.existsSync(path)) {
                try {
                    data = fs.writeFileSync(path, content, 'utf8');
                    cb(null, data);
                } catch (e) {
                    cb(e, null);
                }
            }
        }
    }

    function fsSyncRead(path, cb) {
        return function () {
            var data;
            if (fs.existsSync(path)) {
                try {
                    data = fs.readFileSync(path,'utf8');
                    cb(null, data);
                } catch (e) {
                    console.log(e);
                    cb(e, null);
                }
            }
        }
    }

    module.exports = fsService;
})();