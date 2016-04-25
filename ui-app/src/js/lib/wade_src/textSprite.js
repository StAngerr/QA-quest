/**
 * A Text Sprite is used to display strings in a WADE app.
 * @param {string} [text] A string to diplay when the sprite is drawn. You can also use this constructor by passing in a single object (so just the first parameter) that contains all the TextSprite properties that you want to set (see remarks below for more details).
 * @param {string} [font='12px Arial'] An HTML font style description. For example '20px Verdana'.
 * @param {string} [color] An HTML color string. For example 'red', '#f00, '#ff0000', or 'rgba(255,0,0,0.5)'
 * @param {string} [alignment='left'] A string describing the alignment property for the text, relative to its pivot position. Valid values are 'left', 'right' and 'center'.
 * @param {number} [layerId = wade.defaultLayer] The id of the layer where the text sprite will be drawn
 * <br/><br/><b>Remarks:</b><br/> You can also use this constructor by passing in a single object (so just the first parameter) that contains all the TextSprite properties that you want to set. In this case, the object structure is as follows (all fields are optional): <br/><pre>
 {
    type: 'TextSprite',
    text: string,
    font: string,
    alignment: string,
    color: string,
    visible: boolean,
    layer: number,
    maxWidth: number,
    shadowColor: string,
    shadowBlur: number,
    shadowOffset: {x: number, y: number},
    lineSpacing: number,
    maxLines: number,
    outlineColor: string,
    outlineWidth: number,
    boundsScale: {x: number, y: number},
    sortPoint: {x: number, y: number},
    properties: {}
 }
 </pre>
 Where properties is a set of properties to copy into the new   TextSprite object. Note that properties are deep-copied, and cannot contain functions or cyclical references.
 * @constructor
 * @augments Sprite
 */

 define(function(require) {
     var Sprite = require('lib/wade_src/sprite');
function TextSprite(text, font, color, alignment, layerId)
{
    if (typeof(text) == 'object' && text)
    {
        var c = text;
        text = c.text;
        this._font = c.font || '12px Arial';
        this._alignment = c.alignment || 'left';
        this._color = c.color || '#000';
        this._visible = typeof(c.visible) != 'undefined'? c.visible : true;
        this._layer = wade.getLayer(c.layer || wade.defaultLayer);
        this._maxWidth = c.maxWidth || 0;
        this._shadowColor = c.shadowColor || '#000';
        this._shadowBlur = c.shadowBlur || 0;
        this._shadowOffset = {x: c.shadowOffset && c.shadowOffset.x, y: c.shadowOffset && c.shadowOffset.y};
        this._lineSpacing = c.lineSpacing || 1;
        this._maxLines = c.maxLines || 0;
        this._outlineColor = c.outlineColor || '#000';
        this._outlineWidth = c.outlineWidth || 0;
        this._boundsScale = {x: c.boundsScale && c.boundsScale.x, y: c.boundsScale && c.boundsScale.y};
        this._sortPoint = {x: c.sortPoint && c.sortPoint.x, y: c.sortPoint && c.sortPoint.y};
        this._fixedSize = typeof(c.fixedSize) == 'undefined'? false: c.fixedSize;
        this._name = c.name || '';
    }
    else
    {
        this._font = font || '12px Arial';
        this._alignment = alignment || 'left';
        this._color = color || '#000';
        this._visible = true;
        this._layer = wade.getLayer(layerId || wade.defaultLayer);
        this._maxWidth = 0;
        this._shadowColor = '#000';
        this._shadowBlur = 0;
        this._shadowOffset = {x:0, y: 0};
        this._lineSpacing = 1;
        this._maxLines = 0;
        this._outlineColor = '#000';
        this._outlineWidth = 0;
        this._boundsScale = {x: 1, y: 1};
        this._sortPoint = {x: 0, y: 0};
        this._fixedSize = false;
        this._name = '';
    }

    this._image = 0;
    this._cornerX = 0;
    this._cornerY = 0;
    this._sceneObject = 0;
    this._position = {x: 0, y: 0};
    this._centerOffset = {x: 0, y: 0};
    this._size = {x: 0, y: 0};
    this._numLines = 1;
    this._lines = [];
    this._lineHeight = 12;
    this._rotation = 0;
    this.orientedBoundingBox = {};
    this.boundingBox = {minX: 0, minY: 0, maxX: 0, maxY: 0};

    // float32 arrays for webgl rendering (if supported)
    if (window.Float32Array)
    {
        this._f32PositionAndSize = new Float32Array([0,0,0,0]);
        this._f32AnimFrameInfo = new Float32Array([0,0,1,1]);
        this._f32RotationAlpha = new Float32Array([0,0]);
    }

    this.setText(text || '');
}

TextSprite.prototype.setPosition = Sprite.prototype.setPosition;
TextSprite.prototype.getPosition = Sprite.prototype.getPosition;
TextSprite.prototype.setSortPoint = Sprite.prototype.setSortPoint;
TextSprite.prototype.getSortPoint = Sprite.prototype.getSortPoint;
TextSprite.prototype.getLayer = Sprite.prototype.getLayer;
TextSprite.prototype.getLayerId = Sprite.prototype.getLayerId;
TextSprite.prototype.getScreenBox = Sprite.prototype.getScreenBox;
TextSprite.prototype.containsScreenPoint = Sprite.prototype.containsScreenPoint;
TextSprite.prototype.getWorldOffset = Sprite.prototype.getWorldOffset;
TextSprite.prototype.updateOrientedBoundingBox = Sprite.prototype.updateOrientedBoundingBox;
TextSprite.prototype.setVisible = Sprite.prototype.setVisible;
TextSprite.prototype.isVisible = Sprite.prototype.isVisible;
TextSprite.prototype.bringToFront = Sprite.prototype.bringToFront;
TextSprite.prototype.pushToBack = Sprite.prototype.pushToBack;
TextSprite.prototype.putBehindSprite = Sprite.prototype.putBehindSprite;
TextSprite.prototype.setDrawFunction = Sprite.prototype.setDrawFunction;
TextSprite.prototype.getDrawFunction = Sprite.prototype.getDrawFunction;
TextSprite.prototype.overlapsSprite = Sprite.prototype.overlapsSprite;
TextSprite.prototype.getRotation = Sprite.prototype.getRotation;
TextSprite.prototype.setRotation = Sprite.prototype.setRotation;
TextSprite.prototype.getSceneObject = Sprite.prototype.getSceneObject;
TextSprite.prototype.getOverlappingObjects = Sprite.prototype.getOverlappingObjects;
TextSprite.prototype.setName = Sprite.prototype.setName;
TextSprite.prototype.getName = Sprite.prototype.getName;
TextSprite.prototype.getIndexInLayer = Sprite.prototype.getIndexInLayer;
TextSprite.prototype.setIndexInLayer = Sprite.prototype.setIndexInLayer;
TextSprite.prototype.setDrawModifiers = Sprite.prototype.setDrawModifiers;
TextSprite.prototype.getDrawModifiers = Sprite.prototype.getDrawModifiers;

TextSprite.prototype.setDirtyArea = function()
{
    Sprite.prototype.setDirtyArea.apply(this);
};

TextSprite.prototype.drawToImage = function(virtualPath, replace, offset, transform, compositeOperation)
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
    this._position.x = _offset.x + canvas.width / (2 * ((transform && transform.horizontalScale)||1)) - this._centerOffset.x;
    this._position.y = _offset.y + canvas.height / (2 * ((transform && transform.verticalScale)||1)) - this._centerOffset.y;
    this._cornerX = this._position.x - this._size.x / 2 + this._centerOffset.x;
    this._cornerY = this._position.y - this._size.y / 2 + this._centerOffset.y;
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
    this._cornerX = this._position.x - this._size.x / 2 + this._centerOffset.x;
    this._cornerY = this._position.y - this._size.y / 2 + this._centerOffset.y;
    wade.setImage(virtualPath, canvas);
};

TextSprite.prototype.cache = function()
{
    if (!this._cachedImageName)
    {
        wade.textSpriteCacheCount = (wade.textSpriteCacheCount + 1) || 1;
        this._cachedImageName = '__wade_TextSprite_cache_' + wade.textSpriteCacheCount;
    }
    var rot = this._rotation;
    if (rot)
    {
        this._rotation = 0;
        this.updateOrientedBoundingBox();
        this.updateBoundingBox();
    }
    this.drawToImage(this._cachedImageName, true);
    if (rot)
    {
        this._rotation = rot;
        this.updateOrientedBoundingBox();
        this.updateBoundingBox();
    }
    this._image = wade.getImage(this._cachedImageName);

    // we don't want WADE to store a reference to the cached image (it would likely cause a memory leak)
    wade.releaseImageReference(this._cachedImageName);
};

TextSprite.prototype.getImageName= function()
{
    return this._cachedImageName || '__wade_TextSprite_no_image';
};

TextSprite.prototype.setActiveImage = function() {};

TextSprite.prototype.getScreenPositionAndExtents = function()
{
    var size = {x: (this.boundingBox.maxX - this.boundingBox.minX), y: (this.boundingBox.maxY - this.boundingBox.minY)};
    var position = {x: (this.boundingBox.maxX + this.boundingBox.minX) / 2, y: (this.boundingBox.maxY + this.boundingBox.minY) / 2};
    var screenSize = this._layer.worldDirectionToScreen(size);
    var screenPosition = this._layer.worldPositionToScreen(position);
    return {extents: {x: screenSize.x / 2, y: screenSize.y / 2}, position: screenPosition};
};

TextSprite.prototype.updateBoundingBox = function()
{
    if (this._rotation)
    {
        this.boundingBox.minX = this._position.x - this.orientedBoundingBox.rx - wade.c_epsilon + this._centerOffset.x;
        this.boundingBox.minY = this._position.y - this.orientedBoundingBox.ry - wade.c_epsilon + this._centerOffset.y;
        this.boundingBox.maxX = this._position.x + this.orientedBoundingBox.rx + wade.c_epsilon + this._centerOffset.x;
        this.boundingBox.maxY = this._position.y + this.orientedBoundingBox.ry + wade.c_epsilon + this._centerOffset.y;
    }
    else
    {
        var extentsX = this._size.x / 2;
        var extentsY = this._size.y / 2;
        this.boundingBox.minX = this._position.x - extentsX - wade.c_epsilon + this._centerOffset.x;
        this.boundingBox.minY = this._position.y - extentsY - wade.c_epsilon + this._centerOffset.y;
        this.boundingBox.maxX = this._position.x + extentsX + wade.c_epsilon + this._centerOffset.x;
        this.boundingBox.maxY = this._position.y + extentsY + wade.c_epsilon + this._centerOffset.y;
    }
    this.orientedBoundingBox.centerX = this._position.x + this._centerOffset.x;
    this.orientedBoundingBox.centerY = this._position.y + this._centerOffset.y;

    // update the float32 array for webgl rendering
    if (this._f32PositionAndSize)
    {
        this._f32PositionAndSize[0] = this.orientedBoundingBox.centerX;
        this._f32PositionAndSize[1] = this.orientedBoundingBox.centerY;
        this._f32PositionAndSize[2] = this._size.x;
        this._f32PositionAndSize[3] = this._size.y;
    }

    // notify the sprite's layer about the position change
    this._sceneObject && this._sceneObject.isInScene() && this._layer.onSpritePositionChanged(this);
};

/**
 * Set the text for the sprite
 * @param {string} text A string to display when the sprite is drawn
 */
TextSprite.prototype.setText = function(text)
{
    this.setDirtyArea();
    this._text = text.toString();
    if (!this._fixedSize)
    {
        this._updateSize();
        this.setDirtyArea();
    }
    this._image = 0;
};

/**
 * Get the text currently associated with the sprite
 * @return {string} The text currently associated with the sprite
 */
TextSprite.prototype.getText = function()
{
    return this._text;
};

/**
 * The maximum width of a line of text. If, according to the current font style, the text to display is longer than the specified width, it will be displayed on multiple lines.
 * @param {number} maxWidth The maximum width of the text, in pixels
 */
TextSprite.prototype.setMaxWidth = function(maxWidth)
{
    this._maxWidth = maxWidth;
    !this._fixedSize && this._updateSize();
    this._image = 0;
};

/**
 * Set the maximum number of lines that the text is allowed to contain. Any text that doesn't fit in that number of lines will not be drawn.
 * @param {number} maxLines The maximum number of lines. A value of 0 (or falsy) indicates that there is no limit to the number of lines
 */
TextSprite.prototype.setMaxLines = function(maxLines)
{
    if (this._maxLines != maxLines)
    {
        this._maxLines = maxLines;
        if (this._maxLines)
        {
            this._numLines = Math.min(this._numLines, this._maxLines);
        }
        !this._fixedSize && this._updateSize();
        this._image = 0;
    }
};

/**
 * Set the text color.
 * @param {string} color An HTML color string. For example 'red', '#f00, '#ff0000', or 'rgba(255,0,0,0.5)'
 */
TextSprite.prototype.setColor = function(color)
{
    this._color = color;
    this.setDirtyArea();
    this._image = 0;
};

/**
 * Set a shadow to draw around the text sprite
 * @param {string} color An HTML color string
 * @param {number} blur The amount of blur, in pixels
 * @param {number} offsetX The offset of the shadow along the horizontal axis, in pixels
 * @param {number} offsetY The offset of the shadow along the vertical axis, in pixels
 */
TextSprite.prototype.setShadow = function(color, blur, offsetX, offsetY)
{
    this._shadowColor = color;
    this._shadowBlur = blur;
    this._shadowOffset = {x: (offsetX? offsetX : 0), y: (offsetY? offsetY: 0)};
    this.setDirtyArea();
    if (!this._fixedSize)
    {
        this._updateSize();
        this.setDirtyArea();
    }
    this._image = 0;
};

/**
 * Set a font style for the text sprite.
 * @param {string} font A string describing an HTML font style. For example, '20px Verdana'
 */
TextSprite.prototype.setFont = function(font)
{
    this._font = font;
    this.setDirtyArea();
    if (!this._fixedSize)
    {
        this._updateSize();
        this.setDirtyArea();
    }
    this._image = 0;
};

/**
 * Set the space between lines of text
 * @param {number} lineSpacing The spacing to use between lines, as a fraction of the font size. The default value is 1.
 */
TextSprite.prototype.setLineSpacing = function(lineSpacing)
{
    this._lineSpacing = lineSpacing;
    this.setDirtyArea();
    if (!this._fixedSize)
    {
        this._updateSize();
        this.setDirtyArea();
    }
    this._image = 0;
};

/**
 * Set the text alignment
 * @param {string} alignment The text alignment. It can be 'left', 'center', or 'right'
 */
TextSprite.prototype.setAlignment = function(alignment)
{
    this._alignment = alignment;
    this.setDirtyArea();
    if (!this._fixedSize)
    {
        this._updateSize();
        this.setDirtyArea();
    }
    this._image = 0;
};

/**
 * Get the width of a single line of text
 * @param {number} lineIndex The index of the line of text to get
 * @return {string | undefined} The width of the requested line of text
 */
TextSprite.prototype.getLine = function(lineIndex)
{
    return this._lines[lineIndex].text;
};

/**
 * Get the current number of lines
 * @return {number} The current number of lines
 */
TextSprite.prototype.getNumLines = function()
{
    return this._numLines;
};

/**
 * Get the width of a specific line of text
 * @param {number} lineIndex The index of the line of text
 * @return {number} The width of the line in pixels
 */
TextSprite.prototype.getLineWidth = function(lineIndex)
{
    return this._lines[lineIndex].width;
};

/**
 * Set the width and color of the text outline
 * @param {number} width The width of the outline
 * @param {string} [color] The color of the text outline. Black by default.
 */
TextSprite.prototype.setOutline = function(width, color)
{
    this._outlineWidth = width;
    this._outlineColor = color || '#000';
    this.setDirtyArea();
    this._image = 0;
};

/**
 * Clone the text sprite
 * @return {object} A copy of the text sprite
 */
TextSprite.prototype.clone = function()
{
    var newSprite = new TextSprite();
    jQuery.extend(newSprite, this);
    newSprite._sceneObject = 0;
    newSprite.quadTreeNode = 0;

    // clone object properties
    newSprite._position = {x: this._position.x, y: this._position.y};
    newSprite._sortPoint = {x: this._sortPoint.x, y: this._sortPoint.y};
    newSprite._boundsScale = {x: this._boundsScale.x, y: this._boundsScale.y};
    newSprite._shadowOffset = {x: this._shadowOffset.x, y: this._shadowOffset.y};
    newSprite._centerOffset = {x: this._centerOffset.x, y: this._centerOffset.y};
    newSprite._size = {x: this._size.x, y: this._size.y};
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
    if (this._cachedImageName)
    {
        newSprite._cachedImageName = 0;
        newSprite.cache();
    }
    return newSprite;
};

/**
 * Export this TextSprite to an object that can then be used to create a new TextSprite like this one (by passing the resulting object to the TextSprite constructor).
 * @param {boolean} [stringify] Whether the resulting object should be serialized to JSON. If this is set to true, this function returns a string representation of the TextSprite.
 * @param {Array} [propertiesToExclude] An array of strings that contains the name of the properties of this TextSprite object that you do NOT want to export.
 * @returns {object|string} An object that represents the current TextSprite
 */
TextSprite.prototype.serialize = function(stringify, propertiesToExclude)
{
    var result =
    {
        type: 'TextSprite',
        text: this._text,
        name: this._name,
        font: this._font,
        alignment: this._alignment,
        color: this._color,
        visible: this._visible,
        layer: this._layer.id,
        maxWidth: this._maxWidth,
        shadowColor: this._shadowColor,
        shadowBlur: this._shadowBlur,
        shadowOffset: {x: this._shadowOffset.x, y: this._shadowOffset.y},
        lineSpacing: this._lineSpacing,
        maxLines: this._maxLines,
        outlineColor: this._outlineColor,
        outlineWidth: this._outlineWidth,
        boundsScale: {x: this._boundsScale.x, y: this._boundsScale.y},
        sortPoint: {x: this._sortPoint.x, y: this._sortPoint.y},
        fixedSize: this._fixedSize,
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
 * Scale the bounding box of the text sprite
 * @param {number} scaleX The scale factor on the x axis
 * @param {number} scaleY The scale factor on the y axis
 */
TextSprite.prototype.scaleBounds = function(scaleX, scaleY)
{
    this._boundsScale = {x: scaleX, y: scaleY};
    this._updateSize();
    this._image = 0;
};

/**
 * Use a fixed size for this sprite. This prevents expensive calculations that happen when the text (or font, shadows and other properties) change, and the bounding box of the sprite needs to be updatedd.
 * This may be useful when using fixed-size fonts and when you are sure that the size doesn't change, or when you don't care about inaccuracies in the bounding box calculations. Use with care.
 * @param {boolean} [toggle] Whether to use a fixed size or not. If this parameter is omitted, it is assumed to be true.
 */
TextSprite.prototype.setFixedSize = function(toggle)
{
    if (typeof(toggle) == 'undefined')
    {
        toggle = true;
    }
    this._fixedSize = toggle;
};

TextSprite.prototype.getSize = function()
{
    return {x: this._size.x, y: this._size.y};
};

TextSprite.prototype._updateSize = function()
{
    var context = wade.getInternalContext();
    this._lines.length = 0;

    // calculate height by adding the text to a div (because whoever designed the measureText function forgot about the height)
    var text = $('<span style="white-space:nowrap">' + this._text.replace('<', '< ') + '</span>').css({ font: this._font });
    var block = $('<div style="display: inline-block; width: 1px; height: 0px;"></div>');
    var div = $('<div style="white-space:nowrap"></div>');
    div.append(text, block);
    var body = $('body');
    body.append(div);
    block.css({ verticalAlign: 'bottom' });
    var height = block.offset().top - text.offset().top;
    block.css({ verticalAlign: 'baseline' });
    if (!height)
    {
        height = context.measureText('m').width * 3 + this._outlineWidth;
    }
    this._centerOffset.y = height / 2 + (text.offset().top - block.offset().top);
    div.remove();
    this._lineHeight = height;

    // simulate drawing the text to calculate the width
    this._refresh(0, this._lines, context);
    this._numLines = this._lines.length;
    var width = 0;
    for (var i=0; i<this._lines.length; i++)
    {
        width = Math.max(width, this._lines[i].width);
    }
    this._size.x = width;
    this._size.y = height + (this._numLines - 1) * this._lineSpacing * height;
    this._centerOffset.y += (this._size.y - height) / 2;

    // if the alignment isn't center, move the center offset
    switch (this._alignment)
    {
        case 'left':
            this._centerOffset.x = width / 2;
            break;
        case 'right':
            this._centerOffset.x = -width / 2;
            break;
        case 'center':
            this._centerOffset.x = 0;
            break;
    }

    // add a little bit if we have a shadow
    if (this._shadowColor)
    {
        this._size.x += Math.abs(this._shadowOffset.x) + Math.max(8, this._shadowBlur * 2);
        this._size.y += Math.abs(this._shadowOffset.y) + Math.max(8, this._shadowBlur * 2);
    }

    // add a little bit if we have outlines
    if (this._outlineWidth)
    {
        this._size.x += this._outlineWidth;
        this._size.y += this._outlineWidth;
    }

    // and add a little bit just in case this whole hack is slightly wrong
    this._size.x += 3;
    this._size.y += 3;

    // and apply user-defined scaling, for fonts that don't play by the rules and need manual tweaking
    this._size.x *= this._boundsScale.x;
    this._size.y *= this._boundsScale.y;

    this.updateBoundingBox();
};

TextSprite.prototype._calculateHeight = function()
{
    return height;
};

TextSprite.prototype.draw = function(context)
{
    if (context.isWebGl)
    {
        TextSprite.prototype.draw_gl.call(this, context);
        return;
    }
    if (this._visible && this._text)
    {
        if (this._image)
        {
            this._cornerX = this._position.x - this._size.x / 2 + this._centerOffset.x;
            this._cornerY = this._position.y - this._size.y / 2 + this._centerOffset.y;
            var posX = this._position.x;
            var posY = this._position.y;
            this._position.x = this.orientedBoundingBox.centerX;
            this._position.y = this.orientedBoundingBox.centerY;
            Sprite.prototype.drawStatic.call(this, context);
            this._position.x = posX;
            this._position.y = posY;
        }
        else
        {
            this._refresh(1, 0, context);
        }
    }
};

TextSprite.prototype.draw_gl = function(context)
{
    if (!context.isWebGl)
    {
        TextSprite.prototype.draw.call(this, context);
        return;
    }
    if (this._visible && this._text)
    {
        if (!this._image)
        {
            this.cache();
        }
        this._activeImage = this._cachedImageName;
        this._cornerX = this.boundingBox.minX;
        this._cornerY = this.boundingBox.minY;
        Sprite.prototype.drawStatic_gl.call(this, context);
    }
};

TextSprite.prototype.step = function()
{
};

TextSprite.prototype.playAnimation = function()
{
};

TextSprite.prototype.setSceneObject = function(sceneObject)
{
    // store a reference to the parent scene object
    this._sceneObject = sceneObject;
};

TextSprite.prototype._refresh = function(draw, measure, _context)
{
    var context = _context || wade.getInternalContext();
    if (this._rotation)
    {
        context.save();
        context.translate(this._position.x + this._centerOffset.x, this._position.y + this._centerOffset.y);
        context.rotate(this._rotation);
        context.translate(-this._position.x - this._centerOffset.x, -this._position.y - this._centerOffset.y);
    }
    context.font = this._font;
    context.fillStyle = this._color;
    context.textAlign = this._alignment;
    if (this._shadowColor)
    {
        context.shadowColor = this._shadowColor;
        context.shadowBlur = this._shadowBlur;
        context.shadowOffsetX = this._shadowOffset.x;
        context.shadowOffsetY = this._shadowOffset.y;
    }
    if (this._outlineWidth)
    {
        var strokeStyle = context.strokeStyle;
        var lineWidth = context.lineWidth;
        context.lineWidth = this._outlineWidth;
        context.strokeStyle = this._outlineColor;
    }
    if (!this._maxWidth && this._text.indexOf('\n') < 0)
    {
        if (draw)        {
            context.fillText(this._text, this._position.x, this._position.y);
            if (this._outlineWidth)
            {
                context.strokeText(this._text, this._position.x, this._position.y);
            }
        }
        if (measure)
        {
            measure.push({width: context.measureText(this._text).width + this._outlineWidth, text: this._text});
        }
    }
    else
    {
        // multiline text drawing if we have a maximum width or carriage returns (\n)
        var currentLine = 0;
        var separateLines = this._text.split('\n');
        for (var i=0; i<separateLines.length && (!this._maxLines || currentLine < this._maxLines); i++)
        {
            var words = separateLines[i].split(' ');
            var idx = 1;
            var text;
            while (words.length > 0 && idx <= words.length && (!this._maxLines || currentLine < this._maxLines))
            {
                var str = words.slice(0,idx).join(' ');
                var w = context.measureText(str).width + this._outlineWidth;
                if (w > this._maxWidth && this._maxWidth > 0)
                {
                    if (idx==1)
                    {
                        idx=2;
                    }
                    text = words.slice(0,idx-1).join(' ');
                    if (draw)
                    {
                        context.fillText(text, this._position.x, this._position.y + (this._lineHeight * this._lineSpacing * currentLine) );
                        if (this._outlineWidth)
                        {
                            context.strokeText(this._text, this._position.x, this._position.y);
                        }
                    }
                    if (measure)
                    {
                        measure.push({width: context.measureText(text).width + this._outlineWidth, text: text});
                    }
                    currentLine++;
                    words = words.splice(idx-1);
                    idx = 1;
                }
                else
                {
                    idx++;
                }
            }
            if  (idx > 0)
            {
                text = words.join(' ');
                if (draw)
                {
                    context.fillText(text, this._position.x, this._position.y + (this._lineHeight * this._lineSpacing * currentLine));
                    if (this._outlineWidth)
                    {
                        context.strokeText(this._text, this._position.x, this._position.y);
                    }
                }
                if (measure)
                {
                    measure.push({width: context.measureText(text).width + this._outlineWidth, text: text});
                }
                currentLine++;
            }
        }
        this._numLines = currentLine;
    }
    if (this._shadowColor)
    {
        context.shadowColor = 'rgba(0, 0, 0, 0)';
    }
    if (this._outlineWidth)
    {
        context.strokeStyle = strokeStyle;
        context.lineWidth = lineWidth;
    }
    this._rotation && context.restore();
};

    return TextSprite;
});