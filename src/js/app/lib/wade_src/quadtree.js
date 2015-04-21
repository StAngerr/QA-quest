define(function() {
function QuadTreeNode(level, minX, minY, maxX, maxY)
{
    this._level = level;
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
    this._children = [];
    this._objects = [];
}

QuadTreeNode.prototype.c_idealObjectCountPerLevel = 1;
QuadTreeNode.prototype.c_maxLevels = 8;

QuadTreeNode.prototype.addObject = function(object)
{
    // try adding it to one of our children first
    if (!this._insertInChild(object))
    {
        // if we couldn't add it to our children, add it to this node
        object.quadTreeNode = this;
        this._objects.push(object);

        // if we are above the ideal number of objects for this level and we don't have children, partition this level
        if (this._objects.length > this.c_idealObjectCountPerLevel && !this._children.length && this._level < this.c_maxLevels)
        {
            var middleX = this.minX + (this.maxX - this.minX) / 2;
            var middleY = this.minY + (this.maxY - this.minY) / 2;
            this._children.push(new QuadTreeNode(this._level+1, this.minX, this.minY, middleX,    middleY));
            this._children.push(new QuadTreeNode(this._level+1, middleX,    this.minY, this.maxX, middleY));
            this._children.push(new QuadTreeNode(this._level+1, this.minX, middleY,    middleX,    this.maxY));
            this._children.push(new QuadTreeNode(this._level+1, middleX,    middleY,    this.maxX, this.maxY));

            // now that we have some children, retry to add all the objects into them
            for (var i=this._objects.length-1; i>=0; i--)
            {
                if (this._insertInChild(this._objects[i]))
                {
                    // if successful, remove the object from this node
                    this.removeObject(this._objects[i]);
                }
            }
        }
    }
};

QuadTreeNode.prototype.removeObject = function(object)
{
    wade.removeObjectFromArray(object, this._objects);
};

QuadTreeNode.prototype.getObjects = function(box)
{
    if (wade.boxIntersectsBox(this, box))
    {
        var result = [].concat(this._objects);
        for (var i=0; i<this._children.length; i++)
        {
            result = result.concat(this._children[i].getObjects(box));
        }
        return result;
    }
    return [];
};

QuadTreeNode.prototype.addObjectsInAreaToArray = function(box, array)
{
    if (wade.boxIntersectsBox(this, box))
    {
        for (var i=0; i<this._objects.length; i++)
        {
            if (wade.boxIntersectsBox(box, this._objects[i].boundingBox))
            {
                array.push(this._objects[i]);
            }
        }
        for (i=0; i<this._children.length; i++)
        {
            this._children[i].addObjectsInAreaToArray(box, array);
        }
    }
};

QuadTreeNode.prototype.countObjects = function(box)
{
    if (wade.boxIntersectsBox(this, box))
    {
        var result = this._objects.length;
        for (var i=0; i<this._children.length; i++)
        {
            result += this._children[i].countObjects(box);
        }
        return result;
    }
    return 0;
};

QuadTreeNode.prototype.flagObjects = function(box, property)
{
    if (wade.boxIntersectsBox(this, box))
    {
        for (var j=0; j<this._objects.length; j++)
        {
            if (wade.boxIntersectsBox(box, this._objects[j].boundingBox))
            {
                this._objects[j][property] = 1;
            }
        }
        for (var i=0; i<this._children.length; i++)
        {
            this._children[i].flagObjects(box, property);
        }
    }
};

QuadTreeNode.prototype.empty = function()
{
    this._objects.length = 0;
    for (var i=0; i<this._children.length; i++)
    {
        this._children[i].empty();
    }
};

QuadTreeNode.prototype._insertInChild = function(object)
{
    for (var i=0; i<this._children.length; i++)
    {
        if (wade.boxContainsBox(this._children[i], object.boundingBox))
        {
            this._children[i].addObject(object);
            return true;
        }
    }
    return false;
};

return QuadTreeNode;
});