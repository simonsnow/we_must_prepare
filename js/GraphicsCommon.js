function colorRect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor) {
    canvasContext.fillStyle = fillColor;
    canvasContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
}

function colorCircle(centerX, centerY, radius, fillColor) {
    canvasContext.fillStyle = fillColor;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    canvasContext.fill();
}

function outlineCircle(centerX, centerY, radius, strokeColor) {
    canvasContext.strokeStyle = strokeColor;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    canvasContext.setLineDash([]);
    canvasContext.stroke();
}

function drawBitmapCenteredAtLocationWithRotation(graphic, atX, atY, withAngle = 0) {
    canvasContext.save(); // allows us to undo translate movement and rotate spin
    canvasContext.translate(atX, atY); // sets the point where our graphic will go
    canvasContext.rotate(withAngle); // sets the rotation
    canvasContext.drawImage(graphic, -graphic.width / 2, -graphic.height / 2); // center, draw
    canvasContext.restore(); // undo the translation movement and rotation since save()
}

function coloredOutlineRectCornerToCorner(corner1X, corner1Y, corner2X, corner2Y, lineColor) {
    canvasContext.strokeStyle = lineColor;
    canvasContext.beginPath();
    canvasContext.rect(corner1X, corner1Y, corner2X - corner1X, corner2Y - corner1Y);
    canvasContext.stroke();
}

function colorText(text, textLineX, textLineY, color) {
    canvasContext.fillStyle = color;
    canvasContext.fillText(text, textLineX, textLineY);
}

function SpriteClass(imageIn, widthIn, heightIn){
    var image = imageIn;
    var width = widthIn;
    var height = heightIn;
    
    //These save division operations when drawing to increase performance at the cost of memory
    var halfWidth = width/2;
    var halfHeight = height/2;
    
    this.draw = function(atX, atY){
        canvasContext.drawImage(image, atX - halfWidth, atY - halfHeight);
    };
    
    this.drawExtended = function(atX, atY, withAngle = 0, flipped = false, scale = 1, alpha = 1){
        canvasContext.save();
        
        canvasContext.translate(atX, atY);
        canvasContext.rotate(withAngle);
        canvasContext.scale(flipped ? -scale : scale, scale);
        canvasContext.globalAlpha = alpha;
        
        canvasContext.drawImage(image, -halfWidth, -halfHeight);
        
        canvasContext.restore();
    };
    
    this.getDimensions = function(){
        return {width:width, height:height};
    };
}

function SpriteSheetClass(sheetIn, colWidth, rowHeight) {
    var sheet = sheetIn;
    var width = colWidth;
    var height = rowHeight;
    
    //These save division operations when drawing to increase performance at the cost of memory
    var halfWidth = width/2;
    var halfHeight = height/2;
    
    this.draw = function(atX, atY, col, row){
        canvasContext.drawImage(sheet,
                                col * width, row * height,
                                width, height,
                                atX - halfWidth, atY - halfHeight,
                                width, height);
    };

    this.drawExtended = function(atX, atY, row, col, withAngle = 0, flipped = false, scale = 1, alpha = 1){
        canvasContext.save();
        
        canvasContext.translate(atX, atY);
        canvasContext.rotate(withAngle);
        canvasContext.scale(flipped ? -scale : scale, scale);
        canvasContext.globalAlpha = alpha;
        
        canvasContext.drawImage(sheet,
                                col * width, row * height,
                                width, height,
                                -halfWidth, -halfHeight,
                                width, height);
        
        canvasContext.restore();
    };
    
    this.getDimensions = function(){
        return {width:width, height:height};
    };
}

function AnimationClass(sheetIn, colWidth, rowHeight, sheetInFrames, animationInRowIndex, frameTickRate,looping) {
    var spriteSheet = new SpriteSheetClass(sheetIn, colWidth, rowHeight);
    var numberOfFrames = sheetInFrames;
    var animationIndex = 0; 
    var tickCount = 0;
    var ticksPerFrame = frameTickRate;
    var loop = looping;
    var rowIndex = animationInRowIndex;
    
    this.draw = function(atX, atY){
        spriteSheet.draw(atX, atY, animationIndex, rowIndex);
    };

    this.update = function() {
        tickCount++;
        if (tickCount > ticksPerFrame) {
            tickCount = 0;
            // if the current frame index is in range
            if (animationIndex < numberOfFrames - 1) {
                animationIndex++; // go to the next frame
            } else if (loop) {
                animationIndex = 0;
            }
        }
    };
    
    this.drawExtended = function(atX, atY, withAngle = 0, flipped = false, scale = 1, alpha = 1){
        spriteSheet.draw(atX, atY, animationIndex, rowIndex, withAngle, flipped, scale, alpha);
    };
    
    this.getDimensions = function(){
        return spriteSheet.getDimensions();
    };
    
    this.getCurrentFrame = function(){
        return animationIndex;
    };

    this.getNumberOfFrames = function() {
        return numberOfFrames;
    };
}
