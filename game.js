// game.js - Sistema de cámara con interpolación lineal (lerp)

class Camera {
  constructor(viewportWidth, viewportHeight, worldWidth, worldHeight) {
    // Dimensiones de la vista de la cámara
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    
    // Dimensiones totales del mundo
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    
    // Posición actual de la cámara (centro)
    this.x = viewportWidth / 2;
    this.y = viewportHeight / 2;
    
    // Posición objetivo (donde queremos que esté la cámara)
    this.targetX = this.x;
    this.targetY = this.y;
    
    // Factor de suavizado (0-1). Valores más bajos = más suave
    // 0.1 significa que la cámara se moverá el 10% de la distancia cada frame
    this.lerpFactor = 0.1;
  }
  
  // Función de interpolación lineal
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }
  
  // Actualizar la posición objetivo basado en el personaje
  follow(targetX, targetY) {
    this.targetX = targetX;
    this.targetY = targetY;
  }
  
  // Actualizar la posición de la cámara con lerp
  update() {
    // Aplicar interpolación lineal
    this.x = this.lerp(this.x, this.targetX, this.lerpFactor);
    this.y = this.lerp(this.y, this.targetY, this.lerpFactor);
    
    // Aplicar límites para que la cámara no salga del mundo
    const halfViewportWidth = this.viewportWidth / 2;
    const halfViewportHeight = this.viewportHeight / 2;
    
    // Limitar en X
    if (this.x - halfViewportWidth < 0) {
      this.x = halfViewportWidth;
    }
    if (this.x + halfViewportWidth > this.worldWidth) {
      this.x = this.worldWidth - halfViewportWidth;
    }
    
    // Limitar en Y
    if (this.y - halfViewportHeight < 0) {
      this.y = halfViewportHeight;
    }
    if (this.y + halfViewportHeight > this.worldHeight) {
      this.y = this.worldHeight - halfViewportHeight;
    }
  }
  
  // Obtener el offset de la cámara para aplicar a PixiJS
  getOffset() {
    return {
      x: this.x - this.viewportWidth / 2,
      y: this.y - this.viewportHeight / 2
    };
  }
}

class Game {
  pixiApp;
  characters = []; // we keep the name for minimal changes
  width;
  height;
  
  // HUD timer
  hudContainer;
  timerText;
  remainingSeconds = 60; // 1:00
  _timerAccumulatorMs = 0;
  
  // UI layer and other HUD
  uiLayer;
  health = 100;
  maxHealth = 100;
  healthBarFill;
  toiletCount = 10;
  toiletIconSprite;
  toiletCountText;
  toilets = [];

  //Camera
  camera;           //Camera
  worldContainer;   //World container

  constructor() {
    // Logical spaces inside the fixed background
    this.playArea = { x: 0, y: 0, width: 1336, height: 1024 };   // stadium-stands (left)
    this.grassArea = { x: 1336, y: 0, width: 200, height: 1024 }; // stadium-grass (right)

    //World dimensions
    this.worldWidth = 1536;  // 1336 + 200
    this.worldHeight = 1024;

    // Canvas (camera viewport)
    this.width = 1024;
    this.height = 768;
    this.mouse = { position: { x: 0, y: 0 } };
    this.initPIXI();    
  }

  //Async method. It can use "await".
  async initPIXI() {
    
    //Create pixiApp and store it into pixiApp property.
    this.pixiApp = new PIXI.Application();

    const pixiOptions = { 
        background: "#1099bb", 
        width: this.width,   //800
        height: this.height, //800
        antialias: false,
        SCALE_MODE: PIXI.SCALE_MODES.NEAREST // pixelated rendering
    };
    
    //Init pixiApp with options declared before.
    //Await tells that the code is in pause until pixiApp init method has finished.
    //2ms., 400mx. (...) I don't know how much time.
    await this.pixiApp.init( pixiOptions );

    //Add canvas element created by Pixi into the HTML document
    document.body.appendChild( this.pixiApp.canvas );
    
    // Create the world container
    // This container will move according to the camera
    this.worldContainer = new PIXI.Container();
    this.worldContainer.name = "worldContainer";
    this.pixiApp.stage.addChild(this.worldContainer);

    //Create the camera
    this.camera = new Camera(
      this.width,        // 800 viewport width
      this.height,       // 800 viewport height
      this.worldWidth,   // 1536 world width
      this.worldHeight   // 1024 world height
    );

    //Load the background
    const bgTexture = await PIXI.Assets.load( "stadium2.png" );
    const background = new PIXI.Sprite( bgTexture );
    background.x = 0;
    background.y = 0;
    background.width = this.worldWidth;
    background.height = this.worldHeight;

    // Load the background first (to be behind NPCs)
    this.worldContainer.addChild(background);
    
    // UI Layer on top of everything
    this.uiLayer = new PIXI.Container();
    this.uiLayer.name = "uiLayer";
    // Keep draw order simple: last added is on top
    
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

    // HUD
    await this._createHud();

    //Add UI Layer to the stage (top layer)
    this.pixiApp.stage.addChild(this.uiLayer);

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
    
    //Add camera to follow the hero
    const hero = this._getHero();
    if (hero && this.camera) {
      // Hacer que la cámara siga al héroe
      this.camera.follow(hero.position.x, hero.position.y);
      this.camera.update();
      
      // Aplicar la posición de la cámara al worldContainer
      const offset = this.camera.getOffset();
      this.worldContainer.x = -offset.x;
      this.worldContainer.y = -offset.y;
    }

    // Pre-brain targeting: attract enemies to nearest toilet if close
    const deltaSeconds = (this.pixiApp.ticker.deltaMS || (1000/60)) / 1000;
    const activeToilets = this.toilets.filter(t => !t.destroyed);
    
    for (let aCharacter of this.characters) {
      if (aCharacter instanceof Enemy) {
        let chosenTarget = this.characters.find(c => c instanceof Hero) || null;
        let nearestToilet = null;
        let nearestDist = Infinity;
        for (let t of activeToilets) {
          const d = calculateDistance(aCharacter.position, t.position);
          if (d < 220 && d < nearestDist) { // attraction radius
            nearestDist = d;
            nearestToilet = t;
          }
        }
        aCharacter.target = nearestToilet ? nearestToilet : chosenTarget;
      }
    }

    //Iterate for each of the characters.
    for (let aCharacter of this.characters) {
        //Execute the tick method of each character.
        aCharacter.tick();
        aCharacter.render();
        
        // Debug: Log character movement
        if (Math.floor(time) % 60 === 0) { // Log every second
          console.log(`Character ${aCharacter.id}: pos(${Math.round(aCharacter.position.x)}, ${Math.round(aCharacter.position.y)}) vel(${Math.round(aCharacter.velocity.x*100)/100}, ${Math.round(aCharacter.velocity.y*100)/100})`);
        }
        
        // Enemy interactions: damage hero or toilet when in contact
        if (aCharacter instanceof Enemy) {
          const enemy = aCharacter;
          const target = enemy.target;
          if (target) {
            const targetPos = target.position ? target.position : target;
            const d = calculateDistance(enemy.position, targetPos);
            if (d <= 18) { // same as stopRadius
              if (target === this._getHero()) {
                // damage hero progressively
                this._applyHeroDamage(6 * deltaSeconds); // 6 hp per second
              } else if (target && target.isToilet) {
                this._damageToilet(target, 20 * deltaSeconds); // toilet hp per second
              }
            }
          }
        }
    }

    // Update countdown timer using delta milliseconds
    this._updateHudTimer(this.pixiApp.ticker.deltaMS || (1000/60));
  }

  // ===== HUD TIMER =====
  async _createHud() {
    // Add UI layer at the very top
    this.pixiApp.stage.addChild(this.uiLayer);

    const panelWidth = 140;
    const panelHeight = 44;
    const marginTop = 10;

    // Container to group background panel and text
    this.hudContainer = new PIXI.Container();
    this.hudContainer.x = Math.round((this.width - panelWidth) / 2);
    this.hudContainer.y = marginTop;

    // Background panel: black fill, light gray border
    const panel = new PIXI.Graphics();
    panel.roundRect(0, 0, panelWidth, panelHeight, 6);
    panel.fill({ color: 0x000000 });
    panel.stroke({ color: 0xCCCCCC, width: 2 });
    this.hudContainer.addChild(panel);

    // Red digits centered, slightly scaled for pixel look
    this.timerText = new PIXI.Text("1:00", {
      fontFamily: "VT323",
      fontSize: 24,
      fill: 0xFF0000,
      align: "center",
      letterSpacing: 2
    });

    this.timerText.anchor.set(0.5, 0.5);
    this.timerText.x = Math.round(panelWidth / 2);
    this.timerText.y = Math.round(panelHeight / 2);
    this.timerText.scale.set(2); // pixel-art feel with NEAREST scaling
    this.hudContainer.addChild(this.timerText);

    // Health bar panel (left top)
    this._createHealthBar();

    // Toilet counter (right top)
    await this._createToiletCounter();

    // Add HUD container(s) to UI layer
    this.uiLayer.addChild(this.hudContainer);
  }

  _updateHudTimer(deltaMs) {
    if (this.remainingSeconds <= 0) return;
    this._timerAccumulatorMs += deltaMs;
    while (this._timerAccumulatorMs >= 1000 && this.remainingSeconds > 0) {
      this._timerAccumulatorMs -= 1000;
      this.remainingSeconds -= 1;
      this._renderTimerText();
    }
  }

  _renderTimerText() {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    const text = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    if (this.timerText) this.timerText.text = text;
  }

  _createHealthBar() {
    const width = 240;
    const height = 40;
    const margin = 10;
    const container = new PIXI.Container();
    container.x = margin;
    container.y = margin;

    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, width, height, 4);
    bg.fill({ color: 0x000000 });
    bg.stroke({ color: 0xCCCCCC, width: 2 });
    container.addChild(bg);

    this.healthBarFill = new PIXI.Graphics();
    this.healthBarFill.roundRect(2, 2, width - 4, height - 4, 2);
    this.healthBarFill.fill({ color: 0xD32F2F }); // red fill
    container.addChild(this.healthBarFill);

    this.uiLayer.addChild(container);
    this._updateHealthBar();
  }

  _updateHealthBar() {
    if (!this.healthBarFill) return;
    const width = 240 - 4; // inner width
    const height = 40 - 4; // inner height
    const ratio = Math.max(0, Math.min(1, this.health / this.maxHealth));
    this.healthBarFill.clear();
    this.healthBarFill.roundRect(2, 2, Math.max(1, Math.round(width * ratio)), height, 2);
    this.healthBarFill.fill({ color: 0xD32F2F });
  }

  async _createToiletCounter() {
    const panelWidth = 120;
    const panelHeight = 40;
    const marginTop = 10;
    const container = new PIXI.Container();
    container.x = this.width - panelWidth - 10;
    container.y = marginTop;

    //Toilet background panel
    const panel = new PIXI.Graphics();
    panel.roundRect(0, 0, panelWidth, panelHeight, 6);
    panel.fill({ color: 0x000000 });
    panel.stroke({ color: 0xCCCCCC, width: 2 });
    container.addChild(panel);

    //Container for icon + text 
    const row = new PIXI.Container();
    row.y = panelHeight / 2; // center vertically
    container.addChild(row);

    // Try to load inodoro.png, fall back to a placeholder
    try {
      const tex = await PIXI.Assets.load("inodoro.png");
      this.toiletIconSprite = new PIXI.Sprite(tex);
      this.toiletIconSprite.scale.set(0.25);
      this.toiletIconSprite.anchor.set(0, 0.5); //Left, vertical centered
      row.addChild(this.toiletIconSprite);
    } catch (e) {
      const placeholder = new PIXI.Graphics();
      placeholder.roundRect(0, 0, 32, 32, 4);
      placeholder.fill({ color: 0x444444 });
      placeholder.pivot.y = 16; //Vertical centered
      row.addChild(placeholder);
    }

    //Text
    this.toiletCountText = new PIXI.Text(`x ${this.toiletCount}`, {
      fontFamily: "VT323",
      fontSize: 18,
      fill: 0xFFFFFF,
      align: "left",
      letterSpacing: 1
    });
    this.toiletCountText.scale.set(2);
    this.toiletCountText.anchor.set(0, 0.5); //Left, vertical centered
    this.toiletCountText.x = 40; //Separation from icon
    row.addChild(this.toiletCountText);

    //Add to UI Layer
    this.uiLayer.addChild(container);
  }

  _updateToiletCounter() {
    if (this.toiletCountText) this.toiletCountText.text = `x ${this.toiletCount}`;
  }

  _applyHeroDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    this._updateHealthBar();
  }

  _getHero() {
    return this.characters.find(c => c instanceof Hero) || null;
  }

  async placeToilet(worldPosition) {
    if (this.toiletCount <= 0) return;
    this.toiletCount -= 1;
    this._updateToiletCounter();

    // Visual sprite or placeholder
    let sprite = null;
    try {
      const tex = await PIXI.Assets.load("inodoro.png");
      sprite = new PIXI.Sprite(tex);
      sprite.anchor.set(0.5, 1);
      sprite.scale.set(0.5);
    } catch (e) {
      const g = new PIXI.Graphics();
      g.roundRect(-12, -32, 24, 32, 4);
      g.fill({ color: 0x8888FF });
      sprite = g; // graphics object acts as displayable
    }

    sprite.x = worldPosition.x;
    sprite.y = worldPosition.y;
    this.worldContainer.addChild(sprite);
    
    const toilet = {
      isToilet: true,
      position: { x: worldPosition.x, y: worldPosition.y },
      hp: 100,
      destroyed: false,
      sprite: sprite
    };
    this.toilets.push(toilet);
  }

  _damageToilet(toilet, amount) {
    if (!toilet || toilet.destroyed) return;
    toilet.hp -= amount;
    if (toilet.hp <= 0) {
      toilet.destroyed = true;
      if (toilet.sprite && toilet.sprite.destroy) toilet.sprite.destroy();
      // remove from array lazily on next filter or cleanup
    }
  }
}
