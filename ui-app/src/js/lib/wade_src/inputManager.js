define(function() {
function InputManager()
{
// private:
    var self = this;
	var mouseIsDown = 0;	    // keep track of mouseDown state, to handle mobile browsers that fire both touch and mouse events
	var pinchZoomDistance = 0;	// used to handle the pinch-zoom gesture
    var lastEventData;          // store the details of the last mouse event
    var lastEventTimes = [];    // time of the last input event
    var minEventIntervals = []; // minimum interval between input events of the same type
    var pointerStatus = [];
    var touches = [];
    var mouseDownPositions = [];
    var clickTolerance = 5;
    var lastMousePosition = {};
    var gamepads = [];
    var gamepadButtonState = [];
    var gestureDetection = {positions: [], detected: ''};
    var supportMultitouch = false;
    var initialized = false;
    var cancelEvents = true;
    var swipeTolerance = 1;
    var swipeSamples = 3;
    var containerDiv;
    var keyStates = {};

	// Get the absolute cursor position on the screen for an event object
	var absoluteCursorPosition = function(eventObj)
	{
		eventObj = eventObj ? eventObj : window.event;
	  
		// if window.scrollX is not a number, use scrollLeft and scrollTop instead
        var position;
		if (isNaN(window.scrollX))
		{
			position = {x: document.documentElement.scrollLeft + document.body.scrollLeft + eventObj.clientX,
						y: document.documentElement.scrollTop  + document.body.scrollTop  + eventObj.clientY};
		}
		else
		{
			position = {x: window.scrollX + eventObj.clientX,
						y: window.scrollY + eventObj.clientY};
        }
		return position;
	};

	// Get the cursor position relative to a DOM element. The element parameter can be a string with the element name, or the element id
	var relativeCursorPosition = function(eventObj, element)
	{
		// if the user passed in a string,for the element (i.e. the element name), convert it to a DOM element
		if (typeof(element) == "string")
		{
			element = document.getElementById(element);
		}
		// if no element with the specified name was found, return
		if (element == null)
		{
			return {x:0, y:0};
		}
		// get the absolute position first
		var pos = absoluteCursorPosition(eventObj);
		// then subtract offsets and half the size of the element
		pos.x -= element.offsetLeft + element.clientLeft + element.clientWidth / 2;
		pos.y -= element.offsetTop  + element.clientTop  + element.clientHeight / 2;

        pos.x *= element.getAttribute('width') / element.clientWidth;
        pos.y *= element.getAttribute('height') / element.clientHeight;

        if (wade.isScreenRotated())
        {
            var y = pos.y;
            pos.y = -pos.x;
            pos.x = y;
        }
		return pos;
	};

	// Cancel an event 
	var cancelEvent = function(eventObj)
	{
        if (!cancelEvents)
        {
            return;
        }
		// if no event object is passed in, use the current window event
		eventObj = eventObj ? eventObj : window.event;
		// if a stopPropagation function exists, call that
		if (eventObj.stopPropagation)
		{
			eventObj.stopPropagation();
		}
		// if a preventDefault function exists, call that
		if (eventObj.preventDefault)
		{
			eventObj.preventDefault();
		}
		// for some browsers you have to set one or more of these flags too
		eventObj.returnValue = false;
		eventObj.cancel = true;
		eventObj.cancelBubble = true;
	};

// privileged:

	// Initialize the input mamanger
	this.init = function()
	{
        if (initialized)
        {
            return;
        }
        containerDiv = wade.getContainerName();
		// register some default input event callbacks
        var mainDiv = document.getElementById(containerDiv);
        mainDiv.addEventListener('mousedown', 	    this.event_mouseDown);
        window.addEventListener('mouseup', 		    this.event_mouseUp);
        mainDiv.addEventListener('mousemove', 	    this.event_mouseMove);
        mainDiv.addEventListener('mousewheel', 	    this.event_mouseWheel);
        mainDiv.addEventListener('click',           this.noEvent);
        mainDiv.addEventListener('dblclick',        this.noEvent);
        mainDiv.addEventListener('contextmenu',     this.noEvent);
        mainDiv.addEventListener('DOMMouseScroll',  this.event_mouseWheel);
        window.addEventListener('touchstart', 	    this.event_touchStart);
        window.addEventListener('touchend', 	    this.event_touchEnd);
        window.addEventListener('touchmove', 	    this.event_touchMove);
		window.addEventListener('keydown', 	        this.event_keyDown);
		window.addEventListener('keyup', 	        this.event_keyUp);
		window.addEventListener('keypress',         this.event_keyPress);
		window.addEventListener('blur',             this.event_blur);
		window.addEventListener('focus',            this.event_focus);
        if (navigator.msPointerEnabled)
        {
            mainDiv.addEventListener('MSPointerDown', 	this.event_pointerDown);
            mainDiv.addEventListener('MSPointerMove', 	this.event_pointerMove);
            mainDiv.addEventListener('MSPointerUp', 	this.event_pointerUp);
        }
        if (window.tizen)
        {
            window.addEventListener('tizenhwkey', function(e)
            {
                if (e.keyName == "back")
                {
                    tizen.application.getCurrentApplication().exit();
                }
            });
            window.onblur = function()
            {
                wade.deleteCanvases();
            };
            window.onfocus = function()
            {
                wade.recreateCanvases();
            };
        }
        
        initialized = true;
	};

    // De-initialize the input mamanger (stop listening to events)
    this.deinit = function()
    {
        if (!initialized)
        {
            return;
        }
        var mainDiv = document.getElementById(containerDiv);
        mainDiv.removeEventListener('mousedown', 	    this.event_mouseDown);
        window.removeEventListener('mouseup', 	        this.event_mouseUp);
        mainDiv.removeEventListener('mousemove', 	    this.event_mouseMove);
        mainDiv.removeEventListener('mousewheel',       this.event_mouseWheel);
        mainDiv.removeEventListener('click',            this.noEvent);
        mainDiv.removeEventListener('dblclick',         this.noEvent);
        mainDiv.removeEventListener('contextmenu',      this.noEvent);
        mainDiv.removeEventListener('DOMMouseScroll',   this.event_mouseWheel);
        window.removeEventListener('touchstart',        this.event_touchStart);
        window.removeEventListener('touchend', 	        this.event_touchEnd);
        window.removeEventListener('touchmove', 	    this.event_touchMove);
        window.removeEventListener('keydown', 	        this.event_keyDown);
        window.removeEventListener('keyup', 	        this.event_keyUp);
        window.removeEventListener('keypress',          this.event_keyPress);
        window.removeEventListener('blur',              this.event_blur);
        window.removeEventListener('focus',             this.event_focus);
        if (navigator.msPointerEnabled)
        {
            mainDiv.removeEventListener('MSPointerDown',     this.event_pointerDown);
            mainDiv.removeEventListener('MSPointerMove',     this.event_pointerMove);
            mainDiv.removeEventListener('MSPointerUp', 	    this.event_pointerUp);
        }
        if (window.tizen)
        {
            window.removeEventListener('tizenhwkey');
            window.onblur = window.onfocus = null;
        }
        
        initialized = false;
    };

    // use gamepads
    this.enableGamepads = function(toggle)
    {
        if (typeof(toggle) == 'undefined')
        {
            toggle = true;
        }
        if (toggle)
        {
            if (!wade.areGamepadsSupported())
            {
                wade.log("Warning - Gamepads aren't supported in this browser");
                return;
            }
            var getGamepads = navigator.getGamepads || navigator.webkitGetGamepads;
            wade.setMainLoopCallback(function()
            {
                var newData = getGamepads.call(navigator);
                for (var i=0; i<newData.length; i++)
                {
                    var gamepad = newData[i];
                    if (!gamepadButtonState[i])
                    {
                        gamepadButtonState[i] = [];
                    }
                    if (gamepad)
                    {
                        for (var j=0; j<gamepad.buttons.length; j++)
                        {
                            if (gamepad.buttons[j] != (gamepadButtonState[i][j] || 0))
                            {
                                var func = gamepad.buttons[j]? 'onGamepadButtonDown' : 'onGamepadButtonUp';
                                var eventData = {gamepadIndex: gamepad.index, gamepadId: gamepad.id, button: j};
                                if (wade.app && wade.isAppInitialized() && !wade.processEvent(func, eventData))
                                {
                                    wade.app[func] && wade.app[func](eventData);
                                }
                            }
                            gamepadButtonState[i][j] = gamepad.buttons[j];
                        }
                    }
                }
                gamepads = newData;
            }, '__wade_gamepads');
        }
        else
        {
            wade.setMainLoopCallback(null, '__wade_gamepads');
        }
    };

    this.getGamepadData = function()
    {
        return gamepads;
    };

    // This function is called on mouse down
	this.event_mouseDown = function(e)
	{
        // get the relative cursor position
        var eventData = {screenPosition: relativeCursorPosition(e, containerDiv)};
        if (Math.abs(eventData.screenPosition.x) > wade.getScreenWidth() / 2 || Math.abs(eventData.screenPosition.y) > wade.getScreenHeight() / 2)
        {
            return false;
        }
        // store the mouse position
        self._setLastMousePosition(eventData.screenPosition.x, eventData.screenPosition.y);
        // ignore events occurring too frequently
        var time = (new Date()).getTime();
        if (!supportMultitouch && minEventIntervals['mouseDown'] && lastEventTimes['mouseDown'] && time - lastEventTimes['mouseDown'] < minEventIntervals['mouseDown'])
        {
            return false;
        }
        // ignore mousedowns shortly after mouseups (because some browsers emit mousedown + mouseup events after touch events)
        if (!supportMultitouch && minEventIntervals['mouseUp'] && lastEventTimes['mouseUp'] && time - lastEventTimes['mouseUp'] < minEventIntervals['mouseUp'])
        {
            return false;
        }
		// only do something if the mouse is not down already
		if (supportMultitouch || !mouseIsDown)
		{
            // store the current mouse down state
            mouseIsDown = supportMultitouch? mouseIsDown+1 : true;
            mouseDownPositions.push({x: eventData.screenPosition.x, y: eventData.screenPosition.y});
            eventData.button = e.button;
            lastEventData = e;
			// see if the scene manager catches and stops this event
			if (wade.app && wade.isAppInitialized() && !wade.processEvent('onMouseDown', eventData))
			{
				// if the scene manager didn't stop the event, pass it to the app
                if (wade.app.onMouseDown)
                {
                    wade.app.onMouseDown(eventData);
                }
			}
			// stop the event from propagating
			cancelEvent(e);
            // store the current time
            lastEventTimes['mouseDown'] = time;
            // store the position for gesture recognition
            gestureDetection.positions.length = 0;
            gestureDetection.detected = '';
            gestureDetection.positions.push({x: eventData.screenPosition.x, y: eventData.screenPosition.y});
		}
        return false;
	};
	
	// This function is called on mouse up
	this.event_mouseUp = function(e)
	{
        // get the relative cursor position
        var eventData = {screenPosition: relativeCursorPosition(e, containerDiv)};
        if (Math.abs(eventData.screenPosition.x) > wade.getScreenWidth() / 2 || Math.abs(eventData.screenPosition.y) > wade.getScreenHeight() / 2)
        {
            return false;
        }
        // store the mouse position
        self._setLastMousePosition(eventData.screenPosition.x, eventData.screenPosition.y);
        // ignore events occurring too frequently
        var time = (new Date()).getTime();
        if (!supportMultitouch && minEventIntervals['mouseUp'] && lastEventTimes['mouseUp'] && time - lastEventTimes['mouseUp'] < minEventIntervals['mouseUp'])
        {
            return false;
        }

        // only do something if the mouse was down
		if (supportMultitouch || mouseIsDown)
		{
            // store the current mouse down state
            mouseIsDown = supportMultitouch? mouseIsDown-1 : false;
            eventData.button = e.button;
            lastEventData = e;
            // check to see if it was a click
            if (mouseDownPositions.length)
            {
                for (var i=0; i<mouseDownPositions.length; i++)
                {
                    var dx = eventData.screenPosition.x - mouseDownPositions[i].x;
                    var dy = eventData.screenPosition.y - mouseDownPositions[i].y;
                    if (dx*dx + dy*dy <= clickTolerance*clickTolerance)
                    {
                        self.event_click(eventData);
                        break;
                    }
                }
                mouseDownPositions.length--;
            }
			// see if the scene manager catches and stops this event
			if (wade.app && wade.isAppInitialized() && !wade.processEvent('onMouseUp', eventData))
			{
				// if the scene manager didn't stop the event, pass it to the app
                if (wade.app.onMouseUp)
                {
                    wade.app.onMouseUp(eventData);
                }
			}
            // if this is mobile safari and if it's the first mouseUp event, play a silent sound to enable audio
            if (!lastEventTimes['mouseUp'] && navigator && navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/))
            {
                wade.playSilentSound();
            }
			// stop the event from propagating
			cancelEvent(e);
            // store the current time
            lastEventTimes['mouseUp'] = time;
            // reset stored positions for gesture recognition
            gestureDetection.positions.length = 0;
            gestureDetection.detected = '';
		}
        return false;
	};
	
	// This function is called on mouse move
	this.event_mouseMove = function(e)
	{
        // get the relative cursor position
        var eventData = {screenPosition: relativeCursorPosition(e, containerDiv)};
        if (Math.abs(eventData.screenPosition.x) > wade.getScreenWidth() / 2 || Math.abs(eventData.screenPosition.y) > wade.getScreenHeight() / 2)
        {
            return false;
        }
        // store the mouse position
        self._setLastMousePosition(eventData.screenPosition.x, eventData.screenPosition.y);
        // ignore events occurring too frequently
        var time = (new Date()).getTime();
        if (!supportMultitouch && minEventIntervals['mouseMove'] && lastEventTimes['mouseMove'] && time - lastEventTimes['mouseMove'] < minEventIntervals['mouseMove'])
        {
            return false;
        }
        lastEventData = e;
		// see if the scene manager catches and stops this event
		if (wade.app && wade.isAppInitialized() && !wade.processEvent('onMouseMove', eventData))
		{
			// if the scene manager didn't stop the event, pass it to the app
            if (wade.app.onMouseMove)
            {
                wade.app.onMouseMove(eventData);
            }
		}
        // store the current time
        lastEventTimes['mouseMove'] = time;
		// stop the event from propagating
		cancelEvent(e);
        // if the mouse is down, store the position for gesture recognition
        if (self.isMouseDown())
        {
            gestureDetection.positions.push({x: eventData.screenPosition.x, y: eventData.screenPosition.y});
            self.detectGestures();
        }
	};
	
	// This function is called on mouse wheel
	this.event_mouseWheel = function(e)
	{
        // get the relative cursor position
        e = e ? e : window.event;
        var eventData = {screenPosition: relativeCursorPosition(e, containerDiv)};
        if (Math.abs(eventData.screenPosition.x) > wade.getScreenWidth() / 2 || Math.abs(eventData.screenPosition.y) > wade.getScreenHeight() / 2)
        {
            return false;
        }
        // store the mouse position
        self._setLastMousePosition(eventData.screenPosition.x, eventData.screenPosition.y);
        // ignore events occurring too frequently
        var time = (new Date()).getTime();
        if (!supportMultitouch && minEventIntervals['mouseWheel'] && lastEventTimes['mouseWheel'] && time - lastEventTimes['mouseWheel'] < minEventIntervals['mouseWheel'])
        {
            return;
        }
		// normalise event data, so it's hopefully browser-independent
        eventData.value = e.detail ? e.detail * -1 : e.wheelDelta / 40;
        lastEventData = eventData;
        // see if the scene manager catches and stops this event
        if (wade.app && wade.isAppInitialized() && !wade.processEvent('onMouseWheel', eventData))
        {
            // pass the event to the app
            if (wade.app.onMouseWheel)
            {
                wade.app.onMouseWheel(eventData);
            }
        }
        // store the current time
        lastEventTimes['mouseWheel'] = time;
		// stop the event from propagating
		cancelEvent(e);
	};

    // This function is called on click/tap
    this.event_click = function(eventData)
    {
        // ignore events occurring too frequently
        var time = (new Date()).getTime();
        if (!supportMultitouch && minEventIntervals['onClick'] && lastEventTimes['onClick'] && time - lastEventTimes['onClick'] < minEventIntervals['onClick'])
        {
            return;
        }
        // see if the scene manager catches and stops this event
        if (wade.app && wade.isAppInitialized() && !wade.processEvent('onClick', eventData))
        {
            // if the scene manager didn't stop the event, pass it to the app
            if (wade.app.onClick)
            {
                wade.app.onClick(eventData);
            }
        }
        // store the current time
        lastEventTimes['onClick'] = time;
    };
	
	// This function is called on touch start
	this.event_touchStart = function(e)
	{
        var t = e.touches || touches;
        // if touching with two fingers, it could be the start of a pinch-zoom
        if (t.length == 2)
		{
            var dx = t[0].pageX - t[1].pageX;
            var dy = t[0].pageY - t[1].pageY;
			pinchZoomDistance = Math.sqrt(dx*dx + dy*dy);
            if (supportMultitouch)
            {
                self.event_mouseDown(t[1]);
            }
		}
		else if (t.length == 1)
		{
			// if touching with one finger, pass the event to the mouseDown event callback
            self.event_mouseDown(t[0]);
		}
        else if (supportMultitouch)
        {
            self.event_mouseDown(t[t.length-1])
        }
		cancelEvent(e);
	};
	
	// This function is called on touch end
	this.event_touchEnd = function(e)
	{
        if (e.changedTouches && e.changedTouches.length)
        {
            for (var i=0; i< e.changedTouches.length; i++)
            {
                self.event_mouseUp(e.changedTouches[i]);
            }
        }
        else
        {
            self.event_mouseUp(lastEventData);
        }
        cancelEvent(e);
	};

	// This function is called on touch move
	this.event_touchMove = function(e)
	{
        var i;
        var t = e.touches || touches;
        // detect pinch-zoom and map it to mousewheel
		if (t.length == 2)
		{
			// get the distance between the two fingers
            var dx = t[0].pageX - t[1].pageX;
            var dy = t[0].pageY - t[1].pageY;
            var dist = Math.sqrt(dx*dx + dy*dy);
			if (dist)
			{
				var value = (pinchZoomDistance - dist);
				if (Math.abs(value) > wade.c_epsilon)
				{
					value = -30 * value / Math.max(wade.getScreenWidth(), wade.getScreenHeight());
                    self.event_mouseWheel({clientX: t[0].pageX, clientY: t[0].pageY, detail: -value});
				}
			}
			pinchZoomDistance = dist;
            if (supportMultitouch && e.changedTouches)
            {
                for (i=0; i < e.changedTouches.length; i++)
                {
                    self.event_mouseMove({clientX: e.changedTouches[i].pageX, clientY: e.changedTouches[i].pageY});
                }
            }
		}
		else if (t.length == 1)
		{
			// if touching with one finger, pass the event to the mouseWheel event callback
			self.event_mouseMove({clientX: t[0].pageX, clientY: t[0].pageY});
		}
        else if (supportMultitouch && e.changedTouches)
        {
            for (i=0; i < e.changedTouches.length; i++)
            {
                self.event_mouseMove({clientX: e.changedTouches[i].pageX, clientY: e.changedTouches[i].pageY});
            }
        }
		cancelEvent(e);
	};

    // This function is called on key down
    this.event_keyDown = function(e)
    {
        var eventData = {keyCode: (('which' in e)? e.which : e.keyCode), shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey, meta: e.metaKey};
        keyStates[eventData.keyCode] = true;
        // see if the scene manager catches and stops this event
        if (wade.app && wade.isAppInitialized() && !wade.processEvent('onKeyDown', eventData))
        {
            // if the scene manager didn't stop the event, pass it to the app
            if (wade.app.onKeyDown && wade.app.onKeyDown(eventData))
            {
                cancelEvent(e);
            }
        }
        else
        {
            cancelEvent(e);
        }
    };

    // This function is called on key up
    this.event_keyUp = function(e)
    {
        var eventData = {keyCode: (('which' in e)? e.which : e.keyCode), shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey, meta: e.metaKey};
        keyStates[eventData.keyCode] = false;
        // see if the scene manager catches and stops this event
        if (wade.app && wade.isAppInitialized() && !wade.processEvent('onKeyUp', eventData))
        {
            // if the scene manager didn't stop the event, pass it to the app
            if (wade.app.onKeyUp && wade.app.onKeyUp(eventData))
            {
                cancelEvent(e);
            }
        }
        else
        {
            cancelEvent(e);
        }
    };

    // This function is called on key press
    this.event_keyPress = function(e)
    {
        var eventData = {charCode: (('charCode' in e)? e.charCode : e.keyCode)};
        // see if the scene manager catches and stops this event
        if (wade.app && wade.isAppInitialized() && !wade.processEvent('onKeyPress', eventData))
        {
            // if the scene manager didn't stop the event, pass it to the app
            if (wade.app.onKeyPress && wade.app.onKeyPress(eventData))
            {
                cancelEvent(e);
            }
        }
        else
        {
            cancelEvent(e);
        }
    };

    this.isKeyDown = function(keyCode)
    {
        return !!keyStates[keyCode];
    };

    this.event_pointerDown = function(e)
    {
        if (!pointerStatus[e.pointerId])
        {
            pointerStatus[e.pointerId] = 1;
            touches.push({pageX: e.pageX, pageY: e.pageY, clientX: e.clientX, clientY: e.clientY, pointerId: e.pointerId});
            self.event_touchStart(e);
        }
    };

    this.event_pointerUp = function(e)
    {
        if (pointerStatus[e.pointerId])
        {
            for (var i=0; i<touches.length; i++)
            {
                if (touches[i].pointerId == e.pointerId)
                {
                    wade.removeObjectFromArrayByIndex(i, touches);
                    break;
                }
            }
            pointerStatus[e.pointerId] = 0;
            self.event_touchEnd({changedTouches: [e]});
        }
    };

    this.event_pointerMove = function(e)
    {
        if (pointerStatus[e.pointerId])
        {
            for (var i=0; i<touches.length; i++)
            {
                if (touches[i].pointerId == e.pointerId)
                {
                    touches[i].pageX = e.pageX;
                    touches[i].pageY = e.pageY;
                    touches[i].clientX = e.clientX;
                    touches[i].clientY = e.clientY;
                    e.changedTouches = [touches[i]];
                    break;
                }
            }
            self.event_touchMove(e);
        }
    };

    this.event_deviceMotion = function(e)
    {
        if (!e.acceleration || e.acceleration.x === null)
        {
            return;
        }
        var eventData = {acceleration: e.acceleration, accelerationIncludingGravity: e.accelerationIncludingGravity, rotation: e.rotationRate, refreshInterval: e.interval};
        // see if the scene manager catches and stops this event
        if (wade.app && wade.isAppInitialized() && !wade.processEvent('onDeviceMotion', eventData))
        {
            // if the scene manager didn't stop the event, pass it to the app
            if (wade.app.onDeviceMotion && wade.app.onDeviceMotion(eventData))
            {
                cancelEvent(e);
            }
        }
        else
        {
            cancelEvent(e);
        }
    };

    this.event_deviceOrientation = function(e)
    {
        if (e.alpha === null)
        {
            return;
        }
        var eventData = {alpha: e.alpha, beta: e.beta, gamma: e.gamma};
        // see if the scene manager catches and stops this event
        if (wade.app && wade.isAppInitialized() && !wade.processEvent('onDeviceOrientation', eventData))
        {
            // if the scene manager didn't stop the event, pass it to the app
            if (wade.app.onDeviceOrientation && wade.app.onDeviceOrientation(eventData))
            {
                cancelEvent(e);
            }
        }
        else
        {
            cancelEvent(e);
        }
    };

    this.event_gamepadConnected = function(e)
    {
        wade.app.onGamepadConnected && wade.app.onGamepadConnected({gamepadId: e.gamepad.id});
    };

    this.event_gamepadDisconnected = function(e)
    {
        wade.app.onGamepadDisconnected && wade.app.onGamepadDisconnected({gamepadId: e.gamepad.id});
    };

    this.event_blur = function(e)
    {
        var eventData = {};
        // see if the scene manager catches and stops this event
        if (wade.app && wade.isAppInitialized() && !wade.processEvent('onBlur', eventData))
        {
            // if the scene manager didn't stop the event, pass it to the app
            if (wade.app.onBlur && wade.app.onBlur(eventData))
            {
                cancelEvent(e);
            }
        }
        else
        {
            cancelEvent(e);
        }
    };

    this.event_focus = function(e)
    {
        var eventData = {};
        // see if the scene manager catches and stops this event
        if (wade.app && wade.isAppInitialized() && !wade.processEvent('onFocus', eventData))
        {
            // if the scene manager didn't stop the event, pass it to the app
            if (wade.app.onFocus && wade.app.onFocus(eventData))
            {
                cancelEvent(e);
            }
        }
        else
        {
            cancelEvent(e);
        }
    };

    this.noEvent = function(e)
    {
        cancelEvent(e);
    };

    this.isMouseDown = function()
    {
        return !!mouseIsDown;
    };

    this.setMinimumIntervalBetweenEvents = function(type, interval)
    {
        minEventIntervals[type] = interval;
    };

    this.setClickTolerance = function(tolerance)
    {
        clickTolerance = tolerance;
    };

    this.getMousePosition = function()
    {
        return {x: lastMousePosition.x, y: lastMousePosition.y};
    };

    this.enableMultitouch = function(toggle)
    {
        supportMultitouch = toggle;
    };

    this.isMultitouchEnabled = function()
    {
        return supportMultitouch;
    };

    this.cancelEvents = function(toggle)
    {
        if (typeof(toggle) == 'undefined')
        {
            toggle = true;
        }
        cancelEvents = toggle;
    };

    this._setLastMousePosition = function(x, y)
    {
        if (x != lastMousePosition.x || y != lastMousePosition.y)
        {
            wade.updateMouseInOut(lastMousePosition, {x: x, y: y});
            lastMousePosition.x = x;
            lastMousePosition.y = y;
        }
    };

    this.detectGestures = function()
    {
        var swipeLeft = 0;
        var swipeRight = 0;
        var swipeUp = 0;
        var swipeDown = 0;
        if (!gestureDetection.detected && gestureDetection.positions.length < swipeSamples * 3)
        {
            for (var i=1; i<gestureDetection.positions.length && !gestureDetection.detected; i++)
            {
                var dx = (gestureDetection.positions[i].x - gestureDetection.positions[i-1].x) || wade.c_epsilon;
                var dy = (gestureDetection.positions[i].y - gestureDetection.positions[i-1].y) || wade.c_epsilon;
                var f = dx/Math.abs(dy);
                var g = dy/Math.abs(dx);
                if (f < -1 && Math.abs(g) <= swipeTolerance && ++swipeLeft == swipeSamples && !swipeRight && !swipeUp && !swipeDown)
                {
                    gestureDetection.detected = 'onSwipeLeft';
                }
                else if (f > 1 && Math.abs(g) <= swipeTolerance && ++swipeRight == swipeSamples && !swipeLeft && !swipeUp && !swipeDown)
                {
                    gestureDetection.detected = 'onSwipeRight';
                }
                else if (g < -1 && Math.abs(f) <= swipeTolerance && ++swipeUp == swipeSamples && !swipeLeft && !swipeRight && !swipeDown)
                {
                    gestureDetection.detected = 'onSwipeUp';
                }
                else if (g > 1 && Math.abs(f) <= swipeTolerance && ++swipeDown == swipeSamples && !swipeLeft && !swipeUp && !swipeRight)
                {
                    gestureDetection.detected = 'onSwipeDown';
                }
            }
            if (gestureDetection.detected)
            {
                var p = gestureDetection.positions[0];
                var eventData = {screenPosition: {x: p.x, y: p.y}, screenPositions: gestureDetection.positions};
                if (wade.app && wade.isAppInitialized() && !wade.processEvent(gestureDetection.detected, eventData))
                {
                    // if the scene manager didn't stop the event, pass it to the app
                    if (wade.app[gestureDetection.detected])
                    {
                        wade.app[gestureDetection.detected](eventData);
                    }
                }
            }
        }
    };

    this.setSwipeTolerance = function(tolerance, numSamples)
    {
        swipeTolerance = tolerance;
        swipeSamples = numSamples;
    };

}

    return InputManager;
});