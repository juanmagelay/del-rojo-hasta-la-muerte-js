class Enemy extends GameObject {
    constructor(spritesheetData, x, y, game) {
        super(spritesheetData, x, y, game);
        this.vision = Math.random() * 200 + 300;
        this.target = null;
        this.persecutor = null;
    }

    applyBrain() {
        this.flee();
        this.chase();
        this.wander();
    }
}

