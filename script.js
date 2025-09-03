let app;
let bunnies = [];
const height = 720;
const width = 1280;

async function initPIXI() {
    app = new PIXI.Application();
    const opcionesDePixi = { background: "#1099bb", width: width, height: height };
    await app.init( opcionesDePixi );

    // Append the application canvas to the document body
    document.body.appendChild( app.canvas );

    const texture = await PIXI.Assets.load("bunny.png");

    for ( let i = 0; i < 10; i++ ) {
        const bunny = new PIXI.Sprite( texture );
        bunny.x = Math.random() * width;
        bunny.y = Math.random() * height;
        bunnies.push ( bunny );
        app.stage.addChild( bunny );
    }
}

initPIXI();