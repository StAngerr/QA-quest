define(function(require) {
    App = function() {
        var $ = require('jquery');
        var Sprite = require('lib/wade_src/sprite');
        var SceneObject = require('lib/wade_src/sceneObject');
        var TextSprite = require('lib/wade_src/textSprite');
    	var gameState;
    	var colors = ['', 'green', 'red', 'blue', 'yellow', 'orange', 'purple'];
    	var lines = [];
    	var currentLineId;
    	var gridLines = [];

    	this.init = function() {		
    		this.loadLevel(2);
    	}

        this.loadLevel = function(levelId) {
        	gameState = 'loading';
        	 /*clear scene from level grid */
        	wade.clearScene();
            wade.setScreenSize(1300, 850);
            var screenWidth = wade.getScreenWidth();
            var screenHeight = wade.getScreenHeight();   
          
            var backSprite = new Sprite(null, 5);
            backSprite.setSize(screenWidth, screenHeight);
            backSprite.setDrawFunction(wade.drawFunctions.gradientFill_({x: 0, y: 1}, ['#444', '#000']));
            var backObject = new SceneObject(backSprite);
            wade.addSceneObject(backObject);
            // create loading text
            var loadingText = new TextSprite('Loading level...', (Math.min(screenWidth, screenHeight) / 10) + 'px Arial', '#88f', 'center');
            var loading = new SceneObject(loadingText);
            wade.addSceneObject(loading);
    /* Event handlers for loading content when resizing */
        	backObject.onResize = function(eventData) {
    	        this.getSprite().setSize(eventData.width, eventData.height);
    	    };
    	    wade.addEventListener(backObject, 'onResize');
    	   /*changes font size */
            loading.onResize = function(eventData) {
    	        this.getSprite().setFont((Math.min(screenWidth, screenHeight) / 10) + 'px Arial');
    	    };
    	    wade.addEventListener(loading, 'onResize');
    	    /*Uploading  level data */
    	    var levelFile = 'levels/' + levelId + '.json';
    	    var level = {};
    /*get json with cur level*/
    	    wade.preloadJson(levelFile, level, function() {
    	    	wade.removeSceneObject(loading);
        		wade.app.startLevel(level.data);
    	    });
        };

        this.startLevel = function(levelData) {
        	/*level data = 2d array. imitation  of game field with dots*/
        	var numCells = levelData.length;

            this.levelData = levelData;
            gameState = 'playing';
            var minSize = Math.min(wade.getScreenWidth(), wade.getScreenHeight());
        	var cellSize = minSize / numCells;
        	/*when resizeng*/
        	wade.setMinScreenSize(minSize, minSize);
        	/*paint grid*/
    	    var gridSprite = new Sprite();
    	    gridSprite.setSize(minSize, minSize);
    	    gridSprite.setDrawFunction(wade.drawFunctions.grid_(numCells, numCells, 'white', 3));
    	    var grid = new SceneObject(gridSprite);
    	    grid.numCells = numCells;
    	    grid.setName('grid');
    	    wade.addSceneObject(grid);
    	     // add dots
    	    for (var i=0; i < numCells; i++) {
    	        for (var j=0; j < numCells; j++) {
    	            var colorId = levelData[j][i];	   /*detect a color */         
    	            if (colorId) { 
    	                var dotSprite = new Sprite();
    	                var dotSize = cellSize * 0.9;
    	                var dotPosition = this.gridToWorld(j, i);/* get coordinates of cell in wich must be a dot*/

    	                dotSprite.setSize(dotSize, dotSize);
    	                dotSprite.color = colors[colorId];
    	                wade.addSceneObject(new SceneObject(dotSprite, 0, dotPosition.x, dotPosition.y));
    	                /*next function paint current circle with position  fill with color and */
                        dotSprite.setDrawFunction(function(context) {
    				        var pos = this.getPosition();
    				        var size = this.getSize();
    				        var fillStyle = context.fillStyle;
    				        context.fillStyle = this.color;
    				        context.beginPath();
    				        context.moveTo(pos.x, pos.y);
    				        context.arc(pos.x, pos.y, size.x / 2, 0, Math.PI * 2, false);
    				        context.fill();
    				        context.fillStyle = fillStyle;
    			    	});
    	            }
    	        }
    	    }
    	    // set up line objects
    	    lines.length = 0;

    	    for (i = 1; i < levelData.length + 1; i++) {
    	        var lineSprite = new Sprite();
    	        lineSprite.setSize(minSize, minSize);
    	        var lineObject = new SceneObject(lineSprite);

    	        wade.addSceneObject(lineObject);
    	        lines[i] = lineObject;
    	        lineObject.points = [];
    	        lineObject.color = colors[i];
    			lineSprite.setDrawFunction(function(context) {
    		        var points = this.getSceneObject().points;
    		        var color = this.getSceneObject().color;
    		        if (points.length) {
    		            // store context properties that we are going to change
    		            var lineWidth = context.lineWidth;
    		            var strokeStyle = context.strokeStyle;
    		            var lineCap = context.lineCap;
    		            var lineJoin = context.lineJoin;
    		            // set new context properties
    		            context.lineWidth = cellSize / 3;
    		            context.strokeStyle = color;
    		            context.lineCap = context.lineJoin = 'round';
    		            // draw line
    		            context.beginPath();
    		            var worldPoint = wade.app.gridToWorld(points[0].x, points[0].y);
    		            context.moveTo(worldPoint.x, worldPoint.y);
    		            for (var i=1; i < points.length; i++) {
    		                worldPoint = wade.app.gridToWorld(points[i].x, points[i].y);
    		                context.lineTo(worldPoint.x, worldPoint.y);
    		            }
    		            context.stroke();
    		            // restore context properties
    		            context.lineWidth = lineWidth;
    		            context.strokeStyle = strokeStyle;
    		            context.lineCap = lineCap;
    		            context.lineJoin = lineJoin;
    		        }
    	    	});
    	    }
    	        // set up the state of the lines on the grid
    	    for (i = 0; i < levelData.length; i++) {
    	        gridLines[i] = [];
    	    }
        };

        this.worldToGrid = function(x, y) {
            var grid = wade.getSceneObject('grid');
            var pos = grid.getPosition();
            var size = grid.getSprite().getSize();
            var gridX = Math.floor((x - (pos.x - size.x / 2)) / (size.x / grid.numCells));
            var gridY = Math.floor((y - (pos.y - size.y / 2)) / (size.y / grid.numCells));

            return {x: gridX, y: gridY, valid: (gridX >=0 && gridY >=0 && gridX < grid.numCells && gridY < grid.numCells)};
        };
    /* this function returns coordinates in gred in should be a dot*/
        this.gridToWorld = function(x, y) {
            var grid = wade.getSceneObject('grid');
            var pos = grid.getPosition();
            var size = grid.getSprite().getSize();
            var worldX = (x + 0.5) * size.x / grid.numCells + pos.x - size.x / 2;
            var worldY = (y + 0.5) * size.y / grid.numCells + pos.y - size.y / 2;
            return {x: worldX, y: worldY};
        };

        this.onMouseDown = function(eventData) {
            if (gameState == 'playing') {
                var gridCoords = this.worldToGrid(eventData.screenPosition.x, eventData.screenPosition.y);
                if (!gridCoords.valid) {
                    currentLineId = 0;
                }
                else if (this.levelData[gridCoords.x][gridCoords.y]) {
                    currentLineId = this.levelData[gridCoords.x][gridCoords.y];
                    if (lines[currentLineId].points) {
                        for (var k=0; k < lines[currentLineId].points.length; k++) {
                            var p = lines[currentLineId].points[k];
                            gridLines[p.x][p.y] = 0;
                        }
                    }
                    lines[currentLineId].points = [gridCoords];
                    lines[currentLineId].connected = false;
                    gridLines[gridCoords.x][gridCoords.y] = currentLineId;
                    lines[currentLineId].getSprite().setDirtyArea();
                }
                else if (gridLines[gridCoords.x][gridCoords.y]) {
                    currentLineId = gridLines[gridCoords.x][gridCoords.y];
                    lines[currentLineId].connected = false;
                    var points = lines[currentLineId].points;
                    for (var i=0; i < points.length; i++) {
                        if (points[i].x == gridCoords.x && points[i].y == gridCoords.y) {
                            for (var j=i+1; j < points.length; j++) {
                                gridLines[points[j].x][points[j].y] = 0;
                            }
                            points.length = i+1;
                            lines[currentLineId].getSprite().setDirtyArea();
                        }
                    }
                }
            }
        };

        this.onMouseMove = function(eventData) {
            if (gameState == 'playing' && wade.isMouseDown()) {
                // check that grid coordinates are valid, and that we have a valid currentLineId
                var gridCoords = this.worldToGrid(eventData.screenPosition.x, eventData.screenPosition.y);
                if (!gridCoords.valid || !currentLineId) {
                    currentLineId = 0;
                    return;
                }            
                // have we moved to a new cell at all?
                var points = lines[currentLineId].points;
                if (points[points.length - 1].x == gridCoords.x && points[points.length - 1].y == gridCoords.y) {
                    return;
                }
                // are we intersecting the same line? If so, remove all the points of the line after this point
                if (gridLines[gridCoords.x][gridCoords.y] == currentLineId) {
                    for (var i = 0; i < points.length; i++) {
                        var p = points[i];
                        if (p.x == gridCoords.x && p.y == gridCoords.y) {
                            for (var j = i + 1; j < points.length; j++) {
                                gridLines[points[j].x][points[j].y] = 0;
                            }
                            points.length = i+1;
                            lines[currentLineId].getSprite().setDirtyArea();
                            return;
                        }
                    }
                }
                else if (gridLines[gridCoords.x][gridCoords.y]) {
                    return;
                }
                // avoid diagonals
                var dx = points[points.length-1].x - gridCoords.x;
                var dy = points[points.length-1].y - gridCoords.y;
                if (dx && dy) {
                    return;
                }
                // check for dots at the new coordinates
                var dot = this.levelData[gridCoords.x][gridCoords.y];
                if (dot && dot != currentLineId) {
                    return;
                }
                // have we moved too much?
                var invalid = false;
                if (Math.abs(dx) > 1) {
                    var signX = dx > 0? 1 : -1;
                    for (i = 1; i < Math.abs(dx) && !invalid; i++) {
                        invalid = this.levelData[gridCoords.x + signX * i][gridCoords.y] || gridLines[gridCoords.x + signX * i][gridCoords.y];
                    }
                    if (invalid) {
                        return;
                    }
                    else {
                        for (i = 1; i < Math.abs(dx); i++) {
                            points.push({x: gridCoords.x + signX * i, y: gridCoords.y});
                            gridLines[gridCoords.x + signX * i][gridCoords.y] = currentLineId;
                        }
                    }
                }
                else if (Math.abs(dy) > 1) {
                    var signY = dy > 0? 1 : -1;
                    for (i = 1; i < Math.abs(dy) && !invalid; i++) {
                        invalid = this.levelData[gridCoords.x][gridCoords.y + signY * i] || gridLines[gridCoords.x][gridCoords.y + signY * i];
                    }
                    if (invalid) {
                        return;
                    }
                    else {
                        for (i = 1; i < Math.abs(dy); i++) {
                            points.push({x: gridCoords.x, y: gridCoords.y + signY * i});
                            gridLines[gridCoords.x][gridCoords.y + signY * i] = currentLineId;
                        }
                    }
                }
                // all good, let's add a new point
                points.push(gridCoords);
                gridLines[gridCoords.x][gridCoords.y] = currentLineId;
                lines[currentLineId].getSprite().setDirtyArea();

                // did we just make a connection?
                if (dot == currentLineId) {
                    lines[currentLineId].connected  = true;
                    currentLineId = 0;
                    // do we have all the connections that we need?
                    for (i=1; i < lines.length; i++) {
                        if (!lines[i].connected) {
                            return;
                        }
                    }
                    // go back to the main menu after 1 second
                    setTimeout(function() {
                        wade.clearScene();
                        wade.stop();
                        $('.popup').trigger('flowGameFinished');
                    }, 1000);
                }
            }
        };
    };
    return App;
});