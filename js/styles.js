// styles.js
// Centralized style system for the game

// ============================================
// TYPOGRAPHY CONSTANTS
// ============================================

const FONT_FAMILY = 'VT323, Arial, sans-serif';

const TEXT_STYLES = {
  // HUD Timer (red, large)
  hudTimer: {
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    fill: 0xFF0000,
    align: 'center',
    letterSpacing: 2
  },
  
  // Toilet Counter (white, medium)
  toiletCounter: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fill: 0xFFFFFF,
    align: 'left',
    letterSpacing: 1
  },
  
  // Overlay Title (Win/Lose screens)
  overlayTitle: {
    color: '#fff',
    fontFamily: FONT_FAMILY,
    fontSize: '3rem',
    marginBottom: '16px'
  },
  
  // Overlay Button (Jugar, Volver a jugar, etc)
  overlayButton: {
    fontSize: '2rem',
    fontFamily: FONT_FAMILY,
    padding: '16px 48px',
    borderRadius: '12px',
    border: 'none',
    background: '#382F28',
    color: '#E3C3A8',
    cursor: 'pointer',
    marginTop: '16px'
  },
  
  // Onboarding Text
  onboardingText: {
    width: '100%',
    color: '#E3C3A8',
    fontFamily: FONT_FAMILY,
    fontSize: '1.4rem',
    whiteSpace: 'pre-line',
    textAlign: 'left',
    marginBottom: '32px'
  }
};

// ============================================
// PIXI TEXT SCALE MULTIPLIERS
// ============================================
const TEXT_SCALES = {
  hudTimer: 2,
  toiletCounter: 2
};

// ============================================
// LAYOUT CONSTANTS
// ============================================

const LAYOUT = {
  // HUD Timer Panel
  timerPanel: {
    width: 140,
    height: 44,
    marginTop: 10,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: 0x000000,
    borderColor: 0xCCCCCC
  },
  
  // Health Bar
  healthBar: {
    width: 240,
    height: 40,
    margin: 10,
    borderRadius: 4,
    borderWidth: 2,
    fillPadding: 2,
    backgroundColor: 0x000000,
    borderColor: 0xCCCCCC,
    fillColor: 0xD32F2F
  },
  
  // Toilet Counter Panel
  toiletPanel: {
    width: 120,
    height: 40,
    marginTop: 10,
    marginRight: 10,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: 0x000000,
    borderColor: 0xCCCCCC,
    iconScale: 0.25,
    iconOffsetX: 44
  },
  
  // Overlay dimensions
  overlay: {
    width: '1024px',
    height: '768px',
    borderRadius: '18px',
    backgroundColor: 'rgba(0,0,0,0.4)',
    boxShadow: '0 0 32px 0 rgba(0,0,0,0.7)',
    zIndex: '9999'
  },
  
  // Logo
  logo: {
    width: '384px',
    margin: '0 auto 20px auto'
  },
  
  // Onboarding columns
  onboardingColumns: {
    width: '1024px',
    maxWidth: '1024px',
    gap: '0px'
  },
  
  // Onboarding Image Column
  onboardingImgCol: {
    width: '512px',
    padding: '8px'
  },
  
  // Onboarding Image
  onboardingImg: {
    maxWidth: '512px',
    borderRadius: '12px'
  },
  
  // Onboarding Text Column
  onboardingTextCol: {
    width: '512px',
    padding: '8px'
  }
};

// ============================================
// COLOR PALETTE
// ============================================

const COLORS = {
  // UI Colors (hex strings for CSS)
  overlayBackground: 'rgba(0,0,0,0.4)',
  overlayBorder: 'rgba(0,0,0,0.7)',
  buttonBackground: '#382F28',
  buttonText: '#E3C3A8',
  titleText: '#fff',
  onboardingText: '#E3C3A8',
  
  // Game Colors (hex numbers for PIXI)
  timerText: 0xFF0000,
  healthBar: 0xD32F2F,
  panelBackground: 0x000000,
  panelBorder: 0xCCCCCC,
  toiletCountText: 0xFFFFFF,
  
  // Background colors (both formats)
  generalBackground: 0x1099BB,      // For PIXI (number)
};