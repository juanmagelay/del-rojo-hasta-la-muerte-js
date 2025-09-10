class Bunny extends GameObject {
  constructor(bunnyTexture, x, y, game) {
    super(bunnyTexture, x, y, game);
  }

  getSomeBunnies() {
    return this.game.bunnies;
  }
}