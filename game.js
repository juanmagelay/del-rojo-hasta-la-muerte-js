class Game {
  pixiApp;
  bunnies = [];
  width;
  height;

  //Ejemplo
  constructor() {
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
        height: this.height 
    };
    
    //Init pixiApp with options declared before.
    //Await tells that the code is in pause until pixiApp init method has finished.
    //2ms., 400mx. (...) I don't know how much time.
    await this.pixiApp.init( pixiOptions );

    //Add canvas element created by Pixi into the HTML document
    document.body.appendChild(this.pixiApp.canvas);

    //Load the background
    const bgTexture = await PIXI.Assets.load("stadium.png");
    const background = new PIXI.Sprite(bgTexture);
    background.x = 0;
    background.y = 0;
    background.width = this.width;
    background.height = this.height;

    // Load the background first (to be behind NPCs)
    this.pixiApp.stage.addChild(background);
    
    //Load the bunnies
    const bunnyTexture = await PIXI.Assets.load("bunny.png");

    //Create 10 instances of bunny class
    for ( let i = 0; i < 100; i++ ) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      
      //Create an instance of bunny class, and the constructor of this class takes the bunnyTexture as a parameter.
      //Use x, y and a reference to the game instance (this)
      const bunny = new Bunny( bunnyTexture, x, y, this );
      this.bunnies.push( bunny );
    }

    // Assign targets and persecutors to make bunnies move
    this.assignTargets();
    this.assignRandomPersecutorForAllBunnies();
    
    // Debug: Log bunny setup
    console.log(`Created ${this.bunnies.length} bunnies`);
    for (let bunny of this.bunnies) {
      console.log(`Bunny ${bunny.id}: target=${bunny.target ? bunny.target.id || 'mouse' : 'none'}, persecutor=${bunny.persecutor ? bunny.persecutor.id || 'mouse' : 'none'}`);
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
    for (let aBunny of this.bunnies) {
        //Execute the tick method of each bunny.
        aBunny.tick();
        aBunny.render();
        
        // Debug: Log bunny movement
        if (Math.floor(time) % 60 === 0) { // Log every second
          console.log(`Bunny ${aBunny.id}: pos(${Math.round(aBunny.position.x)}, ${Math.round(aBunny.position.y)}) vel(${Math.round(aBunny.velocity.x*100)/100}, ${Math.round(aBunny.velocity.y*100)/100})`);
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
