class Bunny extends GameObject {
  constructor(bunnyTexture, x, y, game) {
    super(bunnyTexture, x, y, game);
  }

  getSomeBunnies() {
    return this.game.bunnies;
  }
}

//Here is an example of a texture atlas data structure.
//He put this snippet into main.js (game.js)
/* const atlasData = {
  frames: {
    idle1: {
      frame: { x: 0, y: 0, w: 26, h: 37 },
      spriteSourceSize: { x: 0, y: 0, w: 26, h: 37 },
      sourceSize: { w: 26, h: 37 }
    },
    idle2: {
      frame: { x: 0, y: 0, w: 26, h: 37 },
      spriteSourceSize: { x: 0, y: 0, w: 26, h: 37 },
      sourceSize: { w: 26, h: 37 }
    },
    idle3: {
      frame: { x: 0, y: 0, w: 26, h: 37 },
      spriteSourceSize: { x: 0, y: 0, w: 26, h: 37 },
      sourceSize: { w: 26, h: 37 }
    }
  },
  meta: {
    image: "bunny.png",
    size: { w: 26, h: 37 }
  },
  animations: {
    idle: ["idle1", "idle2", "idle3"]
  }
} */

/* //Then we have to load the object Spritesheet into game.js
const texture = await Assets.load( atlasData.meta.image );

//Next we create a spritesheet instance
const spritesheet = new Spritesheet( texture, atlasData );

//Then apply the segmentation to the spritesheet
await spritesheet.parse();

//Then make a constructor for the animations
const animatedSprite = new AnimatedSprite( spritesheet.animations["idle"] );
app.stage.addChild( animatedSprite );

//We have to play the animation
animatedSprite.play();
animatedSprite.animationSpeed = 0.1; */