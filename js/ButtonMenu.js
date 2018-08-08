var buttonColor = "lightgray";
var buttonColorPressed = "gray"

function buttonMenuUI(name, topLeftX, topLeftY, bottomRightX, bottomRightY) {
    this.x = topLeftX;
    this.y = topLeftY;
    this.width = bottomRightX - topLeftX;
    this.height = bottomRightY - topLeftY;
    this.name = name;
    this.isVisible = true;

    this.buttons = [];
    
    this.leftMouseClick = function(x=mouseX, y=mouseY) {
        if(this.isVisible && isInPane(this, x, y)) {
            //checks for *first* button in array that mouse can click
            for(var i=0; i < this.buttons.length; i++) {
                var button = this.buttons[i];
                return button.leftMouseClick(x, y);
            }
        }
        return false;
    };
    
    this.draw = function() {
        if(this.isVisible) {
            drawUIPaneBackground(this);

            //draw buttons
            for(var i=0; i < this.buttons.length; i++) {
                var button = this.buttons[i];
                button.draw();
            }
        }
        //TODO remove this text (just for testing)
        var str = "-- Press Esc To Toggle MainMenu --";
        var strWidth = canvasContext.measureText(str).width;
        colorText(str, (canvas.width-strWidth) * 0.5, canvas.height-40, "black");
    };
    
    // this menu needs to be updated every frame 
    this.update = function(x=mouseX, y=mouseY) {
        for(var i=0; i < this.buttons.length; i++) {
            var button = this.buttons[i];
            button.mouseOver(x, y);
        }
    };

    this.push = function(button) {
        this.buttons.push(button);
    };
}

function buttonUI(name, topLeftX, topLeftY, bottomRightX, bottomRightY) {
    this.x = topLeftX;
    this.y = topLeftY;
    this.width = bottomRightX - topLeftX;
    this.height = bottomRightY - topLeftY;
    this.name = name;
    this.isVisible = true;

    this.isPressed = false;
    
    //TODO I think this is ok in javascript with varable scope
    this.leftMouseClick = function(x=mouseX, y=mouseY) {
        if(isInPane(this, x, y)) {
            this.isPressed = true;
        }
    };
    
    this.mouseOver = function(x=mouseX, y=mouseY) {
        if (!mouseHeld && isInPane(this, x, y)) {
            //mouse released while inside pane
            if(this.isPressed) {
                this.action();
            }
            this.isPressed = false;
        } else if (!isInPane(this, x, y)) {
            this.isPressed = false;
        }
    };

    // This function will be called when button is triggered
    this.action = function() {
        // assign custom function to do something
    };
    
    this.draw = function() {
        if(this.isVisible) {
            var drawColor;
            drawColor = (this.isPressed) ? buttonColorPressed : buttonColor;
            colorRect(this.x, this.y, this.width, this.height, drawColor);

            var str = this.name;
            var strWidth = canvasContext.measureText(this.name).width;
            //center text
            var textX = this.x + (this.width*0.5) - (strWidth*0.5);
            //TODO magic numbers going here.
            var textY = this.y + (this.height*0.5) + 4;
            colorText(str, textX, textY, "black");
        }
    };
}