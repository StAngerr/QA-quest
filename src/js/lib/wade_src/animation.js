/**
 * An Animation object is used in WADE to store and update animation data. It has a reference to an image that contains one or more frames of animation. It is assumed that all frames have the same size, and that the image size is an integer multiple of the frame size. <br/>
 * @param {string|object} [image] A file name of an image that has previously been loaded. If omitted or falsy, a blank image will be used. You can also use this constructor by passing in a single object (so just the first parameter) that contains all the animation properties that you want to set (see remarks below for more details).
 * @param {number} [numCellsX=1] The number of horizontal cells in the image
 * @param {number} [numCellsY=1] The number of vertical cells in the image
 * @param {number} [speed = 20] The animation speed, in frames per second
 * @param {boolean} [looping = false] Whether the animation should start again automatically when it's finished playing
 * @param {number} [startFrame = 0] The cell index corresponding to the first frame in the animation
 * @param {number} [endFrame] The cell index corresponding to the last frame in the animation. If omitted or falsy, the last cell index will be used.
 * @param {boolean} [autoResize] Whether the animation, when played, should automatically preserve the parent sprite's scale factor.
 * @param {{x:number, y:number}} [offset] An object with x and y fields describing an offset (in world space units) to be added to the parent sprite's position when the animation is playing.
 * <br/><br/><b>Remarks:</b><br/> You can also use this constructor by passing in a single object (so just the first parameter) that contains all the animation properties that you want to set. In this case, the object structure is as follows (all fields are optional): <br/><pre>
 {
     type: 'Animation,
     name: string,
     startFrame: number,
     endFrame: number,
     numCells: {x: number, y: number},
     image: string,
     speed: number,
     looping: boolean,
     stopped: boolean,
     blending: boolean,
     playMode: string,  // 'forward', 'reverse' or 'ping-pong'
     autoResize: boolean,
     offset: {x: number, y: number},
     properties: {}
 };
 </pre>
 Where properties is a set of properties to copy into the new animation object. Note that properties are deep-copied, and cannot contain functions or cyclical references.
 * @constructor
 */

 define(function() {
function Animation(image, numCellsX, numCellsY, speed, looping, startFrame, endFrame, autoResize, offset)
{
    if (typeof(image) == 'object' && image)
    {
        // use an object-style constructor, i.e. only use the first argument that contains all the properties of the object
        var c = image;
        this.name = c.name;
        this._numCells = {x: (c.numCells && c.numCells.x) || 1,  y: (c.numCells && c.numCells.y) || 1};
        this._startFrame = c.startFrame || 0;
        this._endFrame = (typeof(c.endFrame) != 'undefined' && !isNaN(c.endFrame))? c.endFrame: this._numCells.x * this._numCells.y - 1;
        this._imageName = c.image;
        this._speed = (typeof(c.speed) != 'undefined')? c.speed : 20;
        this._looping = !!c.looping;
        this._blending = !!c.blending;
        this._playMode = c.playMode || 'forward';
        this._autoResize = (typeof(c.autoResize) != 'undefined')? c.autoResize : true;
        this._offset = {x: (c.offset && c.offset.x) || 0, y: (c.offset && c.offset.y) || 0};
        this._image = wade.getImage(this._imageName);
        this._stopped = !!c.stopped;

        // extra properties
        if (c.properties)
        {
            for (var key in c.properties)
            {
                if (c.properties.hasOwnProperty(key))
                {
                    try
                    {
                        this[key] = JSON.parse(JSON.stringify(c.properties[key]));
                    }
                    catch (e) {}
                }
            }
        }
    }
    else
    {
        // use a normal function-style constructor
        this._image = wade.getImage(image);
        this._imageName = wade.getFullPathAndFileName(image);
        this._numCells = {x: numCellsX? numCellsX : 1, y: numCellsY? numCellsY : 1};
        this._startFrame = startFrame? startFrame : 0;
        this._endFrame = (typeof(endFrame) != 'undefined' && !isNaN(endFrame))? endFrame: numCellsX * numCellsY - 1;
        this._speed = (typeof(speed) != 'undefined')? speed : 20;
        this._looping = looping;
        this._blending = false;
        this._playMode = 'forward';
        this._stopped = false;
        this._autoResize = (typeof(autoResize) != 'undefined')? autoResize : true;
        this._offset = offset || {x: 0, y: 0};
        this._offset.x = this._offset.x || 0;
        this._offset.y = this._offset.y || 0;
    }
    this._currentFrame = this._startFrame;
    this._playing = false;
    this._time = 0;
    this._direction = 1;
    this._frameFraction = 0;
    this._frameSize = {x: this._image.width / this._numCells.x, y: this._image.height / this._numCells.y};
    this._frameCenter = {};
    if (window.Float32Array)
    {
        this._f32AnimFrameInfo = new Float32Array([0, 0, 1 / this._numCells.x, 1 / this._numCells.y]);
    }
    this._updateFrameCenter();
}

/**
 * Get the size of the image (i.e. the whole sprite sheet) being used for the animation
 * @return {{x: number, y: number}} An object with 'x' and 'y' fields representing the size
 */
Animation.prototype.getImageSize = function()
{
    return {x: this._image.width, y: this._image.height};
};

/**
 * Get the size of a single animation frame
 * @returns {{x: number, y: number}} An object with 'x' and 'y' fields representing the size
 */
Animation.prototype.getFrameSize = function()
{
    return {x: this._image.width / this._numCells.x, y: this._image.height / this._numCells.y};
};

Animation.prototype.getFrameCenter = function()
{
    return {x: this._frameCenter.x, y: this._frameCenter.y};
};

/**
 * Get the name of the image being used. This returns the full path and file name, including the basePath if a basePath was set. For a relative path, use Animation.getRelativeImageName()
 * @return {string} The name of the image being used
 */
Animation.prototype.getImageName = function()
{
    return wade.getFullPathAndFileName(this._imageName);
};

/**
 * Get the name of the image being used. This returns the relative file name, NOT including the basePath even if a basePath was set. For an absolute path, use Animation.getImageName()
 * @return {string} The name of the image being used
 */
Animation.prototype.getRelativeImageName = function()
{
    return this._imageName;
};

/**
 * Get the number of cells in the animation spritesheet
 * @returns {{x: number, y: number}} The number of cells in the spritesheet
 */
Animation.prototype.getNumCells = function()
{
    return {x: this._numCells.x, y: this._numCells.y};
};

/**
 * Play the animation
 * @param {string} [direction] The direction of the animation. It can be 'forward', 'reverse' or 'ping-pong' (which means forward and then reverse). Default is 'forward'
 */
Animation.prototype.play = function(direction)
{
    if (this._autoResize && this.sprite)
    {
        var scaleFactor = this.sprite.getScaleFactor();
        this.sprite.setSize(this._frameSize.x * scaleFactor.x, this._frameSize.y * scaleFactor.y);
    }
    this._time = 0;
    this._direction = (direction && direction == 'reverse')? -1 : 1;
    this._playMode = direction;
    var previousFrame = this._currentFrame;
    this._currentFrame = (this._direction == 1)? this._startFrame : this._endFrame;
    if (previousFrame != this._currentFrame)
    {
        this._updateFrameCenter();
    }
    var alreadyPlaying = this._playing;
    this._playing = true;
    this._stopped = false;
    if (this.sprite && this.name)
    {
        this.sprite.onAnimationStart(this.name, alreadyPlaying);
    }
};

/**
 * Stop the animation
 */
Animation.prototype.stop = function()
{
    this._playing = false;
    this._stopped = true;
};

/**
 * Resume an animation that had previously been stopped
 */
Animation.prototype.resume = function()
{
    if (this._playing)
    {
        return;
    }
    if (!this._stopped)
    {
        this.play();
    }
    else
    {
        this._playing = true;
        this._stopped = false;
    }
};

/**
 * Perform a simulation step for the current animation. This may result in displaying a different frame, and/or firing an 'onAnimationEnd' event.<br/>
 * This function is called automatically by WADE at each simulation step (only for animations that are currently playing)
 */
Animation.prototype.step = function()
{
    this._time += wade.c_timeStep;
    var previousFrame = this._currentFrame;
    var st = this._speed * this._time + wade.c_epsilon - 0.5;
    var intSt = Math.round(st);
    this._frameFraction = st - intSt + 0.5;
    this._currentFrame = (this._direction == 1) ? intSt + this._startFrame : this._endFrame - intSt;
    if (previousFrame != this._currentFrame)
    {
        if (this._direction == 1)
        {
            if (this._currentFrame > this._endFrame)
            {
                if (this._playMode == 'ping-pong')
                {
                    this._currentFrame = this._endFrame;
                    this._direction = -1;
                    this._time = 0;
                }
                else if (this._looping)
                {
                    this._currentFrame = this._startFrame;
                    this._time -= (this._endFrame - this._startFrame + 1) / this._speed;
                }
                else
                {
                    this._currentFrame = this._endFrame;
                    this._playing = false;
                    this._time = 0;
                    if (this.sprite && this.name)
                    {
                        this.sprite.onAnimationEnd(this.name);
                    }
                }
            }
        }
        else if (this._currentFrame < this._startFrame)
        {
            if (this._looping)
            {
                if (this._playMode == 'ping-pong')
                {
                    this._currentFrame = this._startFrame;
                    this._direction = 1;
                    this._time = 0;
                }
                else
                {
                    this._currentFrame = this._endFrame;
                    this._time -= (this._endFrame - this._startFrame + 1) / this._speed;
                }
            }
            else
            {
                this._currentFrame = this._startFrame;
                this._playing = false;
                this._time = 0;
                if (this.sprite && this.name)
                {
                    this.sprite.onAnimationEnd(this.name);
                }
            }
        }

        this._updateFrameCenter();
        this.sprite && this.sprite.isVisible() && this.sprite.getSceneObject() && this.sprite.getSceneObject().isInScene() && this.sprite.setDirtyArea();
    }
};

/**
 * Check whether the animation is playing
 * @return {boolean} Whether the animation is currently playing
 */
Animation.prototype.isPlaying = function()
{
    return this._playing;
};

/**
 * Enable or disable blending between animation frames. This is false by default.
 * @param {boolean} [toggle] Whether or not to enable animation blending. If omitted, 'true' is assumed
 */
Animation.prototype.setBlending = function(toggle)
{
    if (typeof(toggle) == 'undefined')
    {
        toggle = true;
    }
    this.draw = toggle? this._drawBlended : this._drawSingle;
    this._blending = toggle;
};

/**
 * Clone the animation
 * @return {object} A copy of the animation
 */
Animation.prototype.clone = function()
{
    var newAnimation = new Animation();
    jQuery.extend(newAnimation, this);
    newAnimation.sprite = 0;

    // clone object properties
    newAnimation._numCells = {x: this._numCells.x, y: this._numCells.y};
    newAnimation._offset = {x: this._offset.x, y: this._offset.y};
    newAnimation._frameSize = {x: this._frameSize.x, y: this._frameSize.y};
    newAnimation._frameCenter = {x: this._frameCenter.x, y: this._frameCenter.y};

    // clone float32 arrays where supported
    if (window.Float32Array)
    {
        newAnimation._f32AnimFrameInfo = this._f32AnimFrameInfo? new Float32Array([this._f32AnimFrameInfo[0], this._f32AnimFrameInfo[1], this._f32AnimFrameInfo[2], this._f32AnimFrameInfo[3]]) : new Float32Array([0,0,1,1]);
        newAnimation._f32PositionAndSize = this._f32PositionAndSize? new Float32Array([this._f32PositionAndSize[0], this._f32PositionAndSize[1], this._f32PositionAndSize[2], this._f32PositionAndSize[3]]) : new Float32Array([0,0,1,1]);
        newAnimation._f32RotationAlpha = this._f32RotationAlpha? new Float32Array([this._f32RotationAlpha[0], this._f32RotationAlpha[1]]) : new Float32Array([0,0]);
    }
    return newAnimation;
};

/**
 * Export this animation to an object that can then be used to create a new animation like this one (by passing the resulting object to the Animation constructor).
 * @param {boolean} [stringify] Whether the resulting object should be serialized to JSON. If this is set to true, this function returns a string representation of the animation.
 * @param {Array} [propertiesToExclude] An array of strings that contains the name of the properties of this Animation object that you do NOT want to export.
 * @returns {object|string} An object that represents the current animation
 */
Animation.prototype.serialize = function(stringify, propertiesToExclude)
{
    var result =
    {
        type: 'Animation',
        name: this.name,
        startFrame: this._startFrame,
        endFrame: this._endFrame,
        numCells: {x: this._numCells.x, y: this._numCells.y},
        image: this._imageName,
        speed: this._speed,
        looping: this._looping,
        blending: this._blending,
        playMode: this._playMode,
        autoResize: this._autoResize,
        offset: {x: this._offset.x, y: this._offset.y},
        stopped: this._stopped,
        properties: {}
    };
    var exclude = ['name', 'sprite', 'isDefault'];
    propertiesToExclude && (exclude = exclude.concat(propertiesToExclude));
    for (var key in this)
    {
        if (this.hasOwnProperty(key))
        {
            if (key[0] != '_' && exclude.indexOf(key) == -1)
            {
                try
                {
                    var j = JSON.stringify(this[key]);
                    result.properties[key] = JSON.parse(j);
                }
                catch (e) {}
            }
        }
    }
    return (stringify? JSON.stringify(result) : result);
};

/**
 * Set the current animation frame
 * @param {number} frameNumber
 */
Animation.prototype.setFrameNumber = function(frameNumber)
{
    if (frameNumber != this._currentFrame)
    {
        this._currentFrame = frameNumber;
        this._updateFrameCenter();
		this.sprite && this.sprite.setDirtyArea();
    }
};

/**
 * Get the current frame number
 * @returns {number} the current animation frame
 */
Animation.prototype.getFrameNumber = function()
{
    return this._currentFrame;
};

/**
 * Get the number of frames in the animation
 */
Animation.prototype.getFrameCount = function()
{
    return this._endFrame - this._startFrame + 1;
};

/**
 * Set an offset for this animation. The parent sprite will be moved by this offset when this animation is playing
 * @param offset
 */
Animation.prototype.setOffset = function(offset)
{
    this._offset.x = offset.x;
    this._offset.y = offset.y;
    this.sprite && this.sprite.updateBoundingBox();
};

/**
 * Get the world-space offset of this animation relative to its parent sprite
 * @returns {{x: number, y: number}}
 */
Animation.prototype.getOffset = function()
{
    return {x: this._offset.x, y: this._offset.y};
};

// Undocumented (i.e. non-exposed) functions:

Animation.prototype.getOffset_ref = function()
{
    return this._offset;
};

Animation.prototype.refreshImage = function()
{
    this._image = wade.getImage(this._imageName);
    this._frameSize = {x: this._image.width / this._numCells.x, y: this._image.height / this._numCells.y};
    if (this._f32AnimFrameInfo)
    {
        this._f32AnimFrameInfo[2] = 1 / this._numCells.x;
        this._f32AnimFrameInfo[3] = 1 / this._numCells.y;
    }
    this._updateFrameCenter();
    if (this._autoResize && this.sprite)
    {
        var scaleFactor = this.sprite.getScaleFactor();
        this.sprite.setSize(this._frameSize.x * scaleFactor.x, this._frameSize.y * scaleFactor.y);
    }
};

Animation.prototype._drawSingle = function(context, position, size)
{
    wade.numDrawCalls++;
    context.drawImage(this._image, this._frameCenter.x, this._frameCenter.y, this._frameSize.x, this._frameSize.y, position.x - size.x / 2 + this._offset.x, position.y - size.y / 2 + this._offset.y, size.x, size.y);
};

Animation.prototype._drawBlended = function(context, position, size)
{
    var otherFrame = (this._frameFraction > 0)? this._currentFrame + this._direction : this._currentFrame - this._direction;
    if (otherFrame < this._startFrame)
    {
        if (this._playMode == 'ping-pong' || !this._looping)
        {
            this._drawSingle(context, position, size);
            return;
        }
        otherFrame = this._endFrame;
    }
    else if (otherFrame > this._endFrame)
    {
        if (this._playMode == 'ping-pong' || !this._looping)
        {
            this._drawSingle(context, position, size);
            return;
        }
        otherFrame = this._startFrame;
    }
    var otherCenter = {x: (otherFrame % this._numCells.x) * this._frameSize.x, y: Math.floor(otherFrame / this._numCells.x) * this._frameSize.y};
    wade.numDrawCalls += 2;
    var alpha = context.globalAlpha;
    var globalCompositeOperation = context.globalCompositeOperation;
    context.globalAlpha = alpha * (1 - this._frameFraction);
    var destX = position.x - size.x / 2 + this._offset.x;
    var destY = position.y - size.y / 2 + this._offset.y;
    context.drawImage(this._image, this._frameCenter.x, this._frameCenter.y, this._frameSize.x, this._frameSize.y, destX, destY, size.x, size.y);
    context.globalCompositeOperation = 'lighter';
    context.globalAlpha = alpha * this._frameFraction;
    context.drawImage(this._image, otherCenter.x, otherCenter.y, this._frameSize.x, this._frameSize.y, destX, destY, size.x, size.y);

    context.globalAlpha = alpha;
    context.globalCompositeOperation = globalCompositeOperation;
    this.sprite && this.sprite.isVisible() && this.sprite.getSceneObject() && this.sprite.getSceneObject().isInScene() && this.sprite.setDirtyArea();
};

Animation.prototype.draw = Animation.prototype._drawSingle;

Animation.prototype.draw_gl = function(context, positionAndSize, rotationAlpha)
{
    if (!context.isWebGl)
    {
        this.draw(context, {x: positionAndSize[0], y: positionAndSize[1]}, {x: positionAndSize[2], y: positionAndSize[3]});
        return;
    }

    wade.numDrawCalls++;
    context.uniform4fv(context.uniforms['uPositionAndSize'], positionAndSize);
    context.uniform4fv(context.uniforms['uAnimFrameInfo'], this._f32AnimFrameInfo);
    context.uniform2fv(context.uniforms['uRotationAlpha'], rotationAlpha);
    context.setTextureImage(this._image);
    context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
};

Animation.prototype._updateFrameCenter = function()
{
    var x = (this._currentFrame % this._numCells.x);
    var y = Math.floor(this._currentFrame / this._numCells.x);
    this._frameCenter.x = x * this._frameSize.x;
    this._frameCenter.y = y * this._frameSize.y;
    if (this._f32AnimFrameInfo)
    {
        this._f32AnimFrameInfo[0] = x / this._numCells.x;
        this._f32AnimFrameInfo[1] = y / this._numCells.y;
    }
};

Animation.prototype.mirror = function()
{
    this._f32AnimFrameInfo[2] *= -1;
};

Animation.prototype.flip = function()
{
    this._f32AnimFrameInfo[3] *= -1;
};

    return Animation;
});
