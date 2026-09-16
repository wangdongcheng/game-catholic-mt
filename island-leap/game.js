(()=>{
"use strict";

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
const scoreEl=document.getElementById("score");
const bestEl=document.getElementById("best");
const overlay=document.getElementById("overlay");
const ot=document.getElementById("ot");
const op=document.getElementById("op");
const hint=document.getElementById("hint");
const muteBtn=document.getElementById("muteBtn");

const AudioContextClass=window.AudioContext||window.webkitAudioContext;
let audioCtx=null;
let muted=false;

function ensureAudio(){
  if(muted||!AudioContextClass)return null;
  if(!audioCtx)audioCtx=new AudioContextClass();
  if(audioCtx.state==="suspended")audioCtx.resume();
  return audioCtx;
}

muteBtn.addEventListener("click",e=>{
  e.stopPropagation();
  muted=!muted;
  muteBtn.textContent=`SOUND: ${muted?"OFF":"ON"}`;
  muteBtn.setAttribute("aria-pressed",String(muted));
});

function playTone({frequency=440,endFrequency=null,duration=.15,type="sine",volume=.12,delay=0}={}){
  const ac=ensureAudio();
  if(!ac)return;
  const start=ac.currentTime+delay;
  const osc=ac.createOscillator();
  const gain=ac.createGain();
  osc.type=type;
  osc.frequency.setValueAtTime(Math.max(1,frequency),start);
  if(endFrequency)osc.frequency.exponentialRampToValueAtTime(Math.max(1,endFrequency),start+duration);
  gain.gain.setValueAtTime(Math.max(.0001,volume),start);
  gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(gain);gain.connect(ac.destination);osc.start(start);osc.stop(start+duration+.02);
}

function soundStart(){playTone({frequency:330,endFrequency:520,duration:.16,type:"triangle",volume:.08})}
function soundJump(){playTone({frequency:180,endFrequency:430,duration:.18,type:"triangle",volume:.11})}
function soundLand(){playTone({frequency:150,endFrequency:95,duration:.12,type:"sine",volume:.14})}
function soundPerfect(){
  playTone({frequency:660,duration:.12,type:"sine",volume:.12});
  playTone({frequency:880,duration:.16,type:"sine",volume:.11,delay:.09});
  playTone({frequency:1100,duration:.18,type:"sine",volume:.10,delay:.18});
}
function soundSplash(){
  const ac=ensureAudio();if(!ac)return;
  const duration=.42;
  const buffer=ac.createBuffer(1,Math.floor(ac.sampleRate*duration),ac.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++){const decay=1-i/data.length;data[i]=(Math.random()*2-1)*decay}
  const source=ac.createBufferSource();const filter=ac.createBiquadFilter();const gain=ac.createGain();
  source.buffer=buffer;filter.type="lowpass";
  filter.frequency.setValueAtTime(900,ac.currentTime);filter.frequency.exponentialRampToValueAtTime(180,ac.currentTime+duration);
  gain.gain.setValueAtTime(.18,ac.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+duration);
  source.connect(filter);filter.connect(gain);gain.connect(ac.destination);source.start();
}
function soundGameOver(){
  playTone({frequency:260,endFrequency:150,duration:.28,type:"triangle",volume:.10});
  playTone({frequency:180,endFrequency:85,duration:.42,type:"triangle",volume:.10,delay:.20});
}

let W=innerWidth,H=innerHeight,DPR=Math.min(devicePixelRatio||1,2);
function resize(){
  W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.floor(W*DPR);canvas.height=Math.floor(H*DPR);
  canvas.style.width=W+"px";canvas.style.height=H+"px";ctx.setTransform(DPR,0,0,DPR,0,0);
}
addEventListener("resize",resize);resize();
function isPortrait(){return H>W}

const C={sky1:"#e5f5f6",sky2:"#9fcbd5",sea1:"#4b8ca5",sea2:"#2f6075",top:"#7f9d71",top2:"#6f8b63",left:"#756d60",right:"#5f594f",sand:"#d4c08e",ink:"#213547",robe:"#efe8d9",cloak:"#8b5047",skin:"#d9b28c",gold:"#d2aa5c",foam:"#eef8f4"};
const names=["Caesarea","Cyprus","Rhodes","Crete","Malta","Gozo","Sicily","Capri","Melita"];
const g={mode:"ready",score:0,best:+localStorage.getItem("paulLeapIsoBest")||0,charging:false,charge:0,dir:1,last:0,camX:0,camY:0};
bestEl.textContent=g.best;
let platforms=[];
const p={x:0,y:0,z:0,vx:0,vy:0,vz:0,ground:true,on:0};

function rawProject(wx,wy,wz=0){
  const portrait=isPortrait();
  const isoX=portrait?.46:.72,isoY=portrait?.23:.36,zScale=portrait?.78:1;
  return{x:(wx-wy)*isoX,y:(wx+wy)*isoY-wz*zScale};
}
function project(wx,wy,wz=0){
  const portrait=isPortrait();const raw=rawProject(wx,wy,wz);
  return{x:raw.x-g.camX+W*.50,y:raw.y-g.camY+H*(portrait?.46:.42)};
}

function appendPlatform(){
  const index=platforms.length;
  if(index===0){
    platforms.push({x:-40,y:-40,z:0,size:150,height:38+Math.random()*32,name:names[0]});
    return;
  }
  const previous=platforms[index-1];
  let wx=previous.x,wy=previous.y;
  const step=165+Math.random()*115;
  if(Math.random()<.48)wx+=step;else wy+=step;
  platforms.push({
    x:wx,y:wy,z:0,
    size:105+Math.random()*85,
    height:38+Math.random()*32,
    name:names[index%names.length]
  });
}

function ensurePlatformsAhead(count=15){
  while(platforms.length<=p.on+count)appendPlatform();
}

function makePlatforms(){
  platforms=[];
  for(let i=0;i<20;i++)appendPlatform();
}

function reset(){
  makePlatforms();
  const a=platforms[0];
  p.x=a.x+a.size/2;p.y=a.y+a.size/2;p.z=0;
  p.vx=p.vy=p.vz=0;p.ground=true;p.on=0;
  ensurePlatformsAhead();
  g.score=0;g.charge=0;g.dir=1;g.charging=false;scoreEl.textContent="0";
  const raw=rawProject(p.x,p.y,0);g.camX=raw.x;g.camY=raw.y-H*(isPortrait()?.08:.05);
}
reset();

function start(){
  if(g.mode!=="playing"){
    reset();g.mode="playing";overlay.classList.add("hidden");
    hint.textContent="HOLD SPACE / SCREEN TO CHARGE • RELEASE TO JUMP";soundStart();
  }
}

function launchJump(){
  ensurePlatformsAhead();
  const target=platforms[p.on+1];
  const current=platforms[p.on];
  if(!target||!current)return;
  const dx=(target.x+target.size/2)-(current.x+current.size/2);
  const dy=(target.y+target.size/2)-(current.y+current.size/2);
  const len=Math.hypot(dx,dy)||1;
  const nx=dx/len,ny=dy/len;
  const power=.26+g.charge*.74;
  const horizontal=2.8+power*3.4;
  p.vx=nx*horizontal;p.vy=ny*horizontal;p.vz=9.6+power*6.5;
  soundJump();g.charge=0;g.dir=1;
}

function keyDown(e){
  if(e.code!=="Space"||e.repeat)return;e.preventDefault();
  if(g.mode==="ready"||g.mode==="gameover"){start();return}
  if(!p.ground)return;
  g.charging=true;g.charge=Math.max(.06,g.charge);
}
function keyUp(e){
  if(e.code!=="Space")return;e.preventDefault();
  if(!g.charging||!p.ground)return;
  g.charging=false;p.ground=false;launchJump();
}
addEventListener("keydown",keyDown);addEventListener("keyup",keyUp);

let touchCharging=false;
function beginTouchCharge(e){
  if(e.target.closest(".back-home, .mute"))return;e.preventDefault();
  if(g.mode==="ready"||g.mode==="gameover"){start();touchCharging=false;return}
  if(!p.ground||g.charging)return;
  g.charging=true;g.charge=Math.max(.06,g.charge);touchCharging=true;
}
function releaseTouchJump(e){
  if(e.target.closest(".back-home, .mute"))return;e.preventDefault();
  if(!touchCharging||!g.charging||!p.ground||g.mode!=="playing"){touchCharging=false;return}
  touchCharging=false;g.charging=false;p.ground=false;launchJump();
}
window.addEventListener("touchstart",beginTouchCharge,{passive:false});
window.addEventListener("touchend",releaseTouchJump,{passive:false});
window.addEventListener("touchcancel",e=>{e.preventDefault();touchCharging=false;g.charging=false;g.charge=0},{passive:false});

function insidePlatform(a,x,y){return x>=a.x&&x<=a.x+a.size&&y>=a.y&&y<=a.y+a.size}
function landCheck(){
  for(let i=Math.max(0,p.on-1);i<Math.min(platforms.length,p.on+4);i++){
    const a=platforms[i];
    if(insidePlatform(a,p.x,p.y)){
      p.ground=true;p.vx=p.vy=p.vz=0;p.z=0;soundLand();
      if(i>p.on){
        p.on=i;
        ensurePlatformsAhead();
        g.score++;
        const cx=a.x+a.size/2,cy=a.y+a.size/2;
        const d=Math.hypot(p.x-cx,p.y-cy);
        if(d<a.size*.13){
          g.score+=2;soundPerfect();hint.textContent="PERFECT LANDING +3";
          setTimeout(()=>g.mode==="playing"&&(hint.textContent="HOLD SPACE / SCREEN TO CHARGE • RELEASE TO JUMP"),650);
        }
        scoreEl.textContent=g.score;
      }
      return true;
    }
  }
  return false;
}

function fail(){
  if(g.mode!=="playing")return;
  g.mode="gameover";soundSplash();soundGameOver();
  if(g.score>g.best){g.best=g.score;bestEl.textContent=g.best;localStorage.setItem("paulLeapIsoBest",g.best)}
  ot.textContent="INTO THE SEA!";
  op.innerHTML=`Score: <strong>${g.score}</strong><br><br>Press Space or tap to try again.`;
  overlay.classList.remove("hidden");
}

function update(dt){
  const f=dt/16.67;
  if(g.charging&&p.ground){
    g.charge+=.014*g.dir*f;
    if(g.charge>=1){g.charge=1;g.dir=-1}
    if(g.charge<=.06){g.charge=.06;g.dir=1}
  }
  if(g.mode==="playing"&&!p.ground){
    p.x+=p.vx*f;p.y+=p.vy*f;p.z+=p.vz*f;p.vz-=.55*f;
    if(p.z<=0&&p.vz<0){p.z=0;if(!landCheck())fail()}
  }
  ensurePlatformsAhead();
  const portrait=isPortrait();
  const currentRaw=rawProject(p.x,p.y,p.z);
  let lookX=currentRaw.x,lookY=currentRaw.y;
  const next=platforms[p.on+1];
  if(next){
    const nextRaw=rawProject(next.x+next.size/2,next.y+next.size/2,0);
    const lookAhead=portrait?.24:.18;
    lookX=currentRaw.x+(nextRaw.x-currentRaw.x)*lookAhead;
    lookY=currentRaw.y+(nextRaw.y-currentRaw.y)*lookAhead;
  }
  const targetCamX=lookX,targetCamY=lookY-H*(portrait?.08:.05);
  const follow=portrait?.11:.075;
  g.camX+=(targetCamX-g.camX)*Math.min(1,follow*f);
  g.camY+=(targetCamY-g.camY)*Math.min(1,follow*f);
}

function polygon(points,fill){
  ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
  for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
  ctx.closePath();ctx.fill();
}
function drawPlatform(a,index){
  const zTop=0,zBottom=-a.height;
  const A=project(a.x,a.y,zTop),B=project(a.x+a.size,a.y,zTop),Cc=project(a.x+a.size,a.y+a.size,zTop),D=project(a.x,a.y+a.size,zTop);
  const Bb=project(a.x+a.size,a.y,zBottom),Cb=project(a.x+a.size,a.y+a.size,zBottom),Db=project(a.x,a.y+a.size,zBottom);
  polygon([D,Cc,Cb,Db],C.left);polygon([B,Cc,Cb,Bb],C.right);polygon([A,B,Cc,D],index%2?C.top2:C.top);
  const center=project(a.x+a.size/2,a.y+a.size/2,0);
  if(a.size>120){ctx.fillStyle=C.sand;ctx.beginPath();ctx.ellipse(center.x,center.y+3,a.size*.20,a.size*.06,0,0,Math.PI*2);ctx.fill()}
  ctx.fillStyle=C.ink;ctx.font=`700 ${isPortrait()?10:12}px ui-monospace`;ctx.textAlign="center";ctx.fillText(a.name,center.x,center.y-a.size*.20);
  if(index===p.on+1){ctx.strokeStyle=C.gold;ctx.lineWidth=3;ctx.beginPath();ctx.arc(center.x,center.y,10,0,Math.PI*2);ctx.stroke()}
}

function drawPaul(){
  const s=project(p.x,p.y,p.z);
  ctx.save();
  if(isPortrait()){ctx.translate(s.x,s.y);ctx.scale(.82,.82);ctx.translate(-s.x,-s.y)}
  ctx.fillStyle="#21354725";ctx.beginPath();ctx.ellipse(s.x,s.y+9,17,7,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=C.robe;ctx.beginPath();ctx.moveTo(s.x-10,s.y-28);ctx.lineTo(s.x+9,s.y-28);ctx.lineTo(s.x+14,s.y+7);ctx.lineTo(s.x-14,s.y+7);ctx.closePath();ctx.fill();
  ctx.fillStyle=C.cloak;ctx.beginPath();ctx.moveTo(s.x-9,s.y-26);ctx.lineTo(s.x-17,s.y-6);ctx.lineTo(s.x-7,s.y+6);ctx.lineTo(s.x+1,s.y-20);ctx.closePath();ctx.fill();
  ctx.fillStyle=C.skin;ctx.beginPath();ctx.arc(s.x,s.y-40,9,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(s.x,s.y-42,10,Math.PI,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(s.x-6,s.y-35);ctx.lineTo(s.x,s.y-27);ctx.lineTo(s.x+7,s.y-35);ctx.lineTo(s.x+4,s.y-25);ctx.lineTo(s.x-4,s.y-25);ctx.closePath();ctx.fill();
  if(g.charging){const w=92;ctx.fillStyle="#fff";ctx.fillRect(s.x-w/2,s.y-66,w,9);ctx.fillStyle=C.gold;ctx.fillRect(s.x-w/2,s.y-66,w*g.charge,9);ctx.strokeStyle=C.ink;ctx.strokeRect(s.x-w/2,s.y-66,w,9)}
  ctx.restore();
}

function drawSea(){
  const portrait=isPortrait(),horizon=portrait?.40:.52;
  const grad=ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,C.sky1);grad.addColorStop(horizon,C.sky2);grad.addColorStop(horizon+.001,C.sea1);grad.addColorStop(1,C.sea2);
  ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#fff8";
  for(let i=0;i<6;i++){
    const cx=(i*300-(g.camX*.08))%(W+400)-80,cy=80+(i%3)*55;
    ctx.beginPath();ctx.ellipse(cx,cy,48,15,0,0,Math.PI*2);ctx.ellipse(cx+38,cy-9,35,19,0,0,Math.PI*2);ctx.fill();
  }
  ctx.strokeStyle="#ffffff55";ctx.lineWidth=2.5;
  for(let r=0;r<6;r++){
    ctx.beginPath();const yy=H*(isPortrait()?.47:.58)+r*(isPortrait()?38:30);
    for(let xx=-20;xx<W+20;xx+=28){const y=yy+Math.sin((xx+g.camX*.18)*.035)*4;xx===-20?ctx.moveTo(xx,y):ctx.lineTo(xx,y)}
    ctx.stroke();
  }
}

function draw(){
  drawSea();
  const visible=platforms.map((a,i)=>({a,i,key:a.x+a.y})).sort((u,v)=>u.key-v.key);
  visible.forEach(({a,i})=>drawPlatform(a,i));
  if(g.mode!=="gameover")drawPaul();
}
function loop(t){
  const dt=Math.min(33,t-(g.last||t));g.last=t;update(dt||16.67);draw();requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
})();
