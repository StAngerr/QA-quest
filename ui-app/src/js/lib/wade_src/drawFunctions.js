/**
 * The drawFunctions module contains a set of  draw functions to use with WADE.<br/>
 * A common usage example is:<br/>
 * <tt>sprite.setDrawFunction(wade.drawFunctions.solidFill_('green'));</tt>
 * @constructor
 */
 define(function() {
function Wade_drawFunctions()
{
    /**
     * Fill the sprite's bounding box with a linear color gradient
     * @param {Object} gradientDirection An object whose 'x' and 'y' fields represent the gradient's direction. Note that this has to be a unit vector.
     * @param {Array} colors An array of strings representing HTML colors. The array must contain at least 2 elements
     * @return {Function} A draw function to use with a Sprite object
     */
    this.gradientFill_ = function(gradientDirection, colors)
    {
        return function(context)
        {
            if (!this._visible)
            {
                return;
            }
            if (context.isWebGl)
            {
                wade.log('wade.drawFunctions.gradientFill_ is not available in webgl mode');
                return;
            }
            var recreate = !this._gradient || this._gradient.colors != colors || this._gradient.direction != gradientDirection || this._gradient.size.x != this._size.x || this._gradient.size.y != this._size.y || this._gradient.position.x != this._position.x || this._gradient.position.y != this._position.y;
            var e = wade.screenUnitToWorld(this._layer.id) * 0.5;
            if (recreate && colors.length >= 2)
            {
                this._gradient =
                {
                    colors: colors,
                    direction: gradientDirection,
                    size: {x: this._size.x, y: this._size.y},
                    position: {x: this._position.x, y: this._position.y}
                };
                var x0 = (this._position.x - this._size.x / 2 + e) * gradientDirection.x;
                var y0 = (this._position.y - this._size.y / 2 + e) * gradientDirection.y;
                var x1 = (this._position.x + this._size.x / 2 - e) * gradientDirection.x;
                var y1 = (this._position.y + this._size.y / 2 - e) * gradientDirection.y;
                this._gradient.gradient = context.createLinearGradient(x0, y0, x1, y1);
                for (var i=0; i<colors.length; i++)
                {
                    this._gradient.gradient.addColorStop(i / (colors.length - 1), colors[i]);
                }
            }
            if (this._gradient && this._gradient.gradient)
            {
                context.save();
                if (this._rotation)
                {
                    context.translate(this._position.x, this._position.y);
                    context.rotate(this._rotation);
                    context.translate(-this._position.x, -this._position.y);
                }
                context.fillStyle = this._gradient.gradient;
                context.fillRect(this._position.x - this._size.x / 2 + e, this._position.y - this._size.y / 2 + e, this._size.x - e, this._size.y - e);
                context.restore();
            }
            else
            {
                wade.log('Warning: attempting to draw a sprite with an invalid linear gradient');
            }
        }
    };

    /**
     * Fill the sprite's bounding box with a solid color.
     * @param {string} color An HTML color string, for example '#ffffff', '#fff', 'white', or 'rgba(255, 255, 255, 1)'
     * @return {Function} A draw function to use with a Sprite object
     */
    this.solidFill_ = function(color)
    {
        return function(context)
        {
            if (!this._visible)
            {
                return;
            }
            if (context.isWebGl)
            {
                wade.log('wade.drawFunctions.solidFill_ is not available in webgl mode');
                return;
            }
            if (this._rotation)
            {
                context.save();
                context.translate(this._position.x, this._position.y);
                context.rotate(this._rotation);
                context.translate(-this._position.x, -this._position.y);
            }
            var fillStyle = context.fillStyle;
            var e = wade.screenUnitToWorld(this._layer.id) * 0.5;
            context.fillStyle = color;
            context.fillRect(this._position.x - this._size.x / 2 + e, this._position.y - this._size.y / 2 + e, this._size.x - e, this._size.y - e);
            context.fillStyle = fillStyle;
            if (this._rotation)
            {
                context.restore();
            }
        }
    };

    /**
     * Fill the sprite's bounding box with a solid color, restricting all coordinates to integer numbers. This may be needed for the drawing to work on some specific browsers, such as Chrome for Android
     * @param {string} color An HTML color string, for example '#ffffff', '#fff', 'white', or 'rgba(255, 255, 255, 1)'
     * @return {Function} A draw function to use with a Sprite object
     */
    this.solidFillInt_ = function(color)
    {
        return function(context)
        {
            if (!this._visible)
            {
                return;
            }
            if (context.isWebGl)
            {
                wade.log('wade.drawFunctions.solidFillInt_ is not available in webgl mode');
                return;
            }
            if (this._rotation)
            {
                context.save();
                context.translate(this._position.x, this._position.y);
                context.rotate(this._rotation);
                context.translate(-this._position.x, -this._position.y);
            }
            var fillStyle = context.fillStyle;
            var e = wade.screenUnitToWorld(this._layer.id) * 0.5;
            context.fillStyle = color;
            context.fillRect(Math.floor(this._position.x - this._size.x / 2 + e), Math.floor(this._position.y - this._size.y / 2 + e), Math.floor(this._size.x - e), Math.floor(this._size.y - e));
            context.fillStyle = fillStyle;
            if (this._rotation)
            {
                context.restore();
            }
        }
    };

    /**
     * Draw a rectangle (borders only).
     * @param {string} color An HTML color string, for example '#ffffff', '#fff', 'white', or 'rgba(255, 255, 255, 1)'
     * @param {number} borderWidth The width of the border
     * @return {Function} A draw function to use with a Sprite object
     */
    this.drawRect_ = function(color, borderWidth)
    {
        return function(context)
        {
            if (!this._visible)
            {
                return;
            }
            if (context.isWebGl)
            {
                wade.log('wade.drawFunctions.drawRect_ is not available in webgl mode');
                return;
            }
            if (this._rotation)
            {
                context.save();
                context.translate(this._position.x, this._position.y);
                context.rotate(this._rotation);
                context.translate(-this._position.x, -this._position.y);
            }
            var fillStyle = context.fillStyle;
            var lineWidth = context.lineWidth;
            var e = wade.screenUnitToWorld(this._layer.id) * 0.5;
            context.strokeStyle = color;
            context.lineWidth = borderWidth;
            context.strokeRect(this._position.x - this._size.x / 2 + borderWidth + e, this._position.y - this._size.y / 2 + borderWidth + e, this._size.x - borderWidth * 2 - e, this._size.y - borderWidth * 2 - e);
            context.fillStyle = fillStyle;
            context.lineWidth = lineWidth;
            if (this._rotation)
            {
                context.restore();
            }
        }
    };

    /**
     * Draw a circle with a radial gradient. The radius of the circle is calculated based on the size of the sprite's bounding box, and is half of the smaller dimension.
     * @param {Array} colors An array of strings representing HTML colors. The array must contain at least 2 elements
     * @param {string} [fadeOutColor] the outer color to fade out to. Default is rgba(0, 0, 0, 0), which is transparent black.
     * @return {Function} A draw function to use with a Sprite object
     */
    this.radialGradientCircle_ = function(colors, fadeOutColor)
    {
        fadeOutColor = fadeOutColor || 'rgba(0, 0, 0, 0)';
        return function(context)
        {
            if (!this._visible)
            {
                return;
            }
            if (context.isWebGl)
            {
                wade.log('wade.drawFunctions.radialGradientCircle_ is not available in webgl mode');
                return;
            }
            var e = wade.screenUnitToWorld(this._layer.id) * 0.5;
            var minRadius = Math.min(this._size.x, this._size.y) / 2 - e;
            var recreate = !this._gradient || this._gradient.colors != colors ||  this._gradient.minRadius != minRadius || this._gradient.position.x != this._position.x || this._gradient.position.y != this._position.y;
            if (recreate)
            {
                this._gradient =
                {
                    colors: colors,
                    minRadius: minRadius,
                    position: {x: this._position.x, y: this._position.y}
                };
                this._gradient.gradient = context.createRadialGradient(this._position.x, this._position.y, 0, this._position.x, this._position.y, minRadius);
                for (var i=0; i<colors.length; i++)
                {
                    this._gradient.gradient.addColorStop(i / (colors.length), colors[i]);
                }
                this._gradient.gradient.addColorStop(1, fadeOutColor);
            }
            context.save();
            if (this._rotation)
            {
                context.translate(this._position.x, this._position.y);
                context.rotate(this._rotation);
                context.translate(-this._position.x, -this._position.y);
            }
            context.fillStyle = this._gradient.gradient;
            context.fillRect(this._position.x - this._size.x / 2 + e, this._position.y - this._size.y / 2 + e, this._size.x - e, this._size.y - e);
            context.restore();
        }
    };

    /**
     * Fill the sprite's bounding box with a color that transitions to another color over a specified number of frames
     * @param {number} r0 The red component of the first color. Valid values are integers between 0 and 255 included
     * @param {number} g0 The green component of the first color. Valid values are integers between 0 and 255 included
     * @param {number} b0 The blue component of the first color. Valid values are integers between 0 and 255 included
     * @param {number} a0 The alpha (opacity) component of the first color. Valid values are numbers between 0 and 1
     * @param {number} r1 The red component of the second color. Valid values are integers between 0 and 255 included
     * @param {number} g1 The green component of the second color. Valid values are integers between 0 and 255 included
     * @param {number} b1 The blue component of the second color. Valid values are integers between 0 and 255 included
     * @param {number} a1 The alpha (opacity) component of the second color. Valid values are numbers between 0 and 1
     * @param {number} numFrames The duration of the transition between two colors, espressed as a frame count
     * @param {Function} [callback] A function to execute when the transition is complete
     * @return {Function} A draw function to use with a Sprite object
     */
    this.solidFade_ = function(r0, g0, b0, a0, r1, g1, b1, a1, numFrames, callback)
    {
        var customDrawCount = 0;
        return function(context)
        {
            if (!this._visible)
            {
                return;
            }
            if (context.isWebGl)
            {
                wade.log('wade.drawFunctions.solidFade_ is not available in webgl mode');
                return;
            }
            if (!this._animations['__fade'])
            {
                var anim = new Animation('', 1, 1, 1, true);
                this.addAnimation('__fade', anim);
            }
            this.playAnimation('__fade');
            var fillStyle = context.fillStyle;
            var t = customDrawCount / numFrames;
            var r = Math.floor(r0 * (1 - t) + r1 * t);
            var g = Math.floor(g0 * (1 - t) + g1 * t);
            var b = Math.floor(b0 * (1 - t) + b1 * t);
            var a = a0 * (1 - t) + a1 * t;
            if (this._rotation)
            {
                context.save();
                context.translate(this._position.x, this._position.y);
                context.rotate(this._rotation);
                context.translate(-this._position.x, -this._position.y);
            }
            context.fillStyle = 'rgba('+r+','+g+','+b+','+a+')';
            var e = wade.screenUnitToWorld(this._layer.id) * 0.5;
            context.fillRect(this._position.x - this._size.x / 2 + e, this._position.y - this._size.y / 2 + e, this._size.x - e, this._size.y - e);
            context.fillStyle = fillStyle;
            if (this._rotation)
            {
                context.restore();
            }
            if (customDrawCount < numFrames)
            {
                customDrawCount++;
                if (customDrawCount == numFrames && callback)
                {
                    callback();
                }
            }
        }
    };

    /**
     * Draw a grid with equally-spaced lines
     * @param {number} numCellsX The number of horizontal cells
     * @param {number} numCellsY The number of vertical cells
     * @param {string} color A string representing an HTML color
     * @param {number} [lineWidth] The width of the lines, in world units. Default is 1
     * @return {Function} A draw function to use with a Sprite object
     */
    this.grid_ = function(numCellsX, numCellsY, color, lineWidth)
    {
        return function(context)
        {
            if (!this._visible)
            {
                return;
            }
            if (context.isWebGl)
            {
                wade.log('wade.drawFunctions.grid_ is not available in webgl mode');
                return;
            }
            lineWidth = lineWidth || 1;
            context.save();
            context.lineWidth = lineWidth;
            context.strokeStyle = color;
            context.lineJoin = 'round';
            context.lineCap = 'round';
            if (this._rotation)
            {
                context.translate(this._position.x, this._position.y);
                context.rotate(this._rotation);
                context.translate(-this._position.x, -this._position.y);
            }
            var e = wade.screenUnitToWorld(this._layer.id) * 0.5 * lineWidth;
            var spacingX = (this._size.x - e*2) / numCellsX;
            var spacingY = (this._size.y - e*2) / numCellsY;
            var startX = this._position.x - this._size.x / 2 + e;
            var startY = this._position.y - this._size.y / 2 + e;
            var endX = this._position.x + this._size.x / 2 - e;
            var endY = this._position.y + this._size.y / 2 - e;
            var posX = startX;
            var posY = startY;
            for (var j=0; j<=numCellsY; j++)
            {
                context.beginPath();
                context.moveTo(startX, posY);
                context.lineTo(endX, posY);
                context.stroke();
                posY += spacingY;
            }
            for (var i=0; i<=numCellsX; i++)
            {
                context.beginPath();
                context.moveTo(posX, startY);
                context.lineTo(posX, endY);
                context.stroke();
                posX += spacingX;
            }
            context.restore();
        }
    };

    /**
     * Draw a sprite multiplying its original transparency by a specified value
     * @param {number} alpha The opacity to use when drawing the sprite
     * @param {function} draw The draw function to use
     */
    this.alpha_ = function(alpha, draw)
    {
        return function(context)
        {
            if (!this._visible)
            {
                return;
            }
            var previousAlpha = context.globalAlpha;
            context.globalAlpha = alpha;
            draw.call(this, context);
            context.globalAlpha = previousAlpha;
        };
    };

    /**
     * Draw a blinking sprite, using the specified draw function
     * @param {number} timeOn How many seconds the sprite should be displayed
     * @param {number} timeOff How many seconds the sprite should be hidden
     * @param {function} draw The draw function to use
     */
    this.blink_ = function(timeOn, timeOff, draw)
    {
        var state = 1;
        var timer = timeOn;
        return function(context)
        {
            if (!this._visible)
            {
                return;
            }
            if ((timer -= wade.c_timeStep) < 0)
            {
                timer = state? timeOff: timeOn;
                state = !state;
            }
            if (state)
            {
                draw.call(this, context);
            }
            this.setDirtyArea();
        };
    };

    /**
     * Draw a sprite, gradually changing its transparency over time.
     * @param {number} alphaStart The initial opacity, between 0 (transparent) and 1 (fully opaque)
     * @param {number} alphaEnd The final opacity
     * @param {number} time How many seconds the transition should last. Note that this won't be extremely accurate, as it ultimately depends on the actual frame rate of the app.
     * @param {function} [originalDrawCall] The draw function to use
     * @param {function} [callback] A function to execute when the transition is over
     * @returns {function} The draw function to use with Sprite.setDrawFunction()
     */
    this.fadeOpacity_ = function(alphaStart, alphaEnd, time, originalDrawCall, callback)
    {
        var alphaIncrement = (alphaEnd - alphaStart) * wade.c_timeStep / time;
        var alpha = alphaStart;
        originalDrawCall = originalDrawCall || Sprite.prototype.draw;
        var fun = function(context)
        {
            if (!this._visible)
            {
                return;
            }
            var oldAlpha = alpha;
            alpha = Math[alphaEnd > alphaStart? 'min' : 'max'](alphaEnd, alpha + alphaIncrement);
            var previousAlpha = context.globalAlpha;
            context.globalAlpha = alpha;
            originalDrawCall.call(this, context);
            context.globalAlpha = previousAlpha;
            if (alpha == alphaEnd && alpha == 1)
            {
                (this.getDrawFunction() == fun) &&  this.setDrawFunction(originalDrawCall);
            }
            else if (alpha != oldAlpha)
            {
                this.setDirtyArea();
            }
            if (alpha == alphaEnd)
            {
                callback && callback();
                callback = null;
            }
        };
        return fun;
    };

    /**
     * Draw a sprite that changes size over time
     * @param startWidth The initial width
     * @param startHeight The initial height
     * @param endWidth The final width
     * @param endHeight The final height
     * @param time The time it takes to change size, in seconds
     * @param originalDrawCall The original draw function of the sprite
     * @param callback A function to execute when it's finished changing size
     * @returns {Function} The draw function to use with Sprite.setDrawFunction()
     */
    this.resizeOverTime_ = function(startWidth, startHeight, endWidth, endHeight, time, originalDrawCall, callback)
    {
        var widthIncrement = (endWidth - startWidth) * wade.c_timeStep / time;
        var width = startWidth;
        var heightIncrement = (endHeight - startHeight) * wade.c_timeStep / time;
        var height = startHeight;
        originalDrawCall = originalDrawCall || Sprite.prototype.draw;
        var fun = function(context)
        {
            if (!this._visible)
            {
                return;
            }
            width = Math[endWidth > startWidth? 'min' : 'max'](endWidth, width + widthIncrement);
            height = Math[endHeight > startHeight? 'min' : 'max'](endHeight, height + heightIncrement);
            this.setSize(width, height);
            originalDrawCall.call(this, context);
            if (width == endWidth && height == endHeight)
            {
                if (fun == this.getDrawFunction())
                {
                    this.setDrawFunction(originalDrawCall);
                }
                callback && callback();
                callback = null;
            }
        };
        return fun;
    };

    /**
     * Draw a sprite that changes size periodically over time
     * @param startWidth The initial width
     * @param startHeight The initial height
     * @param endWidth The final width
     * @param endHeight The final height
     * @param period The time it takes to change size (from initial to final or viceversa), in seconds
     * @param originalDrawCall The original draw call of the sprite
     * @returns {Function} The draw function to use with Sprite.setDrawFunction()
     */
    this.resizePeriodically_ = function(startWidth, startHeight, endWidth, endHeight, period, originalDrawCall)
    {
        var direction = 1;
        var widthIncrement = (endWidth - startWidth) * wade.c_timeStep / period;
        var width = startWidth;
        var heightIncrement = (endHeight - startHeight) * wade.c_timeStep / period;
        var height = startHeight;
        originalDrawCall = originalDrawCall || Sprite.prototype.draw;
        return function(context)
        {
            if (!this._visible)
            {
                return;
            }
            var w0 = (direction == 1)? startWidth : endWidth;
            var w1 = (direction == 1)? endWidth : startWidth;
            var h0 = (direction == 1)? startHeight : endHeight;
            var h1 = (direction == 1)? endHeight : startHeight;
            width = Math[w1 > w0? 'min' : 'max'](w1, width + widthIncrement * direction);
            height = Math[h1> h0? 'min' : 'max'](h1, height + heightIncrement * direction);
            this.setSize(width, height);
            originalDrawCall.call(this, context);
            if (width == w1 && height == h1)
            {
                direction *= -1;
            }
        };
    };

    /**
     * Draws a mirror image of the sprite
     * @param {Function} [originalDrawCall] The original draw call of the sprite
     * @returns {Function} The draw function to use with Sprite.setDrawFunction()
     */
    this.mirror_ = function(originalDrawCall)
    {
        originalDrawCall = originalDrawCall || Sprite.prototype.draw;
        return function(context)
        {
            if (context.isWebGl)
            {
                this._f32AnimFrameInfo[2] *= -1;
                this._animations[this._currentAnimation].mirror();
            }
            else
            {
                context.scale(-1, 1);
            }
            var a = this._position.x;
            var b = this._cornerX;
            this._position.x *= -1;
            this._cornerX = this._position.x - this._size.x / 2;
            originalDrawCall.call(this, context);
            this._position.x = a;
            this._cornerX = b;
            if (context.isWebGl)
            {
                this._f32AnimFrameInfo[2] *= -1;
                this._animations[this._currentAnimation].mirror();
            }
            else
            {
                context.scale(-1, 1);
            }
        };
    };

    /**
     * Draws a flipped image of the sprite (mirrored vertically)
     * @param {Function} [originalDrawCall] The original draw call of the sprite
     * @returns {Function} The draw function to use with Sprite.setDrawFunction()
     */
    this.flip_ = function(originalDrawCall)
    {
        originalDrawCall = originalDrawCall || Sprite.prototype.draw;
        return function(context)
        {
            if (context.isWebGl)
            {
                this._f32AnimFrameInfo[3] *= -1;
                this._animations[this._currentAnimation].flip();
            }
            else
            {
                context.scale(1, -1);
            }
            var a = this._position.y;
            var b = this._cornerY;
            this._position.y *= -1;
            this._cornerY = this._position.y - this._size.y / 2;
            originalDrawCall.call(this, context);
            this._position.y = a;
            this._cornerY = b;
            if (context.isWebGl)
            {
                this._f32AnimFrameInfo[3] *= -1;
                this._animations[this._currentAnimation].flip();
            }
            else
            {
                context.scale(1, -1);
            }
        };
    };

    /**
     * Draws using the specified global composite operation (see http://www.w3schools.com/tags/canvas_globalcompositeoperation.asp for reference)
     * @param {string} operation The global composite operation to use
     * @param {Function} [originalDrawCall] The original draw call of the sprite
     * @returns {Function} The draw function to use with Sprite.setDrawFunction()
     */
    this.composite_ = function(operation, originalDrawCall)
    {
        originalDrawCall = originalDrawCall || Sprite.prototype.draw;
        return function(context)
        {
            if (operation != context.globalCompositeOperation)
            {
                var op = context.globalCompositeOperation;
                context.globalCompositeOperation = operation;
                originalDrawCall.call(this, context);
                context.globalCompositeOperation = op;
            }
            else
            {
                originalDrawCall.call(this, context);
            }
        }
    };

    /**
     * Draw the bounding boxes of the sprite
     * @param {string} [axisAlignedColor] The color to use for the axis-aligned bounding box. Default is 'red'
     * @param {string} [orientedColor] The color to use for the oriented bounding box. Default is 'blue'
     * @param {Function} [originalDrawCall] The original draw call of the sprite
     * @returns {Function} The draw function to use with Sprite.setDrawFunction()
     */
    this.boundingBox_ = function(axisAlignedColor, orientedColor, originalDrawCall)
    {
        axisAlignedColor = axisAlignedColor || 'red';
        orientedColor = orientedColor || 'blue';
        originalDrawCall = originalDrawCall || Sprite.prototype.draw;
        return function(context)
        {
            if (!this._visible)
            {
                return;
            }
            if (context.isWebGl)
            {
                wade.log('wade.drawFunctions.boundingBox_ is not available in webgl mode');
                return;
            }
            context.save();
            context.lineWidth = 1;
            var e = wade.screenUnitToWorld(this._layer.id) * 0.5;
            if (this._rotation)
            {
                context.strokeStyle = orientedColor;
                context.lineJoin = 'round';
                context.lineCap = 'round';
                context.beginPath();
                var xnn = -this.orientedBoundingBox.axisXx - this.orientedBoundingBox.axisYx;
                var xnp = -this.orientedBoundingBox.axisXx + this.orientedBoundingBox.axisYx;
                var xpp =  this.orientedBoundingBox.axisXx + this.orientedBoundingBox.axisYx;
                var xpn =  this.orientedBoundingBox.axisXx - this.orientedBoundingBox.axisYx;
                var ynn = -this.orientedBoundingBox.axisXy - this.orientedBoundingBox.axisYy;
                var ynp = -this.orientedBoundingBox.axisXy + this.orientedBoundingBox.axisYy;
                var ypp =  this.orientedBoundingBox.axisXy + this.orientedBoundingBox.axisYy;
                var ypn =  this.orientedBoundingBox.axisXy - this.orientedBoundingBox.axisYy;
                xnn += (xnn > 0)? -e : e;
                xnp += (xnp > 0)? -e : e;
                xpn += (xpn > 0)? -e : e;
                xpp += (xpp > 0)? -e : e;
                ynn += (ynn > 0)? -e : e;
                ynp += (ynp > 0)? -e : e;
                ypn += (ypn > 0)? -e : e;
                ypp += (ypp > 0)? -e : e;
                context.moveTo(this.orientedBoundingBox.centerX + xnn, this.orientedBoundingBox.centerY + ynn);
                context.lineTo(this.orientedBoundingBox.centerX + xnp, this.orientedBoundingBox.centerY + ynp);
                context.lineTo(this.orientedBoundingBox.centerX + xpp, this.orientedBoundingBox.centerY + ypp);
                context.lineTo(this.orientedBoundingBox.centerX + xpn, this.orientedBoundingBox.centerY + ypn);
                context.lineTo(this.orientedBoundingBox.centerX + xnn, this.orientedBoundingBox.centerY + ynn);
                context.stroke();
            }
            context.strokeStyle = axisAlignedColor;
            context.beginPath();
            context.moveTo(this.boundingBox.minX + e, this.boundingBox.minY + e);
            context.lineTo(this.boundingBox.maxX - e, this.boundingBox.minY + e);
            context.lineTo(this.boundingBox.maxX - e, this.boundingBox.maxY - e);
            context.lineTo(this.boundingBox.minX + e, this.boundingBox.maxY - e);
            context.lineTo(this.boundingBox.minX + e, this.boundingBox.minY + e);
            context.stroke();

            context.restore();
            originalDrawCall.call(this, context);
        }
    };

    /**
     * Make a sprite transparent (i.e. - do not draw it)
     * @returns {Function} The draw function to use with Sprite.setDrawFunction()
     */
    this.transparent_ = function()
    {
        return function() {};
    };
}

/**
 * This is the drawFunctions module of WADE
 * @type {Wade_drawFunctions}
 */
//wade.drawFunctions = new Wade_drawFunctions();

    return Wade_drawFunctions;
});