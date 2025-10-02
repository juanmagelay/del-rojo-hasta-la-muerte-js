// gameMenuOverlay.js
// Overlay to show start, game over, and win screens

class GameMenuOverlay {
  showOnboarding() {
    this._currentSlide = 0;
    this._slides = [
      {
        img: 'onboarding-1.png',
        text: `🟥 Copa Sudamericana 2025, octavos de final: el Rojo contra la U de Chile… ¡partido bravo!\n👤 Vos sos el ÚNICO hincha de Independiente en la tribuna visitante… ¡qué loco!\n💥 Los de la U quieren revolearte a la cancha y que se suspenda el partido.`
      },
      {
        img: 'onboarding-2.png',
        text: `🚽 Pero hay algo que los tienta más… romper inodoros, y vos tenés varios.\n🎮 Usá las flechas del teclado para moverte y poné inodoros con la tecla X para distraerlos unos segundos.\n⏱️ Resistí el último minuto del partido. Si te sacan toda la vida antes, volás a la cancha y se pudre todo.`
      }
    ];
    this._renderOnboardingSlide();
    this.overlay.style.display = 'flex';
    this.button.textContent = 'Siguiente';
    this.button.onclick = () => this._nextOnboardingSlide();
    window.addEventListener('keydown', this._onboardingKeyHandler);
  }

  _renderOnboardingSlide() {
    const slide = this._slides[this._currentSlide];
    this.title.textContent = '';
    // Crea contenedor de columnas si no existe
    if (!this._onboardingColumns) {
      this._onboardingColumns = document.createElement('div');
      this._onboardingColumns.style.display = 'flex';
      this._onboardingColumns.style.flexDirection = 'row';
      this._onboardingColumns.style.width = '1024px';
      this._onboardingColumns.style.maxWidth = '1024px';
      this._onboardingColumns.style.gap = '0px';
      this.overlay.insertBefore(this._onboardingColumns, this.button);
    }
    // Columna imagen
    if (!this._onboardingImgCol) {
      this._onboardingImgCol = document.createElement('div');
      this._onboardingImgCol.style.width = '512px';
      this._onboardingImgCol.style.paddingLeft = '8px';
      this._onboardingImgCol.style.paddingRight = '8px';
      this._onboardingImgCol.style.boxSizing = 'border-box';
      this._onboardingImgCol.style.display = 'flex';
      this._onboardingImgCol.style.alignItems = 'center';
      this._onboardingImgCol.style.justifyContent = 'center';
    }
    if (!this._onboardingImg) {
      this._onboardingImg = document.createElement('img');
      this._onboardingImg.style.width = '100%';
      this._onboardingImg.style.maxWidth = '512px';
      this._onboardingImg.style.height = 'auto';
      this._onboardingImg.style.display = 'block';
    }
    this._onboardingImg.src = slide.img;
    // Columna texto+botón
    if (!this._onboardingTextCol) {
      this._onboardingTextCol = document.createElement('div');
      this._onboardingTextCol.style.display = 'flex';
      this._onboardingTextCol.style.flexDirection = 'column';
      this._onboardingTextCol.style.width = '512px';
      this._onboardingTextCol.style.paddingLeft = '8px';
      this._onboardingTextCol.style.paddingRight = '8px';
      this._onboardingTextCol.style.boxSizing = 'border-box';
      this._onboardingTextCol.style.justifyContent = 'center';
      this._onboardingTextCol.style.alignItems = 'center';
    }
    if (!this._onboardingText) {
      this._onboardingText = document.createElement('div');
      this._onboardingText.style.width = '100%';
      this._onboardingText.style.color = '#E3C3A8';
      this._onboardingText.style.fontFamily = 'VT323, Arial, sans-serif';
      this._onboardingText.style.fontSize = '1.6rem';
      this._onboardingText.style.whiteSpace = 'pre-line';
      this._onboardingText.style.textAlign = 'left';
      this._onboardingText.style.marginBottom = '32px';
    }
    this._onboardingText.textContent = slide.text;
    // Botón debajo del texto
    this.button.style.display = 'block';
    this.button.style.margin = '0 auto';
    this.button.textContent = this._currentSlide < this._slides.length - 1 ? 'Siguiente' : '¡Jugar!';
    // Limpia columnas y agrega elementos
    this._onboardingColumns.innerHTML = '';
    this._onboardingImgCol.innerHTML = '';
    this._onboardingImgCol.appendChild(this._onboardingImg);
    this._onboardingColumns.appendChild(this._onboardingImgCol);
    this._onboardingTextCol.innerHTML = '';
    this._onboardingTextCol.appendChild(this._onboardingText);
    this._onboardingTextCol.appendChild(this.button);
    this._onboardingColumns.appendChild(this._onboardingTextCol);
    // Ajusta overlay
    this.overlay.style.flexDirection = 'column';
    this.overlay.style.alignItems = 'center';
    this.overlay.style.justifyContent = 'center';
  }

  _nextOnboardingSlide() {
    if (this._currentSlide < this._slides.length - 1) {
      this._currentSlide++;
      this._renderOnboardingSlide();
    } else {
      this._endOnboarding();
    }
  }

  _endOnboarding() {
    this.overlay.style.display = 'none';
    if (this._onboardingImg) this._onboardingImg.style.display = 'none';
    if (this._onboardingText) this._onboardingText.style.display = 'none';
    this.button.style.display = 'inline-block';
    this.overlay.style.flexDirection = 'column';
    window.removeEventListener('keydown', this._onboardingKeyHandler);
    this.game._finishOnboarding();
  }

  _onboardingKeyHandler = (e) => {
    if (e.key === 'Escape') {
      this._endOnboarding();
    }
  }
  showWin() {
    this._resetOverlayLayout();
    this.title.textContent = 'Ganaste';
    this.button.textContent = 'Volver a jugar';
    this._resetOverlayLayout();
    this.overlay.style.display = 'flex';
    this.overlay.style.flexDirection = 'column';
    this.overlay.style.alignItems = 'center';
    this.overlay.style.justifyContent = 'center';
    this.overlay.style.zIndex = '9999';
    this.overlay.style.width = '100vw';
    this.overlay.style.height = '100vh';
    this.title.style.display = 'block';
    this.title.style.margin = '0 auto';
    this.button.style.display = 'block';
    this.button.style.position = 'static';
    this.button.style.margin = '32px 0 0 0';
    this.button.style.zIndex = '10000';
    // Inserta el botón justo después del título
    if (this.title.nextSibling !== this.button) {
      this.overlay.insertBefore(this.button, this.title.nextSibling);
    }
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
    // Detecta si viene de 'Volver a jugar' (reinicio)
    if (this.game._justRestarted) {
      // Oculta onboarding y comienza partida directamente
      if (this._onboardingColumns) this._onboardingColumns.style.display = 'none';
      if (this._onboardingImgCol) this._onboardingImgCol.style.display = 'none';
      if (this._onboardingTextCol) this._onboardingTextCol.style.display = 'none';
      if (this._onboardingImg) this._onboardingImg.style.display = 'none';
      if (this._onboardingText) this._onboardingText.style.display = 'none';
      this.button.onclick = () => {
        this.overlay.style.display = 'none';
        this.game._justRestarted = false;
        this.game._finishOnboarding();
      };
    } else {
      // Reset onboarding state and columns
      if (this._onboardingColumns) this._onboardingColumns.style.display = '';
      if (this._onboardingImgCol) this._onboardingImgCol.style.display = '';
      if (this._onboardingTextCol) this._onboardingTextCol.style.display = '';
      if (this._onboardingImg) this._onboardingImg.style.display = '';
      if (this._onboardingText) this._onboardingText.style.display = '';
      this.button.onclick = () => {
        this.showOnboarding();
      };
    }
  }

  showGameOver() {
    this._resetOverlayLayout();
    this.title.textContent = 'Perdiste';
    this.button.textContent = 'Volver a jugar';
    this._resetOverlayLayout();
    this.overlay.style.display = 'flex';
    this.overlay.style.flexDirection = 'column';
    this.overlay.style.alignItems = 'center';
    this.overlay.style.justifyContent = 'center';
    this.overlay.style.zIndex = '9999';
    this.overlay.style.width = '100vw';
    this.overlay.style.height = '100vh';
    this.title.style.display = 'block';
    this.title.style.margin = '0 auto';
    this.button.style.display = 'block';
    this.button.style.position = 'static';
    this.button.style.margin = '32px 0 0 0';
    this.button.style.zIndex = '10000';
    // Inserta el botón justo después del título
    if (this.title.nextSibling !== this.button) {
      this.overlay.insertBefore(this.button, this.title.nextSibling);
    }
    this.button.onclick = () => {
      this.overlay.style.display = 'none';
      this.game.restartGame();
    };
  }
  _resetOverlayLayout() {
    // Oculta columnas de onboarding si existen
    if (this._onboardingColumns) this._onboardingColumns.style.display = 'none';
    if (this._onboardingImgCol) this._onboardingImgCol.style.display = 'none';
    if (this._onboardingTextCol) this._onboardingTextCol.style.display = 'none';
    if (this._onboardingImg) this._onboardingImg.style.display = 'none';
    if (this._onboardingText) this._onboardingText.style.display = 'none';
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
