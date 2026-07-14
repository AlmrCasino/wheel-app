const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spinButton");
const resultBox = document.getElementById("result");

const prizes = [
  "2,500 ل.س",
  "5,000 ل.س",
  "10,000 ل.س",
  "25,000 ل.س",
  "محاولة مجانية",
  "خصم 5% من العمولة",
];

const segmentColors = [
  "#0f5ed7",
  "#f4f7ff",
  "#0f5ed7",
  "#f4f7ff",
  "#0f5ed7",
  "#f4f7ff",
];

let currentRotation = 0;
let spinning = false;

function drawWheel(rotation = 0) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = canvas.width / 2 - 18;
  const segmentAngle = (Math.PI * 2) / prizes.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < prizes.length; i += 1) {
    const startAngle = rotation + i * segmentAngle - Math.PI / 2;
    const endAngle = startAngle + segmentAngle;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = segmentColors[i];
    ctx.fill();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + segmentAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#17376f";
    ctx.font = "bold 24px Arial";
    ctx.fillText(prizes[i], radius - 40, 8);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(centerX, centerY, 58, 0, Math.PI * 2);
  ctx.fillStyle = "#d9b878";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(centerX, centerY, 43, 0, Math.PI * 2);
  ctx.fillStyle = "#0a2a73";
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 24px Arial";
  ctx.fillText("SPIN", centerX, centerY);
}

function normalizeAngle(angle) {
  const fullCircle = Math.PI * 2;
  return ((angle % fullCircle) + fullCircle) % fullCircle;
}

function getWinningIndex(rotation) {
  const segmentAngle = (Math.PI * 2) / prizes.length;
  const pointerAngle = -Math.PI / 2;
  const relative = normalizeAngle(pointerAngle - rotation);
  return Math.floor(relative / segmentAngle) % prizes.length;
}

function spinWheel() {
  if (spinning) {
    return;
  }

  spinning = true;
  spinButton.disabled = true;
  resultBox.textContent = "جاري تدوير العجلة...";

  const extraTurns = 6 + Math.floor(Math.random() * 3);
  const randomOffset = Math.random() * Math.PI * 2;
  const startRotation = currentRotation;
  const targetRotation =
    currentRotation + extraTurns * Math.PI * 2 + randomOffset;

  const duration = 4200;
  const startedAt = performance.now();

  function animate(now) {
    const elapsed = now - startedAt;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);

    currentRotation =
      startRotation + (targetRotation - startRotation) * eased;

    drawWheel(currentRotation);

    if (progress < 1) {
      requestAnimationFrame(animate);
      return;
    }

    currentRotation = normalizeAngle(currentRotation);
    const winningIndex = getWinningIndex(currentRotation);
    const prize = prizes[winningIndex];

    resultBox.innerHTML = `🎉 مبروك! ربحت <strong>${prize}</strong>`;
    spinButton.disabled = false;
    spinning = false;
  }

  requestAnimationFrame(animate);
}

spinButton.addEventListener("click", spinWheel);

drawWheel();
