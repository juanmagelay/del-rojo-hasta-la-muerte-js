class GameObject {
    //Properties
    id;
    position = { x: 0, y: 0 };
    velocity = { x: 0, y: 0 };
    acceleration = { x: 0, y: 0 };
    vision;
    target;
    persecutor;
    maxAcceleration = 0.2;
    maxVelocity = 3;

    //Animation & display
    container;                 // PIXI.Container that holds the animated sprites
    spritesAnimated = {};      // { walk: AnimatedSprite, back: ..., front: ..., idle: ... }
    currentAnimation = null;
    spritesheetData = null;
    
    //Constructor
    constructor ( spritesheetData, x, y, game ) {
        //Save a reference to the game instance.
        this.game = game;
        
        //Save a reference to the spritesheet data
        this.spritesheetData = spritesheetData;

        //Container
        this.container = new PIXI.Container();
        this.container.name = "container";
        
        //Vision and vectors
        this.vision = Math.random() * 200 + 300;
        this.position = { x: x, y: y };
        this.velocity = { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 };
        this.acceleration = { x: 0, y: 0 };

        //Generate a character ID
        this.id = Math.floor(Math.random() * 99999999);

        // Build an AnimatedSprite for each animation defined in the JSON
        // spritesheetData.animations is an object: { idle: [...], walk:[...], ... }
        for (let key of Object.keys(this.spritesheetData.animations)) {
            // PIXI.Assets.load provides ready textures arrays for animations in many setups,
            // so we pass the array directly to AnimatedSprite (this matches Pixi usage).
            const textures = this.spritesheetData.animations[key];
            const anim = new PIXI.AnimatedSprite(textures);
            anim.anchor.set(0.5, 1);      // center-bottom anchor (adjust if you prefer center)
            anim.animationSpeed = 0.12;
            anim.loop = true;
            anim.scale.set(2);           // scale up for visibility — change if too big
            anim.visible = false;        // we'll show the chosen one
            anim.play();                 // keep it playing (visible will control if it's shown)
            this.spritesAnimated[key] = anim;
            this.container.addChild(anim);
        }

        // Add container to stage (same as before when you added a single sprite)
        this.game.pixiApp.stage.addChild(this.container);
        
        // Start with "idle" if available, otherwise the first animation
        if (this.spritesAnimated.idle) this.changeAnimation("idle");
        else {
            const first = Object.keys(this.spritesAnimated)[0];
            if (first) this.changeAnimation(first);
        }
    }

    //Switch animation (keeps previous visible states off)
    changeAnimation(name) {
        if (this.currentAnimation === name) return;

        if (!this.spritesAnimated[name]) {
          console.warn("Unknown animation:", name);
          return;
        }

        for (let k of Object.keys(this.spritesAnimated)) {
          this.spritesAnimated[k].visible = false;
          this.spritesAnimated[k].stop();
        }

        const chosen = this.spritesAnimated[name];
        chosen.visible = true;
        chosen.play();
        this.currentAnimation = name;
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

        // integrate
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
        
        // Update animation based on movement direction
        this.velocityMagnitude = Math.sqrt(
            this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y
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


    // Constrain movement to stadium-stands (playArea)
    // Bounce off the boundaries of the play area
    //Multiply by -0.99, the sign is inverted (+ to - and inverse).
    //And the 0.99 get lose 1% velocity.
    bounce() {
        // Constrain to stadium-stands (playArea)
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
        if ( !this.target ) return;
        
        // mouse targets come in as { position: {x,y} }
        const targetPos = this.target.position ? this.target.position : this.target;
        const dist = calculateDistance(this.position, targetPos);
        if ( dist > this.vision ) return;

        const difX = targetPos.x - this.position.x;
        const difY = targetPos.y - this.position.y;

        // Normalize the direction and apply acceleration
        const magnitude = Math.sqrt(difX * difX + difY * difY);
        
        if ( magnitude > 0 ) {
          this.acceleration.x += (difX / magnitude) * 0.1;
          this.acceleration.y += (difY / magnitude) * 0.1;
        }
    }

    flee() {
        if ( !this.persecutor ) return;
        
        const pursPos = this.persecutor.position ? this.persecutor.position : this.persecutor;
        const dist = calculateDistance(this.position, pursPos);
        if ( dist > this.vision ) return;

        const difX = pursPos.x - this.position.x;
        const difY = pursPos.y - this.position.y;

        // Normalize the direction and apply acceleration (opposite direction)
        const magnitude = Math.sqrt(difX * difX + difY * difY);
        if ( magnitude > 0 ) {
          this.acceleration.x += (-difX / magnitude) * 0.1;
          this.acceleration.y += (-difY / magnitude) * 0.1;
        }
    }

    assignVelocity(x, y) {
        this.velocity.x = x;
        this.velocity.y = y;
    }

    wander() {     
      // Add small random acceleration to keep characters moving        
      if (Math.abs(this.acceleration.x) < 0.01 && Math.abs(this.acceleration.y) < 0.01) {
        this.acceleration.x += (Math.random() - 0.5) * 0.05;
        this.acceleration.y += (Math.random() - 0.5) * 0.05;
      }
    }

    render() {
        // move container to current position
        this.container.x = this.position.x;
        this.container.y = this.position.y;

        // z-order
        this.container.zIndex = Math.round(this.position.y);

        // Decide which animation should play based on velocity and angle
        this._updateAnimationBasedOnMovement();

        // Update animation speed to reflect velocity
        this._updateAnimationSpeed();
    }

    _updateAnimationBasedOnMovement() {
    const speed = this.velocityMagnitude || 0;
    const threshold = 0.2; // below this, we consider the object idle

    if (speed < threshold) {
      // idle
      if (this.spritesAnimated.idle) this.changeAnimation("idle");
      return;
    }

    // angle is degrees from Math.atan2(y, x)
    const a = this.angle;

    // Down on screen is positive Y (canvas coords), so:
    // - moving down (front): angle between 45 and 135
    // - moving up (back): angle between -135 and -45
    // - otherwise: horizontal -> use walk (flip X to mirror)
    if ( a > 45 && a < 135 ) {
      if ( this.spritesAnimated.front ) this.changeAnimation("front");
    } else if (a < -45 && a > -135) {
      if ( this.spritesAnimated.back ) this.changeAnimation("back");
    } else {
      // horizontal-ish
      if ( this.spritesAnimated.walk ) this.changeAnimation("walk");
      // flip horizontally if going left
      const spriteForWalk = this.spritesAnimated.walk;
      if ( spriteForWalk ) {
        spriteForWalk.scale.x = (this.velocity.x < 0) ? -Math.abs(spriteForWalk.scale.x) : Math.abs(spriteForWalk.scale.x);
      }
    }
  }

  _updateAnimationSpeed() {
    // Linearly increase animation speed with velocity (tweak constants to taste)
    const base = 0.08;
    const factor = 0.06;
    const speed = this.velocityMagnitude || 0;
    const newSpeed = base + speed * factor;

    for (let k of Object.keys(this.spritesAnimated)) {
      this.spritesAnimated[k].animationSpeed = newSpeed;
    }
  }

}