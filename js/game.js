// js/game.js — canonical game entry (moved from root)
// Note: physics helpers live in js/physics.js to avoid duplication.

class Game {
  pixiApp;
  characters = [];
  width;
  height;
  hudContainer;
  timerText;
  remainingSeconds = 60;
  _timerAccumulatorMs = 0;
  uiLayer;
  health = 100;
  maxHealth = 100;
  healthBarFill;
  toiletCount = 10;
  toiletIconSprite;
  toiletCountText;
  toilets = [];
  camera;
  worldContainer;

  constructor() {
    this.playArea = { x: 0, y: 0, width: 1336, height: 1024 };
    this.grassArea = { x: 1336, y: 0, width: 200, height: 1024 };
    this.worldWidth = 1536;
    this.worldHeight = 1024;
    this.width = 1024;
    this.height = 768;
    this.mouse = { position: { x: 0, y: 0 } };
    this.initPIXI();
  }

  async initPIXI() {
    this.pixiApp = new PIXI.Application();
    const pixiOptions = {
      background: "#1099bb",
      width: this.width,
      height: this.height,
      antialias: false,
      SCALE_MODE: PIXI.SCALE_MODES.NEAREST
    };
    await this.pixiApp.init(pixiOptions);
    const centerDiv = document.getElementById('game-canvas-center');
    if (centerDiv) centerDiv.appendChild(this.pixiApp.canvas);
    this.worldContainer = new PIXI.Container();
    this.worldContainer.name = "worldContainer";
    this.pixiApp.stage.addChild(this.worldContainer);
    this.camera = new Camera(this.width, this.height, this.worldWidth, this.worldHeight);
    const bgTexture = await PIXI.Assets.load("images/stadium-desktop.png");
    const background = new PIXI.Sprite(bgTexture);
    background.x = 0; background.y = 0; background.width = this.worldWidth; background.height = this.worldHeight;
    this.worldContainer.addChild(background);
    this.uiLayer = new PIXI.Container();
    this.uiLayer.name = "uiLayer";
    const enemySheet = await PIXI.Assets.load("spritesheets/UDeChile.json");
    const heroSheet  = await PIXI.Assets.load("spritesheets/independiente.json");
    const makeSpritesheetData = (sheet) => ({ animations: { walk: sheet.animations.walk, back: sheet.animations.back, front: sheet.animations.front, idle: sheet.animations.idle } });
    const enemySheetData = makeSpritesheetData(enemySheet);
    const heroSheetData = makeSpritesheetData(heroSheet);
    const hx = this.playArea.x + this.playArea.width;
    const hy = this.playArea.y + this.playArea.height * 0.5;
    const hero = new Hero(heroSheetData, hx, hy, this);
    this.characters.push(hero);
    const minEnemyDistance = 200;
    for (let i = 0; i < 100; i++) {
      let x, y, dist;
      do {
        x = this.playArea.x + Math.random() * this.playArea.width;
        y = this.playArea.y + Math.random() * this.playArea.height;
        dist = Math.sqrt((x - hx) ** 2 + (y - hy) ** 2);
      } while (dist < minEnemyDistance);
      const enemy = new Enemy(enemySheetData, x, y, this);
      enemy.target = hero;
      this.characters.push(enemy);
    }
    await this._createHud();
    this.pixiApp.stage.addChild(this.uiLayer);
    this.pixiApp.ticker.add(this.gameLoop.bind(this));
  }

  addMouseInteractivity() { this.pixiApp.canvas.onmousemove = (event) => { this.mouse.position = { x: event.x, y: event.y }; }; }

  gameLoop(time) {
    const hero = this._getHero();
    if (hero && this.camera) {
      this.camera.follow(hero.position.x, hero.position.y);
      this.camera.update();
      const offset = this.camera.getOffset();
      this.worldContainer.x = -offset.x; this.worldContainer.y = -offset.y;
    }
    const deltaSeconds = (this.pixiApp.ticker.deltaMS || (1000/60)) / 1000;
    const activeToilets = this.toilets.filter(t => !t.destroyed);
    for (let aCharacter of this.characters) {
      if (aCharacter instanceof Enemy) {
        let chosenTarget = this.characters.find(c => c instanceof Hero) || null;
        let nearestToilet = null; let nearestDist = Infinity;
        for (let t of activeToilets) {
          const d = calculateDistance(aCharacter.position, t.position);
          if (d < 220 && d < nearestDist) { nearestDist = d; nearestToilet = t; }
        }
        aCharacter.target = nearestToilet ? nearestToilet : chosenTarget;
      }
    }
    for (let aCharacter of this.characters) {
      aCharacter.tick(); aCharacter.render();
      if (Math.floor(time) % 60 === 0) console.log(`Character ${aCharacter.id}: pos(${Math.round(aCharacter.position.x)}, ${Math.round(aCharacter.position.y)})`);
      if (aCharacter instanceof Enemy) {
        const enemy = aCharacter; const target = enemy.target;
        if (target) {
          const targetPos = target.position ? target.position : target;
          const d = calculateDistance(enemy.position, targetPos);
          if (d <= 18) {
            if (target === this._getHero()) this._applyHeroDamage(6 * deltaSeconds);
            else if (target && target.isToilet) this._damageToilet(target, 20 * deltaSeconds);
          }
        }
      }
    }
    this._updateHudTimer(this.pixiApp.ticker.deltaMS || (1000/60));
  }

  async _createHud() {
    this.pixiApp.stage.addChild(this.uiLayer);
    const panelWidth = 140; const panelHeight = 44; const marginTop = 10;
    this.hudContainer = new PIXI.Container(); this.hudContainer.x = Math.round((this.width - panelWidth) / 2); this.hudContainer.y = marginTop;
    const panel = new PIXI.Graphics(); panel.roundRect(0, 0, panelWidth, panelHeight, 6); panel.fill({ color: 0x000000 }); panel.stroke({ color: 0xCCCCCC, width: 2 }); this.hudContainer.addChild(panel);
    this.timerText = new PIXI.Text("1:00", { fontFamily: "VT323, Arial, sans-serif", fontSize: 24, fill: 0xFF0000, align: "center", letterSpacing: 2 }); this.timerText.anchor.set(0.5, 0.5); this.timerText.x = Math.round(panelWidth / 2); this.timerText.y = Math.round(panelHeight / 2); this.timerText.scale.set(2); this.hudContainer.addChild(this.timerText);
    this._createHealthBar(); await this._createToiletCounter(); this.uiLayer.addChild(this.hudContainer);
  }

  _updateHudTimer(deltaMs) { if (this.remainingSeconds <= 0) return; this._timerAccumulatorMs += deltaMs; while (this._timerAccumulatorMs >= 1000 && this.remainingSeconds > 0) { this._timerAccumulatorMs -= 1000; this.remainingSeconds -= 1; this._renderTimerText(); } }

  _renderTimerText() { const minutes = Math.floor(this.remainingSeconds / 60); const seconds = this.remainingSeconds % 60; const text = `${minutes}:${seconds.toString().padStart(2, "0")}`; if (this.timerText) this.timerText.text = text; }

  _createHealthBar() { const width = 240; const height = 40; const margin = 10; const container = new PIXI.Container(); container.x = margin; container.y = margin; const bg = new PIXI.Graphics(); bg.roundRect(0, 0, width, height, 4); bg.fill({ color: 0x000000 }); bg.stroke({ color: 0xCCCCCC, width: 2 }); container.addChild(bg); this.healthBarFill = new PIXI.Graphics(); this.healthBarFill.roundRect(2, 2, width - 4, height - 4, 2); this.healthBarFill.fill({ color: 0xD32F2F }); container.addChild(this.healthBarFill); this.uiLayer.addChild(container); this._updateHealthBar(); }

  _updateHealthBar() { if (!this.healthBarFill) return; const width = 240 - 4; const height = 40 - 4; const ratio = Math.max(0, Math.min(1, this.health / this.maxHealth)); this.healthBarFill.clear(); this.healthBarFill.roundRect(2, 2, Math.max(1, Math.round(width * ratio)), height, 2); this.healthBarFill.fill({ color: 0xD32F2F }); }

  async _createToiletCounter() { const panelWidth = 120; const panelHeight = 40; const marginTop = 10; const container = new PIXI.Container(); container.x = this.width - panelWidth - 10; container.y = marginTop; const panel = new PIXI.Graphics(); panel.roundRect(0, 0, panelWidth, panelHeight, 6); panel.fill({ color: 0x000000 }); panel.stroke({ color: 0xCCCCCC, width: 2 }); container.addChild(panel); const row = new PIXI.Container(); row.y = panelHeight / 2; container.addChild(row); try { const tex = await PIXI.Assets.load("images/toilet.png"); this.toiletIconSprite = new PIXI.Sprite(tex); this.toiletIconSprite.scale.set(0.25); this.toiletIconSprite.anchor.set(0, 0.5); row.addChild(this.toiletIconSprite); } catch (e) { const placeholder = new PIXI.Graphics(); placeholder.roundRect(0, 0, 32, 32, 4); placeholder.fill({ color: 0x444444 }); placeholder.pivot.y = 16; row.addChild(placeholder); } this.toiletCountText = new PIXI.Text(`x ${this.toiletCount}`, { fontFamily: "VT323, Arial, sans-serif", fontSize: 18, fill: 0xFFFFFF, align: "left", letterSpacing: 1 }); this.toiletCountText.scale.set(2); this.toiletCountText.anchor.set(0, 0.5); this.toiletCountText.x = 44; row.addChild(this.toiletCountText); this.uiLayer.addChild(container); }

  _updateToiletCounter() { if (this.toiletCountText) this.toiletCountText.text = `x ${this.toiletCount}`; }

  _applyHeroDamage(amount) { this.health = Math.max(0, this.health - amount); this._updateHealthBar(); }

  _getHero() { return this.characters.find(c => c instanceof Hero) || null; }

  async placeToilet(worldPosition) {
    if (this.toiletCount <= 0) return;
    this.toiletCount -= 1; this._updateToiletCounter();
    let sprite = null;
    try { const tex = await PIXI.Assets.load("images/toilet.png"); sprite = new PIXI.Sprite(tex); sprite.anchor.set(0.5, 1); sprite.scale.set(0.5); } catch (e) { const g = new PIXI.Graphics(); g.roundRect(-12, -32, 24, 32, 4); g.fill({ color: 0x8888FF }); sprite = g; }
    sprite.x = worldPosition.x; sprite.y = worldPosition.y; this.worldContainer.addChild(sprite);
    const toilet = { isToilet: true, position: { x: worldPosition.x, y: worldPosition.y }, hp: 100, maxHp: 100, destroyed: false, sprite: sprite, collisionRadius: 20 };
    this.toilets.push(toilet);
  }

  _damageToilet(toilet, amount) { if (!toilet || toilet.destroyed) return; toilet.hp -= amount; if (toilet.hp <= 0) { toilet.destroyed = true; if (toilet.sprite && toilet.sprite.destroy) toilet.sprite.destroy(); } }
}
