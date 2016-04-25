/**
 * This is a set of functions that operate on 2d vectors. 2d vectors are objects with <i>x</i> and <i>y</i> properties.
 * Because of the weakly-typed nature of JavaScript, 2d vectors can have any other properties as well as <i>x</i> and <i>y</i>, but all the functions in wade.vec2d that return 2d vectors will ignore the other properties, and just return objects with <i>x</i> and <i>y</i> properties.
 * @constructor
 */
function Wade_vec2()
{
    /**
     * Add two vectors
     * @param {{x: number, y: number}} v1 A 2d vector
     * @param {{x: number, y: number}} v2 Another 2d vector
     * @returns {{x: number, y: number}} v1 + v2
     */
    this.add = function(v1, v2)
    {
        return {x: v1.x + v2.x, y: v1.y + v2.y};
    };

    /**
     * Subtract two vectors
     * @param {{x: number, y: number}} v1 A 2d vector
     * @param {{x: number, y: number}} v2 Another 2d vector
     * @returns {{x: number, y: number}} v1 - v2
     */
    this.sub = function(v1, v2)
    {
        return {x: v1.x - v2.x, y: v1.y - v2.y};
    };

    /**
     * Multiply two vectors
     * @param {{x: number, y: number}} v1 A 2d vector
     * @param {{x: number, y: number}} v2 Another 2d vector
     * @returns {{x: number, y: number}} v1 * v2
     */
    this.mul = function(v1, v2)
    {
        return {x: v1.x * v2.x, y: v1.y * v2.y};
    };

    /**
     * Divide a vector by another vector
     * @param {{x: number, y: number}} v1 A 2d vector
     * @param {{x: number, y: number}} v2 Another 2d vector
     * @returns {{x: number, y: number}} v1 / v2
     */
    this.div = function(v1, v2)
    {
        return {x: v1.x / v2.x, y: v1.y / v2.y};
    };

    /**
     * Calculate the dot product of two vectors
     * @param {{x: number, y: number}} v1 A 2d vector
     * @param {{x: number, y: number}} v2 Another 2d vector
     * @returns {{x: number, y: number}} The dot product of v1 and v2
     */
    this.dot = function(v1, v2)
    {
        return v1.x * v2.x + v1.y * v2.y;
    };

    /**
     * Calculate the length squared of a vector
     * @param {{x: number, y: number}} v A 2d vector
     * @returns {number} The length squared of v
     */
    this.lengthSquared = function(v)
    {
        return v.x * v.x + v.y * v.y;
    };

    /**
     * Calculate the length of a vector
     * @param {{x: number, y: number}} v A 2d vector
     * @returns {number} The length of v
     */
    this.length = function(v)
    {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    };

    /**
     * Normalize a vector (so that its length is 1). Note that if the length of the vector is very close to 0, this operation may fail and return a vector whose components are NaN
     * @param {{x: number, y: number}} v A 2d vector
     * @returns {{x: number, y: number}} The normalized vector
     */
    this.normalize = function(v)
    {
        var l = Math.sqrt(v.x * v.x + v.y * v.y);
        return {x: v.x / l, y: v.y / l};
    };

    /**
     * Normalize a vector (so that its length is 1). Note that if the length of the vector is very close to 0, this operation will just return the original vector
     * @param {{x: number, y: number}} v A 2d vector
     * @returns {{x: number, y: number}} The normalized vector
     */
    this.normalizeIfPossible = function(v)
    {
        var l = Math.sqrt(v.x * v.x + v.y * v.y);
        return (l < wade.c_epsilon)? {x: v.x, y: v.y} : {x: v.x / l, y: v.y / l};
    };

    /**
     * Scale a vector (that is, multiply the vector by a scalar)
     * @param {{x: number, y: number}} v A 2d vector
     * @param {number} s A scale factor
     * @returns {{x: number, y: number}} v * s
     */
    this.scale = function(v, s)
    {
        return {x: v.x*s, y: v.y*s};
    };

    /**
     * Clamp a vector, that is force both its components to be between a minimum value and a maximum value
     * @param {{x: number, y: number}} v A 2d vector
     * @param {number} min The minimum value for either component of the vector
     * @param {number} max The maximum value for either component of the vector
     * @returns {{x: number, y: number}} The clamped vector
     */
    this.clamp = function(v, min, max)
    {
        return {x: Math.min(Math.max(v.x, min), max), y: Math.min(Math.max(v.y, min), max)};
    };

    /**
     * Rotate a vector by an angle
     * @param {{x: number, y: number}} v A 2d vector
     * @param {number} angle An angle in radians
     * @returns {{x: number, y: number}} The rotated vector
     */
    this.rotate = function(v, angle)
    {
        var s = Math.sin(angle);
        var c = Math.cos(angle);

        return {x: c*v.x - s*v.y, y: s* v.x + c* v.y};
    };

    /**
     * Add two vectors and store the result in the first vector
     * @param {{x: number, y: number}} v1 A 2d vector
     * @param {{x: number, y: number}} v2 Another 2d vector
     */
    this.addInPlace = function(v1, v2)
    {
        v1.x += v2.x;
        v1.y += v2.y;
    };

    /**
     * Subtract two vectors and store the result in the first vector
     * @param {{x: number, y: number}} v1 A 2d vector
     * @param {{x: number, y: number}} v2 Another 2d vector
     */
    this.subInPlace = function(v1, v2)
    {
        v1.x -= v2.x;
        v1.y -= v2.y;
    };

    /**
     * Multiply two vectors and store the result in the first vector
     * @param {{x: number, y: number}} v1 A 2d vector
     * @param {{x: number, y: number}} v2 Another 2d vector
     */
    this.mulInPlace = function(v1, v2)
    {
        v1.x *= v2.x;
        v1.y *= v2.y;
    };

    /**
     * Divide a vector by another vector and store the result in the first vector
     * @param {{x: number, y: number}} v1 A 2d vector
     * @param {{x: number, y: number}} v2 Another 2d vector
     */
    this.divInPlace = function(v1, v2)
    {
        v1.x /= v2.x;
        v1.y /= v2.y;
    };

    /**
     * Normalize a vector (so that its length is 1). Note that if the length of the vector is very close to 0, this operation may fail and return a vector whose components are NaN. Unlike the 'normalize' function, this one modifies the original vector.
     * @param {{x: number, y: number}} v A 2d vector
     */
    this.normalizeInPlace = function(v)
    {
        var l = Math.sqrt(v.x * v.x + v.y * v.y);
        v.x /= l;
        v.y /= l;
    };

    /**
     * Normalize a vector (so that its length is 1). Note that if the length of the vector is very close to 0, this operation will just return the original vector. Unlike the 'normalizeIfPossible' function, this one modifies the original vector
     * @param {{x: number, y: number}} v A 2d vector
     */
    this.normalizeInPlaceIfPossible = function(v)
    {
        var l = Math.sqrt(v.x * v.x + v.y * v.y);
        if (l >= wade.c_epsilon)
        {
            v.x /= l;
            v.y /= l;
        }
    };

    /**
     * Scale a vector (that is, multiply the vector by a scalar). Unlike the 'scale' function, this one modifies the original vector.
     * @param {{x: number, y: number}} v A 2d vector
     * @param {number} s A scale factor
     */
    this.scaleInPlace = function(v, s)
    {
        v.x *= s;
        v.y *= s;
    };

    /**
     * Clamp a vector, that is force both its components to be between a minimum value and a maximum value. Unlike the 'clamp' function, this one modifies the original vector.
     * @param {{x: number, y: number}} v A 2d vector
     * @param {number} min The minimum value for either component of the vector
     * @param {number} max The maximum value for either component of the vector
     */
    this.clampInPlace = function(v, min, max)
    {
        v.x = Math.min(Math.max(v.x, min), max);
        v.y = Math.min(Math.max(v.y, min), max);
    };

    /**
     * Rotate a vector by an angle. Unlike the 'rotate' function, this one modifies the original vector.
     * @param {{x: number, y: number}} v A 2d vector
     * @param {number} angle An angle in radians
     */
    this.rotateInPlace = function(v, angle)
    {
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        var vx = c*v.x - s*v.y;
        var vy = s* v.x + c* v.y;
        v.x = vx;
        v.y = vy;
    };
}

/**
 * This is the 2d vector maths module of WADE
 * @type {Wade_vec2}
 */
wade.vec2 = new Wade_vec2();
