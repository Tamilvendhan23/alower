// ── Disable right click ──
document.addEventListener('contextmenu', e => e.preventDefault());

// ── Live clock ──
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function updateClock() {
  const dateEl = document.getElementById('clockDate');
  const timeEl = document.getElementById('clockTime');
  if (!dateEl || !timeEl) return;
  const now = new Date();
  dateEl.textContent = `${months[now.getMonth()]} ${now.getDate()}`;
  timeEl.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map(n => String(n).padStart(2,'0')).join(':');
}
updateClock();
setInterval(updateClock, 1000);

// ── Tab navigation (single source of truth) ──
const navItems    = document.querySelectorAll('.nav-item');
const pages       = document.querySelectorAll('.page');
const mainHeader  = document.getElementById('mainHeader');
const headerTitle = document.getElementById('headerTitle');
const HEADER_PAGES = ['passes'];

function switchToPage(target, title) {
  navItems.forEach(n => n.classList.remove('active'));
  const navBtn = document.querySelector(`.nav-item[data-page="${target}"]`);
  if (navBtn) navBtn.classList.add('active');

  pages.forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById('page-' + target);
  if (pageEl) pageEl.classList.add('active');

  if (headerTitle) headerTitle.textContent = title || target;
  mainHeader.style.display = HEADER_PAGES.includes(target) ? 'flex' : 'none';

  // Hide footer on ticket page, show on all others
  document.querySelector('.bottom-nav').style.display = target === 'ticket' ? 'none' : 'flex';
}

navItems.forEach(item => {
  item.addEventListener('click', () => {
    switchToPage(item.dataset.page, item.dataset.title);
  });
});

// Ticket image click → go back to Home
document.addEventListener('DOMContentLoaded', () => {
  const ticketImg = document.querySelector('.ticket-img');
  if (ticketImg) {
    ticketImg.addEventListener('click', () => switchToPage('home', 'Home'));
  }
});

// ── QR code alternator ──
const qrImages = [
  'assets/images/qr_code.png',
  'assets/images/qr_code2.png'
];
let qrIndex = 0;
setInterval(() => {
  qrIndex = (qrIndex + 1) % qrImages.length;
  document.getElementById('qrImage').src = qrImages[qrIndex];
}, 4000);

// ── Ticket keypad ──
let ticketInput = '';
const MAX_LEN = 5;
let currentEnteredCode = localStorage.getItem('enteredCode') || '';

function updateTicketDisplay() {
  for (let i = 0; i < MAX_LEN; i++) {
    const slot = document.getElementById('slot' + i);
    if (!slot) continue;
    if (ticketInput[i]) {
      slot.textContent = ticketInput[i];
      slot.classList.add('filled');
    } else {
      slot.textContent = '_';
      slot.classList.remove('filled');
    }
  }
  document.getElementById('activateBtn')
    .classList.toggle('ready', ticketInput.length === MAX_LEN);
}

function keyPress(char) {
  if (ticketInput.length >= MAX_LEN) return;

  const isAlpha = ['J', 'K', 'I', 'S'].includes(char);

  if (ticketInput.length === 0) {
    // First position must be alphabet
    if (!isAlpha) return;
  } else {
    // All other positions must be numbers only
    if (isAlpha) return;
  }

  ticketInput += char;
  updateTicketDisplay();
  updateKeyboardState();
  document.querySelector('.bottom-nav').style.display = 'none';
}

function keyDelete() {
  if (ticketInput.length === 0) return;
  ticketInput = ticketInput.slice(0, -1);
  updateTicketDisplay();
  updateKeyboardState();
  if (ticketInput.length === 0) {
    document.querySelector('.bottom-nav').style.display = 'none'; // stays hidden on ticket page
  }
}

function updateKeyboardState() {
  const alphas = document.querySelectorAll('.key.alpha');
  const nums   = document.querySelectorAll('.key.num');

  if (ticketInput.length >= 1) {
    alphas.forEach(k => { k.style.color = '#b5b5b5'; k.style.fontWeight = '500'; });
    nums.forEach(k => { k.style.color = '#484848'; k.style.fontWeight = '700'; });
  } else {
    alphas.forEach(k => { k.style.color = '#484848'; k.style.fontWeight = '700'; });
    nums.forEach(k => { k.style.color = '#b5b5b5'; k.style.fontWeight = '500'; });
  }
}

function showActivatedStamp(code) {
  const wrap = document.getElementById('activatedStampWrap');
  const text = document.getElementById('activatedStampText');
  text.innerHTML = '<span style="font-size:15px;letter-spacing:4px;">' + code + '</span>';
  wrap.style.display = 'block';
  document.getElementById('previewBtn').style.display = 'block';
}

function activatePass() {
  if (ticketInput.length < MAX_LEN) return;

  currentEnteredCode = ticketInput;
  localStorage.setItem('enteredCode', currentEnteredCode);

  // Switch to passes page
  switchToPage('passes', 'Passes');

  // Show stamp on card
  showActivatedStamp(currentEnteredCode);

  // Reset ticket input
  ticketInput = '';
  updateTicketDisplay();
}

// ── Generic image preview (clock, QR, profile) ──
let previewClockTimer = null;

function openImagePreview(type) {
  const overlay = document.getElementById('imagePreviewOverlay');
  const img     = document.getElementById('imagePreviewImg');
  const label   = document.getElementById('imagePreviewLabel');

  if (type === 'qr') {
    img.src = document.getElementById('qrImage').src;
    img.style.borderRadius = '14px';
    img.style.filter = 'sepia(0.5) saturate(1.5) hue-rotate(10deg)';

  } else if (type === 'clock') {
    img.style.display = 'none';
    label.innerHTML = `
      <div style="text-align:center; background:rgba(255,255,255,0.95);
        border-radius:16px; padding:24px 36px;">
        <div id="previewClockDate" style="font-size:20px; color:#555; font-weight:500; letter-spacing:1px; font-family:'PixelCaps', monospace;"></div>
        <div id="previewClockTime" style="font-size:42px; font-weight:800; color:#111; letter-spacing:3px; font-variant-numeric:tabular-nums; font-family:'PixelCaps', monospace;"></div>
      </div>`;

    function tickPreviewClock() {
      const d = document.getElementById('previewClockDate');
      const t = document.getElementById('previewClockTime');
      if (!d || !t) { clearInterval(previewClockTimer); return; }
      const now = new Date();
      d.textContent = `${months[now.getMonth()]} ${now.getDate()}`;
      t.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map(n => String(n).padStart(2,'0')).join(':');
    }

    tickPreviewClock();
    previewClockTimer = setInterval(tickPreviewClock, 1000);

  } else if (type === 'profile') {
    img.src = 'assets/images/profile.jpg';
    img.style.borderRadius = '16px';
    img.style.filter = 'none';
  }

  if (type !== 'clock') {
    img.style.display = 'block';
    label.style.marginTop = '0';
  }

  overlay.style.display = 'flex';
}

function closeImagePreview() {
  clearInterval(previewClockTimer);
  previewClockTimer = null;
  document.getElementById('imagePreviewOverlay').style.display = 'none';
  document.getElementById('imagePreviewImg').style.display = 'block';
  document.getElementById('imagePreviewLabel').innerHTML = '';
}

function handleVerifyClick() {
  if (!currentEnteredCode) {
    switchToPage('ticket', 'Ticket');
  } else {
    openStampPreview();
  }
}

// ── Renew pass ──
function renewPass() {
  document.getElementById('activatedStampWrap').style.display = 'none';

  currentEnteredCode = '';
  localStorage.removeItem('enteredCode');

  ticketInput = '';
  updateTicketDisplay();
  updateKeyboardState();
}

// ── Stamp preview ──
function openStampPreview() {
  if (!currentEnteredCode) return;

  const previewText = document.getElementById('previewStampOverlayText');
  previewText.style.cssText = 'position:absolute; top:71%; left:33%; font-size:22px; font-weight:700; color:white; letter-spacing:4px; white-space:nowrap;';
  previewText.textContent = currentEnteredCode;

  document.getElementById('stampPreviewOverlay').style.display = 'flex';
}

function closeStampPreview() {
  document.getElementById('stampPreviewOverlay').style.display = 'none';
}

// ── Init ──
updateTicketDisplay();
updateKeyboardState();

// Restore activated pass state if it exists (saved permanently)
if (currentEnteredCode) {
  showActivatedStamp(currentEnteredCode);
}

// ── Service Worker (offline support) ──
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

// ── Splash screen — skip if already played this session ──
const splash      = document.getElementById('splash');
const splashVideo = document.getElementById('splashVideo');

function hideSplash() {
  if (splash.style.display === 'none') return;
  splash.style.transition = 'opacity 0.5s ease';
  splash.style.opacity = '0';
  setTimeout(() => splash.style.display = 'none', 500);
}

if (splash && splashVideo) {
  splashVideo.addEventListener('ended', hideSplash);
  setTimeout(hideSplash, 5000);
}