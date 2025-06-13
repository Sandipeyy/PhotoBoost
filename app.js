const upload = document.getElementById('upload');
const original = document.getElementById('original');
const enhanced = document.getElementById('enhanced');
const sharpenChk = document.getElementById('sharpen');
const brightnessChk = document.getElementById('brightness');
const enhanceBtn = document.getElementById('enhance');
const resetBtn = document.getElementById('reset');
const downloadBtn = document.getElementById('download');
const modeToggle = document.getElementById('modeToggle');
const info = document.getElementById('info');

let img = new Image();

upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

img.onload = () => {
  [original, enhanced].forEach(canvas => {
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
  });
  info.textContent = `Image Size: ${img.width} x ${img.height}px`;
  gsap.fromTo('.images', {scale: 0.8, opacity: 0}, {scale: 1, opacity: 1, duration: 0.8});
};

enhanceBtn.addEventListener('click', () => {
  const ctx = enhanced.getContext('2d');
  ctx.drawImage(img, 0, 0);
  let imageData = ctx.getImageData(0, 0, enhanced.width, enhanced.height);
  let data = imageData.data;

  // Brightness + Contrast
  if (brightnessChk.checked) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.1 + 10);     
      data[i+1] = Math.min(255, data[i+1] * 1.1 + 10); 
      data[i+2] = Math.min(255, data[i+2] * 1.1 + 10); 
    }
  }

  // Sharpen
  if (sharpenChk.checked) {
    const w = enhanced.width;
    const h = enhanced.height;
    const tempData = new Uint8ClampedArray(data);
    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let i = (y * w + x) * 4 + c;
          let sum = 0, k = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              let ni = ((y + ky) * w + (x + kx)) * 4 + c;
              sum += tempData[ni] * kernel[k++];
            }
          }
          data[i] = Math.min(255, Math.max(0, sum));
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  gsap.fromTo('#enhanced', {scale:0.8}, {scale:1, duration:0.5});
});

resetBtn.addEventListener('click', () => {
  const ctx = enhanced.getContext('2d');
  ctx.drawImage(img, 0, 0);
  sharpenChk.checked = false;
  brightnessChk.checked = false;
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'enhanced.png';
  link.href = enhanced.toDataURL();
  link.click();
});

modeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

window.onload = () => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
  }
};
