import {HandLandmarker,FilesetResolver} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm";
const WASM="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL="https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const TXT={
 uz:{download:"Suratlarni yuklab olish",load:"Kamera va model yuklanmoqda…",err:"Kameraga ruxsat bering va sahifani lokal serverda oching.",
  frame:"Ikkala qo‘l ko‘rsatkich barmog‘i bilan ramka yasang, so‘ng ikkala qo‘lda chimdib ushlang.",
  puz:"Bo‘lakni chimdib olib, boshqa katakka o‘tkazing.",done:"Yig‘ildi! Saqlash uchun mushtni qisqa ushlang.",
  redo:"Yig‘ilmagan. Mushtni ushlasangiz yangidan boshlanadi."},
 en:{download:"Download photos",load:"Loading camera and model…",err:"Allow camera access and open the page from a local server.",
  frame:"Frame the shot with both index fingers, then pinch with both hands and hold.",
  puz:"Pinch a tile and drop it on another cell.",done:"Solved! Hold a fist briefly to save.",
  redo:"Not solved yet. Hold a fist to start over."}};
const $=s=>document.querySelector(s), cv=$("#stage"), ctx=cv.getContext("2d"), vid=$("#cam");
const base=document.createElement("canvas"), bx=base.getContext("2d");
let lang=localStorage.getItem("lang")||"uz", st="load", hold={}, album=[], rect, cdEnd, shot, order, lay, drag, pin=false, solved=false, hands=[], hintKey="load";
let W=1280,H=720;
const P=(h,i)=>({x:(1-h[i].x)*W,y:h[i].y*H}), D=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const pinch=h=>D(P(h,4),P(h,8))/D(P(h,0),P(h,9));
const fist=h=>[8,12,16,20].every(t=>D(P(h,t),P(h,0))<D(P(h,t-2),P(h,0)));
function held(k,c,ms){const n=performance.now();if(!c){hold[k]=0;return false}hold[k]||=n;if(n-hold[k]>ms){hold[k]=0;return true}return false}
function setLang(l){lang=l;localStorage.setItem("lang",l);document.documentElement.lang=l;
 document.querySelectorAll("[data-i18n]").forEach(e=>e.textContent=TXT[l][e.dataset.i18n]);
 document.querySelectorAll("[data-lang]").forEach(b=>b.classList.toggle("on",b.dataset.lang===l));hint(hintKey)}
function hint(k){hintKey=k;$("#hint").textContent=TXT[lang][k]}
document.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>setLang(b.dataset.lang));
function shuffle(){do{order=[...Array(9).keys()].sort(()=>Math.random()-.5)}while(order.every((v,i)=>v===i));solved=false;hint("puz")}
function layout(){const s=Math.min(W*.9/shot.width,H*.85/shot.height);lay={w:shot.width*s,h:shot.height*s,x:(W-shot.width*s)/2,y:(H-shot.height*s)/2}}
function cellAt(p){const c=Math.floor((p.x-lay.x)/(lay.w/3)),r=Math.floor((p.y-lay.y)/(lay.h/3));return c<0||r<0||c>2||r>2?-1:r*3+c}
function tile(id,x,y,w,h){const tw=shot.width/3,th=shot.height/3;ctx.drawImage(shot,id%3*tw,Math.floor(id/3)*th,tw,th,x,y,w,h)}
function frameStep(){
 if(hands.length<2)return;
 const t=hands.map(h=>P(h,8)),x=Math.min(t[0].x,t[1].x),y=Math.min(t[0].y,t[1].y);
 const r={x,y,w:Math.abs(t[0].x-t[1].x),h:Math.abs(t[0].y-t[1].y)};
 ctx.strokeStyle="#ffb703";ctx.lineWidth=4;ctx.strokeRect(r.x,r.y,r.w,r.h);
 if(held("snap",hands.every(h=>pinch(h)<.3)&&r.w>80&&r.h>80,500)){rect=r;cdEnd=performance.now()+3000;st="cd"}
}
function cdStep(){
 ctx.strokeStyle="#ffb703";ctx.lineWidth=4;ctx.strokeRect(rect.x,rect.y,rect.w,rect.h);
 const left=Math.ceil((cdEnd-performance.now())/1000);
 if(left>0){ctx.fillStyle="#ffb703";ctx.font="bold 140px system-ui";ctx.textAlign="center";ctx.fillText(left,rect.x+rect.w/2,rect.y+rect.h/2+50);return}
 shot=document.createElement("canvas");shot.width=rect.w;shot.height=rect.h;
 shot.getContext("2d").drawImage(base,rect.x,rect.y,rect.w,rect.h,0,0,rect.w,rect.h);
 layout();shuffle();st="puz";
}
function puzStep(){
 ctx.fillStyle="rgba(18,22,28,.85)";ctx.fillRect(0,0,W,H);
 const cw=lay.w/3,ch=lay.h/3;
 order.forEach((id,i)=>{if(drag&&drag.from===i)return;tile(id,lay.x+i%3*cw+1,lay.y+Math.floor(i/3)*ch+1,cw-2,ch-2)});
 const h=hands.find(x=>!fist(x)&&pinch(x)<(pin?.45:.3));
 if(h){const p=P(h,4),q=P(h,8),m={x:(p.x+q.x)/2,y:(p.y+q.y)/2};
  if(!pin){const c=cellAt(m);if(c>=0)drag={from:c}}
  pin=true;
  if(drag){tile(order[drag.from],m.x-cw/2,m.y-ch/2,cw,ch);drag.m=m}
 }else{
  if(drag&&drag.m){const to=cellAt(drag.m);if(to>=0){[order[drag.from],order[to]]=[order[to],order[drag.from]];solved=order.every((v,i)=>v===i);hint(solved?"done":"puz")}}
  drag=null;pin=false;
 }
 if(held("fist",hands.some(fist),700)){
  if(solved){album.push(shot);if(album.length>3)album.shift();renderAlbum();st="frame";hint("frame")}else{shuffle();hint("redo")}
 }
}
function renderAlbum(){const a=$("#album");a.replaceChildren(...album);$("#dl").disabled=!album.length}
$("#dl").onclick=()=>{const w=album.reduce((s,c)=>s+c.width+20,20),h=Math.max(...album.map(c=>c.height))+40,o=document.createElement("canvas");
 o.width=w;o.height=h;const c=o.getContext("2d");c.fillStyle="#fff";c.fillRect(0,0,w,h);let x=20;
 album.forEach(s=>{c.drawImage(s,x,20);x+=s.width+20});
 o.toBlob(b=>{const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="snappuzzle.png";a.click()})};
function loop(){
 if(vid.readyState>=2){
  bx.save();bx.translate(W,0);bx.scale(-1,1);bx.drawImage(vid,0,0,W,H);bx.restore();
  ctx.drawImage(base,0,0);
  hands=lm.detectForVideo(vid,performance.now()).landmarks;
  hands.forEach(h=>[4,8].forEach(i=>{const p=P(h,i);ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(p.x,p.y,6,0,7);ctx.fill()}));
  if(st==="frame")frameStep();else if(st==="cd")cdStep();else if(st==="puz")puzStep();
 }
 requestAnimationFrame(loop);
}
let lm;
setLang(lang);
(async()=>{
 try{
  const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:1280,height:720}});
  vid.srcObject=s;await vid.play();
  W=cv.width=base.width=vid.videoWidth;H=cv.height=base.height=vid.videoHeight;
  lm=await HandLandmarker.createFromOptions(await FilesetResolver.forVisionTasks(WASM),
   {baseOptions:{modelAssetPath:MODEL},runningMode:"VIDEO",numHands:2});
  st="frame";hint("frame");loop();
 }catch(e){console.error(e);hint("err")}
})();
                                 
