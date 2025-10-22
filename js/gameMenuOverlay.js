// gameMenuOverlay.js
// Overlay to show start, game over, and win screens

class GameMenuOverlay {
  // ============================================
  // CONSTRUCTOR & INITIALIZATION
  // ============================================
  
  constructor(game) {
    this.game = game;
    this._createOverlay();
    this._bindEvents();
    this.showStart();
  }

  _createOverlay() {
    const centerDiv = document.getElementById('game-canvas-center');
    
    // Create main overlay container
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

    // Create title element
    this.title = document.createElement('h1');
    Object.assign(this.title.style, {
      color: '#fff',
      fontFamily: 'VT323, Arial, sans-serif',
      fontSize: '3rem',
      marginBottom: '16px'
    });
    this.overlay.appendChild(this.title);

    // Create button element
    this.button = document.createElement('button');
    Object.assign(this.button.style, {
      fontSize: '2rem',
      fontFamily: 'VT323, Arial, sans-serif',
      padding: '16px 48px',
      borderRadius: '12px',
      border: 'none',
      background: '#382F28',
      color: '#E3C3A8',
      cursor: 'pointer',
      marginTop: '16px'
    });
    this.overlay.appendChild(this.button);
  }

  _bindEvents() {
    // Prevent key events from affecting game when overlay is visible
    window.addEventListener('keydown', (e) => {
      if (this.overlay.style.display === 'flex') {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }, true);
  }

  // ============================================
  // PUBLIC SCREEN METHODS
  // ============================================
  
  showStart() {
    this.title.textContent = '';
    this.button.textContent = 'Jugar';
    this.overlay.style.display = 'flex';
    
    this._createLogoIfNeeded();
    this._showLogo();
    
    if (this.game._justRestarted) {
      this._handleRestartedGame();
    } else {
      this._handleFirstTimeGame();
    }
  }

  showOnboarding() {
    if (this._logoImg) this._logoImg.style.display = 'none';
    
    this._currentSlide = 0;
    this._slides = [
      {
        img: 'images/onboarding-1.png',
        text: `🟥 Copa Sudamericana 2025, octavos de final: el Rojo contra la U de Chile… ¡partido bravo!\n\n👤 Vos sos el ÚNICO hincha de Independiente en la tribuna visitante… ¡qué loco!\n\n💥 Los de la U quieren revolearte a la cancha y que se suspenda el partido.`
      },
      {
        img: 'images/onboarding-2.png',
        text: `🚽 Pero hay algo que los tienta más… romper inodoros, y vos tenés varios.\n\n🎮 Usá las flechas del teclado para moverte y poné inodoros con la tecla X para distraerlos unos segundos.\n\n⏱️ Resistí el último minuto del partido. Si te sacan toda la vida antes, volás a la cancha y se pudre todo.`
      }
    ];
    
    this._renderOnboardingSlide();
    this.overlay.style.display = 'flex';
    this.button.textContent = 'Siguiente';
    this.button.onclick = () => this._nextOnboardingSlide();
    window.addEventListener('keydown', this._onboardingKeyHandler);
  }

  showGameOver() {
    this._showGameEnd('Perdiste');
  }

  showWin() {
    this._showGameEnd('Ganaste');
  }

  // ============================================
  // ONBOARDING HELPERS
  // ============================================
  
  _renderOnboardingSlide() {
    const slide = this._slides[this._currentSlide];
    this.title.textContent = '';
    
    this._createOnboardingLayoutIfNeeded();
    this._updateOnboardingContent(slide);
    this._adjustOverlayForOnboarding();
  }

  _createOnboardingLayoutIfNeeded() {
    if (!this._onboardingColumns) {
      this._onboardingColumns = document.createElement('div');
      Object.assign(this._onboardingColumns.style, {
        display: 'flex',
        flexDirection: 'row',
        width: '1024px',
        maxWidth: '1024px',
        gap: '0px'
      });
      this.overlay.insertBefore(this._onboardingColumns, this.button);
    }

    if (!this._onboardingImgCol) {
      this._onboardingImgCol = document.createElement('div');
      Object.assign(this._onboardingImgCol.style, {
        width: '512px',
        paddingLeft: '8px',
        paddingRight: '8px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      });
    }

    if (!this._onboardingImg) {
      this._onboardingImg = document.createElement('img');
      Object.assign(this._onboardingImg.style, {
        width: '100%',
        maxWidth: '512px',
        height: 'auto',
        display: 'block',
        borderRadius: '12px'
      });
    }

    if (!this._onboardingTextCol) {
      this._onboardingTextCol = document.createElement('div');
      Object.assign(this._onboardingTextCol.style, {
        display: 'flex',
        flexDirection: 'column',
        width: '512px',
        paddingLeft: '8px',
        paddingRight: '8px',
        boxSizing: 'border-box',
        justifyContent: 'center',
        alignItems: 'flex-start'
      });
    }

    if (!this._onboardingText) {
      this._onboardingText = document.createElement('div');
      Object.assign(this._onboardingText.style, {
        width: '100%',
        color: '#E3C3A8',
        fontFamily: 'VT323, Arial, sans-serif',
        fontSize: '1.4rem',
        whiteSpace: 'pre-line',
        textAlign: 'left',
        marginBottom: '32px'
      });
    }
  }

  _updateOnboardingContent(slide) {
    this._onboardingImg.src = slide.img;
    this._onboardingText.textContent = slide.text;
    
    // Update button text
    this.button.style.display = 'block';
    this.button.style.margin = '0';
    this.button.textContent = this._currentSlide < this._slides.length - 1 ? 'Siguiente' : '¡Jugar!';
    
    // Rebuild layout
    this._onboardingColumns.innerHTML = '';
    this._onboardingImgCol.innerHTML = '';
    this._onboardingImgCol.appendChild(this._onboardingImg);
    this._onboardingColumns.appendChild(this._onboardingImgCol);
    
    this._onboardingTextCol.innerHTML = '';
    this._onboardingTextCol.appendChild(this._onboardingText);
    this._onboardingTextCol.appendChild(this.button);
    this._onboardingColumns.appendChild(this._onboardingTextCol);
  }

  _adjustOverlayForOnboarding() {
    Object.assign(this.overlay.style, {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    });
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

  // ============================================
  // START SCREEN HELPERS
  // ============================================
  
  _createLogoIfNeeded() {
    if (!this._logoImg) {
      this._logoImg = document.createElement('img');
      Object.assign(this._logoImg.style, {
        display: 'block',
        margin: '0 auto 20px auto',
        width: '384px',
        height: 'auto'
      });
      this._logoImg.src = 'images/logo.png';
      this._logoImg.alt = 'Logo';
    }
  }

  _showLogo() {
    if (this.overlay.contains(this._logoImg)) {
      this._logoImg.style.display = 'block';
    } else {
      this.overlay.insertBefore(this._logoImg, this.button);
    }
  }

  _handleRestartedGame() {
    if (this._logoImg) this._logoImg.style.display = 'none';
    this._hideOnboardingElements();
    
    this.button.onclick = () => {
      this.overlay.style.display = 'none';
      this.game._justRestarted = false;
      this.game._finishOnboarding();
    };
  }

  _handleFirstTimeGame() {
    if (this._logoImg) this._logoImg.style.display = 'block';
    this._showOnboardingElements();
    
    this.button.onclick = () => {
      this.showOnboarding();
    };
  }

  // ============================================
  // GAME END SCREEN (WIN/LOSE)
  // ============================================
  
  _showGameEnd(titleText) {
    if (this._logoImg) this._logoImg.style.display = 'none';
    
    this._hideOnboardingElements();
    
    this.title.textContent = titleText;
    this.button.textContent = 'Volver a jugar';
    
    this._setupGameEndOverlay();
    this._setupGameEndTitle();
    this._setupGameEndButton();
    
    this.button.onclick = () => {
      this.overlay.style.display = 'none';
      this.game.restartGame();
    };
  }

  _setupGameEndOverlay() {
    Object.assign(this.overlay.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '9999',
      width: '1024px',
      height: '768px'
    });
  }

  _setupGameEndTitle() {
    Object.assign(this.title.style, {
      display: 'block',
      margin: '0 auto 16px auto',
      textAlign: 'center'
    });
  }

  _setupGameEndButton() {
    Object.assign(this.button.style, {
      display: 'block',
      position: 'static',
      margin: '0 auto',
      marginTop: '0px',
      zIndex: '10000',
      textAlign: 'center'
    });
    
    if (this.title.nextSibling !== this.button) {
      this.overlay.insertBefore(this.button, this.title.nextSibling);
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================
  
  _hideOnboardingElements() {
    const elements = [
      this._onboardingColumns,
      this._onboardingImgCol,
      this._onboardingTextCol,
      this._onboardingImg,
      this._onboardingText
    ];
    
    elements.forEach(el => {
      if (el) el.style.display = 'none';
    });
  }

  _showOnboardingElements() {
    const elements = [
      this._onboardingColumns,
      this._onboardingImgCol,
      this._onboardingTextCol,
      this._onboardingImg,
      this._onboardingText
    ];
    
    elements.forEach(el => {
      if (el) el.style.display = '';
    });
  }
}