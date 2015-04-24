/**
 * WADE - Web App Development Engine.
 * @version 2.1
 * @constructor
 */
function Wade()
{
    var version = '2.1';
    var sceneManager = 0;
    var assetLoader = 0;
    var assetPreloader = 0;
    var inputManager = 0;
	var pendingMainLoop = 0;
    var pendingAppTimer = 0;
	var appInitialised = false;
	var appLoading = false;
	var relativeAppPath = '';
    var appTimerInterval = 1.0;
    var loadingImages = [];
    var mainLoopCallbacks = [];
    var mainLoopLastTime = 0;
    var doubleBuffering = false;
    var resolutionFactor = 1;
    var forcedOrientation = 'none';
    var blankImage = new Image();
    var audioSources = [];
    var loadingBar;
    var simulationPaused;
    var internalCanvas;
    var internalContext;
    var webGlSupported;
    var debugMode;
    var audioContext;
    var catchUpBuffer = 1; // how many seconds of lag until we give up trying to catch up
    var containerDiv = 'wade_main_div'; // the div that contains all the wade canvases
    blankImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NkAAIAAAoAAggA9GkAAAAASUVORK5CYII='; // fully transparent image

    /**
     * The current app instance
     * @type {Object}
     */
    this.app = 0;

    /**
     * The time (in seconds) between simulation steps
     * @type {number}
     * @constant
     */
    this.c_timeStep = 1 / 60;

    /**
     * The default layer for new sprites. This is initially set to 1.
     * @type {number}
     */
    this.defaultLayer = 1;

    this._appData = 0;
    this.c_epsilon = 0.0001;

    /**
     * Initialize the engine
     * @param {string} appScript Path and filename of the main app script
     * @param {Object} [appData = {}] An object containing initialization data for the app
     * @param {Object} [options = {}] An object that contains a set of fields that specify some configuration options. All the fields are optional. Supported values are:<br/><ul>
        <li> <b>forceReload</b>: <i>boolean</i> -  Whether to force reloading the main app script (as opposed to trying to get it from the cache. Defaults to false</li>
        <li> <b>updateCallback</b>: <i>function</i> -  A function to execute when an update for the cached version of the app is available and has been downloaded. This only applies to apps using the application cache. If omitted, the default behavior is to display an alert, after which the page will be refreshed.</li>
        <li> <b>container</b>: <i>string</i> - The name of an HTML element in the current document (typically a DIV), that will contain all of the app's canvases and will be used to detect input events. Default is 'wade_main_div'.</li>
        <li> <b>debug</b>: <i>boolean</i> - Whether to run the app in debug mode. When this is active, the source code of functions loaded through scene files will be easily accessible from the debugger. This will also inject 'sourceURL' tags into all dynamically loaded scripts. Defaults to false.</li>
        <li> <b>audio</b>: <i>boolean</i> - Whether to activate audio or not. Defaults to true.</li>
        <li> <b>input</b>: <i>boolean</i> - Whether to activate input or not. Defaults to true.</li></ul>
     */
    this.init = function(appScript, appData, options)
	{
        options = options || {};
        var forceReload = options.forceReload;
        var updateCallback = options.updateCallback;
        var container = options.container;

        containerDiv = container || 'wade_main_div';

        // handle application cache
        var handleApplicationCache = function()
        {
            var appCache = window.applicationCache;
            if (!appCache)
            {
                return;
            }

            if (appCache.status == appCache.UPDATEREADY)
            {
                wade.log('a new version of the app is available');
                if (updateCallback)
                {
                    updateCallback();
                }
                else
                {
                    alert('A new version is available.\nPlease press OK to restart.');
                    appCache.swapCache();
                    window.location.reload(true);
                    window.location = window.location;
                }
                return;
            }
            else
            {
                try
                {
                    appCache.update();
                } catch(e) {}
            }
            appCache.addEventListener('updateready', handleApplicationCache, false);
        };
        handleApplicationCache();

        if (appScript)
        {
            // set relative app path
            relativeAppPath = appScript.substr(0, Math.max(appScript.lastIndexOf('/'), appScript.lastIndexOf('\\')) + 1);
        }

        // add support for requestAnimationFrame
        // it has to be a bit convoluted because some browsers will have vendor-specific extensions for this, others will have no support at all
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var i=0; i<vendors.length && !window.requestAnimationFrame; i++)
        {
            window.requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[i] + 'CancelAnimationFrame'] || window[vendors[i] + 'CancelRequestAnimationFrame'];
        }
        if (!window.requestAnimationFrame)
        {
            window.requestAnimationFrame = function(callback)
            {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime -lastTime));
                var id = window.setTimeout(function() {callback(currTime + timeToCall);}, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame)
        {
            window.cancelAnimationFrame = function(id)
            {
                clearTimeout(id);
            }
        }

        // try to create a WebAudio context
        var enableAudio = (typeof(options.audio) == 'undefined' || options.audio);
        audioContext = options.audioContext;
        if (enableAudio && !audioContext)
        {
            try
            {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                audioContext = new AudioContext();
                var canUseWebAudio = XMLHttpRequest && (typeof (new XMLHttpRequest()).responseType === 'string');
            }
            catch (e) {}
            if (!canUseWebAudio)
            {
                wade.log('Warning: the WebAudio API is not supported by this browser. Audio functionality will be limited');
            }
        }

		// create the asset loader
		assetLoader = new AssetLoader();
        assetLoader.init(false);

        // create the asset preloader
        assetPreloader = new AssetLoader();
        assetPreloader.init(true);

		// create and initialise the scene manager
		sceneManager = new SceneManager();
		sceneManager.init();

		// create and initialise the input manager
		inputManager = new InputManager();
        if (typeof(options.input) == 'undefined' || options.input)
        {
            inputManager.init();
        }

        // create an internal canvas context for various operations such as measuring text, etc
        internalCanvas = document.createElement('canvas');
        internalCanvas.width = internalCanvas.height = 256;
        internalContext = internalCanvas.getContext('2d');

        // generate procedural images
        this.proceduralImages.init();

        // set debug mode
        debugMode = !!options.debug;

		// load user app
		this._appData = appData? appData : {};
        if (appScript)
        {
		    assetLoader.loadAppScript(appScript, forceReload);
        }
        else if (window.App)
        {
            this.instanceApp();
        }
        else
        {
            wade.log("Warning - App is not defined.")
        }

		// start the main loop
		this.event_mainLoop();
	};

    /**
     * Stop the execution of the WADE app. The simulation and rendering loops will be interrupted, and 'onAppTimer' events will stop firing.<br/>
     * If the WADE app has scheduled any events (for example with setTimeout), it is responsible for cancelling those events.
     */
    this.stop = function()
    {
        if (pendingMainLoop)
        {
            cancelAnimationFrame(pendingMainLoop);
        }
        if (pendingAppTimer)
        {
            clearTimeout(pendingAppTimer);
        }
        this.setLoadingImages([]);
		wade.stopInputEvents();
    };

    /**
     * Stop listening for input events
     */
    this.stopInputEvents = function()
    {
        inputManager.deinit();
    };

    /**
     * Restart listening to input events after a call to wade.stopInputEvents()
     */
    this.restartInputEvents  = function()
    {
        inputManager.init();
    };

    /**
     * Stop the normal input event handling by the browser. Note that this happens by default, so you don't need to call this function unless you want to re-enable the default handling of input events, or change it programmatically.
     * @param {boolean} [toggle] Whether to cancel the normal handling of event. If this parameter is omitted, it's assumed to be true.
     */
    this.cancelInputEvents = function(toggle)
    {
        inputManager.cancelEvents(toggle);
    };

    /**
     * Get the base path of the app (i.e. the directory where the main app script is located or the directory that was set via setBasePath)<br/>
     * The result of this function depends on the path that was passed to the last call to <i>wade.init()</i> or <i>wade.setBasePath</i>. It can be an absolute path, or a path relative to the location of WADE.
     * @returns {String} The base path of the app
     */
	this.getBasePath = function()
	{
		return relativeAppPath;
	};

    /**
     * Set the base path of the app. Omit the parameter or set it to an empty string "" if you want to always use absolute paths
     * @param {String} path the base path of the app
     */
    this.setBasePath = function(path)
    {
        relativeAppPath = path || '';
    };

    /**
     * Get the full path and file name of the specified file. This could be relative to the app's main file location, or an absolute address starting with 'http://', 'https://' or '//'
     * @param {string} file The base file name
     * @returns {string} The full path and file name
     */
    this.getFullPathAndFileName = function(file)
    {
        if (!file || file.substr(0, 11) == 'procedural_')
        {
            return file;
        }
        var firstChar = file[0];
        return (firstChar=='\\' || firstChar == '/' || file.indexOf(':') != -1)? file : relativeAppPath + file;
    };
    
    /**
     * Load a javascript file. Although the loading happens asynchronously, the simulation is suspended until this operation is completed.<br/>
     * If a loading screen has ben set, it will be shown during the loading.<br/>
     * See preloadScript for an equivalent operation that happens in the background without suspending the simulation.
     * @param {string} file A javascript file to load. It can be a relative path, or an absolute path starting with "http://"
     * @param {function} [callback] A callback to execute when the script is loaded
     * @param {boolean} [forceReload] Wheter to force the client to reload the file even when it's present in its cache
     * @param {function} [errorCallback] A callback to execute when the script cannot be loaded
     * @param {boolean} [dontExecute] Scripts loaded via wade.loadScript() are automatically executed. Set this boolean to true to avoid executing them as they are loaded.
     */
    this.loadScript = function(file, callback, forceReload, errorCallback, dontExecute)
    {
        var fileName = this.getFullPathAndFileName(file);
        assetLoader.loadScript(fileName, callback, forceReload, errorCallback, dontExecute);
    };

    /**
     * Load a javascript file asynchronously, without suspending the simulation.
     * @param {string} file A javascript file to load. It can be a relative path, or an absolute path starting with "http://"
     * @param {function} [callback] A callback to execute when the script is loaded
     * @param {boolean} [forceReload] Wheter to force the client to reload the file even when it's present in its cache
     * @param {function} [errorCallback] A callback to execute when the script cannot be loaded
     * @param {boolean} [dontExecute] Scripts loaded via wade.preloadScript() are automatically executed. Set this boolean to true to avoid executing them as they are loaded.
     */
    this.preloadScript = function(file, callback, forceReload, errorCallback, dontExecute)
    {
        var fileName = this.getFullPathAndFileName(file);
        assetPreloader.loadScript(fileName, callback, forceReload, errorCallback, dontExecute);
    };

    /**
     * Get the contents of a script file
     * @param {string} file A script file to access (it has to be a file that has been loaded via wade.loadScript() or set via wade.setScript() first). It can be a relative path, or an absolute path starting with "http://"
     * @returns {string} The contents of the script file
     */
    this.getScript = function(file)
    {
        var fileName = this.getFullPathAndFileName(file);
        return assetLoader.getScript(fileName);
    };

    /**
     * Associate a file name with a script, so that any subsequent calls to getScript using the given file name will return that script.
     * @param {string} file The script file name
     * @param {string} [data] A string representation of the script
     * @param {boolean} [setForPreloader] Whether to apply this operation to the asset preloader as well as the asset loader. This is false by default. If set to true, subsequent calls to wade.preloadScript will get this cached version of the data instead of loading it again in the background.
     */
    this.setScript = function(file, data, setForPreloader)
    {
        var fileName = this.getFullPathAndFileName(file);
        assetLoader.setScript(fileName, data);
        setForPreloader && assetPreloader.setScript(fileName, data);
    };

    /**
     * Load a JavaScript Object Notation (JSON) data file. Although the loading happens asynchronously, the simulation is suspended until this operation is completed.<br/>
     * If a loading screen has ben set, it will be shown during the loading.<br/>
     * See preloadJson for an equivalent operation that happens in the background without suspending the simulation.
     * @param {string} file A json file to load. It can be a relative path, or an absolute path starting with "http://"
     * @param {Object} [objectToStoreData] An object that will be used to store the data. When the loading is complete, objectToStoreData.data will contain the contents of the json file
     * @param {function} [callback] A callback to execute when the script is loaded
     * @param {boolean} [forceReload] Whether to force the client to reload the file even when it's present in its cache#
     * @param {function} [errorCallback] A callback to execute when the json file cannot be loaded
     */
	this.loadJson = function(file, objectToStoreData, callback, forceReload, errorCallback)
	{
        var fileName = this.getFullPathAndFileName(file);
		assetLoader.loadJson(fileName, objectToStoreData, callback, forceReload, errorCallback);
	};

    /**
     * Load a JavaScript Object Notation (JSON) data file asynchronously, without suspending the simulation.
     * @param {string} file A json file to load. It can be a relative path, or an absolute path starting with "http://"
     * @param {Object} [objectToStoreData] An object that will be used to store the data. When the loading is complete, objectToStoreData.data will contain the contents of the json file
     * @param {function} [callback] A callback to execute when the script is loaded
     * @param {boolean} [forceReload] Whether to force the client to reload the file even when it's present in its cache
     * @param {function} [errorCallback] A callback to execute when the json file cannot be loaded
     */
    this.preloadJson = function(file, objectToStoreData, callback, forceReload, errorCallback)
    {
        var fileName = this.getFullPathAndFileName(file);
        assetPreloader.loadJson(fileName, objectToStoreData, callback, forceReload, errorCallback);
    };

    /**
     * @param {string} file A JSON file to access (it has to be a file that has been loaded via wade.loadJson() or set via wade.setJson() first). It can be a relative path, or an absolute path starting with "http://"
     * @returns {object|Array} The contents of the JSON file
     */
    this.getJson = function(file)
    {
        var fileName = this.getFullPathAndFileName(file);
        return assetLoader.getJson(fileName);
    };

    /**
     * Associate a file name with a JSON object, so that any subsequent calls to getJson using the given file name will return that object.
     * @param {string} file The JSON file name
     * @param {Object} [data] The data object to associate with the JSON file name
     * @param {boolean} [setForPreloader] Whether to apply this operation to the asset preloader as well as the asset loader. This is false by default. If set to true, subsequent calls to wade.preloadJson will get this cached version of the data instead of loading it again in the background.
     */
    this.setJson = function(file, data, setForPreloader)
    {
        var fileName = this.getFullPathAndFileName(file);
        assetLoader.setJson(fileName, data);
        setForPreloader && assetPreloader.setJson(fileName, data);
    };

    /**
     * Load an image file. Although the loading happens asynchronously, the simulation is suspended until this operation is completed.<br/>
     * If a loading screen has ben set, it will be shown during the loading.<br/>
     * See preloadImage for an equivalent operation that happens in the background without suspending the simulation.
     * @param {string} file An image file to load. It can be a relative path, or an absolute path starting with "http://"
     * @param {function} [callback] A callback to execute when the file is loaded
     * @param {function} [errorCallback] A callback to execute when the image cannot be loaded
     */
    this.loadImage = function(file, callback, errorCallback)
    {
        var fileName = this.getFullPathAndFileName(file);
        assetLoader.loadImage(fileName, callback, errorCallback);
    };

    /**
     * This is a helper functions to load multiple images in a single function call, and is equivalent to calling wade.loadImage() multiple times.
     * @param {Array} arrayOfFileNames An array of strings, where each string is the file name of an image to load.
     */
    this.loadImages = function(arrayOfFileNames)
    {
        for (var i=0; i<arrayOfFileNames.length; i++)
        {
            this.loadImage(arrayOfFileNames[i]);
        }
    };

    /**
     * Load an image file asynchronously, without suspending the simulation.
     * @param {string} file An image file to load. It can be a relative path, or an absolute path starting with "http://"
     * @param {function} [callback] A callback to execute when the file is loaded
     * @param {function} [errorCallback] A callback to execute when the image cannot be loaded
     */
    this.preloadImage = function(file, callback, errorCallback)
    {
        var fileName = this.getFullPathAndFileName(file);
        assetPreloader.loadImage(fileName, callback, errorCallback);
    };

    /**
     * Release references to an image file, so it can be garbage-collected to free some memory
     * @param {string} file An image file to unload. It can be a relative path, or an absolute path starting with "http://"
     */
    this.unloadImage = function(file)
    {
        var fileName = this.getFullPathAndFileName(file);
        assetLoader.unloadImage(fileName);
        assetPreloader.unloadImage(fileName);
    };

    /**
     * Release references to all the image files that have been loaded so far, so they can be garbage-collected to free some memory
     */
    this.unloadAllImages = function()
    {
        assetLoader.unloadAllImages();
        assetPreloader.unloadAllImages();
    };

    /**
     * Get an image object that has previously been loaded, or a blank image
     * @param {string} [file] An image file to get. This must be the file name that was used in a previous call to loadImage, preloadImage or setImage. If omitted or falsy, a bank (white) image is returned
     * @param {string} [errorMessage] An error message to display in the console if the image hasn't been loaded. If omitted, a default error message will be printed.
     * @returns {Object} The image object that was requested
     */
    this.getImage = function(file, errorMessage)
    {
        if (file)
        {
            var fileName = this.getFullPathAndFileName(file);
            return (assetLoader.getImage(fileName, errorMessage));
        }
        else
        {
            return blankImage;
        }
    };

    /**
     * Associate a file name with an image object, so that any subsequent calls to getImage using the given file name will return that object.
     * @param {string} file The image file name
     * @param {Object} [image] The image object
     * @param {boolean} [setForPreloader] Whether to apply this operation to the asset preloader as well as the asset loader. This is false by default. If set to true, subsequent calls to wade.preloadImage will get this cached version of the data instead of loading it again in the background.
     */
    this.setImage = function(file, image, setForPreloader)
    {
        var fileName = this.getFullPathAndFileName(file);
        assetLoader.setImage(fileName, image);
        setForPreloader && assetPreloader.setImage(fileName, image);
        sceneManager.renderer.updateImageUsers(fileName);
    };

    /**
     * Load an audio file. Although the loading happens asynchronously, the simulation is suspended until this operation is completed.<br/>
     * If a loading screen has ben set, it will be shown during the loading.<br/>
     * See preloadAudio for an equivalent operation that happens in the background without suspending the simulation.
     * @param {string} file The audio file to load. Note that while some browsers support '.aac' files, some don't and support '.ogg' instead. If you plan to use one of these formats, you should provide the same file in the other format too in the same location (same file name but different extension). It then doesn't matter wheter you refer to your file as 'fileName.aac' or 'fileName.ogg', because WADE will automatically use the one that is supported by the client
     * @param {boolean} [autoplay] Whether to start play the audio file as soon as it's ready.
     * @param {boolean} [looping] Whether to repeat the audio when it's over
     * @param {function} [callback] A function to execute when the audio is ready to play
     * @param {function} [errorCallback] A callback to execute when the audio file cannot be loaded
     */
    this.loadAudio = function(file, autoplay, looping, callback, errorCallback)
    {
        var fileName = this.getFullPathAndFileName(file);
        assetLoader.loadAudio(fileName, autoplay, looping, callback, errorCallback);
    };

    /**
     * Load an audio file asynchronously, without suspending the simulation.
     * @param {string} file The audio file to load. Note that while some browsers support '.aac' files, some don't and support '.ogg' instead. If you plan to use one of these formats, you should provide the same file in the other format too in the same location (same file name but different extension). It then doesn't matter wheter you refer to your file as 'fileName.aac' or 'fileName.ogg', because WADE will internally use the one that is supported by the client
     * @param {boolean} [autoplay] Whether to start play the audio file as soon as it's ready.
     * @param {boolean} [looping] Whether to repeat the audio when it's over
     * @param {function} [callback] A function to execute when the audio is ready to play
     * @param {function} [errorCallback] A callback to execute when the audio file cannot be loaded
     */
    this.preloadAudio = function(file, autoplay, looping, callback, errorCallback)
    {
        var fileName = this.getFullPathAndFileName(file);
        assetPreloader.loadAudio(fileName, autoplay, looping, callback, errorCallback);
    };

    /**
     * Release references to an audio file, so it can be garbage-collected to free some memory
     * @param {string} file An audio file to unload. It can be a relative path, or an absolute path starting with "http://"
     */
    this.unloadAudio = function(file)
    {
        var fileName = this.getFullPathAndFileName(file);
        assetLoader.unloadAudio(fileName);
        assetPreloader.unloadAudio(fileName);
    };

    /**
     * Release references to all the audio files that have been loaded so far, so they can be garbage-collected to free some memory
     */
    this.unloadAllAudio = function()
    {
        assetLoader.unloadAllAudio();
        assetPreloader.unloadAllAudio();
    };

    /**
     * Associate a file name with an audio object, so that any subsequent calls to getAudio using the given file name will return that object.
     * @param {string} file The audio file name
     * @param {Object} [audio] The audio object
     * @param {function} [callback] A function to execute when the audio has finished decoding and is fully set. This is useful if the audio object is a data URI of a compressed audio type that needs to be decoded
     * @param {boolean} [setForPreloader] Whether to apply this operation to the asset preloader as well as the asset loader. This is false by default. If set to true, subsequent calls to wade.preloadAudio will get this cached version of the data instead of loading it again in the background.
     */
    this.setAudio = function(file, audio, callback, setForPreloader)
    {
        var fileName = this.getFullPathAndFileName(file);
        assetLoader.setAudio(fileName, audio, callback);
        setForPreloader && assetPreloader.setAudio(fileName, audio, callback);
    };

    /**
     * Play an audio file that has previously been loaded with a call to loadAudio or preloadAudio
     * @param {string} file The file name for the audio object. This must be the same string that was used in a previous call to loadAudio or preloadAudio
     * @param {boolean} looping Whether to repeat the audio when it's over
     * @param {function} [callback] A function to call when the sound is finished playing
     * @returns {number} a unique identifier of the audio source that is being played
     */
    this.playAudio = function(file, looping, callback)
    {
        var audio = this.getAudio(file);
        if (audioContext)
        {
            var source = audioContext.createBufferSource();
            source.buffer = audio;
            source.loop = !!looping;
            source.connect(audioContext.destination);
            source.endEventFired = false;
            source.onended = function()
            {
                source.endEventFired = true;
                if (callback)
                {
                    callback();
                    callback = null;
                }
            };
            source.start(0);
            audioSources.push(source);
            if (callback && !looping)
            {
                var checkIfFinished = function ()
                {
                    if (source.playbackState != source.FINISHED_STATE)
                    {
                        setTimeout(checkIfFinished, wade.c_timeStep);
                    }
                    else if (source.onended && !source.endEventFired)
                    {
                        source.endEventFired = true;
                        source.onended();
                    }
                };
                source.checkEnded = setTimeout(checkIfFinished, source.buffer.duration * 1000 + wade.c_timeStep);
            }
        }
        else
        {
            if (audio.alreadyPlayed && !audio.ended)
            {
                audio = new Audio(audio.src);
                this.setAudio(file, audio);
            }
            audio.loop = looping;
            audio.alreadyPlayed = true;
            if (looping)
            {
                audio.addEventListener('ended', function() {this.currentTime = 0; this.play();}, false);
            }
            audio.play();
            audioSources.push(audio);
        }
        return audioSources.length;
    };

    /**
     * Stop an audio file that was playing
     * @param {number} [uid] The unique identifier of the audio source that you want to stop playing. If omitted, all sources will be stoppped
     */
    this.stopAudio = function(uid)
    {
        if (typeof(uid) == 'undefined')
        {
            for (var i=0; i<audioSources.length; i++)
            {
                if (audioSources[i])
                {
                    audioSources[i].stop();
                    audioSources[i].checkEnded && clearTimeout(audioSources[i].checkEnded);
                }
            }
        }
        else
        {
            var source = audioSources[uid-1];
            if (source)
            {
                source.stop();
                source.checkEnded && clearTimeout(source.checkEnded);
            }
        }
    };

    /**
     * Play an audio file only if it's ready to be played, do not attempt to play otherwise
     * @param {string} file The file name for the audio object. This must be the same string that was used in a previous call to loadAudio or preloadAudio
     * @param {boolean} looping Whether to repeat the audio when it's over
     * @param {function} [callback] A function to call when the sound is finished playing
     * @returns {number} a unique identifier of the audio source that is being played
     */
    this.playAudioIfAvailable = function(file, looping, callback)
    {
        if (this.getLoadingStatus(this.getFullPathAndFileName(file)) == 'ok')
        {
            return this.playAudio(file, looping, callback);
        }
        return 0;
    };

    /**
     * Play a segment of an audio file
     * @param {string} file The file name for the audio object. This must be the same string that was used in a previous call to loadAudio or preloadAudio
     * @param {number} [start] The starting point, in seconds. If omitted or falsy, the sound will be played from the beginning
     * @param {number} [end] The ending point, in seconds. If omitted or falsy, the sound is played from the start position to the end of the source file.
     * @param {function} [callback] A function to call when the ending point is reached
     * @returns {number} a unique identifier of the audio source that is being played
     */
    this.playAudioSegment = function(file, start, end, callback)
    {
        start = start || 0;
        var audio = this.getAudio(this.getFullPathAndFileName(file));
        if (audioContext)
        {
            var source = audioContext.createBufferSource();
            source.buffer = audio;
            source.connect(audioContext.destination);
            source.endEventFired = false;
            source.onended = function()
            {
                source.endEventFired = true;
                if (callback)
                {
                    callback();
                    callback = null;
                }
            };
            source.start(start);
            if (callback)
            {
                var checkIfFinished = function ()
                {
                    if (source.playbackState != source.FINISHED_STATE)
                    {
                        setTimeout(checkIfFinished, wade.c_timeStep);
                    }
                    else if (source.onended && !source.endEventFired)
                    {
                        source.endEventFired = true;
                        source.onended();
                    }
                };
                source.checkEnded = setTimeout(checkIfFinished, (source.buffer.duration - start) * 1000 + wade.c_timeStep);
            }
            end && source.stop(end);
            audioSources.push(source);
        }
        else
        {
            end = end || audio.duration;
            var endFunction = function()
            {
                if (this.currentTime >= end)
                {
                    this.pause();
                    this.ended = true;
                    callback && callback();
                }
            };
            if (audio.alreadyPlayed && !audio.ended)
            {
                audio = new Audio(audio.src);
            }
            audio.addEventListener('timeupdate', endFunction, false);
            audio.alreadyPlayed = true;
            audio.play();
            audioSources.push(audio);
        }
        return audioSources.length-1;
    };

    /**
     * Play a segment of an audio file only if it's ready to be played, do not attempt to play otherwise
     * @param {string} file The file name for the audio object. This must be the same string that was used in a previous call to loadAudio or preloadAudio
     * @param {number} start The starting point, in seconds
     * @param {number} end The ending point, in seconds
     * @param {function} callback A function to call when the ending point is reached
     */
    this.playAudioSegmentIfAvailable = function(file, start, end, callback)
    {
        if (this.getLoadingStatus(this.getFullPathAndFileName(file)) == 'ok')
        {
            // this.playAudio(file);
            this.playAudioSegment(file, start, end, callback);
        }
    };

    /**
     * Load a font file. Although the loading happens asynchronously, the simulation is suspended until this operation is completed.<br/>
     * If a loading screen has ben set, it will be shown during the loading.<br/>
     * See preloadFont for an equivalent operation that happens in the background without suspending the simulation.
     * @param {string} file A fonr file to load (.woff files are universally supported, other format may be supported depending on the browser). It can be a relative path, or an absolute path starting with "http://" or "https://" or "//"
     * @param {function} [callback] A callback to execute when the file is loaded
     * @param {function} [errorCallback] A callback to execute when the font cannot be loaded
     */
    this.loadFont = function(file, callback, errorCallback)
    {
        var fileName = this.getFullPathAndFileName(file);
        assetLoader.loadFont(fileName, callback, errorCallback);
    };

    /**
     * Load a font file asynchronously, without suspending the simulation.
     * @param {string} file A font file to load (.woff files are universally supported, other format may be supported depending on the browser). It can be a relative path, or an absolute path starting with "http://" or "https://" or "//"
     * @param {function} [callback] A callback to execute when the file is loaded
     * @param {function} [errorCallback] A callback to execute when the font cannot be loaded
     */
    this.preloadFont = function(file, callback, errorCallback)
    {
        var fileName = this.getFullPathAndFileName(file);
        assetPreloader.loadFont(fileName, callback, errorCallback);
    };

    /**
     * Get the base64-encoded dataURL of a font
     * @param {string} file A font dataURL to access (it has to be data that has been set via wade.setFont() first). It can be a relative path, or an absolute path starting with "http://"
     * @returns {string} The dataURL of the font
     */
    this.getFont = function(file)
    {
        var fileName = this.getFullPathAndFileName(file);
        return assetLoader.getFont(fileName);
    };

    /**
     * Associate a file name with a font, so that any subsequent calls to getFont using the given file name will return that font.
     * @param {string} file The font file name
     * @param {string} [data] The dataURL of the font
     * @param {boolean} [setForPreloader] Whether to apply this operation to the asset preloader as well as the asset loader. This is false by default. If set to true, subsequent calls to wade.preloadFont will get this cached version of the data instead of loading it again in the background.
     */
    this.setFont = function(file, data, setForPreloader)
    {
        var fileName = this.getFullPathAndFileName(file);
        assetLoader.setFont(fileName, data);
        setForPreloader && assetPreloader.setFont(fileName, data);
    };

    /**
     * Get the current loading status of a file
     * @param {string} file The file name.
     * @returns {string | undefined} The loading status:<br/>
     * - 'loading' when the loading of the file is in progress<br/>
     * - 'ok' if the file was loaded with no problems<br/>
     * - 'error' if there were loading errors<br/>
     * - 'unknown' if WADE has never been requested to load the file
     */
    this.getLoadingStatus = function(file)
    {
        var fileName = this.getFullPathAndFileName(file);
        return assetLoader.getLoadingStatus(fileName);
    };

    /**
     * Create an instance of the user app. This function is called automatically when the main app script is finished loading.
     */
    this.instanceApp = function()
	{
		// create a new instance of the user app
		this.app = new App();
		this.app.appData = this._appData;
		
		// tell it to load its own assets
        if (this.app.load)
        {
            this.app.load();
        }
        appInitialised = false;
        appLoading = true;
	};

    /**
     * Initialize the user app. This function is called automatically when the main app is finished loading its assets.
     */
	this.initializeApp = function()
	{
        appInitialised = true;

        // set double buffering for the android stock browser
        var isAndroidStockBrowser = (navigator.userAgent.indexOf("Android") >= 0 && navigator.userAgent.indexOf("Firefox") == -1 && !(window.chrome && window.chrome.app) && !this.isWebGlSupported());
        this.enableDoubleBuffering(isAndroidStockBrowser);

        // call the init function of the user app
        var that = this;
		if (!that.app.init)
		{
			wade.log('Warning: Unable to initialize app. App.init function is missing.');
			return;
		}
		that.app.init();

		// schedule app timer event
		pendingAppTimer = setTimeout(function() {wade.event_appTimerEvent();}, appTimerInterval * 1000);
	};

    /**
     * Process a given event. A callback function with the same name as the event will be called for the objects that have been registered with addEventListener for this event.<br/>
     * Note that when a listener indicates that they have processed the event (by returning true in their callback), the event won't be passed to any more listeners.
     * @param {string} event The name of the event to process
     * @param {Object} [eventData] An object to be passed to all the callbacks that will be called
     * @returns {boolean} Whether any listener succesfully processed the event
     */
    this.processEvent = function(event, eventData)
    {
        return sceneManager.processEvent(event, eventData);
    };

    /**
     * Register a scene object to listen for all the events with a given name. When an event is triggered, a callback with the same name as the event will be called for this object and all its behaviors (when present).
     * When input events (such as onClick) occur outside the bounding boxes of the objects' sprites, the scene object will not receive the event.
     * @param {SceneObject} sceneObject A scene object that will be listening for the event
     * @param {string} event The name of the event to listen for
     */
    this.addEventListener = function(sceneObject, event)
    {
        sceneManager.addEventListener(sceneObject, event);
    };

    /**
     * Unregister an object that has previously been registered to listen for an event using addEventListener.
     * @param {SceneObject} sceneObject The scene object to unregister
     * @param {string} event The name of the event to stop listening for
     */
    this.removeEventListener = function(sceneObject, event)
    {
        sceneManager.removeEventListener(sceneObject, event);
    };

    /**
     * Check to see if a Scene Object is currently listening for a specific type of event
     * @param {SceneObject} sceneObject The scene object to check
     * @param {string} event The name of the event
     * @returns {boolean} Whether the scene object is currently listening for the event
     */
    this.isEventListener = function(sceneObject, event)
    {
        return sceneManager.isObjectListeneningForEvent(sceneObject, event);
    };

    /**
     * Register a scene object to listen for all the events with a given name. When an event is triggered, a callback with the same name as the event will be called for this object and all its behaviors (when present).
     * The scene object will receive events that occur outside the bounding boxes of the objects' sprites, where this is applicable (depending on the event type).
     * @param {SceneObject} sceneObject A scene object that will be listening to the event
     * @param {string} event The name of the event to listen for
     */
    this.addGlobalEventListener = function(sceneObject, event)
    {
        sceneManager.addGlobalEventListener(sceneObject, event);
    };

    /**
     * Unregister an object that has previously been registered to listen for an event using addGlobalEventListener.
     * @param {SceneObject} sceneObject The scene object to unregister
     * @param {string} event The name of the event to stop listenening for
     */
    this.removeGlobalEventListener = function(sceneObject, event)
    {
        sceneManager.removeGlobalEventListener(sceneObject, event);
    };

    /**
     * Get the current camera position.
     * @returns {Object} An object whose 'x', 'y' and 'z' fields represent the coordinates of the camera position in world space
     */
    this.getCameraPosition = function()
    {
        return sceneManager.renderer.getCameraPosition();
    };

    /**
     * Set a world space position for the camera.
     * @param {Object} pos An object whose 'x', 'y' and 'z' fields represent the coordinates of the camera position in world space
     */
    this.setCameraPosition = function(pos)
    {
        sceneManager.renderer.setCameraPosition(pos);
    };

    /**
     * Get the total simulation time, in seconds, since the app was started
     * @returns {number} The number of seconds the simulation has been running since the app was started
     */
    this.getAppTime = function()
    {
        return sceneManager.getAppTime();
    };

    /**
     * Set a custom interval for the 'onAppTimer' event. If this function is never called, the interval is 1 second by default.
     * @param {number} interval The number of seconds between 'onAppTimer' events
     */
    this.setAppTimerInterval = function(interval)
    {
        appTimerInterval = interval;
    };

    /**
     * Remove an object from an array based on the object's index into the array
     * @param {number} index The index of the object to remove
     * @param {Array} array The array that contains the object
     * @returns {Object} The array after the object has been removed
     */
    this.removeObjectFromArrayByIndex = function(index, array)
    {
        if (index >= 0)
        {
            var rest = array.slice(index + 1 || array.length);
            array.length = index;
            return array.push.apply(array, rest);
        }
        return array;
    };

    /**
     * Remove an object from an array
     * @param {Object} object The object to remove from the array
     * @param {Array} array The array that contains the object
     * @returns {Object} The array after the object has been removed
     */
    this.removeObjectFromArray = function(object, array)
    {
        var i = array.lastIndexOf(object);
        if (i != -1)
        {
            return this.removeObjectFromArrayByIndex(i, array);
        }
        return array;
    };

    /**
     * Add a scene object to the scene
     * @param {SceneObject} sceneObject The scene object to add to the scene
     * @param {boolean} [autoListen] This is false by default. When set to true (or a truthy value), WADE will set the object to automatically listen for any events for which handlers are defined on the object or any of its behaviors.
     * For example if the object has an onMouseDown function when it's addded to the scene (or any of its behaviours has an onMouseDown function) and this parameter is true, the object will be set to listen for onMouseDown events automatically.
     * @param [params] This argument can be any type, is optional, and if present is passed to the onAddToScene event handler(s) for this object
     * @returns {SceneObject} The scene object that was just added to the scene
     */
    this.addSceneObject = function(sceneObject, autoListen, params)
    {
        sceneManager.addSceneObject(sceneObject, autoListen, params);
        return sceneObject;
    };

    /**
     * Remove a scene object from the scene
     * @param {SceneObject|string} sceneObject The object to remove from the scene. If the scene object that you want to remove has a name, you can use its name (a string) rather than a reference to the object itself.
     */
    this.removeSceneObject = function(sceneObject)
    {
        sceneManager.removeSceneObject(typeof(sceneObject) == 'string'? this.getSceneObject(sceneObject) : sceneObject);
    };

    /**
     * Remove multiple scene objects from the scene
     * @param {Array} sceneObjects An array of scene objects to remove from the scene
     */
    this.removeSceneObjects = function(sceneObjects)
    {
        for (var i=0; i<sceneObjects.length; i++)
        {
            sceneManager.removeSceneObject(sceneObjects[i]);
        }
    };

    /**
     * Remove all the scene objects from the scene
     */
    this.clearScene = function()
    {
        sceneManager.clear();
    };

    /**
     * Get the sorting method that is currently being used for the layer
     * @param {number} layerId The layer id
     * @returns {string|function} A user specified function that was previously set with setLayerSorting, or a string indicating one of the built-in types of sorting: 'bottomToTop', 'topToBottom', 'none'.<br/>
     * The default value for a layer sorting method is 'none'.
     */
    this.getLayerSorting = function(layerId)
    {
        return sceneManager.renderer.getLayerSorting(layerId);
    };

    /**
     * Set the sorting method to use for a specified layer
     * @param {number} layerId The layer id
     * @param {string|function} sortingType A user-defined function to use for sorting the layer, or a string indicating one of the built-in types of sorting: 'bottomToTop', 'topToBottom', 'none'.<br/>
     * A sorting function looks like 'function sort(a, b)' where 'a' and 'b' are two sprites. The function returns a negative number if 'a' needs to be drawn before 'b', and a positive number otherwise.<br/>
     * The default sorting type is 'none', which means that objects will be drawn in the order they were added to the scene
     */
    this.setLayerSorting = function(layerId, sortingType)
    {
        sceneManager.renderer.setLayerSorting(layerId, sortingType);
    };

    /**
     * Set a coordinate transformation for the layer. This will determine how the objects in the layer are rotated and translated when the camera moves
     * @param {number} layerId The layer id
     * @param {number} scale The scale transformation factor. The default value is 1. A value of 0 indicates that no scaling will occur when the camera moves. Higher values indicate more scaling.
     * @param {number} translate The transformation factor. The default value is 1. A value of 0 indicates that no translation will occur when the camera moves.  Higher values indicate larger translations.
     */
    this.setLayerTransform = function(layerId, scale, translate)
    {
        sceneManager.renderer.setLayerTransform(layerId, scale, translate);
    };

    /**
     * Set the resolution factor for a specific layer
     * @param {number} layerId The layer id
     * @param {number} resolutionFactor The resolution factor. It must be > 0. 1 indicates full resolution, < 1 lower resolution, > 1 higher resolution.
     */
    this.setLayerResolutionFactor = function(layerId, resolutionFactor)
    {
        sceneManager.renderer.setLayerResolutionFactor(layerId, resolutionFactor);
    };

    /**
     * Get the resolution factor for a specific  layer
     * @param {number} layerId The layer id
     * @returns {number} The resolution factor of the layer
     */
    this.getLayerResolutionFactor = function(layerId)
    {
        return sceneManager.renderer.getLayerResolutionFactor(layerId);
    };

    /**
     * Set the resolution factor for all layers
     * @param {number} _resolutionFactor The resolution factor. It must be > 0. 1 indicates full resolution, < 1 lower resolution, > 1 higher resolution.
     */
    this.setResolutionFactor = function(_resolutionFactor)
    {
        resolutionFactor = _resolutionFactor;
        sceneManager.renderer.setResolutionFactor(resolutionFactor);
    };

    /**
     * Get the current global resolution factor. Note that resolution factors of individual layers may be different, if they were set through setLayerResolutionFactor
     * @returns {number} The global resolution factor
     */
    this.getResolutionFactor = function()
    {
        return resolutionFactor;
    };

    /**
     * Get the width of the current render area
     * @returns {number} The width of the current render area
     */
    this.getScreenWidth = function()
    {
        return sceneManager.renderer.getScreenWidth();
    };

    /**
     * Get the hight of the current render area
     * @returns {number} The height of the current render area
     */
    this.getScreenHeight = function()
    {
        return sceneManager.renderer.getScreenHeight();
    };

    /**
     * Set the size of the render area. Note that, depending on the current window mode, changing the size of the render area may have no actual effect, although an onResize event will always be fired if the width and height specified are not the same as the current ones.
     * @param {number} width The width of the render area
     * @param {number} height The height of the render area
     */
    this.setScreenSize = function(width, height)
    {
        sceneManager.renderer.setScreenSize(width, height);
    };

    /**
     * Get the width of the window that contains the app
     * @returns {number} The width of the window that contains the app
     */
    this.getContainerWidth = function()
    {
        return this.isScreenRotated()? window.innerHeight : window.innerWidth;
    };

    /**
     * Get the height of the window that contains the app
     * @returns {number} The height of the window that contains the app
     */
    this.getContainerHeight = function()
    {
        return this.isScreenRotated()? window.innerWidth : window.innerHeight;
    };

    /**
     * Determine whether the canvas (or the portions of it that have changed) should be cleared between frames. This happens by default but, where possible, you may want to disable the clearing to improve performance.
     * @param {number} layerId The layer id
     * @param {boolean} toggle Whether to clear the canvas between frames
     */
    this.setCanvasClearing = function(layerId, toggle)
    {
        sceneManager.renderer.setCanvasClearing(layerId, toggle);
    };

    /**
     * Set the current window mode. This determines how the render area will be resized when the parent window is resized.
     * @param {string} mode The window mode. Valid values are:<br/>
     * 'full' - The render area will be resized to cover the whole window, as long as it's between the minimum and maximum screen sizes (see setMinScreenSize and setMaxScreenSize)<br/>
     * 'stretchToFit' - The render area will be resized to cover as much as possible of the parent window, without changing its aspect ratio<br/>
     * any other string - The render area will never be resized<br/>
     * The default value is 'full'
     */
    this.setWindowMode = function(mode)
    {
        sceneManager.renderer.setWindowMode(mode);
    };

    /**
     * Get the current window mode.
     * @returns {string} The current window mode.
     */
    this.getWindowMode = function()
    {
        return sceneManager.renderer.getWindowMode();
    };

    /**
     * Open a web page in the app's window.
     * @param {string} url The address of the web page to open
     */
    this.loadPage = function(url)
    {
        self.location = url;
    };

    /**
     * Clone an object
     * @param {Object} object The object to clone
     * @returns {Object} A clone of the original object
     */
    this.cloneObject = function(object)
    {
        return jQuery.extend(true, {}, object);
    };

    /**
     * Clone an array
     * @param {Array} array The array to clone
     * @returns {Array} A clone of the original array
     */
    this.cloneArray = function(array)
    {
        return jQuery.extend(true, [], array);
    };

    /**
     * Enable or disable the simulation of a scene object
     * @param {SceneObject} sceneObject The scene object
     * @param {boolean} toggle Whether to enable the simulation
     */
    this.simulateSceneObject = function(sceneObject, toggle)
    {
        if (toggle)
        {
            if (!sceneObject.simulated)
            {
                sceneManager.addEventListener(sceneObject, 'onSimulationStep');
                sceneObject.simulated = true;
            }
        }
        else
        {
            if (sceneObject.simulated)
            {
                sceneManager.removeEventListener(sceneObject, 'onSimulationStep');
                sceneObject.simulated = false
            }
        }
    };

    /**
     * Set the maximum width and height of the render area. When the window mode is set to full, even when the render area is automatically resized it will never be larger than the specified dimensions.<br/>
     * The default values are 1920 and 1080
     * @param {number} width The maximum width of the render area
     * @param {number} height The maximum height of the render area
     */
    this.setMaxScreenSize = function(width, height)
    {
        sceneManager.renderer.setMaxScreenSize(width, height);
    };

    /**
     * Get the maximum width of the render area
     * @returns {number} The maximum width of the render area, as set with the last call to <i>setMaxScreenWidth</i>, or 1920 by default
     */
    this.getMaxScreenWidth = function()
    {
        return sceneManager.renderer.getMaxScreenWidth();
    };

    /**
     * Get the maximum height of the render area
     * @returns {number} The maximum height of the render area, as set with the last call to <i>setMaxScreenHeight</i>, or 1080 by default
     */
    this.getMaxScreenHeight = function()
    {
        return sceneManager.renderer.getMaxScreenHeight();
    };

    /**
     * Set the minimum width and height of the render area. When the window mode is set to full, even when the render area is automatically resized it will never be smaller than the specified dimensions.<br/>
     * The default values are 0 and 0
     * @param {number} width The minimum width of the render area
     * @param {number} height The minimum height of the render area
     */
    this.setMinScreenSize = function(width, height)
    {
        return sceneManager.renderer.setMinScreenSize(width, height);
    };

    /**
     * Get the minimum width of the render area
     * @returns {number} The minimum width of the render area, as set with the last call to <i>setMinScreenWidth</i>, or 0 by default
     */
    this.getMinScreenWidth = function()
    {
        return sceneManager.renderer.getMinScreenWidth();
    };

    /**
     * Get the minimum height of the render area
     * @returns {number} The minimum height of the render area, as set with the last call to <i>setMinScreenHeight</i>, or 0 by default
     */
    this.getMinScreenHeight = function()
    {
        return sceneManager.renderer.getMinScreenHeight();
    };

    /**
     * Create an HTML5 canvas object and add it to the document
     * @param {number} [resolutionFactor] Resolution relative to the the other canvas objects. 1 is full resolution, < 1 is lower resolution, > 1 is higher resolution. Default is 1. How this relates to the number of logical pixels in the canvas depends on the current window mode.
     * @returns {HTMLElement}
     */
    this.createCanvas = function(resolutionFactor)
    {
        resolutionFactor = resolutionFactor || 1;

        // get the main canvas object to copy some properties from it
        var mainCanvas = document.getElementById(containerDiv);
        var $containerDiv = $("#" + containerDiv);
        var mainWidth = parseInt($containerDiv.attr("width"));
        var mainHeight = parseInt($containerDiv.attr("height"));

        // create a new canvas object
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(mainWidth * resolutionFactor);
        canvas.height = Math.round(mainHeight * resolutionFactor);
        canvas.style.position = mainCanvas.style.position;
        canvas.style.margin = 'auto';
        canvas.style.top = 0;
        canvas.style.left = 0;
        canvas.style.right = 0;
        canvas.style.bottom = 0;
        canvas.style['backfaceVisibility'] = canvas.style['WebkitBackfaceVisibility'] = canvas.style['MozBackfaceVisibility'] = canvas.style['OBackfaceVisibility'] = 'hidden';

        // calculate css width and height relative to the main canvas
        var w = canvas.style.width.toString().toLowerCase();
        var h = canvas.style.height.toString().toLowerCase();
        if (w == h && w == 'auto')
        {
            canvas.style.width = mainWidth + 'px';
            canvas.style.height = mainHeight + 'px';
        }
        else
        {
            canvas.style.width = mainCanvas.style.width;
            canvas.style.height = mainCanvas.style.height;
        }

        // set css transform
        canvas.style['MozTransform'] =  canvas.style['msTransform'] = canvas.style['OTransform'] = canvas.style['WebkitTransform'] = canvas.style['transform'] = 'translate3d(0,0,0)';

        // add the canvas to the html document
        mainCanvas.appendChild(canvas);
        return canvas;
    };

    /**
     * Delete all the canvas objects created by WADE
     */
    this.deleteCanvases = function()
    {
        sceneManager.renderer.removeCanvases();
    };

    /**
     * Recreate canvas objects that were delete with a call to wade.deleteCanvases
     */
    this.recreateCanvases = function()
    {
        sceneManager.renderer.recreateCanvases();
    };

    /**
     * Checks whether the init function for the app has been executed
     */
    this.isAppInitialized = function()
    {
        return appInitialised;
    };

    /**
     * Check whether box1 contains box2
     * @param {Object} box1 An object representing a box with the following fields: 'minX', 'minY', 'maxX', 'maxY'
     * @param {Object} box2 An object representing a box with the following fields: 'minX', 'minY', 'maxX', 'maxY'
     * @returns {boolean} Whether box1 contains box2
     */
    this.boxContainsBox = function(box1, box2)
    {
        return (box1.minX < box2.minX && box1.maxX > box2.maxX && box1.minY < box2.minY && box1.maxY > box2.maxY);
    };

    /**
     * Check whether box1 and box2 intersect each other
     * @param {Object} box1 An object representing a box with the following fields: 'minX', 'minY', 'maxX', 'maxY'
     * @param {Object} box2 An object representing a box with the following fields: 'minX', 'minY', 'maxX', 'maxY'
     * @returns {boolean} Whether box1 and box2 intersect each other
     */
    this.boxIntersectsBox = function(box1, box2)
    {
        return !(box1.maxX < box2.minX || box1.minX > box2.maxX || box1.maxY < box2.minY || box1.minY > box2.maxY);
    };

    /**
     * Check whether a box contains a point
     * @param {Object} box An object representing a box with the following fields: 'minX', 'minY', 'maxX', 'maxY'
     * @param {Object} point An object with the following fields: 'x', 'y'
     * @returns {boolean} Whether box contains point
     */
    this.boxContainsPoint = function(box, point)
    {
        return (point.x >= box.minX && point.x <= box.maxX && point.y >= box.minY && point.y <= box.maxY);
    };

    /**
     * Check whether an oriented box contains a point
     * @param {Object} ob An object with 'centerX' and 'centerY' fields representing its center coordinates, and the following fields:<br/>
     * 'axisXx' and 'axisXy' represent the rotated X axis (the Width axis) of the rectangle in world-space coordinates. The length of the axisX vector must be half the width of the rectangle.<br/>
     * 'axisYx' and 'axisYy' represent the rotated Y axis (the Height axis) of the rectangle in world-space coordinates. The length of the axisY vector must be half the height of the rectangle.
     * @param {Object} point An object with the following fields: 'x', 'y'
     * @returns {boolean} Whether orientedBox contains point
     */
    this.orientedBoxContainsPoint = function(ob, point)
    {
        var s = Math.sin(ob.rotation);
        var c = Math.cos(ob.rotation);
        var dx = point.x - ob.centerX;
        var dy = point.y - ob.centerY;
        var x = c * dx + s * dy;
        var y = c * dy - s * dx;
        return (x >= -ob.halfWidth && x <= ob.halfWidth && y >= -ob.halfHeight && y <= ob.halfHeight);
    };

    /**
     * Check whether two oriented boxes intersect each other. Each box must be an object with 'centerX' and 'centerY' fields representing its center coordinates, and the following fields:<br/>
     * 'axisXx' and 'axisXy' represent the rotated X axis (the Width axis) of the rectangle in world-space coordinates. The length of the axisX vector must be half the width of the rectangle.<br/>
     * 'axisYx' and 'axisYy' represent the rotated Y axis (the Height axis) of the rectangle in world-space coordinates. The length of the axisY vector must be half the height of the rectangle.
     * @param {Object} ob1 An oriented box
     * @param {Object} ob2 The other oriented box
     * @returns {boolean} Whether the two boxes intersect each other
     */
    this.orientedBoxIntersectsOrientedBox = function(ob1, ob2)
    {
        var tx = ob2.centerX - ob1.centerX;
        var ty = ob2.centerY - ob1.centerY;
        var axx = ob1.axisXx;
        var axy = ob1.axisXy;
        var ayx = ob1.axisYx;
        var ayy = ob1.axisYy;
        var bxx = ob2.axisXx;
        var bxy = ob2.axisXy;
        var byx = ob2.axisYx;
        var byy = ob2.axisYy;
        return !(Math.abs(tx * axx + ty * axy) > axx * axx + axy * axy + Math.abs(bxx * axx + bxy * axy) + Math.abs(byx * axx + byy * axy) ||
                 Math.abs(tx * ayx + ty * ayy) > ayx * ayx + ayy * ayy + Math.abs(bxx * ayx + bxy * ayy) + Math.abs(byx * ayx + byy * ayy) ||
                 Math.abs(tx * bxx + ty * bxy) > bxx * bxx + bxy * bxy + Math.abs(bxx * axx + bxy * axy) + Math.abs(bxx * ayx + bxy * ayy) ||
                 Math.abs(tx * byx + ty * byy) > byx * byx + byy * byy + Math.abs(byx * axx + byy * axy) + Math.abs(byx * ayx + byy * ayy));
    };

    /**
     * Check whether an axis-aligned box and an oriented box overlap each other.
     * @param {Object} box An object representing a box with the following fields: 'minX', 'minY', 'maxX', 'maxY'
     * @param {Object} ob An object with 'centerX' and 'centerY' fields representing its center coordinates, and the following fields:<br/>
     * 'axisXx' and 'axisXy' represent the rotated X axis (the Width axis) of the rectangle in world-space coordinates. The length of the axisX vector must be half the width of the rectangle.<br/>
     * 'axisYx' and 'axisYy' represent the rotated Y axis (the Height axis) of the rectangle in world-space coordinates. The length of the axisY vector must be half the height of the rectangle.
     * @returns {boolean}
     */
    this.boxIntersectsOrientedBox = function(box, ob)
    {
        var tx = (box.minX + box.maxX) / 2 - ob.centerX;
        var ty = (box.minY + box.maxY) / 2 - ob.centerY;
        var axx = (box.maxX - box.minX) / 2;
        var ayy = (box.maxY - box.minY) / 2;
        var bxx = ob.axisXx;
        var bxy = ob.axisXy;
        var byx = ob.axisYx;
        var byy = ob.axisYy;
        return !(Math.abs(tx * axx) > axx * axx + Math.abs(bxx * axx) + Math.abs(byx * axx) ||
                 Math.abs(ty * ayy) > ayy * ayy + Math.abs(bxy * ayy) + Math.abs(byy * ayy) ||
                 Math.abs(tx * bxx + ty * bxy) > bxx * bxx + bxy * bxy + Math.abs(bxx * axx) + Math.abs(bxy * ayy) ||
                 Math.abs(tx * byx + ty * byy) > byx * byx + byy * byy + Math.abs(byx * axx) + Math.abs(byy * ayy));
    };

    /**
     * Check whether an axis-aligned box and an oriented box overlap each other.
     * @param {Object} box An object representing a box with the following fields: 'minX', 'minY', 'maxX', 'maxY'
     * @param {Object} ob An object with 'centerX' and 'centerY' fields representing its center coordinates, and the following fields:<br/>
     * 'axisXx' and 'axisXy' represent the rotated X axis (the Width axis) of the rectangle in world-space coordinates. The length of the axisX vector must be half the width of the rectangle.<br/>
     * 'axisYx' and 'axisYy' represent the rotated Y axis (the Height axis) of the rectangle in world-space coordinates. The length of the axisY vector must be half the height of the rectangle.
     * @returns {boolean}
     */
    this.orientedBoxIntersectsBox = function(ob, box)
    {
        return this.boxIntersectsOrientedBox(box, ob);
    };

    /**
     * Expand box1 so that it encompasses both box1 and box2
     * @param {Object} box1 An object representing a box with the following fields: 'minX', 'minY', 'maxX', 'maxY'
     * @param {Object} box2 An object representing a box with the following fields: 'minX', 'minY', 'maxX', 'maxY'
     */
    this.expandBox = function(box1, box2)
    {
        box1.minX = Math.min(box1.minX, box2.minX);
        box1.minY = Math.min(box1.minY, box2.minY);
        box1.maxX = Math.max(box1.maxX, box2.maxX);
        box1.maxY = Math.max(box1.maxY, box2.maxY);
    };

    /**
     * Resize box1 so that it's fully contained in box2
     * @param {Object} box1 An object representing a box with the following fields: 'minX', 'minY', 'maxX', 'maxY'
     * @param {Object} box2 An object representing a box with the following fields: 'minX', 'minY', 'maxX', 'maxY'
     */
    this.clampBoxToBox = function(box1, box2)
    {
        box1.minX = Math.max(box1.minX , box2.minX);
        box1.minY = Math.max(box1.minY , box2.minY);
        box1.maxX = Math.min(box1.maxX , box2.maxX);
        box1.maxY = Math.min(box1.maxY , box2.maxY);
    };

    /**
     * Send an object to a server. The object is serialized to JSON before being sent.
     * @param {string} url The web address to send the object to
     * @param {Object} object A javascript object to send
     * @param {function} callback A function to call when the server replies
     * @param {Object} extraParameters An object containing extra parameters to send together with the object (for example a cookie for csrf prevention)
     */
    this.postObject = function(url, object, callback, extraParameters)
    {
        var dataObject = {data: JSON.stringify(object)};
        if (extraParameters)
        {
            jQuery.extend(dataObject, extraParameters);
        }
        $.ajax({
            type: 'POST',
            url: url,
            data: dataObject,
            complete: callback,
            dataType: 'json'
        });
    };

    /**
     * Set a callback to be executed when all the pending loading requests terminate. Note that preloading requests are ignored for this purpose.
     * @param {function} callback A callback to be executed when all the pending loading requests terminate
     */
    this.setGlobalLoadingCallback = function(callback)
    {
        assetLoader.setGlobalCallback(callback);
    };

    /**
     * Set or remove a callback to be executed after each simulation step. Callbacks can be named, and you can have multiple ones active at the same time (although only one for each name).
     * @param {function} [callback] The function to be executed after each simulation step. You can use a falsy value here (such as 0) to disable the callback
     * @param {string} [name] The name you want to give to the callback. Subsequent calls to setMainLoopCallback() with the same name, will replace the callback you are setting now.
     * @param {number} [priority] When there are multiple callbacks, they will be executed in ascending order of priority. Default is 0
     */
    this.setMainLoopCallback = function(callback, name, priority)
    {
        name = name || '_wade_default';
        priority = priority || 0;
        for (var i=0; i<mainLoopCallbacks.length && (mainLoopCallbacks[i].name != name); i++) {}
        mainLoopCallbacks[i] = {func: callback, name: name, priority: priority};
        mainLoopCallbacks.sort(function(a, b) {return b.priority - a.priority;});
    };

    /**
     * Set the loading image(s) to be displayed while loading data
     * @param {string|Array} files An image file name, or an arrray of image file names. These images don't need to be loaded using loadImage
     * @param {string} [link] An URL to open when the loading image is clicked. The link is opened in a new window (or tab).
     */
    this.setLoadingImages = function(files, link)
    {
        for (var i=0; i<loadingImages.length; i++)
        {
            document.body.removeChild(loadingImages[i]);
        }
        loadingImages.length = 0;

        if (!jQuery.isArray(files))
        {
            files = [files];
        }
        for (i=0; i<files.length; i++)
        {
            // create a loading image
            var loadingImage = document.createElement('img');
            loadingImage.className = 'loadingImage_class';
            loadingImage.style.display = 'none';
            var div = document.getElementById('container');
            document.body.insertBefore(loadingImage, div);

            // point it to the specified file name
            var file = files[i];
            loadingImage.src = this.getFullPathAndFileName(file);
            loadingImages.push(loadingImage);

            // if there's a link associated with the loading images, add an event listener
            if (link)
            {
                loadingImage.addEventListener('click', function()
                {
                    window.open(link, '_blank');
                });
            }
        }
    };

    /**
     * Transform a world space position into screen space
     * @param {number} layerId The id of the layer to use. This determines the translation and scale factors to use in the transformation.
     * @param {Object} position An object whose 'x' and 'y' fields represent a world space position
     * @returns {Object} An object whose 'x' and 'y' fields represent a screen space position
     */
    this.worldPositionToScreen = function(layerId, position)
    {
        return sceneManager.renderer.worldPositionToScreen(layerId, position);
    };

    /**
     * Transform a world space direction into screen space
     * @param {number} layerId The id of the layer to use. This determines the translation and scale factors to use in the transformation.
     * @param {Object} direction An object whose 'x' and 'y' fields represent a world space direction
     * @returns {Object} An object whose 'x' and 'y' fields represent a screen space direction
     */
    this.worldDirectionToScreen = function(layerId, direction)
    {
        return sceneManager.renderer.worldDirectionToScreen(layerId, direction);
    };

    /**
     * Transform a world space box into screen space
     * @param {number} layerId The id of the layer to use. This determines the translation and scale factors to use in the transformation.
     * @param {Object} box An object whose 'minX', 'minY', 'maxX' and 'maxY' fields represent a world space box
     * @returns {Object} An object whose 'minX', 'minY', 'maxX' and 'maxY' fields represent a screen space box
     */
    this.worldBoxToScreen = function(layerId, box)
    {
        return sceneManager.renderer.worldBoxToScreen(layerId, box);
    };

    /**
     * Get the size (in screen pixels) of a world-space unit
     * @param {number} layerId The id of the layer to use. This determines the translation and scale factors to use in the transformation.
     * @returns {number} The size of a world-space unit in screen pixels
     */
    this.worldUnitToScreen = function(layerId)
    {
        return sceneManager.renderer.worldUnitToScreen(layerId);
    };

    /**
     * Transform a screen space position into world space
     * @param {number} layerId The id of the layer to use. This determines the translation and scale factors to use in the transformation.
     * @param {Object} position An object whose 'x' and 'y' fields represent a screen space position
     * @returns {Object} An object whose 'x' and 'y' fields represent a world space position
     */
    this.screenPositionToWorld = function(layerId, position)
    {
        return sceneManager.renderer.screenPositionToWorld(layerId, position);
    };

    /**
     * Transform a screen space direction into world space
     * @param {number} layerId The id of the layer to use. This determines the translation and scale factors to use in the transformation.
     * @param {Object} direction An object whose 'x' and 'y' fields represent a screen space direction
     * @returns {Object} An object whose 'x' and 'y' fields represent a world space direction
     */
    this.screenDirectionToWorld = function(layerId, direction)
    {
        return sceneManager.renderer.screenDirectionToWorld(layerId, direction);
    };

    /**
     * Transform a screen space box into world space
     * @param {number} layerId The id of the layer to use. This determines the translation and scale factors to use in the transformation.
     * @param {Object} box An object whose 'minX', 'minY', 'maxX' and 'maxY' fields represent a screen space box
     * @returns {Object} An object whose 'minX', 'minY', 'maxX' and 'maxY' fields represent a world space box
     */
    this.screenBoxToWorld = function(layerId, box)
    {
        return sceneManager.renderer.screenBoxToWorld(layerId, box);
    };

    /**
     * Get the size of a screen pixel in world-space units
     * @param {number} layerId The id of the layer to use. This determines the translation and scale factors to use in the transformation.
     * @returns {number} The size of a screen pixel in world-space units
     */
    this.screenUnitToWorld = function(layerId)
    {
        return sceneManager.renderer.screenUnitToWorld(layerId);
    };

    /**
     * Transform a world space position into canvas space
     * @param {number} layerId The id of the layer to use. This determines the translation and scale factors to use in the transformation.
     * @param {Object} position An object whose 'x' and 'y' fields represent a world space position
     * @returns {Object} An object whose 'x' and 'y' fields represent a canvas space position
     */
    this.worldPositionToCanvas = function(layerId, position)
    {
        return sceneManager.renderer.worldPositionToCanvas(layerId, position);
    };

    /**
     * Transform a world space direction into canvas space
     * @param {number} layerId The id of the layer to use. This determines the translation and scale factors to use in the transformation.
     * @param {Object} direction An object whose 'x' and 'y' fields represent a world space direction
     * @returns {Object} An object whose 'x' and 'y' fields represent a canvas space direction
     */
    this.worldDirectionToCanvas = function(layerId, direction)
    {
        return sceneManager.renderer.worldDirectionToCanvas(layerId, direction);
    };

    /**
     * Transform a world space box into canvas space
     * @param {number} layerId The id of the layer to use. This determines the translation and scale factors to use in the transformation.
     * @param {Object} box An object whose 'minX', 'minY', 'maxX' and 'maxY' fields represent a world space box
     * @returns {Object} An object whose 'minX', 'minY', 'maxX' and 'maxY' fields represent a canvas space box
     */
    this.worldBoxToCanvas = function(layerId, box)
    {
        return sceneManager.renderer.worldBoxToCanvas(layerId, box);
    };

    /**
     * Get the size (in canvas pixels) of a world-space unit
     * @param {number} layerId The id of the layer to use. This determines the translation and scale factors to use in the transformation.
     * @returns {number} The size of a world-space unit in canvas pixels
     */
    this.worldUnitToCanvas = function(layerId)
    {
        return sceneManager.renderer.worldUnitToCanvas(layerId);
    };

    /**
     * Transform a canvas space position into world space
     * @param {number} layerId The id of the layer to use. This determines the translation and scale factors to use in the transformation.
     * @param {Object} position An object whose 'x' and 'y' fields represent a canvas space position
     * @returns {Object} An object whose 'x' and 'y' fields represent a world space position
     */
    this.canvasPositionToWorld = function(layerId, position)
    {
        return sceneManager.renderer.canvasPositionToWorld(layerId, position);
    };

    /**
     * Transform a canvas space direction into world space
     * @param {number} layerId The id of the layer to use. This determines the translation and scale factors to use in the transformation.
     * @param {Object} direction An object whose 'x' and 'y' fields represent a canvas space direction
     * @returns {Object} An object whose 'x' and 'y' fields represent a world space direction
     */
    this.canvasDirectionToWorld = function(layerId, direction)
    {
        return sceneManager.renderer.canvasDirectionToWorld(layerId, direction);
    };

    /**
     * Transform a canvas space box into world space
     * @param {number} layerId The id of the layer to use. This determines the translation and scale factors to use in the transformation.
     * @param {Object} box An object whose 'minX', 'minY', 'maxX' and 'maxY' fields represent a canvas space box
     * @returns {Object} An object whose 'minX', 'minY', 'maxX' and 'maxY' fields represent a world space box
     */
    this.canvasBoxToWorld = function(layerId, box)
    {
        return sceneManager.renderer.canvasBoxToWorld(layerId, box);
    };

    /**
     * Get the size of a canvas pixel in world-space units
     * @param {number} layerId The id of the layer to use. This determines the translation and scale factors to use in the transformation.
     * @returns {number} The size of a canvas pixel in world-space units
     */
    this.canvasUnitToWorld = function(layerId)
    {
        return sceneManager.renderer.canvasUnitToWorld(layerId);
    };

    /**
     * Set the minimum time between input events of the same type. Events occurring before the specified interval will be ignored.
     * @param {string} type The input event type. Valid values are 'mouseDown', 'mouseUp', 'mouseMove' and 'mouseWheel'
     * @param {number} interval The minimum interval between events of the same type, in milliseconds
     */
    this.setMinimumInputEventInterval = function(type, interval)
    {
        inputManager.setMinimumIntervalBetweenEvents(type, interval);
    };

    /**
     * Check whether a mouse button is currently pressed. For touch-screen devices, the return value represents whether the screen is being touched
     * @returns {boolean} Whether a mouse button is pressed
     */
    this.isMouseDown = function()
    {
        return inputManager.isMouseDown();
    };

    /**
     * Check whether a key is currently down (it's being pressed by the user).
     * @param keyCode The code of the key to check
     * @returns {boolean} Whether the key is pressed
     */
    this.isKeyDown = function(keyCode)
    {
        return inputManager.isKeyDown(keyCode);
    };

    /**
     * Create a separate image (more specifically an off-screen canvas) for each sprite in the sprite sheet
     * @param {string} spriteSheet The path of the input sprite sheet
     * @param {Array} [destinations] An array with the virtual paths for the single images, that can later be used to retrieve the canvas objects via wade.getImage(). If omitted, destination images will be called [spriteSheetName]_0, [spriteSheetName]_1, [spriteSheetName]_2, etc.
     * @param {number} [numCellsX=1] The number of horizontal cells
     * @param {number} [numCellsY=1] The number of vertical cells
     * @param {boolean} [unload] Whether to unload the sprite sheet after unpacking
     */
    this.unpackSpriteSheet = function(spriteSheet, destinations, numCellsX, numCellsY, unload)
    {
        numCellsX = numCellsX || 1;
        numCellsY = numCellsY || 1;
        var sheetImage = this.getImage(spriteSheet);
        var width = sheetImage.width / numCellsX;
        var height = sheetImage.height / numCellsY;
        for (var i=0; i<destinations.length && i < numCellsX * numCellsY; i++)
        {
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            var animation  = new Animation(spriteSheet, numCellsX, numCellsY, 1, false, i, i);
            animation.draw(canvas.getContext('2d'), {x: width / 2, y: height / 2}, {x: width, y: height});
            wade.setImage((destinations[i] || (spriteSheet + '_' + i)), canvas);
        }
        unload && this.unloadImage(spriteSheet);
    };

    /**
     * Store an object in the local storage. Note that the object must be serializable, so you cannot store objects with cyclic references
     * @param {string} name The name to give the object. This can later be used with a call to retrieveLocalObject
     * @param {object} object The object to store
     */
    this.storeLocalObject = function(name, object)
    {
        localStorage.setItem(name, JSON.stringify(object));
    };

    /**
     * Retrieve an object from the local storage, that has previously been saved through storeLocalObject()
     * @param {string} name The name of the object to retrieve
     */
    this.retrieveLocalObject = function(name)
    {
        var object = localStorage.getItem(name);
        return (object && JSON.parse(object));
    };

    /**
     * Enable or disable double buffering for the on-screen canvases. When double buffering is enabled, each layer uses two canvases: one is visible, the other is hidden.
     * Whenever a layer needs a full redraw, this is done on the invisible canvas, and when the operation is completed, the two canvases are swapped.
     * @param {boolean} [toggle] whether to enable or disable double buffering
     */
    this.enableDoubleBuffering = function(toggle)
    {
        if (typeof(toggle) == 'undefined')
        {
            toggle = true;
        }
        if (doubleBuffering != toggle)
        {
            sceneManager.renderer.enableDoubleBuffering(toggle);
            doubleBuffering = toggle;
        }
    };

    /**
     * Check the current state of double buffering. When double buffering is enabled, each layer uses two canvases: one is visible, the other is hidden.
     * Whenever a layer needs a full redraw, this is done on the invisible canvas, and when the operation is completed, the two canvases are swapped.
     * @returns {boolean} The current state of double buffering
     */
    this.isDoubleBufferingEnabled = function()
    {
        return doubleBuffering;
    };

    /**
     * Toggle full screen mode. Note that not all browsers support this, so it may fail. Also, call this from an onMouseUp or onClick event to increase the chances of success.
     * @param {boolean} [toggle] Whether to enable or disable full screen mode. If not specified, "true" is assumed.
     */
    this.setFullScreen = function(toggle)
    {
        var element = document.documentElement;
        var f;
        if (toggle || typeof(toggle) == 'undefined')
        {
            f = element.requestFullScreen || element.requestFullscreen || element.mozRequestFullScreen || element.mozRequestFullscreen || element.webkitRequestFullScreen || element.webkitRequestFullscreen || element.msRequestFullScreen || element.msRequestFullscreen;
        }
        else
        {
            element = document;
            f = element.exitFullscreen || element.msExitFullscreen || element.mozCancelFullScreen || element.webkitCancelFullScreen;
        }
        f && f.call(element);
    };

    /**
     * Enable or disable image smoothing for a specific layer. This determines the type of filtering that is applied to stretched images (nearest-neighbor filtering is used when smoothing is disabled). Note that smoothing is true by default.
     * @param {number} layerId The id of the affected layer
     * @param {boolean} [toggle] Whether to enable or disable image smoothing for the layer. If not specified, "true" is assumed.
     */
    this.setLayerSmoothing = function(layerId, toggle)
    {
        if (typeof(toggle) == 'undefined')
        {
            toggle = true;
        }
        sceneManager.renderer.setLayerSmoothing(layerId, toggle);
    };

    /**
     * Get the current image smoothing state for a specific layer
     * @param layerId The layer id
     * @returns {boolean} The image smoothing state for the specified layer
     */
    this.getLayerSmoothing = function(layerId)
    {
        return sceneManager.renderer.getLayerSmoothing(layerId);
    };

    /**
     * Enable or disable image smoothing for all layers. This determines the type of filtering that is applied to stretched images (nearest-neighbor filtering is used when smoothing is disabled). Note that smoothing is true by default.
     * @param {boolean} [toggle] Whether to enable or disable image smoothing. If not specified, "true" is assumed.
     */
    this.setSmoothing = function(toggle)
    {
        if (typeof(toggle) == 'undefined')
        {
            toggle = true;
        }
        sceneManager.renderer.setSmoothing(toggle);
    };

    /**
     * Get the "global" image smoothing state. This is the image smoothing state that is applied to all the layers, unless setLayerSmoothing has been called for some specific layers.
     * @returns {boolean} The global image smoothing state
     */
    this.getSmoothing = function()
    {
        return sceneManager.renderer.getSmoothing();
    };

    /**
     * Set a tolerance for "onClick" events. A click is defined as a mouseDown followed by a mouseUp in the same place. However, especially in a touch-screen environment, it is possible (and indeed frequent) that the two events occur in slightly different places. Use this function to define the tolerance that you want for click events - default is 5.
     * @param {number} [tolerance] The tolerance for "onClick" events, in pixels.
     */
    this.setClickTolerance = function(tolerance)
    {
        inputManager.setClickTolerance(tolerance);
    };

    /**
     * Get the current mouse position, or the position of the last input event (in the case of touch events). Note that if there have been no mouse or input events since the app started, this will return an empty object
     * @returns {object} An object with 'x' and 'y' fields describing the screen coordinates of the mouse, or of the last input event
     */
    this.getMousePosition = function()
    {
        return inputManager.getMousePosition();
    };

    /**
     * Checks whether the WebAudio API is supported by the client
     * @returns {boolean} whether the WebAudio API is supported
     */
    this.isWebAudioSupported = function()
    {
        return !!audioContext;
    };

    /**
     * Force the app to be displayed in a certain orientation. For example, if the orientation is set to 'landscape', but the screen is taller than it is wide, the app will be rendered rotated by 90 degrees. Forced orientation is disabled by default.
     * @param {string} [orientation] The orientation to use. This can be 'landscape', 'portrait', or any other string (to disable forced orientation).
     */
    this.forceOrientation = function(orientation)
    {
        if (forcedOrientation != orientation)
        {
            switch (orientation)
            {
                case 'landscape':
                    forcedOrientation = 'landscape';
                    break;
                case 'portrait':
                    forcedOrientation = 'portrait';
                    break;
                default:
                    forcedOrientation = 'none';
            }
            sceneManager.setSimulationDirtyState();
            sceneManager.draw();
        }
    };

    /**
     * Checks if the app is being displayed in forced orientation mode.
     * @returns {string} A string describing the forced orientation. It can be 'landscape', 'portrait', or 'none'
     */
    this.getForcedOrientation = function()
    {
        return forcedOrientation;
    };

    /**
     * Checks whether the screen is rotated, with respect to the orientation that was set with forceOrientation(). For example, this returns true if forceOrientation() was called to set a 'landscape' orientation, and now the screen is taller than it is wide (therefore the screen appears rotated by 90 degrees to the viewer).
     * @returns {boolean}
     */
    this.isScreenRotated = function()
    {
        return sceneManager.renderer.isScreenRotated();
    };

    /**
     * Gradually move the camera to the specified position, with the specified speed. If wade.app.onCameraMoveComplete exists, it's executed when the camera finishes moving. If you need to change the camera position instantly, use setCameraPosition() instead.
     * @param {object} destination The destination of the camera. This is an object with 'x', 'y' and 'z' fields, where 'z' is depth (or distance from the scene), and is 1 by default.
     * @param {number|function} [speed] The movement speed. This can be a number, or a function of distance that returns a number
     * @param {function} [callback] A function to execute when the camera is finished moving. Using this callback is the same as defining an App.onCameraMoveComplete function, which would be called when the camera is finished moving.
     */
    this.moveCamera = function(destination, speed, callback)
    {
        // check parameters
        if (typeof(destination) != 'object' || typeof(destination.x) != 'number' || typeof(destination.y) != 'number' || typeof(destination.z) != 'number')
        {
            wade.log("Warning - invalid destination for wade.moveCamera(). It needs to be an object with x, y, and z fields.");
            return;
        }
        else if (typeof(speed) != 'number' && typeof(speed) != 'function')
        {
            wade.log("Warning - invalid speed for wade.moveCamera(). It needs to be a number, or a function that returns a number.");
            return;
        }

        // set a main loop function for the camera movement
        this.setMainLoopCallback(function()
        {
            var pos = wade.getCameraPosition();
            var dx = (destination.x - pos.x);
            var dy = (destination.y - pos.y);
            var dz = (destination.z - pos.z);
            var length = Math.sqrt(dx*dx + dy*dy + dz*dz);
            var s = (typeof(speed) == 'number')?  speed : (speed(length) || 0);
            if (length <= s * wade.c_timeStep)
            {
                wade.setCameraPosition(destination);
                wade.setMainLoopCallback(0, '_wade_camera');
                callback && callback();
                wade.app.onCameraMoveComplete && wade.app.onCameraMoveComplete();
            }
            else
            {
                wade.setCameraPosition({x: pos.x + dx * s * wade.c_timeStep / length, y: pos.y + dy * s * wade.c_timeStep / length, z: pos.z + dz * s * wade.c_timeStep / length});
            }
        }, '_wade_camera');
    };

    /**
     * Set a scene object for the camera to follow.
     * @param {SceneObject} [target] The scene object to follow. If omitted or falsy, the camera target is cleared.
     * @param {number} [inertia] The inertia of the camera, between 0 (no inertia) and 1 (maximum inertia, i.e. the camera doesn't move at all)
     * @param {object} [offset] An object with 'x' and 'y' fields, that specifies an offset relative to the center of the target scene object to follow.
     */
    this.setCameraTarget = function(target, inertia, offset)
    {
        if (!target)
        {
            this.setMainLoopCallback(0, '_wade_cameraTarget');
            return;
        }
        inertia = inertia || 0;
        offset = offset || {x:0, y:0};
        this.setMainLoopCallback(function()
        {
            if (target.isInScene())
            {
                var targetPos = target.getPosition();
                var cameraPos = wade.getCameraPosition();
                targetPos.x += offset.x;
                targetPos.y += offset.y;
                targetPos.z = cameraPos.z;
                if (inertia)
                {
                    var actualPos = {x: targetPos.x * (1 - inertia) + cameraPos.x * inertia,
                                     y: targetPos.y * (1 - inertia) + cameraPos.y * inertia,
                                     z: targetPos.z * (1 - inertia) + cameraPos.z * inertia};
                    var dx = actualPos.x - targetPos.x;
                    var dy = actualPos.y - targetPos.y;
                    var dz = actualPos.z - targetPos.z;
                    if (dx*dx + dy*dy + dz*dz > inertia * inertia)
                    {
                        targetPos = actualPos;
                    }
                }
                wade.setCameraPosition(targetPos);
            }
        }, '_wade_cameraTarget');
    };

    /**
     * Get the objects inside (or intersecting) the specified area, expressed in world units
     * @param {object} area An object with the following fields (in world-space units): 'minX', 'minY', 'maxX', 'maxY'
     * @param {number} [layerId] If specified, the object search will be restricted to this layer id
     * @returns {Array} An array of scene objects
     */
    this.getObjectsInArea = function(area, layerId)
    {
        var result = [];
        sceneManager.renderer.addObjectsInAreaToArray(area, result, layerId);
        return result;
    };

    /**
     * Get the objects inside (or intersecting) the specified area, expressed in screen units
     * @param {object} area An object with the following fields (in screen-space units): 'minX', 'minY', 'maxX', 'maxY'
     * @returns {Array} An array of scene objects
     */
    this.getObjectsInScreenArea = function(area)
    {
        var result = [];
        sceneManager.renderer.addObjectsInScreenAreaToArray(area, result);
        return result;
    };

    /**
     * Get the sprites inside (or intersecting) the specified area, expressed in world units
     * @param {object} area An object with the following fields (in world-space units): 'minX', 'minY', 'maxX', 'maxY'
     * @param {number} [layerId] If specified, the sprite search will be restricted to this layer id
     * @returns {Array} An array of sprites
     */
    this.getSpritesInArea = function(area, layerId)
    {
        var result = [];
        sceneManager.renderer.addSpritesInAreaToArray(area, result, layerId);
        return result;
    };

    /**
     * Get the sprites inside (or intersecting) the specified area, expressed in screen units
     * @param {object} area An object with the following fields (in screen-space units): 'minX', 'minY', 'maxX', 'maxY'
     * @returns {Array} An array of sprites
     */
    this.getSpritesInScreenArea = function(area)
    {
        var result = [];
        sceneManager.renderer.addSpritesInScreenAreaToArray(area, result);
        return result;
    };

    /**
     * Get a scene object by name. This only works with objects that have been added to the scene.
     * @param {string} name The name of the scene object to look for
     * @returns {SceneObject} The scene object corresponding to the given name, or null if no SceneObjects have that name
     */
    this.getSceneObject = function(name)
    {
        return sceneManager.getObjectByName(name);
    };

    /**
     * Get a list of all the objects in the scene, or just the objects with a given property/value pair.
     * @param {string} [property] A property that must be set for the objects. Omit this parameter or use a falsy value to get all the objects in the scene.
     * @param {*} [value] The value that the property must be set to. You can omit this parameter to get all the objects where the property is defined, regarding of its value
     * @returns {Array} An array containing references to all the objects that are currently present in the scene
     */
    this.getSceneObjects = function(property, value)
    {
        return sceneManager.getSceneObjects(property, value);
    };

    /**
     * Get the raw data of an image file or canvas, as an array of bytes
     * @param {string} file The file name associated with the image or canvas resource
     * @param {number} [posX] The left coordinate of the data to retrieve. Default is 0.
     * @param {number} [posY] The top coordinate of the data to retrieve. Default is 0.
     * @param {number} [width] The width of the image data to retrieve. By default this is the whole width of the image.
     * @param {number} [height] The height of the image data to retrieve. By default this is the whole height of the image.
     * @returns {ImageData} An HTML ImageData object containing the image data. Use its <i>data</i> property to access the byte array, where pixels are stored sequentially and for each pixel there are 4 bytes representing the red, green, blue and alpha channels in this order.
     */
    this.getImageData = function(file, posX, posY, width, height)
    {
        var fileName = this.getFullPathAndFileName(file);
        var canvas = assetLoader.getImage(fileName);
        var context;

        // it may be that the asset manager stored this asset as a canvas, or as an image. If it isn't a canvas, create a canvas and draw the image onto it
        if (!canvas.getContext)
        {
            var img = canvas;
            canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            context = canvas.getContext('2d');
            context.drawImage(img, 0, 0);
            wade.setImage(file, canvas);
        }
        else
        {
            context = canvas.getContext('2d');
        }
        return context.getImageData(posX || 0, posY || 0, width || canvas.width, height || canvas.height);
    };

    /**
     * Write raw data into an image or canvas resource. Best used in conjunctions with wade.getImageData()
     * @param {string} file The file name associated with the image or canvas resource to modify. If a resource associated with this file name doesn't exist, it will be created and its dimensions will be set to the specified width and height, or to the image data's width and height if the widht and height parameters aren't set explicitly.
     * @param {ImageData} data A HTML ImageData object containing the raw data
     * @param {number} [destX] The left coordinate of the destination image (where the data is going to copied). Default is 0.
     * @param {number} [destY] The top coordinate of the destination image (where the data is going to copied). Default is 0.
     * @param {number} [sourceX] The left coordinate of  the source data to copy. Default is 0.
     * @param {number} [sourceY] The top coordinate of the source data to copy. Default is 0.
     * @param {number} [width] The width of the data to copy. By default this is the whole width of the source image data.
     * @param {number} [height] The height of the data to copy. By default this is the whole height of the source image data.
     */
    this.putImageData = function(file, data, destX, destY, sourceX, sourceY, width, height)
    {
        destX = destX || 0;
        destY = destY || 0;
        sourceX = sourceX || 0;
        sourceY = sourceY || 0;
        width = width || data.width;
        height = height || data.height;
        var fileName = this.getFullPathAndFileName(file);
        var canvas, context;
        if (assetLoader.getLoadingStatus(fileName) == 'ok')
        {
            canvas = assetLoader.getImage(fileName);

            // it may be that the asset manager stored this asset as a canvas, or as an image. If it isn't a canvas, create a canvas and draw the image onto it
            if (!canvas.getContext)
            {
                var img = canvas;
                canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                context = canvas.getContext('2d');
                context.drawImage(img, 0, 0);
                wade.setImage(file, canvas);
            }
            else
            {
                context = canvas.getContext('2d');
            }
        }
        else
        {
            canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            context = canvas.getContext('2d');
            wade.setImage(file, canvas);
        }
        context.putImageData(data, sourceX, sourceY, destX, destY, width, height);
        sceneManager.renderer.updateImageUsers(fileName);
    };

    /**
     * Enable or disable support for multi touch. Multi touch is disabled by default.
     * @param {boolean} [toggle] Whether to enable or disable multi touch. This parameter is true by default.
     */
    this.enableMultitouch = function(toggle)
    {
        if (typeof(toggle) == 'undefined')
        {
            toggle = true;
        }
        inputManager.enableMultitouch(toggle);
    };

    /**
     * Check whether multi touch support is current enabled. By default it's disabled, unless you call wade.enableMultitouch()
     */
    this.isMultitouchEnabled = function()
    {
        return inputManager.isMultitouchEnabled();
    };

    /**
     * Get the current version of WADE as a string. If you are using it to make sure that it's greater than a certain version, you may want to use <i>wade.requireVersion</i> instead.
     * @returns {string} The current version of WADE.
     */
    this.getVersion = function()
    {
        return version;
    };

    /**
     * Ensure that the current version of WADE is greater or equal than a specific version.
     * @param {string} requiredVersion The required version of WADE. For example '1.0.2'
     * @param {string} [errorMode] The type of error message to display. This can be 'alert' to show an alert box, 'console' to print a message in the console, or anything else to not show an error message
     * @param {string} [errorMessage] The error message to display. Default is 'A newer version of WADE is required;.
     */
    this.requireVersion = function(requiredVersion, errorMode, errorMessage)
    {
        var thisVersion = version.split('.');
        var reqVersion = requiredVersion.split('.');
        for (var i=0; i < reqVersion.length; i++)
        {
            var a = (thisVersion[i] || 0);
            if (a > reqVersion[i])
            {
                return true;
            }
            else if (a < reqVersion[i])
            {
                errorMessage = errorMessage || ('A newer version of WADE is required (' + requiredVersion + ')');
                switch (errorMode)
                {
                    case 'alert':
                        alert(errorMessage);
                        break;
                    case 'console':
                        wade.log(errorMessage);
                        break;
                }
                return false;
            }
        }
        return true;
    };

    /**
     * Get the percentage of files that have been fully loaded with respect to the number of files for which a loading operation has been requested
     * @returns {number} A number between 0 and 100 indicating the percentage of loaded files
     */
    this.getLoadingPercentage = function()
    {
        return assetLoader.getPercentageComplete();
    };

    /**
     * Display (or hide) a progress bar that indicates the current loading progress
     * @param {boolean} [visible] Whether to show the loading bar or not. If omitted, this parameter is assumed to be false.
     * @param {Object} [position] An object with <i>x</i> and <i>y</i> fields describing the position in pixels (relative to the screen center) where the loading bar should appear. This is only relevant if the <i>visible</i> parameter is true.
     * @param {string} [backColor] A HTML color string to use as the background color of the loading bar
     * @param {string} [foreColor] A HTML color string to use as the foreground color of the loading bar
     */
    this.setLoadingBar = function(visible, position, backColor, foreColor)
    {
        if (visible)
        {
            var outer = document.createElement('div');
            var inner = document.createElement('div');
            outer.style.backgroundColor = backColor || 'red';
            outer.style.borderRadius = '13px';
            outer.style.padding = '3px';
            outer.style.width = '50%';
            outer.style.height = '20px';
            outer.style.position = 'absolute';
            outer.style.left = position? (position.x * 2) + 'px' : 0;
            outer.style.right = 0;
            outer.style.top = position? (position.y * 2) + 'px' : 0;
            outer.style.bottom = 0;
            outer.style.margin = 'auto';
            inner.style.backgroundColor = foreColor || 'orange';
            inner.style.borderRadius = '10px';
            inner.style.height = '20px';
            inner.style.width = 0;
            outer.appendChild(inner);
            outer.id = '__wade_loading_bar';
            loadingBar = outer;
            loadingBar.inner = inner;
            document.body.appendChild(outer);
        }
        else
        {
            loadingBar && document.body.removeChild(loadingBar);
            loadingBar = null;
        }
    };

    /**
     * Check to see if gamepads are supported in the current browser
     * @returns {boolean} Whether gamepads are supported in the current browsers
     */
    this.areGamepadsSupported = function()
    {
        return !!(navigator.webkitGetGamepads || navigator.getGamepads)
    };

    /**
     * Enabled or disable gamepad support
     * @param {boolean} [toggle] Whether to enable or disable gamepad support. If omitted, this parameter is assumed to be true.
     */
    this.enableGamepads = function(toggle)
    {
        inputManager.enableGamepads();
    };

    /**
     * Generate a data URL from an image that had previously been loaded or procedurally generated
     * @param {string} imageName The name or virtual path of the image
     * @returns {string} A base64 data URL
     */
    this.getImageDataURL = function(imageName)
    {
        var image = wade.getImage(imageName);
        if (image.toDataURL)
        {
            return image.toDataURL();
        }
        var s = new Sprite(imageName);
        s.drawToImage(imageName, true);
        return wade.getImage(imageName).toDataURL();
    };

    /**
     * Generate a data URL from a game layer
     * @param {number} layerId The layer Id
     * @returns {string} A base64 data URL
     */
    this.getLayerDataURL = function(layerId)
    {
        return this.getLayer(layerId).toDataURL();
    };

    /**
     * A function to log any error or warning message from WADE. By default, this is set to console.log
     * @param {*} data The data to log
     * @type {Function}
     */
    this.log = function(data)
    {
        console.log(data)
    };

    /**
     * Force the full redraw of the scene (or of a single layer)
     * @param {number} [layerId] The id of the layer to redraw. If omitted or falsy, all layers will be redrawn.
     */
    this.forceRedraw = function(layerId)
    {
        sceneManager.setSimulationDirtyState();
        sceneManager.renderer.forceRedraw(layerId);
    };

    /**
     * Apply a per-pixel transformation to an image. Note that you need to load the image (with wade.loadImage) before doing this, or it must be an image that is loaded in memory somehow (it can be an image that you have procedurally generated too).
     * @param {string} sourceImage The file name (or virtual path) of the source image
     * @param {function} whatToDo A function to execute for each pixel. It will receive data about the pixel, and can return an object containing output data. An example is this:<br/><i>function(r, g, b, a, x, y) { return {r: 255, g: 255, b: 255, a: 255}; }</i><br/>Where r is red, g is green, b is blue, a is alpha, and x and y are the coordinates of the pixel being processed.
     * @param {string} [targetImage] The file name (or virtual path) of the target image. If omitted, the source image will be overwritten with the new data.
     */
    this.forEachPixel = function(sourceImage, whatToDo, targetImage)
    {
        var imageData = this.getImageData(sourceImage);
        for (var i=0; i<imageData.width; i++)
        {
            for (var j=0; j<imageData.height; j++)
            {
                var p = (i + j * imageData.width) * 4;
                var result = whatToDo(imageData.data[p], imageData.data[p+1], imageData.data[p+2], imageData.data[p+3], i, j);
                if (result)
                {
                    imageData.data[p] = result.r || 0;
                    imageData.data[p+1] = result.g || 0;
                    imageData.data[p+2] = result.b || 0;
                    imageData.data[p+3] = result.a || 0;
                }
            }
        }
        targetImage = targetImage || sourceImage;
        wade.putImageData(targetImage, imageData);
    };

    /**
     * Get the canvas object being used by a layer. You can use it as a source image for sprite and effects.
     * @param {number} [layerId] The id of the layer to use. Default is 1
     * @returns {Object} An HTML5 canvas object
     */
    this.getLayerCanvas = function(layerId)
    {
        return wade.getLayer(layerId || 1).getCanvas();
    };

    /**
     * Draw a layer to an image in memory
     * @param {number} layerId The id of the layer to use
     * @param {string} imageName The file name (or virtual path) of the target image
     * @param {boolean} [replace] Whether to replace the existing image at the virtual path (if it exists), or draw on top of it
     * @param {Object} [offset] An object with 'x' and 'y' fields representing the offset to use when drawing this sprite onto the image
     * @param {Object} [transform] An object with 6 parameters: 'horizontalScale', 'horizontalSkew', 'verticalSkew', 'verticalScale', 'horizontalTranslate', 'verticalTranslate'
     * @param {string} [compositeOperation] A string describing an HTML5 composite operation
     */
    this.drawLayerToImage = function(layerId, imageName, replace, offset, transform, compositeOperation)
    {
        var canvas = wade.getLayerCanvas(layerId);
        var source = '__wade_layer' + layerId;
        wade.setImage(source, canvas);
        var s = new Sprite(source);
        var opacity = wade.getLayerOpacity(layerId);
        if (opacity != 1)
        {
            s.setDrawFunction(wade.drawFunctions.alpha_(opacity, s.draw));
        }
        if (!transform)
        {
            var r = this.getLayerResolutionFactor(layerId);
            transform = {horizontalScale: 1 / r, verticalScale: 1 / r, horizontalSkew: 0, verticalSkew: 0, horizontalTranslate: 0, verticalTranslate: 0};
        }
        s.drawToImage(imageName, replace, offset, transform, compositeOperation);
    };

    /**
     * Draw the contents of the WADE screen to an image in memory
     * @param {string} imageName The file name (or virtual path) of the target image
     */
    this.screenCapture = function(imageName)
    {
        var layerIds = sceneManager.renderer.getActiveLayerIds();
        if (layerIds.length)
        {
            var s = new Sprite(null, layerIds[0]);
            s.setSize(wade.getScreenWidth(), wade.getScreenHeight());
            s.setDrawFunction(wade.drawFunctions.transparent_());
            s.drawToImage(imageName, true);
            for (var i=0; i<layerIds.length; i++)
            {
                wade.drawLayerToImage(layerIds[i], imageName);
            }
        }
    };

    /**
     * Set the opacity of a layer. This is then applied to the layer canvas(es) via CSS.
     * @param {number} layerId The id of the layer
     * @param {number} opacity The opacity of the layer, between 0 (fully transparent) and 1 (fully opaque)
     */
    this.setLayerOpacity = function(layerId, opacity)
    {
        this.getLayer(layerId).setOpacity(opacity);
    };

    /**
     * Get the opacity of a layer.
     * @param {number} layerId The id of the layer
     * @returns {number} The opacity of the layer. This is a number between 0 (fully transparent) and 1 (fully opaque)
     */
    this.getLayerOpacity = function(layerId)
    {
        var opacity = parseFloat(this.getLayer(layerId).getOpacity());
        return (isNaN(opacity))? 1 : opacity;
    };

    /**
     * Get the name of the DIV or the HTML element that contains the App. This can be set when calling wade.init.
     * @returns {string} The name of the container element
     */
    this.getContainerName = function()
    {
        return containerDiv;
    };

    /**
     * Fade in a layer over time
     * @param {number} layerId The id of the layer to fade in
     * @param {number} time How long (in seconds) the fading should take
     * @param {function} [callback] A function to execute when the fading is complete
     */
    this.fadeInLayer = function(layerId, time, callback)
    {
        var loopName = '__wade_fadeLayer_' + layerId;
        wade.setLayerOpacity(layerId, 0);
        this.setMainLoopCallback(function()
        {
            var opacity = wade.getLayerOpacity(layerId);
            opacity = Math.min(1, opacity + wade.c_timeStep / time);
            if (1 - opacity < wade.c_epsilon)
            {
                opacity = 1;
            }
            wade.setLayerOpacity(layerId, opacity);
            if (opacity == 1)
            {
                wade.setMainLoopCallback(null, loopName);
                callback && callback();
            }
        }, loopName);
    };

    /**
     * Fade out a layer over time
     * @param {number} layerId The id of the layer to fade out
     * @param {number} time How long (in seconds) the fading should take
     * @param {function} [callback] A function to execute when the fading is complete
     */
    this.fadeOutLayer = function(layerId, time, callback)
    {
        var loopName = '__wade_fadeLayer_' + layerId;
        wade.setLayerOpacity(layerId, 1);
        this.setMainLoopCallback(function()
        {
            var opacity = wade.getLayerOpacity(layerId);
            opacity = Math.max(0, opacity - wade.c_timeStep / time);
            if (opacity < wade.c_epsilon)
            {
                opacity = 0;
            }
            wade.setLayerOpacity(layerId, opacity);
            if (opacity == 0)
            {
                wade.setMainLoopCallback(null, loopName);
                callback && callback();
            }
        }, loopName);
    };

    /**
     * Clear the canvas(es) associated with a specific layer. This can be useful when setCanvasClearing(false) has been called for a layer and you want to clear it manually.
     * @param {number} layerId The id of the layer to clear
     */
    this.clearCanvas = function(layerId)
    {
        this.getLayer(layerId).clear();
    };

    /**
     * Draw a layer, group of layers, or the whole scene. Normally you don't need to do this (WADE does it automatically when needed), but by calling this function you can manuallly control when the drawing happens.
     * @param {number|Array} [layerIds] The id of the layer (or layers) to draw. If omitted, the whole scene will be drawn
     */
    this.draw = function(layerIds)
    {
        sceneManager.draw(layerIds);
    };

    /**
     * Export the current scene to an object (optionally serializing it to a JSON string), that can then be used to import a scene like the current one, through wade.importScene()
     * @param {boolean} [stringify] Whether the result should be serialized to a JSON string
     * @param {Array} [exclude] An array of scene objects (or scene object names) to exclude from the exported scene
     * @param {boolean} [exportObjectFunctions] Whether to export a string representation of all member functions of the scene objects. False by default.
     * @returns {object|string} Either an object or a JSON string representation of the scene (depending on the <i>serialize</i> parameter)
     */
    this.exportScene = function(stringify, exclude, exportObjectFunctions)
    {
        var scene = {sceneObjects: sceneManager.exportSceneObjects(exclude, exportObjectFunctions)};
        scene.layers = sceneManager.renderer.getLayerSettings();
        scene.minScreenSize = {x: wade.getMinScreenWidth(), y: wade.getMinScreenHeight()};
        scene.maxScreenSize = {x: wade.getMaxScreenWidth(), y: wade.getMaxScreenHeight()};
        scene.orientation = wade.getForcedOrientation();
        scene.windowMode = wade.getWindowMode();
        scene.defaultLayer = wade.defaultLayer || 1;
        return (stringify? JSON.stringify(scene) : scene);
    };

    /**
     * Import a scene from an object that contains a description of all the entities in the scene - it could have been previously exported with wade.exportScene(), or edited manually. This will automatically load all the assets referenced in the scene data.
     * @param {object} data A scene description object, such as one created with wade.exportScene(). The format is the following (all fields are optional):<pre>
       {
            json: An array of file names, describing which json files should be loaded
            audio: An array of audio file names
            scripts: An array of script (.js) file names. Note that these scripts will be loaded and executed after the rest of the scene has been loaded, but before any scene objects are created and added to the scene
            images: An array of image file names - you don't need to include files that are referenced by the scene objects and sprites in the scene (those will be loaded automatically).
            minScreenSize: An object with x and y components describing the minimum screen size. Refer to the documentation of wade.setMinScreenSize() for more details
            maxScreenSize: An object with x and y components describing the maximum screen size. Refer to the documentation of wade.setMaxScreenSize() for more details
            windowMode: A string describing the window mode. Refer to the documentation of wade.setWindowMode() for more details
            orientation: A string describing the orientation. Valid values are 'portrait' and 'landscape', all other values are ignored. See wade.forceOrientation() for more details
            sceneObjects: An array containing all the SceneObjects to instantiate. See the SceneObject documentation for more details about the format to use.
       }</pre>
     * @param {{position: {x: number, y: number}, foreColor: string, backColor: string}} [loadingBar] A loading bar while loading the assets referenced in the scene data (see wade.setLoadingBar for details about the parameters, which are all optional). If omitted or falsy, no loading bar will be shown
     * @param {function} [callback] A function to execute when the scene has been imported
     * @param {boolean} [async] Whether the scene should be loaded asynchronously in the background, without blocking the simulation and rendering of the app. False by default
     * @param {boolean} [clearScene] Whether the current scene should be cleared before adding objects for the new scene. False by default
     */
    this.importScene = function(data, loadingBar, callback, async, clearScene)
    {
        if (loadingBar)
        {
            wade.setLoadingBar(true, loadingBar.position, loadingBar.backColor, loadingBar.foreColor);
        }
        var sceneObjects = data.sceneObjects;
        if (!sceneObjects)
        {
            callback && setTimeout(callback, 0);
            return;
        }
        var images = data.images || [];
        for (var i=0; i<sceneObjects.length; i++)
        {
            if (sceneObjects[i].sprites)
            {
                for (var j=0; j<sceneObjects[i].sprites.length; j++)
                {
                    sceneObjects[i].sprites[j].image && (images.indexOf(sceneObjects[i].sprites[j].image) == -1) && (sceneObjects[i].sprites[j].image.substr(0, 11) != 'procedural_') && images.push(sceneObjects[i].sprites[j].image);
                    if (sceneObjects[i].sprites[j].animations)
                    {
                        for (var k in sceneObjects[i].sprites[j].animations)
                        {
                            if (sceneObjects[i].sprites[j].animations.hasOwnProperty(k))
                            {
                                var image = sceneObjects[i].sprites[j].animations[k].image;
                                image && (image.substr(0, 11) != 'procedural_') && (images.indexOf(image) == -1) && images.push(image);
                            }
                        }
                    }
                }
            }
        }
        var numLoaded = 0;
        var numToLoad = images.length;
        var afterLoading = function(loadedData, loadedFileName)
        {
            if (++numLoaded == numToLoad)
            {
                clearScene && wade.clearScene();
                if (data.scripts)
                {
                    for (var i=0; i<data.scripts.length; i++)
                    {
                        eval.call(window, wade.getScript(data.scripts[i]));
                    }
                }
                data.minScreenSize && wade.setMinScreenSize(data.minScreenSize.x, data.minScreenSize.y);
                data.maxScreenSize && wade.setMaxScreenSize(data.maxScreenSize.x, data.maxScreenSize.y);
                data.windowMode && wade.setWindowMode(data.windowMode);
                data.orientation && wade.forceOrientation(data.orientation);
                if (data.layers)
                {
                    for (i=0; i<data.layers.length; i++)
                    {
                        if (data.layers[i])
                        {
                            var scaleFactor = (typeof(data.layers[i].scaleFactor) != 'number')? 1 : data.layers[i].scaleFactor;
                            var translateFactor = (typeof(data.layers[i].translateFactor) != 'number')? 1 : data.layers[i].translateFactor;
                            var useQuadtree = (typeof(data.layers[i].useQuadtree) != 'undefined') ? data.layers[i].useQuadtree : true;
                            var resolutionFactor = (typeof(data.layers[i].resolutionFactor) != 'number')? 1 : data.layers[i].resolutionFactor;
                            wade.setLayerTransform(i, scaleFactor, translateFactor);
                            wade.setLayerRenderMode(i, (data.layers[i].renderMode == 'webgl')? 'webgl' : '2d');
                            wade.useQuadtree(i, useQuadtree);
                            wade.setLayerResolutionFactor(i, resolutionFactor);
                        }
                    }
                }
                if (data.defaultLayer)
                {
                    wade.defaultLayer = data.defaultLayer;
                }
                for (i=0; i<sceneObjects.length; i++)
                {
                    new SceneObject(sceneObjects[i]);
                }
                callback && callback();
            }
        };
        var loadingPrefix = async? 'pre' : '';
        if (data.json)
        {
            numToLoad += data.json.length;
            for (i=0; i<data.json.length; i++)
            {
                if (data.json.indexOf(data.json[i]) == i)
                {
                    wade[loadingPrefix + 'loadJson'](data.json[i], null, afterLoading);
                }
                else
                {
                    numToLoad--;
                }
            }
        }
        if (data.audio)
        {
            if (!data.webAudioOnly || wade.isWebAudioSupported())
            {
                numToLoad += data.audio.length;
                for (i=0; i<data.audio.length; i++)
                {
                    if (data.audio.indexOf(data.audio[i]) == i)
                    {
                        wade[loadingPrefix + 'loadAudio'](data.audio[i], false, false, afterLoading);
                    }
                    else
                    {
                        numToLoad--;
                    }
                }
            }
        }
        if (data.fonts)
        {
            numToLoad += data.fonts.length;
            for (i=0; i<data.fonts.length; i++)
            {
                if (data.fonts.indexOf(data.fonts[i]) == i)
                {
                    wade[loadingPrefix + 'loadFont'](data.fonts[i], afterLoading);
                }
                else
                {
                    numToLoad--;
                }
            }
        }
        if (data.scripts)
        {
            numToLoad += data.scripts.length;
            for (i=0; i<data.scripts.length; i++)
            {
                if (data.scripts.indexOf(data.scripts[i]) == i)
                {
                    wade[loadingPrefix + 'loadScript'](data.scripts[i], afterLoading, false, null, true);
                }
                else
                {
                    numToLoad--;
                }
            }
        }
        if (images.length)
        {
            for (i=0; i<images.length; i++)
            {
                if (images.indexOf(images[i]) == i)
                {
                    wade[loadingPrefix + 'loadImage'](images[i], afterLoading);
                }
                else
                {
                    numToLoad--;
                }
            }
        }
        if (!numToLoad)
        {
            numToLoad = 1;
            afterLoading();
        }
    };

    /**
     * Load a JSON file that contains the description of a wade scene, and process that file to load any assets being used and instantiate SceneObjects, Sprites, TextSprites and Animations according to the scene description. This is the same as wade.preloadScene(), except that the loading happens synchronously, blocking the rendering and simulation of the current scene
     * @param {string} fileName The name of a JSON file containing a description of the scene
     * @param {{position: {x: number, y: number}, foreColor: string, backColor: string}} [loadingBar] A loading bar while loading the assets referenced in the scene data (see wade.setLoadingBar for details about the parameters, which are all optional). If omitted or falsy, no loading bar will be shown
     * @param {function} [callback] A function to execute when the scene has been loaded
     * @param {boolean} [clearScene] Whether the previous scene should be cleared before adding objects for the new scene. False by default
     */
    this.loadScene = function(fileName, loadingBar, callback, clearScene)
    {
        wade.loadJson(fileName, null, function(data)
        {
            wade.importScene(data, loadingBar, callback, false, clearScene);
        });
    };
    /**
     * Load a JSON file that contains the description of a wade scene, and process that file to load any assets being used and instantiate SceneObjects, Sprites, TextSprites and Animations according to the scene description. This is the same as wade.loadScene(), except that the loading happens asynchronously without blocking the rendering and simulation of the current scene
     * @param {string} fileName The name of a JSON file containing a description of the scene
     * @param {{position: {x: number, y: number}, foreColor: string, backColor: string}} [loadingBar] A loading bar while loading the assets referenced in the scene data (see wade.setLoadingBar for details about the parameters, which are all optional). If omitted or falsy, no loading bar will be shown
     * @param {function} [callback] A function to execute when the scene has been loaded
     * @param {boolean} [clearScene] Whether the previous scene should be cleared before adding objects for the new scene. False by default
     */
    this.preloadScene = function(fileName, loadingBar, callback, clearScene)
    {
        wade.preloadJson(fileName, null, function(data)
        {
            wade.importScene(data, loadingBar, callback, true, clearScene);
        });
    };

    /**
     * Enable or disable quadtree optimization for a specific layer. Note that this optimization is enabled by default, so normally you don't need to call this function. Sometimes you may want to wade.useQuadtree(layerId, false) for layers that have lots of small moving objects that you don't need to know the exact positions of, such as particles.
     * @param {number} layerId The id of the layer for which you want to enable/disable the quadtree optimization
     * @param {boolean} [toggle] Whether to enable or disable the quadtree. If omitted, this parameter is assumed to be true.
     */
    this.useQuadtree = function(layerId, toggle)
    {
        if (typeof(toggle) == 'undefined')
        {
            toggle = true;
        }
        this.getLayer(layerId).useQuadtree(toggle);
    };

    /**
     * Check whether a layer is using quadtree-based optimizations
     * @param {number} layerId The id of the layer to check
     * @returns {boolean} Whether the layer is using a quadtree
     */
    this.isUsingQuadtree = function(layerId)
    {
        return this.getLayer(layerId).isUsingQuadtree();
    };

    /**
     * Pause the simulation
     * @param {string} [mainLoopName] The name of the main loop that you want to pause. If omitted, the whole simulation will be paused.
     */
    this.pauseSimulation = function(mainLoopName)
    {
        if (mainLoopName)
        {
            for (var i=0; i<mainLoopCallbacks.length; i++)
            {
                if (mainLoopCallbacks[i].name == mainLoopName)
                {
                    mainLoopCallbacks[i].paused = true;
                    return;
                }
            }
        }
        else
        {
            simulationPaused = true;
        }
    };

    /**
     * Resume the simulation (typically after it was paused via wade.pauseSimulation)
     * @param {string} [mainLoopName] The name of the main loop that you want to resume. If omitted, the whole simulation will be resumed.
     */
    this.resumeSimulation = function(mainLoopName)
    {
        var i;
        if (mainLoopName)
        {
            for (i=0; i<mainLoopCallbacks.length; i++)
            {
                if (mainLoopCallbacks[i].name == mainLoopName)
                {
                    mainLoopCallbacks[i].paused = false;
                    return;
                }
            }
        }
        else
        {
            for (i=0; i<mainLoopCallbacks.length; i++)
            {
                mainLoopCallbacks[i].paused = false;
            }
            simulationPaused = false;
        }
    };

    /**
     * Set how many seconds of lag should be tolerated before WADE stop trying to catch up with missed frames
     * @param {number} bufferTime The buffer time, in seconds
     */
    this.setCatchUpBuffer = function(bufferTime)
    {
        catchUpBuffer = bufferTime;
    };

    /**
     * Retrieve the length of the catch-up buffer, that is how many seconds of lag should be tolerated before WADE stops trying to catch up with missed frames
     * @returns {number} The buffer time, in seconds
     */
    this.getCatchUpBuffer = function()
    {
        return catchUpBuffer;
    };

    /**
     * Prevent the WADE App from being executed inside an iframe
     */
    this.preventIframe = function()
    {
        if (!window.location || !window.top.location || !location || !top.location || window.location !== window.top.location || location !== top.location)
        {
            wade = 0;
        }
    };

    /**
     * Only allow the WADE App to be executed on a specific domain. Note that this will still allow you to execute the app on your localhost or 127.0.0.1, regardless of the domain specified
     * @param {string} domain The domain where you want the WADE App to be executed. For example 'www.clockworkchilli.com'
     */
    this.siteLock = function(domain)
    {
        var origin = 'localhost';
        try
        {
            origin = top.location.hostname;

        }
        catch(e)
        {
            try
            {
                origin = this.getHostName(top.location.origin);
            }
            catch (e)
            {
                try
                {
                    origin = this.getHostName(top.location.href);
                }
                catch(e) {}
            }
        }
        var s = origin.toLowerCase();
        if (s != domain.toLowerCase() && s != 'localhost' && s != '127.0.0.1')
        {
            wade = 0;
        }
    };

    /**
     * Get the host name based on a URL string
     * @param {string} url The URL string
     * @returns {string} The host name
     */
    this.getHostName = function(url)
    {
        var u = URL || webkitURL;
        try
        {
            url = new u(url).hostname;
        }
        catch (e)
        {
            var pos = url.indexOf('//');
            if (pos != -1)
            {
                url = url.substr(pos + 2);
            }
            pos = url.indexOf('/');
            if (pos != -1)
            {
                url = url.substr(0, pos);
            }
            pos = url.indexOf(':');
            if (pos != -1)
            {
                url = url.substr(0, pos);
            }
            pos = url.indexOf('?');
            if (pos != -1)
            {
                url = url.substr(0, pos);
            }
        }
        return url;
    };

    /**
     * Only allow the App to be linked only from selected domains
     * @param {string|Array} domains A string (or an array of strings) representing the allowed domain(s)
     */
    this.whitelistReferrers = function(domains)
    {
        var referrer = document.referrer;
        if (!referrer)
        {
            return;
        }
        referrer = this.getHostName(referrer);
        var d;
        if (typeof(domains) == 'string')
        {
            d = [domains.toLowerCase()];
        }
        else if ($.isArray(domains))
        {
            d = [];
            for (var i=0; i<domains.length; i++)
            {
                d.push(domains[i].toLowerCase());
            }
        }
        else
        {
            return;
        }
        if (referrer && d.indexOf(referrer.toLowerCase()) == -1)
        {
            wade = 0;
        }
    };

    /**
     * Do not allow the App to be linked from selected domains
     * @param {string|Array} domains A string (or an array of strings) representing the blacklisted domain(s)
     */
    this.blacklistReferrers = function(domains)
    {
        var referrer = document.referrer;
        if (!referrer)
        {
            return;
        }
        referrer = this.getHostName(referrer);
        if (!referrer)
        {
            return;
        }
        var d;
        if (typeof(domains) == 'string')
        {
            d = [domains.toLowerCase()];
        }
        else if ($.isArray(domains))
        {
            d = [];
            for (var i=0; i<domains.length; i++)
            {
                d.push(domains[i].toLowerCase());
            }
        }
        else
        {
            return;
        }
        if (referrer && d.indexOf(referrer.toLowerCase()) != -1)
        {
            wade = 0;
        }
    };

    /**
     * Remove a layer that was previously created, and free all the associated resources
     * @param {number} layerId The id of the layer to remove
     */
    this.removeLayer = function(layerId)
    {
        sceneManager.renderer.removeLayer(layerId);
    };

    /**
     * Set a CSS 3D transform on a layer. See <a href="https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Using_CSS_transforms">this MDN article</a> for more details.
     * @param {number} layerId The id of the layer
     * @param {string} [transformString] Any valid CSS 3D transform string. Omitting this parameter resets the transform
     * @param {string} [transformOrigin] Any valid CSS 3D transform-origin string. Omitting this parameter resets the transform origin to (50% 50%)
     * @param {number} [time] The time (in seconds) needed for the transform to be applied. Omitting this parameter or setting it to 0 results in the transform to be applied instanty. Any other number will result in the transform being applied smoothly over the specified period of time
     * @param {function} [callback] A function to execute when the transform has been applied
     */
    this.setLayer3DTransform = function(layerId, transformString, transformOrigin, time, callback)
    {
        this.getLayer(layerId).set3DTransform(transformString || 'translate3d(0, 0, 0)', transformOrigin || '50% 50%', time, callback);
    };

    /**
     * Skip any frames that have been missed due to lag up to this point (don't try to catch up). This won't affect future missed frames, i.e. WADE will still try to catch up on those unless you call skipMissedFrames again.
     */
    this.skipMissedFrames = function()
    {
        mainLoopLastTime = (new Date()).getTime();
    };

    /**
     * Get the current index of a scene object in the scene.
     * @param {SceneObject} sceneObject The SceneObject
     * @returns {number} The current index of the scene object in the scene
     */
    this.getSceneObjectIndex = function(sceneObject)
    {
        return sceneManager.getSceneObjectIndex(sceneObject);
    };

    /**
     * Set the index of a scene object in the scene. You may want to do this if you care about SceneObjects being exported in a specific order with wade.exportScene().
     * @param {SceneObject} sceneObject The SceneObject
     * @param {number} index The desired index in the scene
     * @returns {number} The actual index of the SceneObject in the scene after attempting this operation. If the scene has N objects, and you try to set the index to a number greater than N-1, the object will be moved at index N-1 instead. If the object hasn't been added to the scene yet, this function will return -1.
     */
    this.setSceneObjectIndex = function(sceneObject, index)
    {
        return sceneManager.setSceneObjectIndex(sceneObject, index);
    };

    /**
     * Set the tolerance for swipe events.
     * @param {number} tolerance The tolerance value to use for swipe events. Default is 1.
     * @param {number} [numSamples] The number of samples used for gesture detection. Default is 1.
     */
    this.setSwipeTolerance = function(tolerance, numSamples)
    {
        numSamples = (numSamples || 3);
        inputManager.setSwipeTolerance(tolerance, numSamples);
    };

    /**
     * Set the render mode for a layer
     * @param {number} layerId The id of the layer
     * @param {string} renderMode The render mode for the layer. This can be either '2d' or 'webgl'. On devices that don't support webgl, setting the render mode to 'webgl' won't have any effect.
     * @param {object} [options] An object with rendering-related options. At present, only the 'offScreenTarget' option is implemented (for webgl), and it defaults to false.
     */
    this.setLayerRenderMode = function(layerId, renderMode, options)
    {
        this.getLayer(layerId).setRenderMode(renderMode);
    };

    /**
     * Get the current render mode of a layer.d
     * @param {number} layerId The id of the layer
     * @returns {string} The layer render mode. This can be either '2d' or 'webgl'
     */
    this.getLayerRenderMode = function(layerId)
    {
        return this.getLayer(layerId).getRenderMode();
    };

    /**
     * Check to see if WebGL is supported
     * @returns {boolean} Whether WebGL is supported in the current environment
     */
    this.isWebGlSupported = function()
    {
        if (typeof(webGlSupported) != 'undefined')
        {
            return !!webGlSupported;
        }
        else
        {
            try
            {
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            }
            catch(e)
            {
                webGlSupported = false;
                return false;
            }
            webGlSupported = !!context;
            return !!context;
        }
    };

    /**
     * Check whether we are currently running in debug mode
     * @returns {boolean} Whether we are currently running in debug mode
     */
    this.isDebugMode = function()
    {
        return !!debugMode;
    };

    /**
     * If WebAudio is supported, get the current WebAudio context
     * @returns {AudioContext} The current WebAudio context. If WebAudio is not supported, this function returns undefined.
     */
    this.getWebAudioContext = function()
    {
        return audioContext;
    };

    // Below are some member functions and parameters that need to be public for the rest of the engine to see them, but shouldn't be exposed to the WADE API.

    this.doNothing = function()
    {
    };

    this.getAudio = function(file)
    {
        var fileName = this.getFullPathAndFileName(file);
        return assetLoader.getAudio(fileName);
    };

    this.playSilentSound = function()
    {
        if (audioContext)
        {
            var oscillator = audioContext.createOscillator();
            oscillator.frequency.value = 440;
            var amp = audioContext.createGainNode();
            amp.gain.value = 0;
            oscillator.connect(amp);
            amp.connect(audioContext.destination);

            if (oscillator.start)
            {
                oscillator.start(0);
            }
            else
            {
                oscillator.noteOn(0);
            }
            if (oscillator.stop)
            {
                oscillator.stop(0.001);
            }
            else
            {
                oscillator.noteOff(0.001);
            }
        }
        else
        {
            var audio = new Audio();
            audio.src = 'data:audio/wav;base64,UklGRjoAAABXQVZFZm10IBAAAAABAAEA6AcAANAPAAACABAAZGF0YQYAAAAAAAAAAAA%3D';
            try
            {
                audio.play();
            }
            catch (e) {}
        }
    };

    this.event_mainLoopCallback_ = function()
    {
        var that = this;
        return function()
        {
            that.event_mainLoop();
        };
    };

    this.event_mainLoop = function()
    {
        var i, time;
        // schedule next execution
        pendingMainLoop = requestAnimationFrame(this.event_mainLoopCallback_());
        // only do stuff if all the resources have finished loading
        if (assetLoader.isFinishedLoading())
        {
            // hide the loading images
            for (i=0; i<loadingImages.length; i++)
            {
                if (loadingImages[i].style.display != 'none')
                {
                    loadingImages[i].style.display = 'none';
                }
            }

            // hide the loading bar if there is one
            if (loadingBar && loadingBar.style.display != 'none')
            {
                loadingBar.style.display = 'none';
            }

            // if the app is initialised, step and draw
            if (appInitialised)
            {
                // draw
                sceneManager.draw();

                // determine how many simulation steps we need to do
                time = (new Date()).getTime();
                var numSteps = 0;
                var maxSteps = 3;
                var numStepsBehind = Math.round((time - mainLoopLastTime) / (wade.c_timeStep * 1000));
                if (mainLoopLastTime)
                {
                    numSteps = Math.min(maxSteps, numStepsBehind);
                }
                else
                {
                    mainLoopLastTime = time;
                }

                if (numSteps)
                {
                    // if we are so many steps behind, stop trying to catch up
                    if (numStepsBehind > catchUpBuffer / wade.c_timeStep)
                    {
                        numSteps = 1;
                        mainLoopLastTime = time;
                    }
                    else
                    {
                        mainLoopLastTime += numSteps * wade.c_timeStep * 1000;
                    }
                }

                // step
                for (i=0; i<numSteps && !simulationPaused; i++)
                {
                    // step the scene manager
                    sceneManager.step();

                    // execute the mainLoop callbacks
                    for (var j=0; j<mainLoopCallbacks.length; j++)
                    {
                        if (!mainLoopCallbacks[j].paused)
                        {
                            var f = mainLoopCallbacks[j].func;
                            f && f();
                        }
                    }
                }

                if (simulationPaused)
                {
                    sceneManager.setSimulationDirtyState();
                }
            }
            else if (appLoading)
            {
                // if the app hasn't been initialised yet, but it's finished loading, initialise it now
                this.initializeApp();
            }
        }
        else
        {
            mainLoopLastTime = (new Date()).getTime();

            // if the loading image is supposed to be visible, show it
            for (i=0; i<loadingImages.length; i++)
            {
                if (loadingImages[i].src)
                {
                    loadingImages[i].style.display = 'inline';
                }
            }

            // update the loading bar if there is one
            if (loadingBar)
            {
                loadingBar.inner.style.width = this.getLoadingPercentage() + '%';
            }
        }
    };

    this.event_appTimerEvent = function()
    {
        // schedule next execution
        pendingAppTimer = setTimeout('wade.event_appTimerEvent();', appTimerInterval * 1000);
       // tell the sceneManager to process the event
        sceneManager.appTimerEvent();
    };

    this.onObjectNameChange = function(sceneObject, oldName, newName)
    {
        if (sceneObject.isInScene())
        {
            sceneManager.changeObjectName(sceneObject, oldName);
        }
    };

    this.getLayer = function(layerId)
    {
        return sceneManager.renderer.getLayer(layerId);
    };

    this.updateMouseInOut = function(oldPosition, newPosition)
    {
        sceneManager.updateMouseInOut(oldPosition, newPosition);
    };

    this.addImageUser = function(image, user)
    {
        sceneManager.renderer.addImageUser(image, user);
    };

    this.removeImageUser = function(image, user)
    {
        sceneManager.renderer.removeImageUser(image, user);
    };

    this.removeAllImageUsers = function(image)
    {
        sceneManager.renderer.removeAllImageUsers(image);
    };

    this.getInternalContext = function()
    {
        return internalContext;
    };

    this.getImageUsers = function(image)
    {
        return sceneManager.renderer.getImageUsers(image);
    };

    this.releaseImageReference = function(image)
    {
        assetLoader.releaseImageReference(this.getFullPathAndFileName(image));
    };

    // avoid console.log errors when the debugger is not attached
    if (!window.console)
    {
        window.console = {};
    }
    if (!window.console.log)
    {
        window.console.log = function() {};
    }
}

/**
 * This is the global object that is used to interact with the engine
 * @type {Wade}
 */
wade = new Wade();
