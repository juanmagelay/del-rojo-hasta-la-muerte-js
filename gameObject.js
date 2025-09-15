class GameObject {
    //Properties
    sprite;
    id;
    x = 0;
    y = 0;
    target;
    persecutor;
    maxAcceleration = 0.2;
    maxVelocity = 3;
    
    //Constructor
    constructor ( bunnyTexture, x, y, game ) {
        //Save a reference to the game instance.
        this.game = game;
        
        //Vision and vectors
        this.vision = Math.random() * 200 + 300;
        this.position = { x: x, y: y };
        this.velocity = { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 };
        this.acceleration = { x: 0, y: 0 };

        //Generate a character ID
        this.id = Math.floor(Math.random() * 99999999);

        //Take the bunnyTexture as a parameter and create a sprite.
        this.sprite = new PIXI.Sprite(bunnyTexture);
        
        //Assign position to the sprite.
        this.sprite.x = x;
        this.sprite.y = y;

        //Set an anchor point in center of the sprite.
        this.sprite.anchor.set(0.5);

        //Add the sprite to the stage.
        //this.game is a reference to the Game class instance.
        //The Game has a property called pixiApp, that's the Pixi App.
        //This app has the stage. The Pixi stage has a method to add chilren.
        //The stage is a kind of container or node.
        this.game.pixiApp.stage.addChild(this.sprite);
    }

    //Tick
    tick() {
        //This method tick is executed in every frame.
        
        //Acceleration
        this.acceleration.x = 0;
        this.acceleration.y = 0;

        this.flee(); //escapar
        this.chase(); //perseguir
        this.wander(); // wander randomly if no strong behavior
        this.limitAcceleration();
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;

        //Velocity variations
        this.bounce(); //rebotar
        this.applyFriction();
        this.limitVelocity();

        //Pixels per frame
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        //Save the angle
        this.angle = radiansToDegrees(
            Math.atan2(this.velocity.y, this.velocity.x) //This is backguards y, x
        );
        
        // Debug: Log if bunny is moving
        if (Math.abs(this.velocity.x) > 0.01 || Math.abs(this.velocity.y) > 0.01) {
          // Bunny is moving
        } else {
          // Bunny is not moving - this might indicate a problem
        }
    }

    
    //Functions
    
    limitAcceleration() {
        this.acceleration = limitVector(this.acceleration, this.maxAcceleration);
    }

    limitVelocity() {
        this.velocity = limitVector(this.velocity, this.maxVelocity);
    }

    applyFriction() {
        this.velocity.x *= 0.95;
        this.velocity.y *= 0.95;
    }


    //If the X position of this bunny is > stage width (going out through right side),
    //or if the X position of this bunny is < 0 (going out through left side)
    //Multiply by -0.99, the sign is inverted (+ to - and inverse).
    //And the 0.99 get lose 1% velocity.
    bounce() {
        // Use stadium-stands bounds (playArea)
        const left = this.game.playArea.x;
        const right = this.game.playArea.x + this.game.playArea.width;
        const top = this.game.playArea.y;
        const bottom = this.game.playArea.y + this.game.playArea.height;

        if (this.position.x > right || this.position.x < left) {
            this.velocity.x *= -0.99;
            this.position.x = Math.min(Math.max(this.position.x, left), right);
        }

        if (this.position.y > bottom || this.position.y < top) {
            this.velocity.y *= -0.99;
            this.position.y = Math.min(Math.max(this.position.y, top), bottom);
        }
    }

    assignTarget( who ) {
        this.target = who;
    }

    chase() {
        if (!this.target) return;
        const dist = calculateDistance(this.position, this.target.position);
        if (dist > this.vision) return;

        const difX = this.target.position.x - this.position.x;
        const difY = this.target.position.y - this.position.y;

        // Normalize the direction and apply acceleration
        const magnitude = Math.sqrt(difX * difX + difY * difY);
        if (magnitude > 0) {
          this.acceleration.x += (difX / magnitude) * 0.1;
          this.acceleration.y += (difY / magnitude) * 0.1;
        }
    }

    flee() {
        if (!this.persecutor) return;
        const dist = calculateDistance(this.position, this.persecutor.position);
        if (dist > this.vision) return;

        const difX = this.persecutor.position.x - this.position.x;
        const difY = this.persecutor.position.y - this.position.y;

        // Normalize the direction and apply acceleration (opposite direction)
        const magnitude = Math.sqrt(difX * difX + difY * difY);
        if (magnitude > 0) {
          this.acceleration.x += (-difX / magnitude) * 0.1;
          this.acceleration.y += (-difY / magnitude) * 0.1;
        }
    }

    assignVelocity(x, y) {
        this.velocity.x = x;
        this.velocity.y = y;
    }

    wander() {
        // Add small random acceleration to keep bunnies moving
        if (Math.abs(this.acceleration.x) < 0.01 && Math.abs(this.acceleration.y) < 0.01) {
          this.acceleration.x += (Math.random() - 0.5) * 0.05;
          this.acceleration.y += (Math.random() - 0.5) * 0.05;
        }
    }

    render() {
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
    }

}