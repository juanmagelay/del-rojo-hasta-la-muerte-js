class GameObject {
    //Properties
    id;
    position = { x: 0, y: 0 };
    velocity = { x: 0, y: 0 };
    acceleration = { x: 0, y: 0 };
    maxAcceleration = 0.2;
    maxVelocity = 3;
    velocityMagnitude;

    //Animation & display
    container;                 // PIXI.Container that holds the animated sprites
    spritesAnimated = {};      // { walk: AnimatedSprite, back: ..., front: ..., idle: ... }
    currentAnimation = null;
    spritesheetData = null;
    angle;
    
    //Constructor
    constructor ( spritesheetData, x, y, game ) {
        //Save a reference to the game instance.
        this.game = game;
        
        //Save a reference to the spritesheet data
        this.spritesheetData = spritesheetData;

        //Container
        this.container = new PIXI.Container();
        this.container.name = "container";
        
        //Vectors
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

        // Add container to world container
        this.game.worldContainer.addChild(this.container);
        
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
        }

      this.spritesAnimated[name].visible = true;
      this.currentAnimation = name;
    }

    //Tick: This method tick is executed in every frame.
    tick() {
        //Acceleration
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        
        // Decide acceleration via subclass brain (IA or input)
        this.applyBrain();
        this.limitAcceleration();

        //Integrate with deltaTime
        this.velocity.x += this.acceleration.x * this.game.pixiApp.ticker.deltaTime;
        this.velocity.y += this.acceleration.y * this.game.pixiApp.ticker.deltaTime;

        //Velocity variations
        this.applyFriction();
        this.limitVelocity();

        //Pixels per frame with deltaTime
        this.position.x += this.velocity.x * this.game.pixiApp.ticker.deltaTime;
        this.position.y += this.velocity.y * this.game.pixiApp.ticker.deltaTime;

        //Save the angle to show the correct animation
        this.angle = radiansToDegrees(
            Math.atan2(this.velocity.y, this.velocity.x) //This is backguards y, x
        );
        
        // Update animation based on movement direction
        this.velocityMagnitude = Math.sqrt(
            this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y
        );

        //Bounds
        this._applyBounds();
    }

    // Hook for subclasses (Enemy/Hero) to set acceleration each frame
    applyBrain() {}

    
    //Functions
    
    limitAcceleration() {
        this.acceleration = limitVector(this.acceleration, this.maxAcceleration);
    }

    limitVelocity() {
        this.velocity = limitVector(this.velocity, this.maxVelocity);
    }

    applyFriction() {
      const friction = Math.pow(0.95, this.game.pixiApp.ticker.deltaTime);
      this.velocity.x *= friction;
      this.velocity.y *= friction;
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
      // Velocity of animation proportional to real velocity + deltaTime
      for (let k of Object.keys(this.spritesAnimated)) {
        this.spritesAnimated[k].animationSpeed = 
          this.velocityMagnitude * 0.05 * this.game.pixiApp.ticker.deltaTime;
      }
    }

    //Bounds
    _applyBounds() {
    // Verificar que tenemos acceso al juego y al área de juego
    if (!this.game || !this.game.playArea) return;
    
    // Obtener límites del área de juego (stadium-stands)
    const bounds = this.game.playArea; // { x: 0, y: 0, width: 1336, height: 1024 }
    
    // Limitar posición X entre 0 y 1336
    if (this.position.x < bounds.x) {
      this.position.x = bounds.x;
      if (this.velocity) this.velocity.x = 0;
    }
    if (this.position.x > bounds.x + bounds.width) {
      this.position.x = bounds.x + bounds.width;
      if (this.velocity) this.velocity.x = 0;
    }
    
    // Limitar posición Y entre 0 y 1024
    if (this.position.y < bounds.y) {
      this.position.y = bounds.y;
      if (this.velocity) this.velocity.y = 0;
    }
    if (this.position.y > bounds.y + bounds.height) {
      this.position.y = bounds.y + bounds.height;
      if (this.velocity) this.velocity.y = 0;
    }
  }
}