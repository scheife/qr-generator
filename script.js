const input    = document.getElementById('url-input');
const genBtn   = document.getElementById('generate-btn');
const qrCard   = document.getElementById('qr-card');
const qrWrap   = document.getElementById('qr-wrap');
const dlPng    = document.getElementById('dl-png');
const dlSvg    = document.getElementById('dl-svg');
const urlLabel = document.getElementById('qr-url-label');

const DARK  = '#000000';
const LIGHT = '#ffffff';

let qrInstance = null;
let lastUrl = '';

function isValidUrl(s) {
  try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; }
  catch { return false; }
}

function generate() {
  const url = input.value.trim();
  if (!isValidUrl(url)) {
    input.classList.add('error');
    setTimeout(() => input.classList.remove('error'), 600);
    return;
  }
  lastUrl = url;

  // clear previous
  qrWrap.innerHTML = '';
  qrInstance = new QRCode(qrWrap, {
    text: url,
    width: 260,
    height: 260,
    colorDark: DARK,
    colorLight: LIGHT,
    correctLevel: QRCode.CorrectLevel.H,
  });

  qrCard.style.display = 'block';
  qrCard.style.animation = 'none';
  void qrCard.offsetWidth;
  qrCard.style.animation = '';
  urlLabel.textContent = url.length > 60 ? url.slice(0, 57) + '…' : url;
}

genBtn.addEventListener('click', generate);
input.addEventListener('keydown', e => { if (e.key === 'Enter') generate(); });

function getCanvas() {
  return qrWrap.querySelector('canvas');
}

dlPng.addEventListener('click', () => {
  const c = getCanvas(); if (!c) return;
  const a = document.createElement('a');
  a.download = slug(lastUrl) + '.png';
  a.href = c.toDataURL('image/png');
  a.click();
});

dlSvg.addEventListener('click', () => {
  const c = getCanvas(); if (!c) return;
  const img = c.toDataURL('image/png');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="260" height="260"><image href="${img}" width="260" height="260"/></svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = slug(lastUrl) + '.svg';
  a.href = url; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

function slug(url) {
  return url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').slice(0, 40).replace(/^-|-$/g, '') || 'qrcode';
}