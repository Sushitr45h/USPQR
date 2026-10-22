// ===== USP WMSU Campaign Website - Navigation & QR Logic =====

let menuOpen = false;

// ---- Toggle hamburger menu ----
function toggleMenu() {
  menuOpen = !menuOpen;
  const btn = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('mobileMenu');
  btn.classList.toggle('open', menuOpen);
  menu.classList.toggle('open', menuOpen);
}

// Close menu when clicking outside
document.addEventListener('click', function (e) {
  if (menuOpen) {
    const menu = document.getElementById('mobileMenu');
    const btn = document.getElementById('hamburgerBtn');
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menuOpen = false;
      btn.classList.remove('open');
      menu.classList.remove('open');
    }
  }
});

// ---- Section Navigation ----
let currentSection = 'home';

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active');
  });

  // Show target section
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add('active');

    // Re-trigger animation by removing and re-adding class
    target.style.animation = 'none';
    requestAnimationFrame(() => {
      target.style.animation = '';
    });

    currentSection = sectionId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update active nav links
  document.querySelectorAll('.mobile-menu a').forEach(a => a.classList.remove('active-nav'));
  const activeLink = document.getElementById('nav-' + sectionId);
  if (activeLink) activeLink.classList.add('active-nav');

  // Close menu
  if (menuOpen) toggleMenu();

  // Generate QR code when QR section is shown
  if (sectionId === 'qr') {
    generateQR();
  }
}

// ---- QR Code Generation ----
let qrGenerated = false;

function generateQR() {
  if (qrGenerated) return;

  const liveUrl = 'https://Sushitr45h.github.io/USPQR';
  const url = window.location.hostname === 'localhost' || window.location.protocol === 'file:'
    ? liveUrl
    : window.location.href.split('?')[0].split('#')[0];
  const displayEl = document.getElementById('qr-url-display');
  const qrEl = document.getElementById('qrcode');

  displayEl.textContent = url;
  qrEl.innerHTML = '';

  QRCode.toCanvas(url, {
    width: 220,
    margin: 1,
    color: {
      dark: '#0d2a4a',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  }, function (err, canvas) {
    if (err) {
      // Fallback: use img approach
      QRCode.toDataURL(url, {
        width: 220,
        margin: 1,
        color: { dark: '#0d2a4a', light: '#ffffff' }
      }, function(err2, dataUrl) {
        if (!err2) {
          const img = document.createElement('img');
          img.src = dataUrl;
          img.alt = 'QR Code';
          img.style.borderRadius = '8px';
          img.style.width = '220px';
          img.style.height = '220px';
          qrEl.appendChild(img);
          qrGenerated = true;
        }
      });
    } else {
      canvas.style.borderRadius = '8px';
      qrEl.appendChild(canvas);
      qrGenerated = true;
    }
  });
}

// ---- Handle browser back/forward ----
window.addEventListener('popstate', function (e) {
  if (e.state && e.state.section) {
    showSection(e.state.section);
  }
});

// ---- Smooth scroll animation for profile cards ----
function observeCards() {
  if (!window.IntersectionObserver) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.profile-card, .bughao-letter-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    observer.observe(card);
  });
}

// ---- Page Load ----
document.addEventListener('DOMContentLoaded', function () {
  // Read hash on load for direct navigation
  const hash = window.location.hash.replace('#', '');
  const validSections = ['home', 'sadriemar', 'paul', 'platform', 'qr'];

  if (hash && validSections.includes(hash)) {
    showSection(hash);
  } else {
    showSection('home');
  }

  // Init scroll observer
  observeCards();

  // Re-observe when sections are shown
  const origShowSection = window.showSection;
  const sectionObserver = new MutationObserver(observeCards);
  document.querySelectorAll('.section').forEach(s => {
    sectionObserver.observe(s, { attributes: true, attributeFilter: ['class'] });
  });
});

// ---- Touch swipe detection (mobile UX) ----
let touchStartX = 0;
let touchEndX = 0;
const SWIPE_THRESHOLD = 80;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;

  // Only trigger near left edge for back swipe
  if (diff < -SWIPE_THRESHOLD && touchStartX < 40 && currentSection !== 'home') {
    showSection('home');
  }
}, { passive: true });
