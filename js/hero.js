class Hero extends GameObject {
    //Properties
    input;
    moveAcceleration;
    maxVelocity;
    inputEnabled = false;
    
    // Finite State Machine for animations
    state = "idle"; // possible: 'idle', 'walk', 'dead'

    _fsmActive = true; // when true, FSM decides the animation for this hero
    
    constructor(spritesheetData, x, y, game) {
        super(spritesheetData, x, y, game);
        this.input = { up: false, down: false, left: false, right: false };
        this.moveAcceleration = 0.2; //Acceleration per input
        this.maxVelocity = 4;
        this._attachInput();
        
        // Create FSM and states
        this.fsm = new FiniteStateMachine(this);
        
        // Idle state
        this.fsm.addState('idle', {
            onEnter() { this.changeAnimation('idle'); },
            onUpdate() { /* idle: nothing special */ }
        });
        
        // Walk state: choose animation based on angle and flip for left
        this.fsm.addState('walk', {
            onEnter() { /* ensure animation will be set in onUpdate */ },
            onUpdate() {
                const speed = this.velocity && Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y) || 0;
                if (speed <= 0.2) return;
                const a = this.angle;
                if ( a > 45 && a < 135 && this.spritesAnimated.front) {
                    this.changeAnimation('front');
                    if (typeof this._applyHorizontalFlip === 'function') this._applyHorizontalFlip();
                } else if (a < -45 && a > -135 && this.spritesAnimated.back) {
                    this.changeAnimation('back');
                    if (typeof this._applyHorizontalFlip === 'function') this._applyHorizontalFlip();
                } else if (this.spritesAnimated.walk) {
                    this.changeAnimation('walk');
                    // Use GameObject helper to flip the current active sprite
                    if (typeof this._applyHorizontalFlip === 'function') this._applyHorizontalFlip();
                }
            }
        });
        
        // Dead state
        this.fsm.addState('dead', {
            onEnter() {
                console.log('HERO DIED! onEnter executed');
                console.log('Position before:', { x: this.position.x, y: this.position.y });
                
                this.inputEnabled = false;
                this.velocity.x = 0;
                this.velocity.y = 0;
                
                // BRUTAL MOVEMENT: +100 en X, al frente en Z
                this.position.x += 100;
                this.container.rotation = Math.PI / 2; // Rotar 90 grados a la derecha
                this.container.zIndex = 9999; // Al frente totalmente en Z
                
                console.log('Position after:', { x: this.position.x, y: this.position.y });
                console.log('Z-index set to:', this.container.zIndex);
                console.log('Rotation set to:', this.container.rotation, 'radians (90 degrees)');
                
                // Try to play 'death' animation and stop it so it remains visible until restart.
                this.changeAnimation('death');
                const deathSprite = this.spritesAnimated && this.spritesAnimated.death;
                if (deathSprite) {
                    deathSprite.loop = false; // play once and then stay on last frame
                    deathSprite.animationSpeed = deathSprite.animationSpeed || 0.12;
                    try { deathSprite.play(); } catch (e) { /* ignore */ }
                }
                
                // Add red rectangle immediately below the hero
                this._addDeathRedRectangle();
                console.log('Red rectangle added');
            }
        });
    }

    _attachInput() {
        window.addEventListener('keydown', (e) => {
            if (!this.inputEnabled) return;
            if (e.key === 'w' || e.key === 'ArrowUp') this.input.up = true;
            if (e.key === 's' || e.key === 'ArrowDown') this.input.down = true;
            if (e.key === 'a' || e.key === 'ArrowLeft') this.input.left = true;
            if (e.key === 'd' || e.key === 'ArrowRight') this.input.right = true;
            if (e.key.toLowerCase() === 'x') this._onKeyX();
        });
        window.addEventListener('keyup', (e) => {
            if (!this.inputEnabled) return;
            if (e.key === 'w' || e.key === 'ArrowUp') this.input.up = false;
            if (e.key === 's' || e.key === 'ArrowDown') this.input.down = false;
            if (e.key === 'a' || e.key === 'ArrowLeft') this.input.left = false;
            if (e.key === 'd' || e.key === 'ArrowRight') this.input.right = false;
        });
        if (this.game?.pixiApp?.canvas) {
            this.game.pixiApp.canvas.addEventListener('pointerdown', (e) => this._onClick(e));
        }
    }

    _onClick(e) {
        //Hero click action (placeholder)
    }

    _onKeyX() {
        if (!this.game || !this.game.placeToilet) return;
        //Place a toilet at hero's current world position
        this.game.placeToilet({ x: this.position.x, y: this.position.y });
    }

    _addDeathRedRectangle() {
        // Create a red rectangle below the hero
        const redRectangle = new PIXI.Graphics();
        redRectangle.rect(0, -50, 20, 60); // 20x60 rectangle centered horizontally
        redRectangle.fill({ color: 0xFF0000 }); // Red color
        redRectangle.zIndex = -1; // Place it below the hero
        
        // Add it to the hero's container so it moves with the hero
        this.container.addChild(redRectangle);
        
        // Store reference for potential cleanup
        this.deathRedRectangle = redRectangle;
    }

    applyBrain() {
        // Don't apply input controls if hero is dead
        if (this.fsm && this.fsm.getState() === 'dead') {
            return;
        }
        
        if (this.input.up) this.acceleration.y -= this.moveAcceleration;
        if (this.input.down) this.acceleration.y += this.moveAcceleration;
        if (this.input.left) this.acceleration.x -= this.moveAcceleration;
        if (this.input.right) this.acceleration.x += this.moveAcceleration;
    }

    // Method to reset hero to initial state when game restarts
    resetToInitialState() {
        // Reset position to initial spawn position
        this.position.x = this.game.playArea.x + this.game.playArea.width;
        this.position.y = this.game.playArea.y + this.game.playArea.height * 0.5;
        
        // Reset velocity and acceleration
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        
        // Reset Z index to normal
        this.container.zIndex = Math.round(this.position.y);
        
        // Reset rotation to normal
        this.container.rotation = 0;
        
        // Remove red rectangle if it exists
        if (this.deathRedRectangle) {
            this.container.removeChild(this.deathRedRectangle);
            this.deathRedRectangle = null;
        }
        
        // Reset FSM to idle state
        if (this.fsm) {
            this.fsm.setState('idle');
        }
        
        // Reset input
        this.inputEnabled = true;
    }

    // Finite State Machine: perceiveEnvironment decides the state based on conditions
    perceiveEnvironment() {
        const isDead = this.game && typeof this.game.health === 'number' && this.game.health <= 0;
        if (isDead) {
            this.fsm.setState('dead');
            return;
        }
        const speed = this.velocity && Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y) || 0;
        const movingThreshold = 0.2;
        if (speed <= movingThreshold) { this.fsm.setState('idle'); return; }
        this.fsm.setState('walk');

    }
}
