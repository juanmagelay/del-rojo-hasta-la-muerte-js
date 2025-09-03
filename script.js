let app;
let bunnies = [];
const height = 720;
const width = 1280;

async function initPIXI() {
    app = new PIXI.Application();
    const pixiOptions = { background: "#1099bb", width: width, height: height };
    await app.init( pixiOptions );

    // Append the application canvas to the document body
    document.body.appendChild( app.canvas );

    // Load background
    const bgTexture = await PIXI.Assets.load("stadium.png");
    const background = new PIXI.Sprite(bgTexture);
    background.x = 0;
    background.y = 0;
    background.width = width;
    background.height = height;

    // Load the background first (to be behind NPCs)
    app.stage.addChild(background);

    // Load the bunnies
    const bunnyTexture = await PIXI.Assets.load("bunny.png");

    for ( let i = 0; i < 10; i++ ) {
        const bunny = new PIXI.Sprite( bunnyTexture );
        bunny.x = Math.random() * width;
        bunny.y = Math.random() * height;
        bunnies.push ( bunny );
        app.stage.addChild( bunny );
    }
}

initPIXI();