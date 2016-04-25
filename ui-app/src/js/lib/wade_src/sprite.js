/**
 * A Sprite object is used to display images. It may have references to Animation objects if the image to display is supposed to be animating.
 * @param {string|object} [image] The file name of an image that has previously been loaded. If falsy, a blank (white) image will be used. You can also use this constructor by passing in a single object (so just the first parameter) that contains all the sprite properties that you want to set (see remarks below for more details).
 * @param {number} [layerId = wade.defaultLayer] The id of the layer that will contain the sprite
 * <br/><br/><b>Remarks:</b><br/> You can also use this constructor by passing in a single object (so just the first parameter) that contains all the sprite properties that you want to set. In this case, the object structure is as follows (all fields are optional): <br/><pre>
 {
    type: 'Sprite',
    sortPoint: {x: number, y: number},
    layer: number,
    name: string,
    size: {x: number, y: number},
    autoResize: boolean,
    visible: boolean,
    image: string,
    animations: {},
    currentAnimation: string,
    properties: {}
 }
 </pre>
 Where properties is a set of properties to copy into the new sprite object. Note that properties are deep-copied, and cannot contain functions or cyclical references.<br/>
 The animations object can contain any number of animations, each associated with a unique name. See the Animation documentation for more details.
 * @constructor
 */

 define(function(require) {
    var Animation = require('lib/wade_src/animation');
function Sprite(image, layerId)
{
    // set up a default animation
    this._animations = {};
    this._currentAnimation = 'default';
    var animation = new Animation(image);
    animation.sprite = this;
    animation.name = this._currentAnimation;
    animation.isDefault = true;
    this._animations[this._currentAnimation] = animation;
    this._numAnimations = 1;
    this._scaleFactor = {x: 1, y: 1};
    this._name = '';
    this._drawModifiers = [];
    this.draw = this.drawStatic;
    this.draw_gl = this.drawStatic_gl;

    // if the first parameter that was passed to this constructor is an object, use the properties of that object to set up the sprite
    var imageName;
    var objectStyleConstructor = typeof(image) == 'object' && image;
    if (objectStyleConstructor)
    {
        // use an object-style constructor
        var c = image;
        this._sortPoint = c.sortPoint || {x:0, y:0};
        this._layer = wade.getLayer(c.layer || wade.defaultLayer);
        var frameSize = this._animations[this._currentAnimation].getFrameSize();
        this._size = c.size? {x: c.size.x, y: c.size.y} : frameSize;
        this._sizeWasSet = !c.autoResize;
        this._name = c.name || '';
        this._staticImageName = c.image;
        this._visible = typeof(c.visible) == 'undefined'? true : c.visible;
        imageName = c.image;
        if (c.animations)
        {
            for (var anim in c.animations)
            {
                if (c.animations.hasOwnProperty(anim))
                {
                    this.addAnimation(new Animation(c.animations[anim]), true);
                }
            }
        }
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
        // use a function-style constructor
        this._staticImageName = image;
        this._sortPoint = {x: 0, y: 0};
        this._layer = wade.getLayer(layerId? layerId : wade.defaultLayer);
        this._size = this._animations[this._currentAnimation].getImageSize();
        this._sizeWasSet = false;
        this._visible = true;
        imageName = image;
    }

    this._sceneObject = null;
    this._position = {x: 0, y: 0};
    this._cornerX = 0;
    this._cornerY = 0;
    this._rotation = 0;
	if (window.Float32Array)
	{
		this._f32PositionAndSize = new Float32Array([0,0,0,0]);
        this._f32AnimFrameInfo = new Float32Array([0,0,1,1]);
		this._f32RotationAlpha = new Float32Array([0,0]);
	}
    this.orientedBoundingBox = {};
    this.boundingBox = {};
    this.updateBoundingBox();
    this.setActiveImage(wade.getFullPathAndFileName(imageName));
    if (objectStyleConstructor && c.drawModifiers)
    {
        this.setDrawModifiers(c.drawModifiers);
    }
    if (objectStyleConstructor && image.currentAnimation && image.animations && image.animations[image.currentAnimation] && !image.animations[image.currentAnimation].stopped)
    {
        this.playAnimation(image.currentAnimation, image.animations[image.currentAnimation].playMode);
    }
}

/**
 * Set the world space position of the sprite.
 * @param {number|Object} positionX A coordinate for the horizontal axis, or an object with 'x' and 'y' fields representing world space coordinates
 * @param {number} [positionY] A coordinate for the vertical axis
 */
Sprite.prototype.setPosition = function(positionX, positionY)
{
    // it may be easier sometimes to pass in a single parameter (as a vector that contains x and y)
    var posX;
    var posY;
    if (typeof(positionX) == 'object')
    {
        posX = positionX.x;
        posY = positionX.y;
    }
    else
    {
        posX = positionX;
        posY = positionY;
    }

    // mark the area that this sprite was occupying as dirty
    this.setDirtyArea();

    // store the new position
    this._position.x = posX;
    this._position.y = posY;

    // update the bounding box
    this.updateBoundingBox();

    // store corners
    this._cornerX = posX - this._size.x / 2;
    this._cornerY = posY - this._size.y / 2;

    // mark the area that this sprite is now occupying as dirty
    this.setDirtyArea();
};

/**
 * Get the world space position of the sprite
 * @return {Object} An object with 'x' and 'y' field representing world space coordinates
 */
Sprite.prototype.getPosition = function()
{
    return {x: this._position.x, y: this._position.y};
};

/**
 * Set a rotation angle for the sprite
 * @param {number} rotation The rotation angle in radians. A positive value indicates a clockwise rotation
 */
Sprite.prototype.setRotation = function(rotation)
{
    if (rotation != this._rotation)
    {
        this.setDirtyArea();
        this._rotation = rotation;
        // update bounding boxes
        this.updateOrientedBoundingBox();
        this.updateBoundingBox();
        this.setDirtyArea();
    }
};

/**
 * Get the current rotation angle of the sprite
 * @returns {number} The current rotation angle in radians. A positive value indicates a clockwise rotation
 */
Sprite.prototype.getRotation = function()
{
    return this._rotation;
};

/**
 * Set the world space size of the sprite
 * @param {number} width The desired width of the sprite
 * @param {number} height The desired height of the sprite
 */
Sprite.prototype.setSize = function(width, height)
{
    this._sizeWasSet = true;
    if (width != this._size.x || height != this._size.y)
    {
        this.setDirtyArea();
        this._size = {x: width, y: height};
        var animation = this._animations[this._currentAnimation];
        if (animation.getRelativeImageName())
        {
            var frameSize = animation.getFrameSize();
            this._scaleFactor.x = this._size.x / frameSize.x;
            this._scaleFactor.y = this._size.y / frameSize.y;
        }
        else
        {
            this._scaleFactor.x = this._scaleFactor.y = 1;
        }
        this._cornerX = this._position.x - width / 2;
        this._cornerY = this._position.y - height / 2;
        // update the bounding boxes
        this._rotation && this.updateOrientedBoundingBox();
        this.updateBoundingBox();
        this.setDirtyArea();
    }
};

/**
 * Get the world space size of the sprite
 * @return {Object} An object with 'x' and 'y' fields representing the world space size of the sprite
 */
Sprite.prototype.getSize = function()
{
    return {x: this._size.x, y: this._size.y};
};

/**
 * Set a sort point for the sprite. This will be used in the calculations to determine whether the sprite should appear in front of other sprites in the same layer, according to the layer's sorting mode.
 * @param {number} x The offset on the X axis
 * @param {number} y The offset on the Y axis
 */
Sprite.prototype.setSortPoint = function(x, y)
{
    this._sortPoint.x = x;
    this._sortPoint.y = y;
};

/**
 * Get the sprite's sort point that is used in the calculations to determine whether the sprite should appear in front of other sprites in the same layer, according to the layer's sorting mode.
 * @return {Object} An object with 'x' and 'y' fields representing the sprite's sort point
 */
Sprite.prototype.getSortPoint = function()
{
    return {x: this._sortPoint.x, y: this._sortPoint.y};
};

/**
 * Add an animation to the sprite. If, after this operation, there is only one animation for this sprite, it will be played automatically
 * @param {string} [name] The animation name. This can be omitted, in which case the 'name' parameter of the Animation object will be used.
 * @param {Animation} animation The animation object
 * @param {boolean} [dontPlay] Don't play the animation automatically, even if no other animations are present
 */
Sprite.prototype.addAnimation = function(name, animation, dontPlay)
{
    // check if the name parameter was omitted
    if (typeof(name) != 'string' && (name instanceof Animation))
    {
        dontPlay = animation;
        animation = name;
        name = '';
    }

    // get a valid name for this animation
    name = name || animation.name;
    if (!name)
    {
        wade.unnamedAnimationCount = (wade.unnamedAnimationCount + 1) || 1;
        name = '__wade_unnamed_anim_' + wade.unnamedAnimationCount;
    }

    var firstAnimation = this._numAnimations == 1 && !this._animations[this._currentAnimation].getImageName();
    var setSize = (!dontPlay && !this._sizeWasSet && firstAnimation);
    if (firstAnimation && !dontPlay)
    {
        delete (this._animations[this._currentAnimation]);
        this._numAnimations = 0;
    }

    if (!this._animations[name])
    {
        this._numAnimations++;
    }

    this._animations[name] = animation;
    animation.name = name;
    animation.sprite = this;
    if (this._numAnimations == 1 && !dontPlay)
    {
        this.playAnimation(name);

        if (setSize && wade.getLoadingStatus(animation.getImageName()) == 'ok')
        {
            var size = animation.getFrameSize();
            this.setSize(size.x, size.y);
        }

        // update the bounding box (size may have changed)
        this.updateBoundingBox();
    }
    if (this.draw == this.drawStatic)
    {
        this.draw = this.drawAnimated;
        this.draw_gl = this.drawAnimated_gl;
    }
};

/**
 * Get the animation object associated with a given animation name
 * @param {string} [name] The name of the animation. If omitted, the current animation will be returned.
 * @returns {Animation} The animation object
 */
Sprite.prototype.getAnimation = function(name)
{
    return this._animations[name || this._currentAnimation];
};

/**
 * Play an animation for this sprite
 * @param {string} name The name of an animation that has previously been added with a call to 'addAnimation'
 * @param {string} [direction] The direction of the animation. It can be 'forward', 'reverse' or 'ping-pong' (which means forward and then reverse). Default is 'forward'
 */
Sprite.prototype.playAnimation = function(name, direction)
{
    var anim = this._animations[name];
    if (anim)
    {
        if (name != this._currentAnimation)
        {
            this.setDirtyArea();
        }
        this._currentAnimation = name;
        anim.play(direction);
        var frameSize = anim.getFrameSize();
        this._scaleFactor.x = this._size.x / frameSize.x;
        this._scaleFactor.y = this._size.y / frameSize.y;
        this.setActiveImage(anim.getImageName());
        this.updateBoundingBox();
    }
};

/**
 * Get the current scale factor of the sprite, that is its size compared to the source image (or animation frame) size
 * @returns {{x: number, y: number}}
 */
Sprite.prototype.getScaleFactor = function()
{
    return {x: this._scaleFactor.x, y: this._scaleFactor.y};
};

/**
 * Perform a simulation step for the sprite. This involves updating the sprite's animation, if there is one that is currently playing.<br/>
 * This function is called automatically by WADE, that aims to maintain a constant calling rate where possible (60Hz by default).
 */
Sprite.prototype.step = function()
{
    var animation = this._animations[this._currentAnimation];
    if (animation)
    {
        if (animation.isPlaying())
        {
            animation.step();
        }
    }
};

/**
 * Set the parent scene object for the sprite. If there is an animation playing, this operation may trigger an 'onAnimationEnd' event for the old parent and an 'onAnimationStart' event for the new parent.
 * @param {SceneObject} sceneObject The new parent scene object
 */
Sprite.prototype.setSceneObject = function(sceneObject)
{
    if (sceneObject != this._sceneObject)
    {
        // if we have an animation playing, send an event to the parent scene object so it knows about it
        var anim = this._animations[this._currentAnimation];
        if (anim && anim.isPlaying())
        {
            if (sceneObject)
            {
                sceneObject.processEvent('onAnimationStart', this._currentAnimation);
            }
            if (this._sceneObject)
            {
                this._sceneObject.processEvent('onAnimationEnd', this._currentAnimation);
            }
        }

        // store a reference to the parent scene object
        this._sceneObject = sceneObject;
    }
};

/**
 * Get the parent scene object for this sprite (if any)
 * @returns {SceneObject} The parent scene object
 */
Sprite.prototype.getSceneObject = function()
{
    return this._sceneObject;
};

/**
 * Get the screen space position and extents for this sprite
 * @return {Object} An object with the following layout: {extents: {x, y}, position {x,y}}
 */
Sprite.prototype.getScreenPositionAndExtents = function()
{
    var screenSize = this._layer.worldDirectionToScreen(this.getSize());
    var screenPosition = this._layer.worldPositionToScreen(this._position);
    return {extents: {x: screenSize.x / 2, y: screenSize.y / 2}, position: screenPosition};
};

/**
 * Check whether the sprite contains a given screen space point
 * @param {Object} point An object with 'x' and 'y' fields representing the screen space point to test
 * @return {boolean} Whether the sprite contains the point
 */
Sprite.prototype.containsScreenPoint = function(point)
{
    if (!this._rotation)
    {
        var screenData = this.getScreenPositionAndExtents();
        var screenBoundingBox =    {minX: screenData.position.x - screenData.extents.x,
            minY: screenData.position.y - screenData.extents.y,
            maxX: screenData.position.x + screenData.extents.x,
            maxY: screenData.position.y + screenData.extents.y};
        return (point.x >= screenBoundingBox.minX && point.x <= screenBoundingBox.maxX && point.y >= screenBoundingBox.minY && point.y <= screenBoundingBox.maxY);
    }
    else
    {
        var worldPoint = wade.screenPositionToWorld(this._layer.id, point);
        return wade.orientedBoxContainsPoint(this.orientedBoundingBox, worldPoint);
    }
};

/**
 * Convert a screen space position into a world space offset relative to the sprite's world space position
 * @param {Object} screenPosition An object with 'x' and 'y' fields representing the screen space position
 * @return {Object} An object with 'x' and 'y' fields representing the world space offset
 */
Sprite.prototype.getWorldOffset = function(screenPosition)
{
    var worldPosition = this._layer.screenPositionToWorld(screenPosition);
    return {x: worldPosition.x - this._position.x,
            y: worldPosition.y - this._position.y};
};

/**
 * Mark the area occupied by the sprite as dirty. Depending on the sprite's layer's properties, this operation may cause this and some other sprites to be redrawn for the next frame
 */
Sprite.prototype.setDirtyArea = function()
{
    this._layer.isUsingQuadtree() && this._layer.addDirtyArea(this.boundingBox);
};

/**
 * Show or hide a sprite
 * @param {boolean} toggle Whether to show the sprite
 */
Sprite.prototype.setVisible = function(toggle)
{
    if (toggle != this._visible)
    {
        this._visible = toggle;
        this.setDirtyArea();
    }
};

/**
 * Check whether the sprite is visible
 * @return {boolean} Whether the sprite is visible
 */
Sprite.prototype.isVisible = function()
{
    return this._visible;
};

/**
 * Set an image to use with the current sprite
 * @param {string} image The file name of an image that has previously been loaded
 * @param {boolean} [updateSizeFromImage=false] Whether to update the sprite size based on the image size
 */
Sprite.prototype.setImageFile = function(image, updateSizeFromImage)
{
    this.setDirtyArea();
    this._animations[this._currentAnimation] = new Animation(image, 1, 1, 0);
    if (updateSizeFromImage || !this._sizeWasSet)
    {
        var frameSize = this._animations[this._currentAnimation].getFrameSize();
        this.setSize(frameSize.x, frameSize.y);
    }
    this._staticImageName = image;
    this.setActiveImage(wade.getFullPathAndFileName(image));
    this.setDirtyArea();
};

/**
 * Bring the sprite to the front of its layer. Note that if any sorting function (other than 'none') has been specified for the layer, when the sorting occurs it will override this operation
 */
Sprite.prototype.bringToFront = function()
{
    if (!this._sceneObject || !this._sceneObject.isInScene())
    {
        wade.log('Cannot change the order of sprites before they are added to the scene');
        return;
    }

    this._layer.bringSpriteToFront(this);
};

/**
 * Send the sprite to the back of its layer. Note that if any sorting function (other than 'none') has been specified for the layer, when the sorting occurs it will override this operation
 */
Sprite.prototype.pushToBack = function()
{
    if (!this._sceneObject || !this._sceneObject.isInScene())
    {
        wade.log('Cannot change the order of sprites before they are added to the scene');
        return;
    }
    this._layer.pushSpriteToBack(this);
};

/**
 * Move the sprite behind another sprite in the same layer. Note that if any sorting function (other than 'none') has been specified for the layer, when the sorting occurs it will override this operation
 * @param {Sprite} otherSprite The sprite that should appear in front of this sprite
 */
Sprite.prototype.putBehindSprite = function(otherSprite)
{
    if (this._layer != otherSprite._layer)
    {
        wade.log('Cannot put a sprite behind another sprite that is on a different layer');
        return;
    }
    if (!this._sceneObject || !this._sceneObject.isInScene() || !otherSprite._sceneObject || !otherSprite._sceneObject.isInScene())
    {
        wade.log('Cannot change the order of sprites before they are added to the scene');
        return;
    }
    this._layer.putSpriteBehindSprite(this, otherSprite);
};

/**
 * Get the active animation object for the sprite
 * @return {Animation} The active animation object for the sprite
 */
Sprite.prototype.getCurrentAnimation = function()
{
    return this._animations[this._currentAnimation];
};

/**
 * Get the name of the active animation for the sprite
 * @return {Animation} The name of the active animation for the sprite
 */
Sprite.prototype.getCurrentAnimationName = function()
{
    return this._currentAnimation;
};

/**
 * Check whether the sprite has an animation that matches the given name
 * @param {string} name The animation name
 * @return {boolean} Whether the sprite has an animation that matches the given name
 */
Sprite.prototype.hasAnimation = function(name)
{
    return (this._animations[name]? true : false);
};

/**
 * Set a custom draw function for the sprite
 * @param {Function} drawFunction The draw function to use for this sprite. Draw function are passed one parameter, which is the current HTML5 context object. Note that the it is assumed that the draw function will never draw anything outside the bounding box the sprite. Doing so may result in incorrect behavior.
 */
Sprite.prototype.setDrawFunction = function(drawFunction)
{
    this.draw = this.draw_gl = drawFunction;
    this.setDirtyArea();
};

/**
 * Get the current draw function of the sprite
 * @returns {Function} The current draw function. Depending on the sprite's layer's render mode, this could be either a WebGL or a canvas-based draw function.
 */
Sprite.prototype.getDrawFunction = function()
{
    return (this.getLayer().getRenderMode() == 'webgl')? this.draw_gl : this.draw;
};

/**
 * Set draw modifiers for this sprite. This is a simpler (although less flexible) way of setting draw functions for sprites, for some common cases.
 * @param {Array} modifiers An array of modifiers. Each element is an object with a <i>type</i> field and (optionally) a set of parameters. Supported modifiers are:<ul>
 *     <li>{type: 'alpha', alpha: number}</li>
 *     <li>{type: 'blink', timeOn: number, timeOff: number}</li>
 *     <li>{type: 'fadeOpacity', start: number, end: number, time: number}</li>
 *     <li>{type: 'flip'}</li>
 *     <li>{type: 'mirror'}</li>
 */
Sprite.prototype.setDrawModifiers = function(modifiers)
{
    var defaultDraw = (this._layer.getRenderMode() == 'webgl')? Sprite.prototype.draw_gl : Sprite.prototype.draw;
    if (!modifiers)
    {
        this.setDrawFunction(defaultDraw)
    }
    else
    {
        this._drawModifiers.length = 0;
        for (var i=0; i<modifiers.length; i++)
        {
            var m = modifiers[i];
            this._drawModifiers.push(wade.cloneObject(m));
            switch (m.type)
            {
                case 'alpha':
                    if (m.alpha != 1)
                    {
                        this.setDrawFunction(wade.drawFunctions.alpha_(m.alpha, this.getDrawFunction()));
                    }
                    break;
                case 'fadeOpacity':
                    this.setDrawFunction(wade.drawFunctions.fadeOpacity_(m.start, m.end, m.time, this.getDrawFunction()));
                    break;
                case 'mirror':
                    this.setDrawFunction(wade.drawFunctions.mirror_(this.getDrawFunction()));
                    break;
                case 'flip':
                    this.setDrawFunction(wade.drawFunctions.flip_(this.getDrawFunction()));
                    break;
                case 'blink':
                    this.setDrawFunction(wade.drawFunctions.blink_(m.timeOn, m.timeOff, this.getDrawFunction()));
                    break;
            }
        }
    }
};

/**
 * Get the current modifiers that are applied to the sprite
 * @returns {Array} A list of active draw modifiers. See Sprite.setDrawModifiers for more details.
 */
Sprite.prototype.getDrawModifiers = function()
{
    return wade.cloneArray(this._drawModifiers);
};

/**
 * Test to see whether this sprite overlaps another sprite
 * @param {Sprite} otherSprite The other sprite to test
 * @return {boolean} Whether the two sprites are overlapping
 */
Sprite.prototype.overlapsSprite = function(otherSprite)
{
    var layer1 = this._layer.id;
    var layer2 = otherSprite.getLayer().id;
    if (layer1 == layer2)
    {
        return wade.boxIntersectsBox(this.boundingBox, otherSprite.boundingBox);
    }
    else
    {
        var box1 = wade.worldBoxToScreen(layer1, this.boundingBox);
        var box2 = wade.worldBoxToScreen(layer2, otherSprite.boundingBox);
        return wade.boxIntersectsBox(box1, box2);
    }
};

/**
 * Get the name of the image being used
 * @return {string} The name of the image being used
 */
Sprite.prototype.getImageName = function()
{
    return this._activeImage;
};

/**
 * Set a new layer for the sprite
 * @param {number} layerId The id of the new layer
 */
Sprite.prototype.setLayer = function(layerId)
{
    if (this._sceneObject && this._sceneObject.isInScene())
    {
        this._layer && this._layer.removeSprite(this);
        this._layer = wade.getLayer(layerId? layerId : 1);
        this._layer.addSprite(this);
    }
    else
    {
        this._layer = wade.getLayer(layerId? layerId : 1);
    }
};

/**
 * Draw a sprite to an image associated with a virtual path. Note that, technically, this creates an HTML canvas object rather than an HTML img object, to save memory and increase performance
 * @param {string} virtualPath The virtual path of the image - this  can later be used to retrieve the image via wade.getImage(virtualPath)
 * @param {boolean} [replace] Whether to replace the existing image at the virtual path (if it exists), or draw on top of it
 * @param {Object} [offset] An object with 'x' and 'y' fields representing the offset to use when drawing this sprite onto the image
 * @param {Object} [transform] An object with 6 parameters: 'horizontalScale', 'horizontalSkew', 'verticalSkew', 'verticalScale', 'horizontalTranslate', 'verticalTranslate'
 * @param {string} [compositeOperation] A string describing an HTML5 composite operation
 */
Sprite.prototype.drawToImage = function(virtualPath, replace, offset, transform, compositeOperation)
{
    var _offset = offset || {x: 0, y: 0};
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    if (replace || wade.getLoadingStatus(virtualPath) != 'ok')
    {
        canvas.width = this.boundingBox.maxX - this.boundingBox.minX + Math.abs(_offset.x);
        canvas.height = this.boundingBox.maxY - this.boundingBox.minY + Math.abs(_offset.y);
    }
    else
    {
        var original = wade.getImage(virtualPath);
        canvas.width = original.width;
        canvas.height = original.height;
        context.drawImage(original, 0, 0);
    }
    var pos = {x: this._position.x, y: this._position.y};
    this._position.x = _offset.x + canvas.width / (2 * ((transform && transform.horizontalScale)||1));
    this._position.y = _offset.y + canvas.height / (2 * ((transform && transform.verticalScale)||1));
    this._cornerX = this._position.x - this._size.x / 2;
    this._cornerY = this._position.y - this._size.y / 2;
    var previousCompositeOperation = context.globalCompositeOperation;
    if (compositeOperation)
    {
        context.globalCompositeOperation = compositeOperation;
    }
    if (transform)
    {
        context.save();
        context.setTransform(transform.horizontalScale, transform.horizontalSkew, transform.verticalSkew, transform.verticalScale, transform.horizontalTranslate, transform.verticalTranslate);
        this.draw(context);
        context.restore();
    }
    else
    {
        this.draw(context);
    }
    context.globalCompositeOperation = previousCompositeOperation;
    this._position = pos;
    this._cornerX = this._position.x - this._size.x / 2;
    this._cornerY = this._position.y - this._size.y / 2;
    wade.setImage(virtualPath, canvas);
};

/**
 * Stop the animation that is currently playing
 */
Sprite.prototype.stopAnimation = function()
{
    var anim = this._animations[this._currentAnimation];
    anim && anim.stop();
};

/**
 * Resume playing an animation that had been stopped
 */
Sprite.prototype.resumeAnimation = function()
{
    var anim = this._animations[this._currentAnimation];
    anim && anim.resume();
};

/**
 * Clone the sprite
 * @return {Sprite} A copy of the sprite
 */
Sprite.prototype.clone = function()
{
    // remove reference to the associated objects that don't need copying
    var newSprite = new Sprite(null, this._layer.id);
    jQuery.extend(newSprite, this);
    newSprite._sceneObject = 0;
    newSprite.quadTreeNode = 0;

    // clone animations
    if (this._animations) // checking if animations exist because TextSprite uses this method
    {
        newSprite._animations = {};
        for (var anim in this._animations)
        {
            if (this._animations.hasOwnProperty(anim))
            {
                newSprite._animations[anim] = this._animations[anim].clone();
                newSprite._animations[anim].sprite = newSprite;
            }
        }
    }

    // clone object properties
    newSprite._position = {x: this._position.x, y: this._position.y};
    newSprite._sortPoint = {x: this._sortPoint.x, y: this._sortPoint.y};
    newSprite._size = {x: this._size.x, y: this._size.y};
    newSprite._scaleFactor = {x: this._scaleFactor.x, y: this._scaleFactor.y};
    newSprite.boundingBox = jQuery.extend({}, this.boundingBox);
    newSprite.orientedBoundingBox = jQuery.extend({}, this.orientedBoundingBox);

    // clone float32 arrays where supported
    if (window.Float32Array)
    {
        newSprite._f32AnimFrameInfo = (this._f32AnimFrameInfo? new Float32Array([this._f32AnimFrameInfo[0], this._f32AnimFrameInfo[1], this._f32AnimFrameInfo[2], this._f32AnimFrameInfo[3]]) : new Float32Array([0,0,1,1]));
        newSprite._f32PositionAndSize = (this._f32PositionAndSize? new Float32Array([this._f32PositionAndSize[0], this._f32PositionAndSize[1], this._f32PositionAndSize[2], this._f32PositionAndSize[3]]) : new Float32Array([0,0,1,1]));
        newSprite._f32RotationAlpha = (this._f32RotationAlpha? new Float32Array([this._f32RotationAlpha[0], this._f32RotationAlpha[1]]) : new Float32Array([0,0]));
    }

    // update image users
    newSprite._activeImage && wade.addImageUser(newSprite._activeImage, newSprite);
    return newSprite;
};

/**
 * Export this sprite to an object that can then be used to create a new sprite like this one (by passing the resulting object to the Sprite constructor).
 * @param {boolean} [stringify] Whether the resulting object should be serialized to JSON. If this is set to true, this function returns a string representation of the sprite.
 * @param {Array} [propertiesToExclude] An array of strings that contains the name of the properties of this Sprite object that you do NOT want to export.
 * @returns {object|string} An object that represents the current sprite
 */
Sprite.prototype.serialize = function(stringify, propertiesToExclude)
{
    var result =
    {
        type: 'Sprite',
        animations: {},
        currentAnimation: this.getCurrentAnimationName(),
        sortPoint: {x: this._sortPoint.x, y: this._sortPoint.y},
        layer: this._layer.id,
        size: {x: this._size.x, y: this._size.y},
        autoResize: !this._sizeWasSet,
        visible: this._visible,
        image: this._staticImageName || '',
        name: this._name,
        drawModifiers: wade.cloneArray(this._drawModifiers),
        properties: {}
    };
    for (var anim in this._animations)
    {
        if (this._animations.hasOwnProperty(anim) && !this._animations[anim].isDefault)
        {
            result.animations[anim] = this._animations[anim].serialize();
        }
    }
    var exclude = ['sceneObject', 'boundingBox', 'orientedBoundingBox', 'id', 'needsDrawing'];
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
 * Set a name for the sprite
 * @param {string} name The name to set
 */
Sprite.prototype.setName = function(name)
{
    this._name = name;
};

/**
 * Get the current name of this sprite, if it was set with Sprite.setName()
 * @returns {string} The name of this object
 */
Sprite.prototype.getName = function()
{
    return this._name;
};

/**
 * Get an array of objects overlapping this sprite
 * @param {boolean} [searchAllLayers] Whether to extend the search to all layers. This is false by default, meaning that only overlapping sprites on the same layer will be considered.
 * @param {string} [precision] How accurately to search for overlaps. This can be either 'axis-aligned' (which would consider the axis-aligned bounding box of the sprites), or 'oriented', which takes into account the rotation of each sprite. Default is 'axis-aligned'
 * @returns {Array} All the objects that are overlapping this sprite
 */
Sprite.prototype.getOverlappingObjects = function(searchAllLayers, precision)
{
    var screenArea;
    precision = precision || 'axis-aligned';
    if (precision == 'axis-aligned')
    {
        var objects;
        if (searchAllLayers)
        {
            screenArea =  wade.worldBoxToScreen(this._layer.id, this.boundingBox);
            objects = wade.getObjectsInScreenArea(screenArea);
        }
        else
        {
            objects = wade.getObjectsInArea(this.boundingBox, this._layer.id);
        }
        this._sceneObject && wade.removeObjectFromArray(this._sceneObject, objects);
        return objects;
    }
    else    // check oriented bounding boxes
    {
        var a = [];                     // here we are going to store sprites that overlap the axis-aligned bounding box of this sprite
        var overlappingSprites = [];    // here we are going to store sprites that overlap the oriented bounding box of this sprite
        if (searchAllLayers)
        {
            screenArea = wade.worldBoxToScreen(this._layer.id, this.boundingBox);
            a = wade.getSpritesInScreenArea(screenArea);
        }
        else
        {
            a = wade.getSpritesInArea(this.boundingBox, this._layer.id);
        }
        var functionPrefix = this._rotation? 'orientedBox' : 'box';
        var testObject = this._rotation? this.orientedBoundingBox : this.boundingBox;
        for (var i=0; i < a.length; i++)
        {
            var sprite = a[i];
            if (sprite == this)
            {
                continue;
            }
            if (sprite.getRotation())
            {
                if (wade[functionPrefix + 'IntersectsOrientedBox'](testObject, sprite.orientedBoundingBox))
                {
                    overlappingSprites.push(sprite);
                    overlappingSprites.push(sprite);
                }
            }
            else
            {
                if (wade[functionPrefix + 'IntersectsBox'](testObject, sprite.boundingBox))
                {
                    overlappingSprites.push(sprite);
                }
            }
        }

        // now re-use the a array to store overlapping objects
        a.length = 0;
        for (var j=0; j<overlappingSprites.length; j++)
        {
            var obj = overlappingSprites[j].getSceneObject();
            (a.lastIndexOf(obj) == -1) && a.push(obj);
        }
        return a;
    }
};

/**
 * Get the id of the sprite's layer
 * @returns {number} The id of the sprite's layer
 */
Sprite.prototype.getLayerId = function()
{
    return this._layer.id;
};

/**
 * Draw this sprite to an off-screen canvas, then use this canvas as a source image whenever this sprite needs to be drawn again
 */
Sprite.prototype.cache = function()
{
    wade.spriteCacheCount = (wade.spriteCacheCount + 1) || 1;
    var virtualPath = '__wade_sprite_cache' + wade.spriteCacheCount;
    var rot = this._rotation;
    if (rot)
    {
        this._rotation = 0;
        this.updateOrientedBoundingBox();
        this.updateBoundingBox();
    }
    this.drawToImage(virtualPath, true);
    if (rot)
    {
        this._rotation = rot;
        this.updateOrientedBoundingBox();
        this.updateBoundingBox();
    }
    this.setImageFile(virtualPath, true);
    var anim = this._animations[this._currentAnimation];
    var isStatic = !(anim && anim.isPlaying());
    this.draw = isStatic? Sprite.prototype.drawStatic : Sprite.prototype.draw;
    this.draw_gl = isStatic? Sprite.prototype.drawStatic_gl : Sprite.prototype.draw_gl;
    this.setDirtyArea();
};

/**
 * Get the index of the sprite in its layer. For unsorted layers this matches the order in which the sprites were added to the layers, though for layers with sorting this may change every frame accoring to the sorting criterion.
 * @returns {number} The index of the sprite in its layer. This can be -1 if the sprite has not been added to the layer yet.
 */
Sprite.prototype.getIndexInLayer = function()
{
    return this._layer.getIndexOfSprite(this);
};

/**
 * Set the sprite's index in its layer.
 * @param {number} index The desired index of the sprite.
 * @returns {number} The actual index of the sprite after attempting this operation. If the layer has N sprites, and you try to set the index to a number greater than N-1, the sprite will be moved at index N-1 instead. If the sprite hasn't been added to the layer yet, this function will return -1.
 */
Sprite.prototype.setIndexInLayer = function(index)
{
    this.setDirtyArea();
    return this._layer.setIndexOfSprite(this, index);
};

Sprite.prototype.getLayer = function()
{
    return this._layer;
};

Sprite.prototype.onAnimationStart = function(animationName, restarting)
{
    if (this._sceneObject)
    {
        this._sceneObject.processEvent('onAnimationStart', {name: animationName, restarting: restarting});
    }
};

Sprite.prototype.onAnimationEnd = function(animationName)
{
    if (this._sceneObject)
    {
        this._sceneObject.processEvent('onAnimationEnd', {name: animationName});
    }
};

Sprite.prototype.updateBoundingBox = function()
{
    var offset = this._animations[this._currentAnimation].getOffset_ref();
    if (this._rotation)
    {
        this.boundingBox.minX = this._position.x - this.orientedBoundingBox.rx - wade.c_epsilon + offset.x;
        this.boundingBox.minY = this._position.y - this.orientedBoundingBox.ry - wade.c_epsilon + offset.y;
        this.boundingBox.maxX = this._position.x + this.orientedBoundingBox.rx + wade.c_epsilon + offset.x;
        this.boundingBox.maxY = this._position.y + this.orientedBoundingBox.ry + wade.c_epsilon + offset.y;
    }
    else
    {
        var extentsX = this._size.x / 2;
        var extentsY = this._size.y / 2;
        this.boundingBox.minX = this._position.x - extentsX - wade.c_epsilon + offset.x;
        this.boundingBox.minY = this._position.y - extentsY - wade.c_epsilon + offset.y;
        this.boundingBox.maxX = this._position.x + extentsX + wade.c_epsilon + offset.x;
        this.boundingBox.maxY = this._position.y + extentsY + wade.c_epsilon + offset.y;
    }
    this.orientedBoundingBox.centerX = this._position.x + offset.x;
    this.orientedBoundingBox.centerY = this._position.y + offset.y;
	
	// update the float32 array for webgl rendering
	if (this._f32PositionAndSize)
	{
		this._f32PositionAndSize[0] = this._position.x + offset.x;
		this._f32PositionAndSize[1] = this._position.y + offset.y;
		this._f32PositionAndSize[2] = this._size.x;
		this._f32PositionAndSize[3] = this._size.y;
	}

    // notify the sprite's layer about the position change
    this._sceneObject && this._sceneObject.isInScene() && this._layer.onSpritePositionChanged(this);
};

Sprite.prototype.updateOrientedBoundingBox = function()
{
    var extentsX = this._size.x / 2;
    var extentsY = this._size.y / 2;
    var cos = Math.cos(this._rotation);
    var sin = Math.sin(this._rotation);
    var xc = extentsX * cos;
    var xs = extentsX * sin;
    var ys = extentsY * sin;
    var yc = extentsY * cos;
    var rx0 = (xc + ys);
    var ry0 = (xs - yc);
    var rx1 = (xc - ys);
    var ry1 = (xs + yc);
    this.orientedBoundingBox.rx = Math.max(Math.abs(rx0), Math.abs(rx1));
    this.orientedBoundingBox.ry = Math.max(Math.abs(ry0), Math.abs(ry1));
    this.orientedBoundingBox.rx0 = rx0;
    this.orientedBoundingBox.ry0 = ry0;
    this.orientedBoundingBox.rx1 = rx1;
    this.orientedBoundingBox.ry1 = ry1;
    this.orientedBoundingBox.axisXx = xc;
    this.orientedBoundingBox.axisXy = xs;
    this.orientedBoundingBox.axisYx = -ys;
    this.orientedBoundingBox.axisYy = yc;
    this.orientedBoundingBox.rotation = this._rotation;
    this.orientedBoundingBox.halfWidth = extentsX;
    this.orientedBoundingBox.halfHeight = extentsY;
	
	// update the float32 array for webgl rendering
	if (this._f32RotationAlpha)
	{
		this._f32RotationAlpha[0] = this._rotation;
	}
};

Sprite.prototype.drawStatic = function(context)
{
    if (context.isWebGl)
    {
        this.drawStatic_gl(context);
        return;
    }
    if (this._visible)
    {
        wade.numDrawCalls++;
        if (this._rotation)
        {
            context.save();
            context.translate(this._position.x, this._position.y);
            context.rotate(this._rotation);
            context.translate(-this._position.x, -this._position.y);
        }
        context.drawImage(this._image, this._cornerX, this._cornerY, this._size.x, this._size.y);
        this._rotation && context.restore();
    }
};

Sprite.prototype.drawStatic_gl = function(context)
{
    if (!context.isWebGl)
    {
        this.drawStatic(context);
        return;
    }
	if (this._visible)
	{
		wade.numDrawCalls++;
		this._f32RotationAlpha[1] = context.globalAlpha;
        if (context.globalCompositeOperation == 'lighter')
        {
            context.blendFuncSeparate(context.SRC_ALPHA, context.ONE, context.SRC_ALPHA, context.ONE);
        }
		context.uniform4fv(context.uniforms['uPositionAndSize'], this._f32PositionAndSize);
        context.uniform4fv(context.uniforms['uAnimFrameInfo'], this._f32AnimFrameInfo);
        context.uniform2fv(context.uniforms['uRotationAlpha'], this._f32RotationAlpha);
        context.setTextureImage(this._image);
		context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
        if (context.globalCompositeOperation && context.globalCompositeOperation != 'sourceOver')
        {
            context.blendFuncSeparate(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA, context.ONE, context.ONE_MINUS_SRC_ALPHA);
        }
	}
    else
    {
        context.setTextureImage(this._image, true);
    }
};

Sprite.prototype.drawAnimated = function(context)
{
    if (context.isWebGl)
    {
        this.drawAnimated_gl(context);
        return;
    }
    if (this._visible)
    {
        var anim = this._animations[this._currentAnimation];
        if (anim)
        {
            if (this._rotation)
            {
                context.save();
                context.translate(this._position.x, this._position.y);
                context.rotate(this._rotation);
                context.translate(-this._position.x, -this._position.y);
            }
            anim.draw(context, this._position, this._size);
            this._rotation && context.restore();
        }
    }
};

Sprite.prototype.drawAnimated_gl = function(context)
{
    if (!context.isWebGl)
    {
        this.drawAnimated(context);
        return;
    }
    var anim = this._animations[this._currentAnimation];
    if (anim)
    {
        if (this._visible)
        {
            if (context.globalCompositeOperation == 'lighter')
            {
                context.blendFuncSeparate(context.SRC_ALPHA, context.ONE, context.SRC_ALPHA, context.ONE);
            }
            this._f32RotationAlpha[1] = context.globalAlpha;
            anim.draw_gl(context, this._f32PositionAndSize, this._f32RotationAlpha);
            if (context.globalCompositeOperation && context.globalCompositeOperation != 'sourceOver')
            {
                context.blendFuncSeparate(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA, context.ONE, context.ONE_MINUS_SRC_ALPHA);
            }
        }
        else
        {
            context.setTextureImage(wade.getImage(anim.getImageName()), true);
        }
    }
};

Sprite.prototype.draw = Sprite.prototype.drawAnimated;
Sprite.prototype.draw_gl = Sprite.prototype.drawAnimated_gl;

Sprite.prototype.setActiveImage = function(imageName)
{
    var oldImageName = this._activeImage;
    this._activeImage && (oldImageName != imageName) && wade.removeImageUser(this._activeImage, this);
    this._activeImage = imageName;
    this._image = wade.getImage(imageName, '');
    if (imageName)
    {
        (oldImageName != imageName) && wade.addImageUser(imageName, this);
        if (wade.getLoadingStatus(imageName) != 'ok')
        {
            wade.log('Loading ' + imageName);
            wade.preloadImage(imageName);
        }
        else
        {
            var updateAnimation = this._animations[this._currentAnimation].getImageName() == wade.getFullPathAndFileName(imageName);
            if (updateAnimation)
            {
                this._animations[this._currentAnimation].refreshImage();
            }
            if (!this._sizeWasSet)
            {
                if (updateAnimation)
                {
                    var size = this._animations[this._currentAnimation].getFrameSize();
                    this.setSize(size.x, size.y);
                }
                else
                {
                    this.setSize(this._image.width, this._image.height);
                }
            }
        }
    }
};


    return Sprite;
});