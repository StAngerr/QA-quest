define(function() {
function AssetLoader()
{
    this.loadingStatus = [];
    this.loadedImages = [];
    this.loadedAudio = [];
    this.loadedJson = [];
    this.loadedScripts = [];
    this.loadedFonts = [];
    this.attemptsCount = [];
    this.maxAttempts = 5;
    this.loadingRequests    = {scripts: 0, json: 0, images: 0, audio: 0, fonts: 0};
    this.loadingSuccess     = {scripts: 0, json: 0, images: 0, audio: 0, fonts: 0};
    this.loadingErrors      = {scripts: 0, json: 0, images: 0, audio: 0, fonts: 0};
    this.loadingFailed      = {scripts: 0, json: 0, images: 0, audio: 0, fonts: 0};

    this.init = function(isPreLoader)
    {
        // can we use webaudio?
        this.audioContext = wade.getWebAudioContext();

        // determine which type of audio files is supported
        var testAudio;
        if (window.Audio && (testAudio = new Audio()))
        {
            this.audioExtension = (testAudio.canPlayType('audio/ogg; codecs=vorbis'))? 'ogg': 'aac';
        }
        else if (!isPreLoader)
        {
            wade.log("Warning: Unable to initialise audio.")
        }
    };

    this.updateAttempts = function(name, type)
    {
        if (!this.attemptsCount[name])
        {
            this.attemptsCount[name] = 1;
            this.loadingRequests[type]++;
        }
        else
        {
            this.attemptsCount[name]++;
        }
    };

	this.loadScript = function(name, callback, forceReload, errorCallback, dontExecute)
	{
        if (this.loadingStatus[name] == 'loading' && !forceReload)
        {
            return;
        }
        if (this.loadingStatus[name] == 'ok' || this.loadingStatus[name] == 'loading')
        {
            if (!forceReload)
            {
                if (this.loadingStatus[name] == 'ok')
                {
                    !dontExecute && eval.call(window, this.loadedScripts[name]);
                    callback && callback(this.loadedScripts[name], name);
                }
                return;
            }
            this.attemptsCount[name] = 0;
        }
        this.loadingStatus[name] = 'loading';
        this.updateAttempts(name, 'scripts');
        var ajaxParams = {
            cache: forceReload ? false : true,
            type: 'GET',
            url: name,
            dataType: 'script',
            timeout: 15000,
            success: this.scriptLoaded(name, callback, !dontExecute),
            error: this.scriptLoadingError(name, callback, forceReload, errorCallback),
            converters: {'text script': function(text) {return text;}}
        };
        $.ajax(ajaxParams);
	};
	
	this.loadJson = function(name, objectToStoreData, callback, forceReload, errorCallback)
	{
        if (this.loadingStatus[name] == 'ok' || this.loadingStatus[name] == 'loading')
        {
            if (!forceReload)
            {
                if (this.loadingStatus[name] == 'ok')
                {
                    objectToStoreData && (objectToStoreData.data = this.loadedJson[name]);
                    callback && callback(this.loadedJson[name], name);
                }
                return;
            }
            this.attemptsCount[name] = 0;
        }
        this.loadingStatus[name] = 'loading';
        this.updateAttempts(name, 'json');
		$.ajax({
            cache: forceReload? false: true,
			type: 'GET',
			url: name,
			dataType: 'json',
            timeout: 15000,
			success: this.jsonLoaded(name, objectToStoreData, callback),
			error: this.jsonLoadingError(name, objectToStoreData, callback, forceReload, errorCallback)
		});		
	};

	this.loadAppScript = function(name, forceReload)
	{
        this.updateAttempts(name, 'scripts');
		$.ajax({
            cache: forceReload? false: true,
			type: 'GET',
			url: name,
			dataType: 'script',
            timeout: 15000,
			success: this.appLoaded(name),
			error: this.appLoadingError(name)
		});
	};

    this.loadImage = function(name, callback, errorCallback)
    {
        if (this.loadingStatus[name] == 'ok')
        {
            if (callback)
            {
                callback(this.loadedImages[name], name);
            }
            return;
        }
        else if (this.loadingStatus[name] == 'loading')
        {
            if (this.loadedImages[name])
            {
                if (this.loadedImages[name].callbackIsSet && callback)
                {
                    wade.log('Warning: conflicting callbacks for the load event of image '+ name);
                }
            }
            return;
        }
        this.loadingStatus[name] = 'loading';
        this.updateAttempts(name, 'images');
        var image = new Image();
        this.loadedImages[name] = image;
        image.loadListener = this.imageLoaded(name, callback);
        image.errorListener = this.imageLoadingError(name, callback, errorCallback);
        image.addEventListener('load', image.loadListener, false);
        image.addEventListener('error', image.errorListener, false);
        image.callbackIsSet = callback? 1: 0;
        image.src = name;
    };

    this.unloadImage = function(name)
    {
        if (this.loadingStatus[name] != 'ok')
        {
            return false;
        }
        var loadedImage = this.loadedImages[name];
        loadedImage.removeEventListener('load', loadedImage.loadListener);
        loadedImage.removeEventListener('error', loadedImage.errorListener);
        if (loadedImage.src)
        {
            loadedImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP7//wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
        }
        else
        {
            loadedImage.width = loadedImage.height = 1;
        }
        var users = wade.getImageUsers(name);
        if (users)
        {
            for (var i=0; i<users.length; i++)
            {
                users[i].onImageUnloaded && users[i].onImageUnloaded(name);
            }
        }
        wade.removeAllImageUsers(name);
        this.loadedImages[name] = null;
        this.loadingStatus[name] = '';
        this.attemptsCount[name] = 0;
        return true;
    };

    this.releaseImageReference = function(name)
    {
        if (this.loadingStatus[name] != 'ok')
        {
            return;
        }
        this.loadedImages[name] = null;
        this.loadingStatus[name] = '';
        this.attemptsCount[name] = 0;
    };

    this.unloadAllImages = function()
    {
        for (var name in this.loadedImages)
        {
            if (this.loadedImages.hasOwnProperty(name))
            {
                this.unloadImage(name);
            }
        }
    };

    this.imageLoaded = function(name, callback)
    {
        var that = this;
        return function()
        {
            that.loadingSuccess.images++;
            that.loadingStatus[name] = 'ok';
            // if we're preloading an image, notify wade so it can pass the image to the main asset loader
            if (window['wade'])
            {
                wade.setImage(name, that.loadedImages[name]);
            }
            that.handleLoadingCallback(callback, that.loadedImages[name], name);
        };
    };

    this.imageLoadingError = function(name, callback, errorCallback)
    {
        var that = this;
        return function()
        {
            that.loadingErrors.images++;
            that.loadingStatus[name] = 'error';
            if (that.attemptsCount[name] < that.maxAttempts)
            {
                if (errorCallback)
                {
                    errorCallback();
                }
                else
                {
                    wade.log('Unable to load image ' + name);
                }
                that.loadingFailed.images++;
            }
            else
            {
                that.loadImage(name, callback, errorCallback);
            }
        }
    };

    this.setImage = function(name, image)
    {
        image.imageName = name;
        this.loadedImages[name] = image;
        if (image)
        {
            this.loadingStatus[name] = 'ok';
        }
    };

    this.setJson = function(name, data)
    {
        this.loadedJson[name] = data;
        if (data)
        {
            this.loadingStatus[name] = 'ok';
        }
    };

    this.setAudio = function(name, audio, callback)
    {
        if (!this.audioContext)
        {
            this.audioContext = wade.getWebAudioContext();
        }

        if (audio && this.audioContext && typeof(audio) == 'string')
        {
            // convert base64 to raw binary data held in a string
            var byteString = atob(audio.split(',')[1]);

            // write the bytes of the string to an ArrayBuffer
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++)
            {
                ia[i] = byteString.charCodeAt(i);
            }
            var that = this;
            this.audioContext.decodeAudioData(ab, function(buffer)
            {
                that.loadedAudio[name] = buffer;
                that.loadingStatus[name] = 'ok';
                callback && setTimeout(callback, 0);
            }, function()
            {
                wade.log('Unable to decode audio file ' + audio);
            });

        }
        else
        {
            this.loadedAudio[name] = audio;
            if (audio)
            {
                this.loadingStatus[name] = 'ok';
            }
            callback && callback();
        }
    };

    this.setScript = function(name, script)
    {
        if (wade.isDebugMode())
        {
            if (script.indexOf('//# sourceURL') == -1)
            {
                script += '\n//# sourceURL=' + name;
            }
        }

        this.loadedScripts[name] = script;
        if (script)
        {
            this.loadingStatus[name] = 'ok';
        }
    };

    this.setFont = function(name, font)
    {
        this.loadedFonts[name] = font;
        if (font)
        {
            this.loadingStatus[name] = 'ok';

            // add some css to the document for our font-face
            if (!document.getElementById('__wade_font_' + name))
            {
                var start = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\')) + 1;
                var fontName = name.substr(start, name.lastIndexOf('.') - start);
                var newStyle = document.createElement('style');
                newStyle.id = '__wade_font_' + name;
                newStyle.appendChild(document.createTextNode("@font-face {font-family: '" + fontName + "';src: url('" + font + "') format('woff');}"));
                document.head.appendChild(newStyle);
            }
        }
    };
	
	this.jsonLoaded = function(name, objectToStoreData, callback)
	{
        var that = this;
		return function(data)
		{
            that.loadingSuccess.json++;
            that.loadingStatus[name] = 'ok';
            that.loadedJson[name] = data;
            // if we're preloading JSON, notify wade so it can pass the JSON data to the main asset loader
            if (window['wade'])
            {
                wade.setJson(name, that.loadedJson[name]);
            }
			objectToStoreData && (objectToStoreData.data = data);
            that.handleLoadingCallback(callback, that.loadedJson[name], name);
		}
	};

	this.scriptLoaded = function(name, callback, executeNow)
	{
        var that = this;
        return function(data)
        {
            that.loadingSuccess.scripts++;
            that.loadingStatus[name] = 'ok';
            that.loadedScripts[name] = data;
            // if we're preloading scripts, notify wade so it can pass the script data to the main asset loader
            if (window['wade'])
            {
                wade.setScript(name, that.loadedScripts[name]);
            }
            executeNow && eval.call(window, data);
            that.handleLoadingCallback(callback, that.loadedScripts[name], name);
        }
	};

    this.scriptLoadingError = function(name, callback, forceReload, errorCallback)
    {
        var that = this;
        return function()
        {
            that.loadingErrors.scripts++;
            that.loadingStatus[name] = 'error';
            if (that.attemptsCount[name] < that.maxAttempts)
            {
                if (errorCallback)
                {
                    errorCallback();
                }
                else
                {
                    wade.log('Unable to load script ' + name);
                }
                that.loadingFailed.scripts++;
            }
            else
            {
                that.loadScript(name, callback, forceReload, errorCallback);
            }
        }
    };

    this.jsonLoadingError = function(name, objectToStoreData, callback, forceReload, errorCallback)
    {
        var that = this;
        return function()
        {
            that.loadingErrors.json++;
            that.loadingStatus[name] = 'error';
            if (that.attemptsCount[name] < that.maxAttempts)
            {
                if (errorCallback)
                {
                    errorCallback();
                }
                else
                {
                    wade.log('Unable to load json file ' + name);
                }
                that.loadingFailed.json++;
            }
            else
            {
                that.loadJson(name, objectToStoreData, callback, forceReload, errorCallback);
            }
        }
    };

    this.appLoaded = function(name)
	{
        var that = this;
        return function()
        {
            that.loadingSuccess.scripts++;
            that.loadingStatus[name] = 'ok';
            wade.instanceApp();
        }
	};
	
	this.appLoadingError = function(name)
	{
        var that = this;
        return function()
        {
            that.loadingErrors.scripts++;
            that.loadingStatus[name] = 'error';
            if (that.attemptsCount[name] < that.maxAttempts)
            {
                alert('Unable to load main app script ' + name);
                that.loadingFailed.scripts++;
            }
            else
            {
                that.loadAppScript(name);
            }
        }
	};

    this.loadAudio = function(name, autoplay, loop, callback, errorCallback)
    {
        if (this.loadingStatus[name] == 'ok' || this.loadingStatus[name] == 'loading')
        {
            if (this.loadingStatus[name] == 'ok')
            {
                var that = this;
                if (that.loadedAudio[name])
                {
                    that.loadedAudio[name].autoplay = autoplay;
                    that.loadedAudio[name].loop = loop;
                }
                autoplay && that.audioContext && wade.playAudio(name, loop);
                callback && callback(that.loadedAudio[name], name);
            }
            return;
        }
        this.loadingStatus[name] = 'loading';
        this.updateAttempts(name, 'audio');
        var extension = name.substr(name.length - 3).toLowerCase();
        var actualName = name;
        if (extension != this.audioExtension && (extension == 'aac' || extension == 'ogg'))
        {
            actualName = name.substr(0, name.length - 3) + this.audioExtension;
        }

        if (this.audioContext)
        {
            that = this;
            var request = new XMLHttpRequest();
            request.open('GET', actualName, true);
            request.responseType = 'arraybuffer';
            request.timeout = 60000;

            request.onload = function()
            {
                that.audioContext.decodeAudioData(request.response, function(buffer)
                {
                    that.loadedAudio[name] = buffer;
                    that.audioLoaded(name, callback)();
                    autoplay && wade.playAudio(name, loop);
                }, that.audioLoadingError(name, autoplay, loop, callback, errorCallback));
            };
            request.send();
        }
        else
        {
            var audio = new Audio();
            audio.autoplay = autoplay;
            audio.loop = loop;
            audio.name = name;
            audio.addEventListener('canplaythrough', this.audioLoaded(name, callback), false);
            audio.addEventListener('error', this.audioLoadingError(name, autoplay, loop, callback, errorCallback), false);
            if (loop)
            {
                audio.addEventListener('ended', function() {this.currentTime = 0; this.play();}, false);
            }
            audio.src = actualName;
            audio.load();
            this.loadedAudio[name] = audio;
        }
    };

    this.unloadAudio = function(name)
    {
        if (this.loadingStatus[name] != 'ok')
        {
            return false;
        }
        this.loadedAudio[name] = null;
        this.loadingStatus[name] = '';
        this.attemptsCount[name] = 0;
        return true;
    };

    this.unloadAllAudio = function()
    {
        for (var name in this.loadedAudio)
        {
            if (this.loadedAudio.hasOwnProperty(name))
            {
                this.unloadAudio(name);
            }
        }
    };

    this.audioLoaded = function(name, callback)
    {
        var that = this;
        return function()
        {
            if (that.loadingStatus[name] != 'ok')
            {
                that.loadingSuccess.audio++;
                // if we're preloading audio, notify wade so it can pass the audio to the main asset loader
                if (window['wade'])
                {
                    wade.setAudio(name, that.loadedAudio[name]);
                }
                that.loadingStatus[name] = 'ok';
                that.handleLoadingCallback(callback, that.loadedAudio[name], name);
            }
        }
    };

    this.audioLoadingError = function(name, autoplay, loop, callback, errorCallback)
    {
        var that = this;
        return function()
        {
            that.loadingErrors.audio++;
            that.loadingStatus[name] = 'error';
            if (that.attemptsCount[name] < that.maxAttempts)
            {
                if (errorCallback)
                {
                    errorCallback();
                }
                else
                {
                    wade.log('Unable to load audio ' + name);
                }
                that.loadingFailed.audio++;
            }
            else
            {
                that.loadAudio(name, autoplay, loop, callback, errorCallback);
            }
        }
    };

    this.isFinishedLoading = function()
	{
        return (this.loadingRequests.scripts    == this.loadingSuccess.scripts  + this.loadingFailed.scripts  &&
                this.loadingRequests.json       == this.loadingSuccess.json     + this.loadingFailed.json     &&
                this.loadingRequests.images     == this.loadingSuccess.images   + this.loadingFailed.images   &&
                this.loadingRequests.audio      == this.loadingSuccess.audio    + this.loadingFailed.audio    &&
                this.loadingRequests.fonts      == this.loadingSuccess.fonts    + this.loadingFailed.fonts);
	};

    this.getPercentageComplete = function()
    {
        return 100 * (this.loadingSuccess.scripts + this.loadingSuccess.json + this.loadingSuccess.images + this.loadingSuccess.audio) / (this.loadingRequests.scripts + this.loadingRequests.json + this.loadingRequests.images + this.loadingRequests.audio);
    };

    this.getImage = function(name, errorMessage)
    {
        if (this.loadingStatus[name] == 'ok')
        {
            return this.loadedImages[name];
        }
        else
        {
            if (typeof(errorMessage) == 'undefined')
            {
                errorMessage = 'Warning: Trying to get image ' + name + ' without loading it first';
            }
            errorMessage && wade.log(errorMessage);
            return wade.getImage();
        }
    };

    this.getJson = function(name)
    {
        if (this.loadingStatus[name] == 'ok')
        {
            return this.loadedJson[name];
        }
        else
        {
            wade.log('Warning: Trying to get JSON data ' + name + ' without loading it first');
            return {};
        }
    };

    this.getAudio = function(name)
    {
        if (this.loadingStatus[name] == 'ok')
        {
            return this.loadedAudio[name];
        }
        else
        {
            wade.log('Warning: Trying to get audio ' + name + ' without loading it first');
            return new Audio();
        }
    };

    this.getScript = function(name)
    {
        if (this.loadingStatus[name] == 'ok')
        {
            return this.loadedScripts[name];
        }
        else
        {
            wade.log('Warning: Trying to get script ' + name + ' without loading it first');
            return '';
        }
    };

    this.getFont = function(name)
    {
        if (this.loadingStatus[name] == 'ok')
        {
            return this.loadedFonts[name];
        }
        else
        {
            wade.log('Warning: Trying to get font ' + name + ' without loading it first');
            return '';
        }
    };

    this.getLoadingStatus = function(name)
    {
        var status = this.loadingStatus[name];
        return status? status : 'unknown';
    };

    // set a callback to be executed the next time everything is finished loading
    this.setGlobalCallback = function(callback)
    {
        if (callback && this.isFinishedLoading())
        {
            callback();
            this.globalCallback = 0;
        }
        else
        {
            this.globalCallback = callback;
        }
    };

    this.handleLoadingCallback = function(callback, data, fileName)
    {
        if (callback)
        {
            callback(data, fileName);
        }
        if (this.globalCallback && this.isFinishedLoading())
        {
            this.globalCallback();
            this.setGlobalCallback(0);
        }
    };

    this.loadFont = function(name, callback, errorCallback)
    {
        // if already loaded, just execute the callback
        if (this.loadingStatus[name] == 'ok')
        {
            if (callback)
            {
                callback(this.loadedFonts[name], name);
            }
            return;
        }
        else if (this.loadingStatus[name] == 'loading')
        {
            // if currently loading, do nothing
            return;
        }
        this.loadingStatus[name] = 'loading';
        this.updateAttempts(name, 'fonts');

        // get font name from file name
        var start = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\')) + 1;
        var fontName = name.substr(start, name.lastIndexOf('.') - start);

        // do an xhr to download the font and store it as a data uri
        var xhr = new XMLHttpRequest();
        xhr.open('GET', name, true);
        xhr.responseType = 'blob';
        var that = this;
        xhr.onload = function()
        {
            if ((this.status && this.status != 200) || !this.response)
            {
                that.fontLoadingError(name, callback, errorCallback);
            }
            else
            {
                var blob = this.response;
                var reader = new FileReader();

                // when the font is available as a data uri this function will be execute
                reader.onloadend = function()
                {
                    // add some css to the document for our font-face
                    var newStyle = document.createElement('style');
                    newStyle.id = '__wade_font_' + fontName;
                    newStyle.appendChild(document.createTextNode("@font-face {font-family: '" + fontName + "';src: url('" + reader.result + "') format('woff');}"));
                    document.head.appendChild(newStyle);

                    // create a text node with a default font
                    var node = document.createElement('span');
                    // characters that vary significantly among different fonts
                    node.innerHTML = 'giItT1WQy@!-/#';
                    // visible - so we can measure it - but not on the screen
                    node.style.position      = 'absolute';
                    node.style.left          = '-10000px';
                    node.style.top           = '-10000px';
                    // large font size makes even subtle changes obvious
                    node.style.fontSize      = '300px';
                    // reset any font properties
                    node.style.fontFamily    = 'sans-serif';
                    node.style.fontVariant   = 'normal';
                    node.style.fontStyle     = 'normal';
                    node.style.fontWeight    = 'normal';
                    node.style.letterSpacing = '0';
                    document.body.appendChild(node);

                    // remember width with no applied web font
                    var width = node.offsetWidth;

                    // change font and wait until the width changes (so we know the font has been applied)
                    node.style.fontFamily = fontName;
                    var interval;
                    var intervalTime = 50;
                    var totalTime = 0;
                    var maxTime = 15000;
                    var checkFont = function()
                    {
                        // Compare current width with original width
                        if (node && node.offsetWidth != width)
                        {
                            node.parentNode.removeChild(node);
                            node = null;
                            clearInterval(interval);
                            that.loadedFonts[name] = reader.result;
                            that.fontLoaded(name, callback)();
                            return true;
                        }

                        if ((totalTime += intervalTime) > maxTime)
                        {
                            clearInterval(interval);
                            that.fontLoadingError(name, callback, errorCallback)();
                        }
                        return false;
                    };

                    if (!checkFont())
                    {
                        interval = setInterval(checkFont, intervalTime);
                    }
                };
                reader.readAsDataURL(blob);
            }
        };
        xhr.send();
    };

    this.fontLoaded = function(name, callback)
    {
        var that = this;
        return function()
        {
            if (that.loadingStatus[name] != 'ok')
            {
                that.loadingSuccess.fonts++;
                that.loadingStatus[name] = 'ok';
                // if we're preloading a font, notify wade so it can pass the font to the main asset loader
                if (window['wade'])
                {
                    wade.setFont(name, that.loadedFonts[name]);
                }
                that.handleLoadingCallback(callback, that.loadedFonts[name], name);
            }
        };
    };

    this.fontLoadingError = function(name, callback, errorCallback)
    {
        var that = this;
        return function()
        {
            that.loadingErrors.fonts++;
            that.loadingStatus[name] = 'error';
            if (that.attemptsCount[name] < that.maxAttempts)
            {
                if (errorCallback)
                {
                    errorCallback();
                }
                else
                {
                    wade.log('Unable to load font ' + name);
                }
                that.loadingFailed.fonts++;
            }
            else
            {
                that.loadFont(name, callback, errorCallback);
            }
        }
    };

}
    return AssetLoader;
});