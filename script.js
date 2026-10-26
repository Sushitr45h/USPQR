// =========================================================
// USP WMSU Campaign Website - Interactive Logic & QR
// =========================================================

const LIVE_URL = 'https://Sushitr45h.github.io/USPQR';
let currentScreenId = 'home';
let qrRendered = false;

// ---- Navigation ----
function navigateTo(targetId, updateHistory = true) {
  const target = document.getElementById(targetId);
  if (!target) return;

  // Deactivate all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  // Activate target screen
  target.classList.add('active');
  currentScreenId = targetId;

  // Scroll viewport and window to top
  window.scrollTo({ top: 0, behavior: 'instant' });
  const viewport = document.querySelector('.app-viewport');
  if (viewport) viewport.scrollTop = 0;
  if (target.classList.contains('screen-scrollable')) {
    target.scrollTop = 0;
  }

  // Update browser history
  if (updateHistory) {
    if (targetId === 'home') {
      history.pushState({ screen: 'home' }, '', window.location.pathname);
    } else {
      history.pushState({ screen: targetId }, '', '#' + targetId);
    }
  }
}

// Global alias for onclick backwards compatibility
window.go = function(id) {
  navigateTo(id);
};

// ---- Popstate (Hardware / Browser back button) ----
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.screen) {
    navigateTo(e.state.screen, false);
  } else {
    // Check hash or fallback to home
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(hash)) {
      navigateTo(hash, false);
    } else {
      navigateTo('home', false);
    }
  }
});

// ---- QR Code Modal ----
function openQRModal() {
  const modal = document.getElementById('qrModal');
  if (!modal) return;
  modal.classList.add('active');

  if (!qrRendered) {
    const container = document.getElementById('qrcode-container');
    container.innerHTML = '';

    if (typeof QRCode !== 'undefined') {
      QRCode.toCanvas(LIVE_URL, {
        width: 200,
        margin: 1,
        color: {
          dark: '#0e3158',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      }, function (err, canvas) {
        if (!err && canvas) {
          canvas.style.borderRadius = '8px';
          container.appendChild(canvas);
          qrRendered = true;
        } else {
          // Fallback to data URL
          QRCode.toDataURL(LIVE_URL, { width: 200, margin: 1 }, (err2, url) => {
            if (!err2) {
              const img = document.createElement('img');
              img.src = url;
              img.alt = 'USP WMSU QR Code';
              img.style.width = '200px';
              img.style.height = '200px';
              container.appendChild(img);
              qrRendered = true;
            } else {
              // Fallback to static image
              const img = document.createElement('img');
              img.src = 'usp-campaign-qr.jpg';
              img.alt = 'USP WMSU QR Code';
              img.style.width = '200px';
              img.style.height = '200px';
              img.style.borderRadius = '8px';
              container.appendChild(img);
              qrRendered = true;
            }
          });
        }
      });
    } else {
      // QRCode library not loaded, use static image
      const img = document.createElement('img');
      img.src = 'usp-campaign-qr.jpg';
      img.alt = 'USP WMSU QR Code';
      img.style.width = '200px';
      img.style.height = '200px';
      img.style.borderRadius = '8px';
      container.appendChild(img);
      qrRendered = true;
    }
  }
}

function closeQRModal(event) {
  const modal = document.getElementById('qrModal');
  if (!modal) return;
  if (!event || event.target === modal || event.target.classList.contains('qr-close-btn')) {
    modal.classList.remove('active');
  }
}

// ---- Keyboard Esc to close modal ----
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeQRModal();
  }
});

// ---- Swipe gesture for easy mobile back-navigation ----
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const deltaX = e.changedTouches[0].clientX - touchStartX;
  const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);

  // Swipe right from left edge to navigate back
  if (touchStartX < 50 && deltaX > 70 && deltaY < 50) {
    if (currentScreenId.endsWith('-creds') || currentScreenId.endsWith('-platform')) {
      const candidate = currentScreenId.startsWith('sadriemar') ? 'sadriemar-profile' : 'paul-profile';
      navigateTo(candidate);
    } else if (currentScreenId === 'sadriemar-profile' || currentScreenId === 'paul-profile') {
      navigateTo('home');
    }
  }
}, { passive: true });

// ---- Init on DOM ready ----
document.addEventListener('DOMContentLoaded', () => {
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && document.getElementById(initialHash)) {
    navigateTo(initialHash, false);
  } else {
    navigateTo('home', false);
  }
});
