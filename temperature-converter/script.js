class Particle {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'particle';
    this.size = Math.random() * 30 + 10;
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.vx = Math.random() * 0.5 - 0.25;
    this.vy = Math.random() * 0.5 - 0.25;
    this.element.style.width = `${this.size}px`;
    this.element.style.height = `${this.size}px`;
    document.body.appendChild(this.element);
  }

  update(mouseX, mouseY) {
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
  if (distance < 250) {
    const force = (250 - distance) / 25;
    this.element.style.opacity = Math.min(1, 0.9 + force/2);
    this.element.style.transform = `translate(${this.x}px, ${this.y}px) scale(${1 + force/10})`;
      this.vx += (dx / distance) * force;
      this.vy += (dy / distance) * force;
    }
    
    this.x += this.vx;
    this.y += this.vy;
    
    // Boundary checks
    if (this.x < -this.size) this.x = window.innerWidth + this.size;
    if (this.x > window.innerWidth + this.size) this.x = -this.size;
    if (this.y < -this.size) this.y = window.innerHeight + this.size;
    if (this.y > window.innerHeight + this.size) this.y = -this.size;
    
    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }
}

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animate() {
  particles.forEach(particle => particle.update(mouseX, mouseY));
  console.log('Animating', particles.length, 'particles');
  requestAnimationFrame(animate);
}

let particles = [];

// Initialize particles with random sizes
particles = Array.from({length: 80}, () => new Particle());
animate();
console.log('Particle system initialized with', particles.length, 'particles');

function convert() {
  const input = document.getElementById("inputTemp").value;
  const type = document.getElementById("conversionType").value;
  const resultElement = document.getElementById("result");
  
  if (!input || isNaN(input)) {
    resultElement.innerText = "Error: Please enter a valid number";
    resultElement.className = "error";
    return;
  }

  const value = parseFloat(input);
  let result;
  resultElement.className = "success";
  
  switch(type) {
    case "CtoF":
      result = (value * 9/5 + 32).toFixed(3) + " °F";
      break;
    case "FtoC":
      result = ((value - 32) * 5/9).toFixed(3) + " °C";
      break;
    case "CtoK":
      result = (value + 273.15).toFixed(3) + " K";
      break;
    case "KtoC":
      result = (value - 273.15).toFixed(3) + " °C";
      break;
    case "FtoK":
      result = ((value - 32) * 5/9 + 273.15).toFixed(3) + " K";
      break;
    case "KtoF":
      result = ((value - 273.15) * 9/5 + 32).toFixed(3) + " °F";
      break;
    default:
      result = "Invalid conversion";
  }
  
  resultElement.innerText = `Result: ${result}`;
}
