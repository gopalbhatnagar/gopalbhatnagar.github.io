import './style.css';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';

type Sym = '🍒'|'🍋'|'🔔'|'⭐'|'💎'|'7️⃣'|'🃏';
const COLS=5, ROWS=3, WILD='🃏' as Sym, SCATTER='💎' as Sym;
const strips:Sym[][]=[
 ['🍒','🍋','🔔','⭐','💎','7️⃣','🍒','🃏','🍋','🔔','💎','7️⃣','⭐','🍒','🃏','🍋','7️⃣','🔔','⭐','💎'],
 ['🍋','🔔','⭐','💎','7️⃣','🍒','🃏','🍋','7️⃣','💎','⭐','🔔','🍒','🃏','💎','🍋','⭐','7️⃣','🔔','🍒'],
 ['🔔','⭐','💎','7️⃣','🍒','🍋','🃏','🔔','⭐','💎','🍒','7️⃣','🍋','🃏','⭐','🔔','💎','🍒','7️⃣','🍋'],
 ['⭐','💎','7️⃣','🍒','🍋','🔔','🃏','⭐','7️⃣','🍒','💎','🔔','🍋','🃏','⭐','7️⃣','💎','🍒','🔔','🍋'],
 ['💎','7️⃣','🍒','🍋','🔔','⭐','🃏','💎','7️⃣','🍒','🔔','⭐','🍋','🃏','💎','7️⃣','🍒','🔔','⭐','🍋']
];
const pay:Record<string,number>={'🍒':2,'🍋':3,'🔔':5,'⭐':10,'💎':25,'7️⃣':50};
const paylines:number[][][]=[
 [[0,1],[1,1],[2,1],[3,1],[4,1]],[[0,0],[1,0],[2,0],[3,0],[4,0]],[[0,2],[1,2],[2,2],[3,2],[4,2]],
 [[0,0],[1,1],[2,2],[3,1],[4,0]],[[0,2],[1,1],[2,0],[3,1],[4,2]],[[0,0],[1,0],[2,1],[3,0],[4,0]],
 [[0,2],[1,2],[2,1],[3,2],[4,2]],[[0,1],[1,0],[2,0],[3,0],[4,1]],[[0,1],[1,2],[2,2],[3,2],[4,1]],
 [[0,0],[1,1],[2,1],[3,1],[4,0]],[[0,2],[1,1],[2,1],[3,1],[4,2]],[[0,1],[1,0],[2,1],[3,0],[4,1]],
 [[0,1],[1,2],[2,1],[3,2],[4,1]],[[0,0],[1,1],[2,0],[3,1],[4,0]],[[0,2],[1,1],[2,2],[3,1],[4,2]],
 [[0,1],[1,0],[2,1],[3,2],[4,1]],[[0,1],[1,2],[2,1],[3,0],[4,1]],[[0,0],[1,0],[2,1],[3,2],[4,2]],
 [[0,2],[1,2],[2,1],[3,0],[4,0]],[[0,1],[1,1],[2,0],[3,1],[4,2]]
];

async function init(){
  const mount=document.querySelector<HTMLDivElement>('#game');
  if(!mount){throw new Error('Game mount element #game not found');}
  const app=new Application();
  await app.init({background:'#08070d',antialias:true,resizeTo:mount});
  mount.appendChild(app.canvas);
  const root=new Container(); const reels=new Container(); const linesLayer=new Graphics(); root.addChild(reels,linesLayer); app.stage.addChild(root);
  const frame=new Graphics(); root.addChildAt(frame,0);
  const cells:Text[][]=Array.from({length:COLS},()=>[]);
  let cellW=120,cellH=110;
  const textStyle=()=>new TextStyle({fontFamily:'Arial',fontSize:52,fontWeight:'900',fill:'#fff',stroke:{color:'#140b20',width:5},dropShadow:{color:'#000',blur:5,distance:3,alpha:.9}});
  for(let c=0;c<COLS;c++)for(let r=0;r<ROWS;r++){const t=new Text({text:strips[c][Math.floor(Math.random()*20)],style:textStyle()});t.anchor.set(.5);cells[c][r]=t;reels.addChild(t)}
  function layout(){const w=app.screen.width,h=app.screen.height;cellW=Math.min(135,(w-34)/5);cellH=Math.min(125,(h-40)/3);const bw=cellW*5+14,bh=cellH*3+14;root.x=(w-bw)/2;root.y=Math.max(8,(h-bh)/2-6);frame.clear().roundRect(0,0,bw,bh,20).fill({color:0x170d21}).stroke({color:0xffc34a,width:3,alpha:.8});for(let c=0;c<COLS;c++)for(let r=0;r<ROWS;r++){cells[c][r].x=7+cellW*c+cellW/2;cells[c][r].y=7+cellH*r+cellH/2;cells[c][r].scale.set(Math.min(1,cellW/120))}drawLines([])}
  app.renderer.on('resize',layout);layout();

  let credits=1000,bet=10,lineCount=20,win=0,free=0,busy=false,auto=false,sound=true;
  const el=(id:string)=>document.querySelector<HTMLElement>('#'+id)!;
  const spinBtn=el('spin') as HTMLButtonElement;
  function hud(){el('balance').textContent=String(Math.floor(credits));el('bet').textContent=String(bet);el('win').textContent=String(Math.floor(win));el('feature').textContent=free?`FREE SPINS: ${free}`:'READY'}
  let audio:AudioContext|null=null;
  function beep(freq=440,d=.08){if(!sound)return;audio??=new AudioContext();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=freq;g.gain.value=.04;o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+d)}
  function setColumn(c:number,start:number){for(let r=0;r<ROWS;r++){const s=strips[c][(start+r)%20];cells[c][r].text=s}}
  function randomGrid():Sym[][]{const g:Sym[][]=Array.from({length:COLS},()=>Array(ROWS));for(let c=0;c<COLS;c++){const n=Math.floor(Math.random()*20);for(let r=0;r<ROWS;r++)g[c][r]=strips[c][(n+r)%20]}if(Math.random()<.35){const s=(['🍒','🍋','🔔','⭐','7️⃣'][Math.floor(Math.random()*5)]) as Sym;const p=paylines[Math.floor(Math.random()*5)];p.forEach(([c,r])=>g[c][r]=s)}return g}
  async function spinColumn(c:number,d:number,final:Sym[]){const start=performance.now();let pos=Math.floor(Math.random()*20);while(performance.now()-start<d){pos=(pos+1)%20;setColumn(c,pos);await new Promise(requestAnimationFrame)}for(let r=0;r<3;r++){cells[c][r].text=final[r];cells[c][r].style=textStyle()}beep(260+c*65)}
  function evaluate(g:Sym[][]){const wins:{line:number;amount:number;points:number[][]}[]=[];for(let i=0;i<paylines.length;i++){const p=paylines[i];let base:Sym|null=null,count=0;for(const [c,r] of p){const s=g[c][r];if(!base&&s!==WILD&&s!==SCATTER)base=s;if(s===SCATTER)break;if(s===WILD||s===base){count++}else break}if(base&&count>=3)wins.push({line:i,amount:bet*pay[base]*(count===5?2:1),points:p.slice(0,count)})}return wins}
  function drawLines(active:number[]){linesLayer.clear();for(const i of active){const p=paylines[i];for(let j=0;j<p.length-1;j++){const [c1,r1]=p[j],[c2,r2]=p[j+1];linesLayer.moveTo(7+c1*cellW+cellW/2,7+r1*cellH+cellH/2).lineTo(7+c2*cellW+cellW/2,7+r2*cellH+cellH/2)}linesLayer.stroke({color:0xffe15a,width:4,alpha:.9})}}
  function flash(){const g=new Graphics();g.roundRect(2,2,frame.width-4,frame.height-4,18).stroke({color:0xffdf57,width:6,alpha:1});root.addChild(g);let a=1;const id=setInterval(()=>{a-=.18;g.alpha=a;if(a<=0){clearInterval(id);g.destroy()}},70)}
  async function bonusPick(){el('msg').textContent='⚡ BONUS PICK!';const overlay=new Container();const bg=new Graphics().rect(0,0,app.screen.width,app.screen.height).fill({color:0x05040b,alpha:.88});overlay.addChild(bg);const title=new Text({text:'BONUS PICK',style:new TextStyle({fontFamily:'Arial Black',fontSize:36,fill:0xffd45c})});title.anchor.set(.5);title.x=app.screen.width/2;title.y=app.screen.height*.25;overlay.addChild(title);const values=[50,100,250].sort(()=>Math.random()-.5);const startX=app.screen.width/2-150;const cardY=app.screen.height*.4;for(let i=0;i<3;i++){const card=new Graphics();card.x=startX+i*150;card.y=cardY;card.roundRect(0,0,110,150,18).fill({color:0x2a2047}).stroke({color:0x70eaff,width:3});card.eventMode='static';card.cursor='pointer';const q=new Text({text:'?',style:new TextStyle({fontSize:48,fill:'#fff',fontWeight:'900'})});q.anchor.set(.5);q.x=card.x+55;q.y=card.y+75;overlay.addChild(card,q);card.on('pointertap',()=>{if(q.text!=='?')return;q.text='+'+values[i];credits+=values[i];hud();beep(800,.18);setTimeout(()=>overlay.destroy({children:true}),650)})}app.stage.addChild(overlay);await new Promise<void>(resolve=>setTimeout(()=>{if(overlay.parent)overlay.destroy({children:true});resolve()},6000))}
  async function spin(){if(busy)return;const cost=free?0:bet*lineCount;if(credits<cost){el('msg').textContent='Not enough credits.';return}busy=true;drawLines([]);spinBtn.disabled=true;el('betDown').setAttribute('disabled','true');el('betUp').setAttribute('disabled','true');credits-=cost;win=0;hud();el('msg').textContent=free?'🔥 FREE SPIN…':'Reels spinning…';const g=randomGrid();await Promise.all(Array.from({length:5},(_,c)=>spinColumn(c,650+c*170,g[c])));const wins=evaluate(g);const scat=g.flat().filter(s=>s===SCATTER).length;if(scat>=3){free+=8;el('msg').textContent='💎 SCATTER! +8 FREE SPINS'}if(g.flat().filter(s=>s==='⭐').length>=3)await bonusPick();win=wins.reduce((a,w)=>a+w.amount,0);credits+=win;drawLines(wins.map(w=>w.line));if(win){el('msg').textContent=`✨ BIG WIN! +${Math.floor(win)} credits`;flash();beep(780,.2)}if(free>0)free--;hud();busy=false;spinBtn.disabled=false;el('betDown').removeAttribute('disabled');el('betUp').removeAttribute('disabled');if(auto)setTimeout(spin,650)}
  spinBtn.onclick=spin;el('betDown').onclick=()=>{if(!busy){bet=Math.max(1,bet-1);hud()}};el('betUp').onclick=()=>{if(!busy){bet=Math.min(50,bet+1);hud()}};el('lines').onclick=()=>{if(!busy){lineCount=lineCount===20?10:20;el('lines').textContent=`LINES: ${lineCount}`}};el('sound').onclick=()=>{sound=!sound;el('sound').textContent=sound?'🔊 SOUND':'🔇 SOUND';if(sound)beep(600)};el('auto').onclick=()=>{auto=!auto;el('auto').textContent=auto?'AUTO: ON':'AUTO SPIN';if(auto&&!busy)spin()};el('reset').onclick=()=>{if(!busy){credits=1000;bet=10;lineCount=20;free=0;win=0;auto=false;el('auto').textContent='AUTO SPIN';el('lines').textContent='LINES: 20';el('msg').textContent='Game reset.';drawLines([]);hud()}};hud();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>void init(),{once:true});
}else{
  void init();
}
