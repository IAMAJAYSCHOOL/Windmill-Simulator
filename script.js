const canvas = document.getElementById("windCanvas");
const ctx = canvas.getContext("2d");

const speedInput = document.getElementById("windSpeed");
const speedPill = document.getElementById("speedPill");
const speedMetric = document.getElementById("speedMetric");
const speedMs = document.getElementById("speedMs");
const rpmMetric = document.getElementById("rpmMetric");
const revMetric = document.getElementById("revMetric");
const powerMetric = document.getElementById("powerMetric");
const kwMetric = document.getElementById("kwMetric");
const statusBox = document.getElementById("statusBox");
const canvasStatus = document.getElementById("canvasStatus");
const canvasWind = document.getElementById("canvasWind");

const brakeBtn = document.getElementById("brakeBtn");
const gustBtn = document.getElementById("gustBtn");
const autoBtn = document.getElementById("autoBtn");
const resetBtn = document.getElementById("resetBtn");

let wind = 35, brake = false, gusts = false, auto = false;
let rotorAngle = 0, last = performance.now(), autoTime = 0;
let cloudOffset = 0;
let lastUIUpdate = 0;
let particles = Array.from({length: 34}, () => ({
  x: Math.random(), y: .18 + Math.random() * .58,
  len: .012 + Math.random() * .025, phase: Math.random() * 10
}));

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const r = canvas.getBoundingClientRect();
  canvas.width = r.width * dpr;
  canvas.height = r.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize);
resize();

function powerFor(v) {
  if (v < 5) return 0;
  return Math.round(1600 * Math.pow((v - 5) / 95, 2.3));
}

function effectiveWind() {
  if (brake) return 0;
  if (!gusts) return wind;

  // Smooth temporary wind-speed changes around the selected speed.
  const gust = 1 + Math.sin(performance.now() / 420) * 0.25;
  return Math.max(0, Math.min(100, Math.round(wind * gust)));
}

function values() {
  const v = effectiveWind();
  const rpm = v === 0 ? 0 : Math.round(v / 100 * 28 + 2);
  const power = powerFor(v);
  return {v, rpm, power};
}

function updateUI() {
  const {v, rpm, power} = values();
  const ms = (v / 3.6).toFixed(1);

  speedPill.textContent = `${v} km/h`;
  speedMetric.textContent = `${v} km/h`;
  speedMs.textContent = `${ms} m/s`;
  rpmMetric.textContent = `${rpm} RPM`;
  revMetric.textContent = brake ? "Locked" : rpm ? `${(rpm / 60).toFixed(2)} rev/sec` : "Stationary";
  powerMetric.textContent = `${power} W`;
  kwMetric.textContent = `${(power / 1000).toFixed(2)} kW`;
  canvasWind.textContent = `${v} km/h`;

  let status = "No wind", efficiency = 0;
  if (brake) status = "Brake engaged — rotor locked";
  else if (v < 10) status = v === 0 ? "No wind" : "Below cut-in speed";
  else if (v < 45) status = "Low power generation";
  else if (v < 75) status = "Optimal generation";
  else status = "Peak generation capacity";
  if (v > 0) efficiency = Math.min(100, Math.round(power / 1600 * 100));

  statusBox.innerHTML = `${status} <span>Efficiency ${efficiency}%</span>`;
  canvasStatus.textContent = brake ? "Rotor locked" : v === 0 ? "Rotor stationary" : "Rotor spinning";
  brakeBtn.classList.toggle("active", brake);
  gustBtn.classList.toggle("active", gusts);
  autoBtn.classList.toggle("active", auto);

  document.querySelectorAll(".preset").forEach(b =>
    b.classList.toggle("active", Number(b.dataset.speed) === wind)
  );
}

function draw(t) {
  const now = t;
  const dt = Math.min((now - last) / 1000, .05);
  last = now;

  if (auto && !brake) {
    autoTime += dt;
    wind = Math.round(50 + 45 * Math.sin(autoTime * .65));
    speedInput.value = wind;
  }

  const w = canvas.clientWidth, h = canvas.clientHeight;
  const {v, rpm} = values();

  // Refresh displayed RPM/power while gusts are changing the effective wind.
  if (now - lastUIUpdate > 100) {
    updateUI();
    lastUIUpdate = now;
  }

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#08141e");
  sky.addColorStop(.58, "#102a35");
  sky.addColorStop(1, "#17483f");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // moon/sun glow
  const gx = w * .78, gy = h * .18;
  const glow = ctx.createRadialGradient(gx, gy, 5, gx, gy, 130);
  glow.addColorStop(0, "rgba(240,189,103,.85)");
  glow.addColorStop(.25, "rgba(240,189,103,.18)");
  glow.addColorStop(1, "rgba(240,189,103,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(gx - 140, gy - 140, 280, 280);
  ctx.fillStyle = "#f0bd67";
  ctx.beginPath(); ctx.arc(gx, gy, 18, 0, Math.PI * 2); ctx.fill();

  // clouds move with the wind
  cloudOffset += (v / 100) * 0.012 * dt * (gusts ? 1.35 : 1);
  cloudOffset %= 1.35;

  ctx.fillStyle = "rgba(220,240,238,.10)";
  [[.12,.2,1],[.36,.13,.75],[.62,.24,.9]].forEach(([x,y,s]) => {
    let X = ((x + cloudOffset) % 1.35) * w;
    if (X < -80) X += w + 80;
    const Y = h * y;
    ctx.beginPath();
    ctx.arc(X,Y,28*s,0,Math.PI*2);
    ctx.arc(X+25*s,Y-10*s,22*s,0,Math.PI*2);
    ctx.arc(X+47*s,Y,25*s,0,Math.PI*2);
    ctx.arc(X+24*s,Y+8*s,20*s,0,Math.PI*2);
    ctx.fill();
  });

  // wind particles
  if (v > 0) {
    ctx.lineCap = "round";
    particles.forEach(p => {
      const speed = (.05 + v / 100 * .18) * (gusts ? 1.8 + Math.sin(now/250+p.phase)*.35 : 1);
      p.x += speed * dt;
      if (p.x > 1.08) { p.x = -.08; p.y = .18 + Math.random() * .58; }
      const x = p.x*w, y = p.y*h, len = p.len*w*(.5+v/100);
      const grad = ctx.createLinearGradient(x-len,y,x,y);
      grad.addColorStop(0,"rgba(77,225,193,0)");
      grad.addColorStop(.5,"rgba(77,225,193,.45)");
      grad.addColorStop(1,"rgba(220,255,248,.05)");
      ctx.strokeStyle = grad; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x-len,y); ctx.lineTo(x,y); ctx.stroke();
    });
  }

  // ground
  const ground = h*.78;
  ctx.fillStyle = "#0b332e";
  ctx.beginPath();
  ctx.moveTo(0,ground+18);
  ctx.bezierCurveTo(w*.25,ground-30,w*.6,ground+18,w,ground-18);
  ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.fill();

  // tower
  const cx=w*.42, hubY=ground*.44;
  ctx.fillStyle="#b6c4c3";
  ctx.beginPath();
  ctx.moveTo(cx-10,hubY+10); ctx.lineTo(cx+10,hubY+10);
  ctx.lineTo(cx+42,ground); ctx.lineTo(cx-42,ground); ctx.closePath(); ctx.fill();

  ctx.strokeStyle="rgba(7,17,22,.55)"; ctx.lineWidth=2;
  for(let i=0;i<5;i++){
    const y=hubY+25+i*(ground-hubY-30)/5;
    ctx.beginPath(); ctx.moveTo(cx-(y-hubY)*.08,y); ctx.lineTo(cx+(y-hubY)*.08,y); ctx.stroke();
  }

  // nacelle
  ctx.fillStyle="#d6dfdd";
  ctx.beginPath();
  ctx.roundRect(cx-38,hubY-18,76,36,8); ctx.fill();
  ctx.fillStyle="#4de1c1";
  ctx.beginPath(); ctx.arc(cx+30,hubY,5,0,Math.PI*2); ctx.fill();

  // rotor
  const bladeLen=Math.min(w,h)*.27;
  if (!brake) rotorAngle += (rpm/60)*Math.PI*2*dt;
  ctx.save();
  ctx.translate(cx,hubY);
  for(let i=0;i<3;i++){
    ctx.save();
    ctx.rotate(rotorAngle+i*Math.PI*2/3);
    const g=ctx.createLinearGradient(0,-10,bladeLen,0);
    g.addColorStop(0,"#f4f7f4"); g.addColorStop(1,"#82999a");
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.moveTo(0,-6);
    ctx.quadraticCurveTo(bladeLen*.45,-12,bladeLen,-2);
    ctx.quadraticCurveTo(bladeLen*.48,8,0,6);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  const hub=ctx.createRadialGradient(-3,-3,2,0,0,14);
  hub.addColorStop(0,"#fff"); hub.addColorStop(.5,"#cbd7d5"); hub.addColorStop(1,"#4b6265");
  ctx.fillStyle=hub; ctx.beginPath(); ctx.arc(0,0,14,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle="#4de1c1"; ctx.lineWidth=2; ctx.stroke();
  ctx.restore();

  requestAnimationFrame(draw);
}

speedInput.addEventListener("input", e => {
  wind = Number(e.target.value);
  auto = false;
  updateUI();
});

document.querySelectorAll(".preset").forEach(btn => btn.addEventListener("click", () => {
  wind = Number(btn.dataset.speed);
  speedInput.value = wind;
  auto = false;
  updateUI();
}));

brakeBtn.addEventListener("click", () => { brake = !brake; updateUI(); });
gustBtn.addEventListener("click", () => { gusts = !gusts; updateUI(); });
autoBtn.addEventListener("click", () => { auto = !auto; updateUI(); });
resetBtn.addEventListener("click", () => {
  wind = 35; brake = false; gusts = false; auto = false; autoTime = 0;
  speedInput.value = wind;
  updateUI();
});

updateUI();
requestAnimationFrame(draw);
