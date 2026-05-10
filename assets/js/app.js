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

// ── Tab navigation ──
const navItems    = document.querySelectorAll('.nav-item');
const pages       = document.querySelectorAll('.page');
const mainHeader  = document.getElementById('mainHeader');
const headerTitle = document.getElementById('headerTitle');
const HEADER_PAGES = ['passes'];

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const target = item.dataset.page;
    const title  = item.dataset.title;
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + target).classList.add('active');
    headerTitle.textContent = title;
    mainHeader.style.display = HEADER_PAGES.includes(target) ? 'flex' : 'none';

    // Hide footer on ticket page, show on all others
    document.querySelector('.bottom-nav').style.display =
      target === 'ticket' ? 'none' : 'flex';
  });
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
let currentEnteredCode = '';

function updateTicketDisplay(){

  for(let i=0;i<MAX_LEN;i++){

    const slot = document.getElementById('slot'+i);

    if(ticketInput[i]){
      slot.textContent = ticketInput[i];
      slot.classList.add('filled');
    }else{
      slot.textContent = "_";
      slot.classList.remove('filled');
    }

  }

  document.getElementById('activateBtn')
    .classList.toggle('ready', ticketInput.length === MAX_LEN);
}

function keyPress(char){
 if(ticketInput.length >= MAX_LEN) return;
 ticketInput += char;
 updateTicketDisplay();
 updateKeyboardState();
 document.querySelector('.bottom-nav').style.display = 'none';
}

function keyDelete(){
 if(ticketInput.length === 0) return;
 ticketInput = ticketInput.slice(0,-1);
 updateTicketDisplay();
 updateKeyboardState();
  if(ticketInput.length === 0){
   document.querySelector('.bottom-nav').style.display = 'flex';
 }
}

function updateKeyboardState(){

 const alphas = document.querySelectorAll('.key.alpha');
 const nums   = document.querySelectorAll('.key.num');

 if(ticketInput.length >= 1){

   alphas.forEach(k=>{
     k.style.color = "#b5b5b5";
     k.style.fontWeight = "500";
   });

   nums.forEach(k=>{
     k.style.color = " #484848";
     k.style.fontWeight = "700";
   });

 }else{

   alphas.forEach(k=>{
     k.style.color = "#484848";
     k.style.fontWeight = "700";
   });

   nums.forEach(k=>{
     k.style.color = "#b5b5b5";
     k.style.fontWeight = "500";
   });

 }
}
function activatePass() {
  if (ticketInput.length < MAX_LEN) return;

  currentEnteredCode = ticketInput;

  // Switch to passes page
  navItems.forEach(n => n.classList.remove('active'));
  document.querySelector('[data-page="passes"]').classList.add('active');
  pages.forEach(p => p.classList.remove('active'));
  document.getElementById('page-passes').classList.add('active');
  headerTitle.textContent = 'Passes';
  mainHeader.style.display = 'flex';

  // Show stamp on card (tilted)
  const wrap = document.getElementById('activatedStampWrap');
  const text = document.getElementById('activatedStampText');
  text.innerHTML = '<span style="font-size:15px;letter-spacing:4px;">' + currentEnteredCode + '</span>';
  wrap.style.display = 'block';
  

  // Show verify button
  document.getElementById('previewBtn').style.display = 'block';

  // Reset ticket input
  ticketInput = '';
  updateTicketDisplay();

  document.querySelector('.bottom-nav').style.display = 'flex';
}

// ── Generic image preview (clock, QR, profile) ──
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
      <style>
        @font-face {
          font-family: "PixelCaps";
          src: url("../fonts/PixelCaps.ttf") format("truetype");
        }
      </style>
      <div style="text-align:center; background:rgba(255,255,255,0.95);
        border-radius:16px; padding:24px 36px;">
        <div id="previewClockDate" style="font-size:20px; color:#555; font-weight:500; letter-spacing:1px; font-family:'PixelCaps', monospace;"></div>
        <div id="previewClockTime" style="font-size:42px; font-weight:800; color:#111; letter-spacing:3px; font-variant-numeric:tabular-nums; font-family:'PixelCaps', monospace;"></div>
      </div>`;

    // update immediately then every second
    function tickPreviewClock() {
      const d = document.getElementById('previewClockDate');
      const t = document.getElementById('previewClockTime');
      if (!d || !t) { clearInterval(previewClockTimer); return; }
      const now = new Date();
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      d.textContent = `${months[now.getMonth()]} ${now.getDate()}`;
      t.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map(n => String(n).padStart(2,'0')).join(':');
    }

    tickPreviewClock();
    previewClockTimer = setInterval(tickPreviewClock, 1000);

  } else if (type === "profile") {
    img.src = "assets/images/profile.jpg";
  }

  if (type !== 'clock') {
    img.style.display = 'block';
    label.style.marginTop = '0';
  }

  overlay.style.display = 'flex';
}
let previewClockTimer = null;

function closeImagePreview() {
  clearInterval(previewClockTimer);
  previewClockTimer = null;
  document.getElementById('imagePreviewOverlay').style.display = 'none';
  document.getElementById('imagePreviewImg').style.display = 'block';
  document.getElementById('imagePreviewLabel').innerHTML = '';
}

function handleVerifyClick(){

  if(!currentEnteredCode){

    // go to ticket page
    navItems.forEach(n => n.classList.remove('active'));
    document.querySelector('[data-page="ticket"]').classList.add('active');

    pages.forEach(p => p.classList.remove('active'));
    document.getElementById('page-ticket').classList.add('active');

    mainHeader.style.display = "none";
    

  }else{

    // pass already activated
    openStampPreview();

  }

}
// back to home from ticket page,
// ---- existing nav logic (keep or add if missing) ----
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;

    // switch page
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');

    // update footer active
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');

    // update header
    const title = document.getElementById('headerTitle');
    if (title) title.innerText = item.dataset.title;
  });
});

// ---- trigger HOME nav from ticket image ----
function goBackToHome() {
  const homeNav = document.querySelector('.nav-item[data-page="home"]');
  if (homeNav) homeNav.click();
}

// attach click
document.addEventListener("DOMContentLoaded", () => {
  const ticketImg = document.querySelector('.ticket-img');
  if (ticketImg) {
    ticketImg.addEventListener('click', goBackToHome);
  }
});



// renew pass (just resets everything)
function renewPass(){

  // remove activated stamp
  document.getElementById("activatedStampWrap").style.display = "none";

  // clear stored activation code
  currentEnteredCode = "";

  // reset keypad input
  ticketInput = "";
  updateTicketDisplay();
  updateKeyboardState();

}

// ── Stamp preview ──
function openStampPreview() {
  if (!currentEnteredCode) return;

  // Set the user input text on the preview image
  const previewText = document.getElementById('previewStampOverlayText');
  previewText.style.cssText = 'position:absolute; top:71%; left:33%; font-size:22px; font-weight:700; color:white; letter-spacing:4px; white-space:nowrap;';
  previewText.textContent = currentEnteredCode;

  // Show overlay
  document.getElementById('stampPreviewOverlay').style.display = 'flex';
}

// preview for all items (clock, qr, profile)


function closeStampPreview() {
  document.getElementById('stampPreviewOverlay').style.display = 'none';
}

// Init
updateTicketDisplay();

// ── Service Worker ──
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

// ── Splash ──
const splash      = document.getElementById('splash');
const splashVideo = document.getElementById('splashVideo');

function hideSplash() {
  if (splash.style.display === 'none') return;
  splash.style.transition = 'opacity 0.5s ease';
  splash.style.opacity = '0';
  setTimeout(() => splash.style.display = 'none', 500);
}

splashVideo.addEventListener('ended', hideSplash);
setTimeout(hideSplash, 5000);