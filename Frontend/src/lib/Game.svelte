<script>
  import { onMount, onDestroy } from 'svelte';

  let canvas;
  let scoreEl;
  let bestEl;
  let centerEl;
  let btnbar;
  let upBtn; let downBtn; let leftBtn; let rightBtn;

  let W, H, CX, CY, R, outerR;
  let lastTime = 0;
  let running = false;
  let gameOver = false;
  let timeAlive = 0;
  let best = 0;

  const player = { x: 0, y: 0, speed: 280, radius: 12, dirX: 0, dirY: 0 };
  const arrows = [];
  const lasers = [];
  const events = [];

  function schedule(afterSec, fn){ events.push({at: timeAlive + afterSec, fn}); }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = canvas.clientWidth; H = canvas.clientHeight;
    CX = W / 2; CY = H / 2;
    R = Math.min(W, H) * 0.36;
    outerR = Math.min(W, H) * 0.60;
    // Center player on first layout before the game starts
    if (!running && timeAlive === 0) { player.x = CX; player.y = CY; }
  }

  const BASE_SPEED = 240;

  class Arrow {
    constructor(angle, speed = BASE_SPEED) {
      this.dirX = Math.cos(angle);
      this.dirY = Math.sin(angle);
      const spawnDist = outerR + 30;
      this.x = CX + this.dirX * spawnDist;
      this.y = CY + this.dirY * spawnDist;
      this.vx = -this.dirX * speed;
      this.vy = -this.dirY * speed;
      this.len = 22; this.width = 4;
      this.alive = true;
      this.travelAlong = spawnDist;
    }
    update(dt) {
      this.x += this.vx * dt; this.y += this.vy * dt;
      const dx = this.x - CX, dy = this.y - CY;
      this.travelAlong = dx * this.dirX + dy * this.dirY;
      if (this.travelAlong < -(outerR + 60)) this.alive = false;
    }
    draw(g) {
      const ang = Math.atan2(this.vy, this.vx);
      g.save(); g.translate(this.x, this.y); g.rotate(ang);
      g.fillStyle = '#c9d4ff';
      g.fillRect(-this.len, -this.width/2, this.len, this.width);
      g.beginPath(); g.moveTo(0,0); g.lineTo(-8,6); g.lineTo(-8,-6); g.closePath(); g.fill();
      g.restore();
    }
    collides(px, py, pr) {
      const rr = 8; const dx = px - this.x, dy = py - this.y; const rad = rr + pr;
      return (dx*dx + dy*dy) <= rad * rad;
    }
  }

  function rand(a,b){ return a + Math.random()*(b-a); }
  const LASER_WARN_TIME = 0.7;
  const LASER_FIRE_TIME = 0.45;
  const LASER_WIDTH = 14;

  function spawnLaser(){
    const angle = Math.random() * Math.PI * 2;
    const spin = Math.random() < 0.4;
    const angVel = spin ? (Math.random()<0.5?1:-1) * rand(0.8, 1.4) : 0;
    lasers.push({ angle, state:'warn', t:0, warn:LASER_WARN_TIME, fire:LASER_FIRE_TIME, angVel });
  }

  function updateLasers(dt){
    for (const L of lasers){
      L.t += dt;
      if (L.state==='warn' && L.t >= L.warn){ L.state='fire'; L.t = 0; }
      else if (L.state==='fire' && L.t >= L.fire){ L.state='dead'; }
      if (L.state==='fire' && L.angVel) L.angle += L.angVel * dt;
    }
    for (let i=lasers.length-1;i>=0;i--) if (lasers[i].state==='dead') lasers.splice(i,1);
  }

  function drawLasers(ctx){
    ctx.save();
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI*2); ctx.clip();
    for (const L of lasers){
      const dirx = Math.cos(L.angle), diry = Math.sin(L.angle);
      const x1 = CX - dirx * R * 1.2, y1 = CY - diry * R * 1.2;
      const x2 = CX + dirx * R * 1.2, y2 = CY + diry * R * 1.2;
      if (L.state==='warn'){
        ctx.setLineDash([10,10]); ctx.lineWidth = 2; ctx.strokeStyle = '#ff5a5a'; ctx.globalAlpha = 0.85;
      } else {
        ctx.setLineDash([]); ctx.lineWidth = LASER_WIDTH; ctx.strokeStyle = '#d7e6ff'; ctx.shadowColor = '#9ecbff'; ctx.shadowBlur = 18; ctx.globalAlpha = 1;
      }
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.setLineDash([]);
    }
    ctx.restore();
  }

  function laserHitsPlayer(px,py,pr){
    for (const L of lasers){
      if (L.state !== 'fire') continue;
      const nx = -Math.sin(L.angle), ny = Math.cos(L.angle);
      const dist = Math.abs((px - CX)*nx + (py - CY)*ny);
      if (dist <= pr + LASER_WIDTH*0.5 - 1e-3) return true;
    }
    return false;
  }

  function shoot(angle, n=1, spread=0){
    if (n<=1){ arrows.push(new Arrow(angle)); return; }
    const start = angle - spread/2;
    for (let i=0;i<n;i++) arrows.push(new Arrow(start + spread*(i/(n-1))));
  }
  function simpleBurst(){ for (let i=0;i<3;i++) schedule(i*0.1, ()=>shoot(Math.random()*Math.PI*2)); }
  function ring(count=8){ for (let i=0;i<count;i++) shoot((i/count)*Math.PI*2); }
  function aimedFan(n=4, spread=Math.PI/6){ const ang = Math.atan2(player.y-CY, player.x-CX); shoot(ang, n, spread); }
  function crossfire(count=3){ const base=Math.random()*Math.PI*2; for(let i=0;i<count;i++){ const a=base+i*(Math.PI/count); shoot(a); shoot(a+Math.PI);} }
  function sweepBursts(bursts=5, step=Math.PI/12, startAng=Math.random()*Math.PI*2, fanN=4, spread=Math.PI/10, gap=0.12){ for (let i=0;i<bursts;i++) schedule(i*gap, ()=> shoot(startAng + i*step, fanN, spread)); }
  function spiral(duration=2.0, rate=9){ const start = Math.random()*Math.PI*2; for (let i=0;i<duration*rate;i++){ const t=i/rate; const ang = start + t*1.1; schedule(t, ()=> shoot(ang)); } }

  let nextPatternTime = 0;
  function patternInterval(){
    if (timeAlive < 15) return 1.2;
    if (timeAlive < 30) return 1.0;
    if (timeAlive < 60) return 0.9;
    return 0.8;
  }
  function runPattern(){
    const t = timeAlive;
    const picks = [];
    if (t < 20){
      picks.push(()=>simpleBurst());
      picks.push(()=>aimedFan(3, Math.PI/8));
    } else if (t < 60){
      picks.push(()=>simpleBurst());
      picks.push(()=>aimedFan(3, Math.PI/8));
      picks.push(()=>sweepBursts(5, Math.PI/14, Math.random()*Math.PI*2, 4, Math.PI/12, 0.14));
      picks.push(()=>spiral(1.8, 8));
    } else {
      picks.push(()=>ring(10));
      picks.push(()=>crossfire(4));
      picks.push(()=>aimedFan(5, Math.PI/5));
      picks.push(()=>sweepBursts(9, Math.PI/14, Math.random()*Math.PI*2, 5, Math.PI/9, 0.11));
      picks.push(()=>spiral(2.4, 11));
    }
    const choice = picks[Math.floor(Math.random()*picks.length)];
    choice();
    nextPatternTime = timeAlive + patternInterval();
  }

  let nextLaserTime = 0;

  const keys = new Set();
  function updateDirFromKeys(){
    let x=0,y=0; if(keys.has('L'))x-=1; if(keys.has('R'))x+=1; if(keys.has('U'))y-=1; if(keys.has('D'))y+=1;
    const len=Math.hypot(x,y)||1; player.dirX=x/len; player.dirY=y/len;
  }

  const hold={U:false,D:false,L:false,R:false};
  function updateHold(){ let x=(hold.L?-1:0)+(hold.R?1:0); let y=(hold.U?-1:0)+(hold.D?1:0); const len=Math.hypot(x,y)||1; player.dirX=x/len; player.dirY=y/len; }

  function startGame(){
    arrows.length = 0; events.length = 0; lasers.length = 0; nextPatternTime = 0; nextLaserTime = 30 + rand(4,6);
    player.x = CX; player.y = CY; player.dirX = 0; player.dirY = 0;
    timeAlive = 0; running = true; gameOver = false;
    centerEl.style.display = 'none';
    btnbar.style.display = window.matchMedia('(pointer: coarse)').matches ? 'flex' : 'none';
    lastTime = performance.now(); requestAnimationFrame(loop);
  }

  function loop(ts){
    if (!running) return;
    const dt = Math.min(0.033, (ts - lastTime) / 1000); lastTime = ts; timeAlive += dt;

    events.sort((a,b)=>a.at-b.at);
    while (events.length && events[0].at <= timeAlive) events.shift().fn();
    if (timeAlive >= nextPatternTime) runPattern();

    if (timeAlive >= nextLaserTime){ spawnLaser(); nextLaserTime = timeAlive + rand(4,6); }

    update(dt); draw();
    if (running) requestAnimationFrame(loop);
  }

  function update(dt){
    const ctx = canvas.getContext('2d');
    player.x += player.dirX * player.speed * dt; player.y += player.dirY * player.speed * dt;
    const dx=player.x-CX, dy=player.y-CY, d=Math.hypot(dx,dy), maxR=R-player.radius;
    if (d>maxR){ const s=maxR/d; player.x=CX+dx*s; player.y=CY+dy*s; }

    for (const a of arrows) a.update(dt);
    updateLasers(dt);

    for (const a of arrows){ if(!a.alive) continue; const adx=a.x-CX, ady=a.y-CY; if(adx*adx+ady*ady <= (R+20)*(R+20)) { if(a.collides(player.x, player.y, player.radius)){ doGameOver(); return; } } }
    if (laserHitsPlayer(player.x, player.y, player.radius)){ doGameOver(); return; }

    for (let i=arrows.length-1;i>=0;i--) if(!arrows[i].alive) arrows.splice(i,1);

    scoreEl.textContent = `⏱ ${timeAlive.toFixed(1)}s`;
    if (timeAlive > best) { best = timeAlive; localStorage.setItem('bamboo_best', String(best)); }
    bestEl.textContent = `🏆 ${best.toFixed(1)}s`;
  }

  function doGameOver(){
    running=false; gameOver=true; centerEl.style.display='block';
    centerEl.innerHTML = `
      <div class="title">GAME OVER</div>
      <div class="subtitle">기록: ${timeAlive.toFixed(1)}s · 최고: ${best.toFixed(1)}s</div>
      <div style=\"opacity:.9\">스페이스바로 재시작 · 모바일은 화면 탭</div>
    `; btnbar.style.display='none';
  }

  function draw(){
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);
    ctx.beginPath(); ctx.arc(CX,CY,R,0,Math.PI*2); ctx.strokeStyle='#2a3e87'; ctx.lineWidth=3; ctx.stroke();
    ctx.beginPath(); ctx.arc(player.x,player.y,player.radius,0,Math.PI*2); ctx.fillStyle='#8ecbff'; ctx.shadowColor='#8ecbff'; ctx.shadowBlur=14; ctx.fill(); ctx.shadowBlur=0;
    for(const a of arrows) a.draw(ctx);
    drawLasers(ctx);
    ctx.beginPath(); ctx.arc(CX,CY,Math.max(10,R*0.2),0,Math.PI*2); const grad=ctx.createRadialGradient(CX,CY,0,CX,CY,R*0.2); grad.addColorStop(0,'rgba(255,255,255,0.08)'); grad.addColorStop(1,'rgba(255,255,255,0)'); ctx.fillStyle=grad; ctx.fill();
  }

  onMount(() => {
    console.log('[Game] mounted');
    best = Number(localStorage.getItem('bamboo_best') || 0);
    resize();
    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    const onKeyDown = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.add('L');
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.add('R');
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.add('U');
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.add('D');
      updateDirFromKeys();
      if (e.code === 'Space') { if (gameOver || !running) startGame(); }
    };
    const onKeyUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.delete('L');
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.delete('R');
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.delete('U');
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.delete('D');
      updateDirFromKeys();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const bindTouch = (btn, on, off) => { btn.addEventListener('touchstart', on, {passive:true}); btn.addEventListener('touchend', off); btn.addEventListener('touchcancel', off); };
    const setU=()=>{hold.U=true; updateHold();}, unsetU=()=>{hold.U=false; updateHold();};
    const setD=()=>{hold.D=true; updateHold();}, unsetD=()=>{hold.D=false; updateHold();};
    const setL=()=>{hold.L=true; updateHold();}, unsetL=()=>{hold.L=false; updateHold();};
    const setR=()=>{hold.R=true; updateHold();}, unsetR=()=>{hold.R=false; updateHold();};
    bindTouch(upBtn, setU, unsetU);
    bindTouch(downBtn, setD, unsetD);
    bindTouch(leftBtn, setL, unsetL);
    bindTouch(rightBtn, setR, unsetR);

    const onClickCanvas = () => { if (gameOver || !running) startGame(); };
    canvas.addEventListener('click', onClickCanvas);

    // initial paint
    draw();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('click', onClickCanvas);
    };
  });
</script>

<div id="wrap">
  <canvas id="game" bind:this={canvas}></canvas>
  <div class="hud">
    <div id="score" bind:this={scoreEl}>⏱ 0.0s</div>
    <div id="best" bind:this={bestEl}>🏆 0.0s</div>
  </div>
  <div class="centerText" id="center" bind:this={centerEl}>
    <div class="title">죽림고수</div>
    <div class="subtitle">원 내부에서 자유 이동하며 화살을 피해 생존하세요</div>
    <div style="opacity:.9; line-height:1.6">
      PC: <span class="kbd">W</span><span class="kbd">A</span><span class="kbd">S</span><span class="kbd">D</span> 또는 <span class="kbd">↑</span><span class="kbd">←</span><span class="kbd">↓</span><span class="kbd">→</span> 이동 · <span class="kbd">Space</span> 재시작<br/>
      Mobile: 아래 방향 버튼 터치
    </div>
  </div>
  <div class="btnbar" id="btnbar" bind:this={btnbar}>
    <button class="tapbtn" id="upBtn" bind:this={upBtn}>▲ UP</button>
    <button class="tapbtn" id="leftBtn" bind:this={leftBtn}>◀ LEFT</button>
    <button class="tapbtn" id="downBtn" bind:this={downBtn}>▼ DOWN</button>
    <button class="tapbtn" id="rightBtn" bind:this={rightBtn}>RIGHT ▶</button>
  </div>
</div>

<style>
  :global(html), :global(body) { height: 100%; margin: 0; background: #0b1020; color: #e6eaf2; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple SD Gothic Neo, Noto Sans KR, sans-serif; }
  /* Ensure the game takes full viewport height inside iframe */
  #wrap { position: relative; height: 100vh; }
  canvas { display: block; width: 100%; height: 100%; }
  .hud { position: absolute; left: 0; right: 0; top: 60px; display: flex; justify-content: space-between; padding: 14px 16px; font-weight: 600; letter-spacing: 0.3px; pointer-events: none; }
  .hud, .centerText { color: #e6eaf2; }
  .centerText { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none; }
  .title { font-size: clamp(24px, 5vw, 40px); font-weight: 800; margin-bottom: 8px; }
  .subtitle { opacity: 0.85; margin-bottom: 14px; }
  .kbd { display: inline-block; background: #11182f; border: 1px solid #1e2a55; border-bottom-width: 3px; border-radius: 8px; padding: 4px 8px; margin: 0 4px; font-weight: 700; }
  .btnbar { position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%); display: none; gap: 10px; flex-wrap: wrap; justify-content: center; }
  .tapbtn { background: #17203f; border: 1px solid #2a3e87; color: #e6eaf2; padding: 12px 16px; border-radius: 16px; font-weight: 800; letter-spacing: 0.4px; box-shadow: 0 6px 0 #0d1330; }
  .tapbtn:active { transform: translateY(2px); box-shadow: 0 4px 0 #0d1330; }
  @media (pointer: coarse) { .btnbar { display: flex; } }
</style>
