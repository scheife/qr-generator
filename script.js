const input     = document.getElementById('url-input');
const genBtn    = document.getElementById('generate-btn');
const qrCard    = document.getElementById('qr-card');
const canvas    = document.getElementById('qr-canvas');
const dlPng     = document.getElementById('dl-png');
const dlSvg     = document.getElementById('dl-svg');
const urlLabel  = document.getElementById('qr-url-label');

// HoamatWerk Branding
const COLOR_DARK  = '#3B2A1A'; // Dunkelbraun – QR module color
const COLOR_LIGHT = '#F5F0E8'; // Creme – background

let lastUrl = '';

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

  lastUrl = url;

  QRCode.toCanvas(canvas, url, {
    width: 260,
    margin: 2,
    color: {
      dark:  COLOR_DARK,
      light: COLOR_LIGHT,
    },
    errorCorrectionLevel: 'H',
  }, (err) => {
    if (err) { console.error(err); return; }

    qrCard.style.display = 'block';
    qrCard.style.animation = 'none';
    void qrCard.offsetWidth; // reflow
    qrCard.style.animation = '';

    // truncate long URLs for display
    urlLabel.textContent = url.length > 60 ? url.slice(0, 57) + '…' : url;
  });
}

// ── Events ──
genBtn.addEventListener('click', generateQR);

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') generateQR();
});

// ── Download PNG ──
dlPng.addEventListener('click', () => {
  if (!lastUrl) return;
  const link = document.createElement('a');
  link.download = slugify(lastUrl) + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// ── Download SVG ──
dlSvg.addEventListener('click', () => {
  if (!lastUrl) return;

  QRCode.toString(lastUrl, {
    type: 'svg',
    width: 260,
    margin: 2,
    color: {
      dark:  COLOR_DARK,
      light: COLOR_LIGHT,
    },
    errorCorrectionLevel: 'H',
  }, (err, svgString) => {
    if (err) { console.error(err); return; }
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = slugify(lastUrl) + '.svg';
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
});

// ── Helper ──
function slugify(url) {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .slice(0, 40)
    .replace(/^-|-$/g, '') || 'qrcode';
}
