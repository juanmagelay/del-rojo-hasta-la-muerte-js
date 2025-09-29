class Hero extends GameObject {
    //Properties
    input;
    moveAcceleration;
    maxVelocity;
    
    constructor(spritesheetData, x, y, game) {
        super(spritesheetData, x, y, game);
        this.input = { up: false, down: false, left: false, right: false };
        this.moveAcceleration = 0.2; // Acceleration per input
        this.maxVelocity = 4;
        this._attachInput();
    }

    _attachInput() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'w' || e.key === 'ArrowUp') this.input.up = true;
            if (e.key === 's' || e.key === 'ArrowDown') this.input.down = true;
            if (e.key === 'a' || e.key === 'ArrowLeft') this.input.left = true;
            if (e.key === 'd' || e.key === 'ArrowRight') this.input.right = true;
            if (e.key.toLowerCase() === 'x') this._onKeyX();
        });
        window.addEventListener('keyup', (e) => {
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
        // acción de click del héroe (placeholder)
    }

    _onKeyX() {
        if (!this.game || !this.game.placeToilet) return;
        // Place a toilet at hero's current world position
        this.game.placeToilet({ x: this.position.x, y: this.position.y });
    }

    applyBrain() {
        if (this.input.up) this.acceleration.y -= this.moveAcceleration;
        if (this.input.down) this.acceleration.y += this.moveAcceleration;
        if (this.input.left) this.acceleration.x -= this.moveAcceleration;
        if (this.input.right) this.acceleration.x += this.moveAcceleration;
    }
}

