// gameMenuOverlay.js
// Overlay to show start, game over, and win screens

class GameMenuOverlay {
  showOnboarding() {
    this._currentSlide = 0;
    this._slides = [
      {
        img: 'onboarding-1.png',
        text: `🟥 Copa Sudamericana 2025, octavos de final: el Rojo contra la U de Chile… ¡partido bravo!\n\n👤 Vos sos el ÚNICO hincha de Independiente en la tribuna visitante… ¡qué loco!\n\n💥 Los de la U quieren revolearte a la cancha y que se suspenda el partido.`
      },
      {
        img: 'onboarding-2.png',
        text: `🚽 Pero hay algo que los tienta más… romper inodoros, y vos tenés varios.\n\n🎮 Usá las flechas del teclado para moverte y poné inodoros con la tecla X para distraerlos unos segundos.\n\n⏱️ Resistí el último minuto del partido. Si te sacan toda la vida antes, volás a la cancha y se pudre todo.`
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
    //Create a two-column layout if not already created
    if (!this._onboardingColumns) {
      this._onboardingColumns = document.createElement('div');
      this._onboardingColumns.style.display = 'flex';
      this._onboardingColumns.style.flexDirection = 'row';
      this._onboardingColumns.style.width = '1024px';
      this._onboardingColumns.style.maxWidth = '1024px';
      this._onboardingColumns.style.gap = '0px';
      this.overlay.insertBefore(this._onboardingColumns, this.button);
    }
    //Image column
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
      this._onboardingImg.style.borderRadius = '12px';
    }
    this._onboardingImg.src = slide.img;
    //Text + button column
    if (!this._onboardingTextCol) {
      this._onboardingTextCol = document.createElement('div');
      this._onboardingTextCol.style.display = 'flex';
      this._onboardingTextCol.style.flexDirection = 'column';
      this._onboardingTextCol.style.width = '512px';
      this._onboardingTextCol.style.paddingLeft = '8px';
      this._onboardingTextCol.style.paddingRight = '8px';
      this._onboardingTextCol.style.boxSizing = 'border-box';
      this._onboardingTextCol.style.justifyContent = 'center';
      this._onboardingTextCol.style.alignItems = 'flex-start';
    }
    if (!this._onboardingText) {
      this._onboardingText = document.createElement('div');
      this._onboardingText.style.width = '100%';
      this._onboardingText.style.color = '#E3C3A8';
      this._onboardingText.style.fontFamily = 'VT323, Arial, sans-serif';
      this._onboardingText.style.fontSize = '1.4rem';
      this._onboardingText.style.whiteSpace = 'pre-line';
      this._onboardingText.style.textAlign = 'left';
      this._onboardingText.style.marginBottom = '32px';
    }
    this._onboardingText.textContent = slide.text;
    //Button under text
    this.button.style.display = 'block';
    this.button.style.margin = '0';
    this.button.textContent = this._currentSlide < this._slides.length - 1 ? 'Siguiente' : '¡Jugar!';
    //Clean cols and add elements
    this._onboardingColumns.innerHTML = '';
    this._onboardingImgCol.innerHTML = '';
    this._onboardingImgCol.appendChild(this._onboardingImg);
    this._onboardingColumns.appendChild(this._onboardingImgCol);
    this._onboardingTextCol.innerHTML = '';
    this._onboardingTextCol.appendChild(this._onboardingText);
    this._onboardingTextCol.appendChild(this.button);
    this._onboardingColumns.appendChild(this._onboardingTextCol);
    //Adjust overlay
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
    this.overlay.style.width = '1024px';
    this.overlay.style.height = '768px';
    this.title.style.display = 'block';
    this.title.style.margin = '0 auto 32px auto';
    this.title.style.textAlign = 'center';
    this.button.style.display = 'block';
    this.button.style.position = 'static';
    this.button.style.margin = '0 auto';
    this.button.style.marginTop = '32px';
    this.button.style.zIndex = '10000';
    this.button.style.textAlign = 'center';
    //Insert the button just after the title
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
    // Busca el contenedor centrado del juego
    const centerDiv = document.getElementById('game-canvas-center');
    // Overlay absoluto dentro del contenedor de 1024x768
    this.overlay = document.createElement('div');
    this.overlay.id = 'game-menu-overlay';
    Object.assign(this.overlay.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '1024px',
      height: '768px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      background: 'rgba(0,0,0,0.4)',
      boxShadow: '0 0 32px 0 rgba(0,0,0,0.7)',
      borderRadius: '18px',
      overflow: 'hidden',
      pointerEvents: 'auto'
    });
    if (centerDiv) centerDiv.appendChild(this.overlay);

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
    //Detect if the player comes from Play again action (Reset)
    if (this.game._justRestarted) {
      //Hide onboarding and start game directly
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
      //Reset onboarding state and columns
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
    this.overlay.style.width = '1024px';
    this.overlay.style.height = '768px';
    this.title.style.display = 'block';
    this.title.style.margin = '0 auto 32px auto';
    this.title.style.textAlign = 'center';
    this.button.style.display = 'block';
    this.button.style.position = 'static';
    this.button.style.margin = '0 auto';
    this.button.style.marginTop = '32px';
    this.button.style.zIndex = '10000';
    this.button.style.textAlign = 'center';
    //Insert the button just after the title
    if (this.title.nextSibling !== this.button) {
      this.overlay.insertBefore(this.button, this.title.nextSibling);
    }
    this.button.onclick = () => {
      this.overlay.style.display = 'none';
      this.game.restartGame();
    };
  }
  _resetOverlayLayout() {
    //Hide onboarding columns if they exist
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
