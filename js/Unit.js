const UNIT_PLACEHOLDER_RADIUS = 5;
const UNIT_PIXELS_MOVE_RATE = 2;
const UNIT_MAX_RAND_DIST_FROM_WALK_TARGET = 50;
const UNIT_SELECTED_DIM_HALF = UNIT_PLACEHOLDER_RADIUS + 3;

function playerClass() {
    this.isWalking = false;
    this.bucketList = [];
    this.storageList = [];
    this.x = 0;
    this.y = 0;

    this.keyHeld_West = false;
    this.keyHeld_North = false;
    this.keyHeld_South = false;
    this.keyHeld_East = false;

    this.isUnitFacingNorth = false;
    this.isUnitFacingSouth = false;
    this.isUnitFacingWest = false;
    this.isUnitFacingEast = false;

    this.controlKeyLeft;
    this.controlKeyUp;
    this.controlKeyDown;
    this.controlKeyRight;

    this.controlKeyLeft2;
    this.controlKeyUp2;
    this.controlKeyDown2;
    this.controlKeyRight2;
    
    let walkIntoTileIndex = -1;
    let walkIntoTileType = TILE_WALL;

    this.setupInput = function (leftKey,upKey,downKey,rightKey, leftKey2,upKey2,downKey2,rightKey2)
    {
        //next four lines set a,w,s,d
        this.controlKeyLeft = leftKey;
        this.controlKeyUp = upKey;
        this.controlKeyDown = downKey;
        this.controlKeyRight = rightKey;

        //these four set left, up, down, right arrows
        this.controlKeyLeft2 = leftKey2;
        this.controlKeyUp2 = upKey2;
        this.controlKeyDown2 = downKey2;
        this.controlKeyRight2 = rightKey2;
    }

    this.reset = function() {
        if(this.homeX == undefined) {
            for(var i=0; i<roomGrid.length; i++) {
              if( roomGrid[i] == TILE_PLAYER) {
                var tileRow = Math.floor(i / ROOM_COLS);
                var tileCol = i % ROOM_COLS;
                this.homeX = tileCol * TILE_W + 0.5 * TILE_W;
                this.homeY = tileRow * TILE_H + 0.5 * TILE_H;
                roomGrid[i] = TILE_GROUND;
                break; // found it, so no need to keep searching 
              } // end of if
            } // end of for
          } // end of if position not saved yet
        
        this.unitColor = 'white';
        this.x = this.homeX;
        this.y = this.homeY;
        this.gotoX = this.x;
        this.gotoY = this.y;
        
        this.myTarget = null;
        
        this.bucketList = [];
        this.bucketList[Resources.Metal] = new resourceClass(1000, 0);
        this.bucketList[Resources.Stone] = new resourceClass(1000, 0);
        this.bucketList[Resources.Wood] = new resourceClass(1000, 0);

        this.storageList = [];
        this.storageList[Resources.Metal] = new resourceClass(50, 0);
        this.storageList[Resources.Stone] = new resourceClass(50, 0);
        this.storageList[Resources.Wood] = new resourceClass(50, 0);

    }  // end reset

    this.drawPlayerHUD = function() {
        canvasContext.fillStyle = 'white';
        var textLineY = 15, textLineSkip = 15, textLineX = 30;
				var i = 1;
        for (var key in this.bucketList) {
            canvasContext.fillText('Carried ' + key + ': ' + inventory.countItems(i), textLineX, textLineY);
            canvasContext.fillText('Stored ' + key + ': ' + 
            (typeof this.storageList[key] !== "undefined" ? this.storageList[key].carried : 0) + '/' + this.storageList[key].max, 
            textLineX * 4, textLineY); textLineY += textLineSkip;
						i++;
        }
    }

    this.draw = function() {
        canvasContext.drawImage(playerImage, this.x - playerImage.width / 2, this.y - playerImage.height); // coords at base of feet
    }

    this.drawShaded = function() {
        canvasContext.drawImage(playerImageShaded, this.x - playerImageShaded.width / 2, this.y - playerImage.height); // coords at base of feet
    }
    
    this.distFrom = function (otherX, otherY) {
        var deltaX = otherX - this.x;
        var deltaY = otherY - (this.y - playerImage.height / 2);
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    this.setTarget = function(newTarget) {
        this.myTarget = newTarget;
    }

    this.goto = function(destinationX, destinationY) {

        this.gotoX = destinationX;
        this.gotoY = destinationY;
    }
    
    this.collectResourcesIfAble = function() {
	    switch (walkIntoTileType) {
            case TILE_WALL:
                distToGo = 0;
                break;
            case TILE_FOOD_SRC:
                distToGo = 0;
                break;
            case TILE_METAL_SRC:
                getResourceFromIndex(walkIntoTileIndex, true, this.bucketList);
                inventory.add(items.metal, 1);
                break;
            case TILE_METAL_DEST:
                var temp = {carried: inventory.countItems(items.metal), makeEmpty: function(){}};
                inventory.remove(items.metal, inventory.countItems(items.metal));
                depositResources(temp, this.storageList[Resources.Metal]);
                break;
            case TILE_STONE_SRC:
                getResourceFromIndex(walkIntoTileIndex, true, this.bucketList);
                inventory.add(items.stone, 1);
                break;
            case TILE_STONE_DEST:
                var temp = {carried: inventory.countItems(items.stone), makeEmpty: function(){}};
                inventory.remove(items.stone, inventory.countItems(items.stone));
                depositResources(temp, this.storageList[Resources.Stone]);
                break;
            case TILE_WOOD_SRC:
                getResourceFromIndex(walkIntoTileIndex, true, this.bucketList);
                inventory.add(items.wood, 1);
                break;
            case TILE_WOOD_DEST:
                var temp = {carried: inventory.countItems(items.wood), makeEmpty: function(){}};
                inventory.remove(items.wood, inventory.countItems(items.wood));
                depositResources(temp, this.storageList[Resources.Wood]);
                break;
            default:
                break;
        }
    }

    this.move = function() {
        var nextX = this.x;
        var nextY = this.y;
      
        //Works but note that in order to pick up materials you need to keep moving into the material
        if (this.keyHeld_North) 
        {
            nextY -= UNIT_PIXELS_MOVE_RATE;
        }
        if (this.keyHeld_South) 
        {
            nextY += UNIT_PIXELS_MOVE_RATE;
        }
        if (this.keyHeld_West) 
        {
            nextX -= UNIT_PIXELS_MOVE_RATE;
        }
        if (this.keyHeld_East) 
        {
            nextX += UNIT_PIXELS_MOVE_RATE;
        }

        this.getDirectionPlayerIsCurrentlyFacing();

		if((nextX != this.x) || (nextY != this.y))
		{
			walkIntoTileIndex = getTileIndexAtPixelCoord(nextX, nextY);
	        walkIntoTileType = TILE_WALL;
	
	        if (walkIntoTileIndex != undefined) {
	            walkIntoTileType = roomGrid[walkIntoTileIndex];
	        }
	
	        if (isTileKindWalkable(walkIntoTileType)) 
	        {
	            this.x = nextX;
	            this.y = nextY;
	        }
	        else
	        {
	            console.log('Ran into a wall!');
	        }

		}//end if nextX & nextY
    } // end move

    this.getDirectionPlayerIsCurrentlyFacing = function() 
    {
        //next four if/else if statements set direction only for horizontal and vertical movement
        if (this.keyHeld_West && !this.keyHeld_North && !this.keyHeld_South) {
            this.isUnitFacingWest = true;

            //console.log("facing west");

            this.isUnitFacingEast = false;
            this.isUnitFacingSouth = false;
            this.isUnitFacingNorth = false;
        }
        else if (this.keyHeld_East && !this.keyHeld_North && !this.keyHeld_South) {
            this.isUnitFacingEast = true;

            //console.log("facing east");

            this.isUnitFacingWest = false;           
            this.isUnitFacingSouth = false;
            this.isUnitFacingNorth = false;
        }
        else if (this.keyHeld_North && !this.keyHeld_West && !this.keyHeld_East) {
            this.isUnitFacingNorth = true;

            //console.log("facing north");

            this.isUnitFacingWest = false;
            this.isUnitFacingEast = false;            
            this.isUnitFacingSouth = false;
        }
        else if (this.keyHeld_South && !this.keyHeld_West && !this.keyHeld_East) {
            this.isUnitFacingSouth = true;

            //console.log("facing south");

            this.isUnitFacingWest = false;
            this.isUnitFacingEast = false;
            this.isUnitFacingNorth = false;           
        }

        //these four else if statements set direction for diagonal movement rather than horizontal and vertical movement
        else if (this.keyHeld_North && this.keyHeld_East) {
            this.isUnitFacingNorth = true;
            this.isUnitFacingEast = true;

            //console.log("facing northeast");

            this.isUnitFacingWest = false;                        
            this.isUnitFacingSouth = false;
        }
        else if (this.keyHeld_North && this.keyHeld_West) {
            this.isUnitFacingNorth = true;
            this.isUnitFacingWest = true;

            //console.log("facing northwest");

            this.isUnitFacingEast = false;            
            this.isUnitFacingSouth = false;
        }
        else if (this.keyHeld_South && this.keyHeld_East) {
            this.isUnitFacingSouth = true;
            this.isUnitFacingEast = true;

            //console.log("facing southeast");

            this.isUnitFacingWest = false;            
            this.isUnitFacingNorth = false;            
        }
        else if (this.keyHeld_South && this.keyHeld_West) {
            this.isUnitFacingSouth = true;
            this.isUnitFacingWest = true;

            //console.log("facing southwest");

            this.isUnitFacingEast = false;
            this.isUnitFacingNorth = false;      
        }
    }

} // end unitClass