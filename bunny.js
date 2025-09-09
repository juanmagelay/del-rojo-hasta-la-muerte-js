class Bunny {
  //Define the class properties, but I could not define them.
  sprite;
  id;

  constructor( bunnyTexture, x, y, game) {
    
    //Save a reference to the game instance.
    this.game = game;
    
    //Generate a bunny ID
    this.id = Math.floor(Math.random() * 99999999);

    //Take the bunnyTexture as a parameter and create a sprite.
    this.sprite = new PIXI.Sprite(bunnyTexture);
    
    //Assign position to the sprite.
    this.sprite.x = x;
    this.sprite.y = y;

    //Set an anchor point in center of the sprite.
    this.sprite.anchor.set(0.5);

    //Velocity random between 0 and 1
    this.velocityX = Math.random() * 1;
    this.velocityY = Math.random() * 1;

    //Add the sprite to the stage.
    //this.game is a reference to the Game class instance.
    //The Game has a property called pixiApp, that's the Pixi App.
    //This app has the stage. The Pixi stage has a method to add chilren.
    //The stage is a kind of container or node.
    this.game.pixiApp.stage.addChild(this.sprite);
  }

  getOtherBunnies() {
    return this.juego.bunnies;
  }

  tick() {
    //This method tick is executed in every frame.
    
    //Each time a bunny touch a border of the screen, it bounces, with a new velocity.
    //But to the opposite side from which it came.

    // if (this.sprite.x > this.game.width) {
    //   this.velocityX = -Math.random();
    // }

    // if (this.sprite.y > this.game.height) {
    //   this.velocityY = -Math.random();
    // }

    // if (this.sprite.x < 0) {
    //   this.velocityX = Math.random();
    // }

    // if (this.sprite.y < 0) {
    //   this.velocityY = Math.random();
    // }

    //Real example
    if (this.sprite.x > this.game.width || this.sprite.x < 0) {
      //If the X position of this bunny is > stage width (going out through right side),
      //or if the X position of this bunny is < 0 (going out through left side)
      //Multiply by -0.99, the sign is inverted (+ to - and inverse).
      //And the 0.99 get lose 1% velocity.
      this.velocityX *= -0.99;
    }

    if (this.sprite.y > this.game.height || this.sprite.y < 0) {
      this.velocityY *= -0.99;
    }

    //Pixels per frame
    this.sprite.x += this.velocityX;
    this.sprite.y += this.velocityY;
  }
}