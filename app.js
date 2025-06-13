const upload = document.getElementById('upload');
const original = document.getElementById('original');
const enhanced = document.getElementById('enhanced');
const info = document.getElementById('info');
const autoEnhance = document.getElementById('autoEnhance');
const rotateBtn = document.getElementById('rotate');
const flipBtn = document.getElementById('flip');
const resetBtn = document.getElementById('reset');
const downloadBtn = document.getElementById('download');
const modeToggle = document.getElementById('modeToggle');

let angle = 0;
let flipped = false;
let img = new Image();
let zoom = 1;
let panX = 0, panY = 0;
let isDragging = false, startX, startY;

upload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  img.src = URL.createObjectURL(file);
  img.onload = drawImage;
});

function drawImage() {
  const ctx = original.getContext('2d');
  original.width = img.width;
  original.height = img.height;
  ctx.clearRect(0, 0, original.width, original.height);
  ctx.drawImage(img, 0, 0);

  // Copy to enhanced
  enhanceImage();
}

function enhanceImage() {
  const ctx = enhanced.getContext('2d');
  enhanced.width = img.width;
  enhanced.height = img.height;
  ctx.filter = 'brightness(1.2) contrast(1.2)';
  ctx.clearRect(0, 0, enhanced.width, enhanced.height);
  ctx.save();
  ctx.translate(enhanced.width/2, enhanced.height/2);
  ctx.rotate(angle * Math.PI / 180);
  ctx.scale(flipped ? -1 : 1, 1);
  ctx.scale(zoom, zoom);
  ctx.drawImage(img, -img.width/2 + panX, -img.height/2 + panY);
  ctx.restore();
}

// Auto Enhance
autoEnhance.addEventListener('click', enhanceImage);

// Rotate
rotateBtn.addEventListener('click', () => {
  angle += 90;
  enhanceImage();
});

// Flip
flipBtn.addEventListener('click', () => {
  flipped = !flipped;
  enhanceImage();
});

// Reset
resetBtn.addEventListener('click', () => {
  angle = 0;
  flipped = false;
  zoom = 1;
  panX = 0;
  panY = 0;
  enhanceImage();
});

// Download
downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'enhanced.png';
  link.href = enhanced.toDataURL();
  link.click();
});

// Mode Toggle
modeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  gsap.to(modeToggle, { rotation: "+=180", duration: 0.5 });
});

// Zoom & Pan
enhanced.addEventListener('wheel', e => {
  zoom += e.deltaY * -0.001;
  zoom = Math.min(Math.max(zoom, 0.5), 3);
  enhanceImage();
});

enhanced.addEventListener('mousedown', e => {
  isDragging = true;
  startX = e.offsetX;
  startY = e.offsetY;
});

enhanced.addEventListener('mouseup', () => isDragging = false);
enhanced.addEventListener('mouseout', () => isDragging = false);
enhanced.addEventListener('mousemove', e => {
  if (!isDragging) return;
  panX += (e.offsetX - startX) / zoom;
  panY += (e.offsetY - startY) / zoom;
  startX = e.offsetX;
  startY = e.offsetY;
  enhanceImage();
});
