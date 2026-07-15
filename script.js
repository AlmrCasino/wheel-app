const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const resultBox = document.getElementById("result");

const telegram = window.Telegram?.WebApp;
const params = new URLSearchParams(window.location.search);

const eligible = params.get("eligible") === "1";
const remaining = Number(params.get("remaining") || "100000");
const available = Number(params.get("available") || "0");

const prizes = [
  "حظ أوفر",
  "2,500 ل.س",
  "حظ أوفر",
  "5,000 ل.س",
  "حظ أوفر",
  "10,000 ل.س",
  "حظ أوفر",
  "25,000 ل.س",
];

const segmentColors = [
  "#0f5ed7",
  "#f4f7ff",
  "#0f5ed7",
  "#f4f7ff",
  "#0f5ed7",
  "#f4f7ff",
  "#0f5ed7",
  "#f4f7ff",
];

let currentRotation = 0;
let spinning = false;
let submitted = false;

function formatSyp(value) {
  return `${new Intl.NumberFormat("en-US").format(value)} ل.س`;
}

function drawWheel(rotation = 0) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = canvas.width / 2 - 18;
  const segmentAngle = (Math.PI * 2) / prizes.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  prizes.forEach((prize, index) => {
    const startAngle = rotation + index * segmentAngle - Math.PI / 2;
    const endAngle = startAngle + segmentAngle;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = segmentColors[index];
    ctx.fill();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + segmentAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = index % 2 === 0 ? "#ffffff" : "#17376f";
    ctx.font = "bold 21px Arial";
    ctx.fillText(prize, radius - 35, 8);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(centerX, centerY, 58, 0, Math.PI * 2);
  ctx.fillStyle = eligible ? "#d9b878" : "#777777";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(centerX, centerY, 43, 0, Math.PI * 2);
  ctx.fillStyle = eligible ? "#0a2a73" : "#444444";
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 23px Arial";
  ctx.fillText(eligible ? "دوّر" : "مقفول", centerX, centerY);
}

function normalizeAngle(angle) {
  const fullCircle = Math.PI * 2;
  return ((angle % fullCircle) + fullCircle) % fullCircle;
}

function sendSpinToBot() {
  if (!telegram) {
    resultBox.textContent = "❌ افتح عجلة الحظ من داخل البوت.";
    return;
  }

  telegram.sendData(
    JSON.stringify({
      action: "wheel_spin",
    })
  );

  resultBox.innerHTML =
    "✅ تم تثبيت اللفة.<br>" +
    "ارجع للمحادثة لمعرفة النتيجة.";

  setTimeout(() => {
    telegram.close();
  }, 1700);
}

function spinWheel() {
  if (!eligible || spinning || submitted) {
    return;
  }

  spinning = true;
  submitted = true;
  canvas.style.pointerEvents = "none";
  resultBox.textContent = "جاري تدوير العجلة...";

  const extraTurns = 6;
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
    spinning = false;
    resultBox.textContent = "⏳ يتم تثبيت النتيجة داخل البوت...";
    sendSpinToBot();
  }

  requestAnimationFrame(animate);
}

canvas.addEventListener("click", spinWheel);

if (telegram) {
  telegram.ready();
  telegram.expand();
}

drawWheel(0);

if (eligible) {
  canvas.style.cursor = "pointer";
  resultBox.innerHTML =
    "✅ لديك لفة متاحة الآن.<br>" +
    `🎟️ عدد اللفات المتاحة: <strong>${available}</strong><br><br>` +
    "اضغط على زر <strong>دوّر</strong> الموجود في منتصف العجلة.";
} else {
  canvas.style.cursor = "not-allowed";
  canvas.style.pointerEvents = "none";
  resultBox.innerHTML =
    "<strong>الشحن لتفعيل لفتك اليومية</strong><br><br>" +
    `تحتاج لشحن مبلغ <strong>${formatSyp(remaining)}</strong><br>` +
    "للحصول على لفة جديدة";
}
