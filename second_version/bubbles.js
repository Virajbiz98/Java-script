const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
let width = window.innerWidth;
let height = window.innerHeight;
let mousePos = null;
const whiteBubbles = [];
const interactiveBubbles = [];

// Resize canvas
function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Create bubbles
// White background bubbles
function initWhiteBubbles(count = 40) {
  for (let i = 0; i < count; i++) {
    whiteBubbles.push({
      x: Math.random() * width,
      y: height + Math.random() * 100,
      size: Math.random() * 8 + 2,
      speed: 0.2 + Math.random() * 0.3,
      opacity: Math.random() * 0.4 + 0.1
    });
  }
}

// Interactive green/black bubbles
function initInteractiveBubbles(count = 30) {
  for (let i = 0; i < count; i++) {
    interactiveBubbles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 30 + 1 + Math.random() * 10,
      speed: 0.1 + Math.random() * 0.2, // Slowed to 0.1-0.3
      color: Math.random() > 0.3 ? '#a3ff00' : '#000000',
      angle: Math.random() * Math.PI * 2,
      isActive: false
    });
  }
}

initWhiteBubbles();
initInteractiveBubbles();

// Mouse events
window.addEventListener('mousemove', (e) => {
  mousePos = { x: e.clientX, y: e.clientY };
});
window.addEventListener('mouseleave', () => mousePos = null);

// Animation
function animate() {
  ctx.clearRect(0, 0, width, height);
  
  // Update white bubbles
  whiteBubbles.forEach(bubble => {
    // Simple upward movement
    bubble.y -= bubble.speed;
    if (bubble.y < -bubble.size) {
      bubble.y = height + bubble.size;
      bubble.x = Math.random() * width;
    }
    
    // Draw white bubble
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity})`;
    ctx.fill();
  });

  // Update interactive bubbles
  interactiveBubbles.forEach(bubble => {
    // Repel from cursor
    if (mousePos) {
      const dx = mousePos.x - bubble.x;
      const dy = mousePos.y - bubble.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance < 200) {
        const angle = Math.atan2(dy, dx);
        const repelForce = (1 - distance/200) * 20;
        bubble.x -= Math.cos(angle) * repelForce;
        bubble.y -= Math.sin(angle) * repelForce;
        bubble.isActive = true;
      } else {
        bubble.isActive = false;
      }
    } else {
      bubble.isActive = false;
    }

    // Orbit movement
    if (!bubble.isActive) {
      bubble.angle += bubble.speed / 180; // Slower rotation speed
      const targetX = width/2 + Math.cos(bubble.angle) * (width/4); // Smaller orbit radius
      const targetY = height/2 + Math.sin(bubble.angle) * (height/3);
      bubble.x += (targetX - bubble.x) * 0.005; // Smoother movement
      bubble.y += (targetY - bubble.y) * 0.005;
    }

    // Draw bubble
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI*2);
    ctx.fillStyle = bubble.isActive 
      ? (bubble.color === '#000000' ? 'rgba(29, 80, 22, 0.15)' : 'rgba(21, 176, 10, 0.97)') 
      : (bubble.color === '#000000' ? 'rgb(0, 0, 0)' : 'rgba(99, 235, 53, 0.84)');
    
    if (bubble.color !== '#000000') {
      ctx.shadowBlur = 5;
      ctx.shadowColor = 'rgba(163, 255, 0, 0.5)';
    }
    
    ctx.fill();
    ctx.shadowBlur = 0;
  });
  
  requestAnimationFrame(animate);
}
animate();