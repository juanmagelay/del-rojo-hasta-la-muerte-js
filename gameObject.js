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
        this.velocity = { x: Math.random() * 10, y: Math.random() * 10 };
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

    bounce() {
    //Real example
        if (this.position.x > this.game.width || this.position.x < 0) {
            //If the X position of this bunny is > stage width (going out through right side),
            //or if the X position of this bunny is < 0 (going out through left side)
            //Multiply by -0.99, the sign is inverted (+ to - and inverse).
            //And the 0.99 get lose 1% velocity.
            this.velocity.x *= -0.99;
        }

        if (this.position.y > this.game.height || this.position.y < 0) {
            this.velocity.y *= -0.99;
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

        this.acceleration.x += difX;
        this.acceleration.y += difY;
    }

    flee() {
        if (!this.persecutor) return;
        const dist = calculateDistance(this.position, this.persecutor.position);
        if (dist > this.vision) return;

        const difX = this.persecutor.position.x - this.position.x;
        const difY = this.persecutor.position.y - this.position.y;

        this.acceleration.x += -difX;
        this.acceleration.y += -difY;
    }

    assignVelocity(x, y) {
        this.velocity.x = x;
        this.velocity.y = y;
    }

    render() {
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
    }

}