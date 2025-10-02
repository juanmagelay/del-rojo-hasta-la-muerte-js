// gameMenuOverlay.js
// Overlay to show start, game over, and win screens

class GameMenuOverlay {
  showWin() {
    this.title.textContent = 'Ganaste';
    this.button.textContent = 'Volver a jugar';
    this.overlay.style.display = 'flex';
    this.button.onclick = () => {
      this.overlay.style.display = 'none';
      this.game.restartGame();
    };
  }
  constructor(game) {
    this.game = game;
    this._createOverlay();
    this._bindEvents();
    this.showStart();
  }

  _createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'game-menu-overlay';
    Object.assign(this.overlay.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      background: 'rgba(0,0,0,0.4)',
    });
    document.body.appendChild(this.overlay);

  this.title = document.createElement('h1');
  this.title.style.color = '#fff';
  this.title.style.fontFamily = 'VT323, Arial, sans-serif';
  this.title.style.fontSize = '3rem';
  this.title.style.marginBottom = '32px';
  this.overlay.appendChild(this.title);

  this.button = document.createElement('button');
  this.button.style.fontSize = '2rem';
  this.button.style.fontFamily = 'VT323, Arial, sans-serif';
  this.button.style.padding = '16px 48px';
  this.button.style.borderRadius = '12px';
  this.button.style.border = 'none';
  this.button.style.background = '#382F28';
  this.button.style.color = '#E3C3A8';
  this.button.style.cursor = 'pointer';
  this.button.style.marginTop = '16px';
  this.overlay.appendChild(this.button);
  }

  showStart() {
    this.title.textContent = '';
    this.button.textContent = 'Jugar';
    this.overlay.style.display = 'flex';
    this.button.onclick = () => {
      this.overlay.style.display = 'none';
      this.game.startGame();
    };
  }

  showGameOver() {
    this.title.textContent = 'Perdiste';
    this.button.textContent = 'Volver a jugar';
    this.overlay.style.display = 'flex';
    this.button.onclick = () => {
      this.overlay.style.display = 'none';
      this.game.restartGame();
    };
  }

  _bindEvents() {
    //Avoid moving the hero/enemies if the overlay is visible
    window.addEventListener('keydown', (e) => {
      if (this.overlay.style.display === 'flex') {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }, true);
  }
}
