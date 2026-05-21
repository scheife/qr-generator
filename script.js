const input    = document.getElementById('url-input');
const genBtn   = document.getElementById('generate-btn');
const qrCard   = document.getElementById('qr-card');
const qrWrap   = document.getElementById('qr-wrap');
const dlPng    = document.getElementById('dl-png');
const dlSvg    = document.getElementById('dl-svg');
const urlLabel = document.getElementById('qr-url-label');

// HoamatWerk Branding
const COLOR_DARK  = '#3B2A1A';
const COLOR_LIGHT = '#F5F0E8';

let qrInstance = null;

function isValidUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function generateQR() {
  const url = input.value.trim();

  if (!isValidUrl(url)) {
    input.classList.add('error');
    setTimeout(() => input.classList.remove('error'), 600);
    input.focus();
    return;
  }

  // Clear previous
  qrWrap.innerHTML = '';
  if (qrInstance) { qrInstance = null; }

  qrInstance = new QRCode(qrWrap, {
    text: url,
    width: 260,
    height: 260,
    colorDark: COLOR_DARK,
    colorLight: COLOR_LIGHT,
    correctLevel: QRCode.CorrectLevel.H,
  });

  qrCard.style.display = 'block';
  qrCard.style.animation = 'none';
  void qrCard.offsetWidth;
  qrCard.style.animation = '';

  urlLabel.textContent = url.length > 60 ? url.slice(0, 57) + '…' : url;
}

genBtn.addEventListener('click', generateQR);
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') generateQR(); });

// ── Download PNG ──
dlPng.addEventListener('click', () => {
  const img = qrWrap.querySelector('img');
  const canvas = qrWrap.querySelector('canvas');
  let src = '';
  if (canvas) {
    src = canvas.toDataURL('image/png');
  } else if (img) {
    src = img.src;
  } else { return; }
  const link = document.createElement('a');
  link.download = slugify(input.value.trim()) + '.png';
  link.href = src;
  link.click();
});

// ── Download SVG (convert canvas to SVG-wrapped PNG) ──
dlSvg.addEventListener('click', () => {
  const canvas = qrWrap.querySelector('canvas');
  if (!canvas) return;
  const dataUrl = canvas.toDataURL('image/png');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="260" height="260">
  <image href="${dataUrl}" width="260" height="260"/>
</svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = slugify(input.value.trim()) + '.svg';
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

function slugify(url) {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .slice(0, 40)
    .replace(/^-|-$/g, '') || 'qrcode';
}