class Game {
  pixiApp;
  bunnies = []; // we keep the name for minimal changes
  width;
  height;

  constructor() {
    // Logical spaces inside the fixed background (1280 x 720)
    this.playArea = { x: 0, y: 0, width: 1004, height: 720 };   // stadium-stands (left)
    this.grassArea = { x: 1004, y: 0, width: 276, height: 720 }; // stadium-grass (right)

    // Single canvas covers 1280 x 720 (exact background size)
    this.width = 1280;
    this.height = 720;
    this.mouse = { position: { x: 0, y: 0 } };
    this.initPIXI();    
  }

  //Async method. It can use "await".
  async initPIXI() {
    
    //Create pixiApp and store it into pixiApp property.
    this.pixiApp = new PIXI.Application();

    const pixiOptions = { 
        background: "#1099bb", 
        width: this.width, 
        height: this.height,
        antialias: false,
        SCALE_MODE: PIXI.SCALE_MODES.NEAREST // pixelated rendering
    };
    
    //Init pixiApp with options declared before.
    //Await tells that the code is in pause until pixiApp init method has finished.
    //2ms., 400mx. (...) I don't know how much time.
    await this.pixiApp.init( pixiOptions );

    //Add canvas element created by Pixi into the HTML document
    document.body.appendChild( this.pixiApp.canvas );

    //Load the background
    const bgTexture = await PIXI.Assets.load( "stadium.png" );
    const background = new PIXI.Sprite( bgTexture );
    background.x = 0;
    background.y = 0;
    background.width = this.width;
    background.height = this.height;

    // Load the background first (to be behind NPCs)
    this.pixiApp.stage.addChild( background );
    
    //Load spritesheet JSON
    const spritesheetData = await PIXI.Assets.load("spritesheets/independiente.json");

    //Create instances of bunny class
    for ( let i = 0; i < 100; i++ ) {
      const x = this.playArea.x + Math.random() * this.playArea.width;
      const y = this.playArea.y + Math.random() * this.playArea.height;

      //Create an instance of Game Object with spritesheetData
      //Use x, y and a reference to the game instance (this)
      const independienteGuy = new GameObject(spritesheetData, x, y, this);
      this.bunnies.push( independienteGuy );
    }

    // Assign targets and persecutors to make bunnies move
    this.assignTargets();
    this.assignRandomPersecutorForAllBunnies();
    
    // Debug: Log bunny setup
    console.log(`Created ${this.bunnies.length} game objects`);
    for (let bunny of this.bunnies) {
      console.log(`Object ${obj.id}: target=${obj.target ? obj.target.id || 'mouse' : 'none'}, persecutor=${obj.persecutor ? obj.persecutor.id || 'mouse' : 'none'}`);
    }

    //Add the method this.gameLoop to the ticker.
    //In each frame we are executing the this.gameLoop method.
    this.pixiApp.ticker.add(this.gameLoop.bind(this));
    
    this.addMouseInteractivity();
  }

  //Functions

  addMouseInteractivity() {
    // Listen to mouse move event
    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.position = { x: event.x, y: event.y };
    };
  }

  gameLoop( time ) {
    //Iterate for each of the bunnies.
    for (let aObj of this.bunnies) {
        //Execute the tick method of each bunny.
        aObj.tick();
        aObj.render();
        
        // Debug: Log bunny movement
        if (Math.floor(time) % 60 === 0) { // Log every second
          console.log(`Obj ${aObj.id}: pos(${Math.round(aObj.position.x)}, ${Math.round(aObj.position.y)}) vel(${Math.round(aObj.velocity.x*100)/100}, ${Math.round(aObj.velocity.y*100)/100})`);
        }
    }
  }

  getBunnyRandom() {
    return this.bunnies[Math.floor(this.bunnies.length * Math.random())];
  }

  assignTargets() {
    for (let bun of this.bunnies) {
      bun.assignTarget(this.getBunnyRandom());
    }
  }

  assignMouseAsTargetForAllBunnies() {
    for (let bun of this.bunnies) {
      bun.assignTarget(this.mouse);
    }
  }

  assignRandomPersecutorForAllBunnies() {
    for (let bun of this.bunnies) {
      bun.persecutor = this.getBunnyRandom();
    }
  }

  assignMouseAsPersecutorForAllBunnies() {
    for (let bun of this.bunnies) {
      bun.persecutor = this.mouse;
    }
  }
}
