let app;
let conejitos = [];
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
        const conejito = new PIXI.Sprite( texture );
        conejito.x = Math.random() * width;
        conejito.y = Math.random() * height;
        conejitos.push ( conejito );
        app.stage.addChild( conejito );
    }
  
}

initPIXI();