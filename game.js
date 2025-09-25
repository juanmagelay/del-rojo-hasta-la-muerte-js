class Game {
  pixiApp;
  characters = []; // we keep the name for minimal changes
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
    const enemySheet = await PIXI.Assets.load("spritesheets/independiente.json");
    const heroSheet  = await PIXI.Assets.load("spritesheets/boca.json");

    //Load each animation as an array of textures
    const makeSpritesheetData = (sheet) => ({
        animations: {
            walk: sheet.animations.walk,
            back: sheet.animations.back,
            front: sheet.animations.front,
            idle: sheet.animations.idle
        }
    });

    //Prepare spritesheet
    const enemySheetData = makeSpritesheetData(enemySheet);
    const heroSheetData = makeSpritesheetData(heroSheet);

    // Create hero
    const hx = this.playArea.x + this.playArea.width * 0.5;
    const hy = this.playArea.y + this.playArea.height * 0.5;
    const hero = new Hero(heroSheetData, hx, hy, this);
    this.characters.push(hero);

    // Create enemies
    for ( let i = 0; i < 80; i++ ) {
      const x = this.playArea.x + Math.random() * this.playArea.width;
      const y = this.playArea.y + Math.random() * this.playArea.height;
      const enemy = new Enemy(enemySheetData, x, y, this);
      enemy.target = hero;
      this.characters.push(enemy);
    }

    //Add the method this.gameLoop to the ticker.
    //In each frame we are executing the this.gameLoop method.
    this.pixiApp.ticker.add(this.gameLoop.bind(this));
    
    // Hero attaches its own input listeners; mouse move listener optional
  }

  //Functions

  addMouseInteractivity() {
    // Listen to mouse move event
    this.pixiApp.canvas.onmousemove = (event) => {
      this.mouse.position = { x: event.x, y: event.y };
    };
  }

  gameLoop( time ) {
    //Iterate for each of the characters.
    for (let aCharacter of this.characters) {
        //Execute the tick method of each character.
        aCharacter.tick();
        aCharacter.render();
        
        // Debug: Log character movement
        if (Math.floor(time) % 60 === 0) { // Log every second
          console.log(`Character ${aCharacter.id}: pos(${Math.round(aCharacter.position.x)}, ${Math.round(aCharacter.position.y)}) vel(${Math.round(aCharacter.velocity.x*100)/100}, ${Math.round(aCharacter.velocity.y*100)/100})`);
        }
    }
  }

  getCharacterRandom() {
    return this.characters[Math.floor(this.characters.length * Math.random())];
  }

  assignTargets() {
    for (let char of this.characters) {
      char.assignTarget(this.getCharacterRandom());
    }
  }

  assignRandomPersecutorForAllCharacters() {
    for (let char of this.characters) {
      char.persecutor = this.getCharacterRandom();
    }
  }
}
