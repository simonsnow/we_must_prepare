var resouceLookupTable = [];

function resourceClass(max, carried) {
    this.max = max;
    this.carried = carried;

    this.makeEmpty = function() {
        this.carried = 0;
    }
}

function depositResources(fromContainer, toContainer, quantity) {
    if (typeof quantity === "undefined") {
        if (fromContainer.carried + toContainer.carried <= toContainer.max) {
            toContainer.carried += fromContainer.carried;
            fromContainer.makeEmpty();
        } else {
            fromContainer.carried = fromContainer.carried + toContainer.carried - toContainer.max;
            toContainer.carried = toContainer.max;
        }
    } else {
        var itemsToTransfer = quantity;
        if (fromContainer.carried < quantity) {
            itemsToTransfer = fromContainer.carried;
        }
        if (toContainer.carried + itemsToTransfer > toContainer.max) {
            itemsToTransfer = toContainer.max - toContainer.carried;
        }
        fromContainer.carried -= itemsToTransfer;
        toContainer.carried += itemsToTransfer;
    }
}

function setupBuckets() {
    for(var i=0; i<roomGrid.length; i++) {
        var resourceType = '';
        var resourceQuantity = 0;
        switch (roomGrid[i]) {
            case TILE_METAL_SRC:
                resourceType = "Metal";
                resourceQuantity = 40;
                break;
            case TILE_STONE_SRC:
                resourceType = "Stone";
                resourceQuantity = 20;
                break;
            case TILE_WOOD_SRC:
                resourceType = "Wood";
                resourceQuantity = 10;
                break;
            default:
                break;
        }
        if (resourceType != '') {
            resouceLookupTable[i] = [];
            resouceLookupTable[i][resourceType] = new resourceClass(resourceQuantity, resourceQuantity);
            console.log("Added in " + resourceType);
        }

      } // end of for
}

function getResourceFromIndex(index, oncePerClick, playerBucket) {
    if (oncePerClick) {
        if (mouseClickedThisFrame == false) {
            return;
        }
    }
    if (typeof resouceLookupTable[index] === "undefined") {
      console.log("No resource bucket exists.");
    } else {
      for (var key in resouceLookupTable[index]) {
        console.log("Found a bucket of " + key + " with count of " + resouceLookupTable[index][key].carried);
        depositResources(resouceLookupTable[index][key], playerBucket[key], 1);
        if (resouceLookupTable[index][key].carried == 0) {
            roomGrid[index] = TILE_GROUND;
        }
      }
    }
  }
