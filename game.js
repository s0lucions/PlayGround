import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

const canvas=document.querySelector('#game-canvas');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x8795a1);
scene.fog=new THREE.FogExp2(0x8795a1,0.0085);
const camera=new THREE.PerspectiveCamera(54,innerWidth/innerHeight,.1,420);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
scene.add(new THREE.HemisphereLight(0xb8c6d6,0x26202a,2.1));
const moon=new THREE.DirectionalLight(0xffd5ba,2.2);moon.position.set(-34,55,24);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);moon.shadow.camera.left=-60;moon.shadow.camera.right=60;moon.shadow.camera.top=60;moon.shadow.camera.bottom=-60;scene.add(moon);
const neonLight=new THREE.PointLight(0xd84443,24,85);neonLight.position.set(-10,10,-10);scene.add(neonLight);
const blueLight=new THREE.PointLight(0x4d83bc,22,75);blueLight.position.set(24,12,8);scene.add(blueLight);
const mats={
 road:new THREE.MeshStandardMaterial({color:0x20262d,roughness:.92}),sidewalk:new THREE.MeshStandardMaterial({color:0x555861,roughness:.9}),
 red:new THREE.MeshStandardMaterial({color:0x8e111d,roughness:.58,metalness:.1}),redBright:new THREE.MeshStandardMaterial({color:0xb6242a,roughness:.48,metalness:.12}),
 navy:new THREE.MeshStandardMaterial({color:0x101c35,roughness:.68,metalness:.12}),navyLite:new THREE.MeshStandardMaterial({color:0x192b4a,roughness:.6,metalness:.1}),
 web:new THREE.MeshStandardMaterial({color:0xd9e1df,roughness:.32,metalness:.3}),glow:new THREE.MeshBasicMaterial({color:0xe5473e}),
 concrete:new THREE.MeshStandardMaterial({color:0x41444a,roughness:.88}),metal:new THREE.MeshStandardMaterial({color:0x454c54,roughness:.5,metalness:.6}),
 skin:new THREE.MeshStandardMaterial({color:0x7f452b,roughness:.7}),glass:new THREE.MeshStandardMaterial({color:0x253947,roughness:.25,metalness:.4,emissive:0x101c23}),
 enemy:new THREE.MeshStandardMaterial({color:0x262d34,roughness:.72}),enemyRed:new THREE.MeshStandardMaterial({color:0x692b28,roughness:.6}),enemyGlow:new THREE.MeshStandardMaterial({color:0xff6a48,emissive:0x822617,emissiveIntensity:1.6})
};
const boxGeo=new THREE.BoxGeometry(1,1,1),sphereGeo=new THREE.SphereGeometry(1,16,12),cylGeo=new THREE.CylinderGeometry(1,1,1,12);
function box(parent,mat,pos,scale,cast=true){const m=new THREE.Mesh(boxGeo,mat);m.position.set(...pos);m.scale.set(...scale);m.castShadow=cast;m.receiveShadow=true;parent.add(m);return m}
function sphere(parent,mat,pos,scale){const m=new THREE.Mesh(sphereGeo,mat);m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;parent.add(m);return m}
function cylinder(parent,mat,pos,rTop,rBot,h,rot=[0,0,0]){const m=new THREE.Mesh(new THREE.CylinderGeometry(rTop,rBot,h,12),mat);m.position.set(...pos);m.rotation.set(...rot);m.castShadow=true;parent.add(m);return m}
function line(parent,points,mat,r=.025){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(8,points.length*5),r,5,false),mat);parent.add(mesh);return mesh}

// Rooftop-to-street block: authored as a compact playable slice of Manhattan.
const city=new THREE.Group();scene.add(city);
box(city,mats.road,[0,-.18,0],[220,.35,220],false);
// roads and curb strips
for(let z=-60;z<=60;z+=30){box(city,mats.concrete,[0,.02,z],[220,.12,7],false);box(city,mats.road,[0,.1,z],[220,.08,5.1],false);for(let x=-100;x<100;x+=10)box(city,new THREE.MeshBasicMaterial({color:0xc2b59b}),[x,.15,z],[4,.018,.12],false)}
for(let x=-60;x<=60;x+=30){box(city,mats.concrete,[x,.02,0],[7,.12,220],false);box(city,mats.road,[x,.1,0],[5.1,.08,220],false)}
// blocks, rooftops, facade grids and warm window lights
const buildingMats=[0x333943,0x45404a,0x37434a,0x504851,0x313d49,0x494447].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.82}));
const windowMats=[0xd6a969,0x91b9c5,0x2d3942,0xd18d67].map(c=>new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.3,roughness:.45}));
function building(x,z,w,d,h,idx){const g=new THREE.Group();g.position.set(x,0,z);city.add(g);const wall=buildingMats[idx%buildingMats.length];box(g,wall,[0,h/2,0],[w,h,d]);box(g,mats.concrete,[0,h+.25,0],[w+.35,.5,d+.35]);
 for(let y=2.2;y<h-1;y+=2.35){for(let sx=-w/2+1.15;sx<w/2-.4;sx+=2.3){for(const side of [-1,1]){const win=new THREE.Mesh(boxGeo,windowMats[(Math.random()*windowMats.length)|0]);win.position.set(sx,y,side*(d/2+.011));win.scale.set(.82,1.15,.04);g.add(win)}for(let sz=-d/2+1.4;sz<d/2-.4;sz+=2.7){for(const side of [-1,1]){const win=new THREE.Mesh(boxGeo,windowMats[(Math.random()*windowMats.length)|0]);win.position.set(side*(w/2+.011),y,sz);win.scale.set(.04,1.15,.92);g.add(win)}}}}
 // rooftop tanks, vents and a red aviation lamp
 if(h>18){cylinder(g,mats.metal,[w*.18,h+1.5,0],1.3,1.3,2.6);box(g,mats.metal,[-w*.22,h+1,0],[2.5,1.8,2]);sphere(g,mats.glow,[w*.36,h+2,d*.15],[.18,.18,.18])}
 return g}
// Close skyline frames the arena; low rooftops leave clear grapple silhouettes.
building(-16,-28,20,20,31,1);building(17,-29,22,19,43,0);building(-18,1,18,19,24,3);building(17,1,20,19,35,2);
building(-18,32,19,18,29,4);building(18,33,22,20,39,5);building(-46,-18,25,24,57,0);building(46,-17,27,22,63,3);building(-47,25,25,26,48,2);building(47,25,26,25,54,4);
for(let i=0;i<34;i++){const x=(Math.random()-.5)*210,z=(Math.random()-.5)*210;if(Math.abs(x)<53&&Math.abs(z)<48)continue;const w=10+Math.random()*13,d=10+Math.random()*12,h=28+Math.random()*78;building(x,z,w,d,h,i)}
// plaza ground details, lamps, bollards, parked cabs
for(let x=-5;x<=5;x+=5){box(city,mats.metal,[x,.24,7],[.13,.14,18],false)}
function streetLamp(x,z){cylinder(city,mats.metal,[x,2.6,z],.08,.12,5.1);line(city,[[x,5,z],[x+.8,5.1,z],[x+1,4.8,z]],mats.metal,.065);sphere(city,new THREE.MeshBasicMaterial({color:0xffdfa0}),[x+1,4.7,z],[.2,.12,.15]);}
for(const x of [-10,10])for(const z of [-8,8,24])streetLamp(x,z);
function car(x,z,color){const g=new THREE.Group();g.position.set(x,.35,z);city.add(g);const body=new THREE.MeshStandardMaterial({color,roughness:.35,metalness:.45});box(g,body,[0,.42,0],[2, .65,4.1]);box(g,mats.glass,[0,.93,-.2],[1.6,.48,1.8]);for(const wx of [-1,1])for(const wz of [-1.25,1.25]){const wheel=cylinder(g,new THREE.MeshStandardMaterial({color:0x151719}),[wx,.1,wz],.34,.34,.2,[0,0,Math.PI/2]);wheel.rotation.x=Math.PI/2}box(g,new THREE.MeshBasicMaterial({color:0xffe6bc}),[0,.45,-2.07],[1.2,.16,.03]);return g}
car(-8,13,0x293d53);car(8,-13,0x6a2c2d);

// Aoi: fully masked, broad-shouldered silhouette; no exposed skin.
const hero=new THREE.Group();scene.add(hero);hero.position.set(0,0,13);
const torso=new THREE.Group();hero.add(torso);
// hips and tapered, armored trunk
sphere(torso,mats.navy,[0,1.12,0],[.47,.34,.34]);
const chest=box(torso,mats.redBright,[0,1.75,0],[1.12,1.03,.54]);chest.rotation.z=-.035;
box(torso,mats.red,[0,2.12,.01],[1.18,.38,.55]);
// chest spider mark, angular legs
sphere(torso,mats.red,[0,1.88,.286],[.12,.17,.035]);
for(const s of [-1,1]){line(torso,[[s*.06,1.91,.32],[s*.27,2.05,.34],[s*.4,2.2,.31]],mats.navy,.025);line(torso,[[s*.07,1.84,.32],[s*.28,1.7,.34],[s*.41,1.56,.31]],mats.navy,.025)}
// segmented suit rib lines and dark blue side panels
for(const s of [-1,1]){const panel=box(torso,mats.navy,[s*.47,1.68,.04],[.18,.75,.51]);panel.rotation.z=s*-.12;}
// neck and mask
cylinder(torso,mats.navy,[0,2.34,0],.16,.19,.26);
const head=new THREE.Group();head.position.set(0,2.68,0);torso.add(head);
sphere(head,mats.red,[0,0,0],[.37,.47,.34]);
// mask center seam and expressive white lenses framed in navy
for(const s of [-1,1]){const eyeFrame=sphere(head,mats.navy,[s*.17,.08,.292],[.155,.118,.053]);eyeFrame.rotation.z=s*.2;const eye=sphere(head,mats.web,[s*.17,.085,.335],[.118,.071,.032]);eye.rotation.z=s*.22;}
line(head,[[0,.42,.13],[0,-.36,.32]],mats.redBright,.018);
// shoulders, upper arms, gloves, forearms
const arms=[];
for(const s of [-1,1]){const arm=new THREE.Group();arm.position.set(s*.65,2.12,0);torso.add(arm);sphere(arm,mats.red,[s*.12,-.08,0],[.34,.32,.34]);cylinder(arm,mats.navy,[s*.23,-.47,0],.23,.27,.68,[0,0,s*.12]);sphere(arm,mats.navy,[s*.25,-.78,0],[.23,.19,.23]);cylinder(arm,mats.redBright,[s*.29,-1.05,0],.19,.21,.43,[0,0,s*.06]);sphere(arm,mats.navy,[s*.3,-1.32,.02],[.2,.15,.22]);for(let k=0;k<3;k++)line(arm,[[s*.12,-.01,.31],[s*.25,-.45,.24],[s*.29,-.72,.23]],mats.redBright,.012);arms.push(arm)}
// legs are articulated at the hips
const legs=[];
for(const s of [-1,1]){const leg=new THREE.Group();leg.position.set(s*.29,.97,0);hero.add(leg);cylinder(leg,mats.navy,[0,-.42,0],.27,.22,.85);sphere(leg,mats.navy,[0,-.87,.02],[.22,.19,.24]);cylinder(leg,mats.red,[0,-1.22,0],.19,.18,.65);sphere(leg,mats.navy,[0,-1.57,.14],[.24,.15,.36]);for(let k=0;k<2;k++)line(leg,[[-.12,-.15,.22],[0,-.52,.23],[.1,-.82,.2]],mats.redBright,.012);legs.push(leg)}
// small red back spider, visible when swinging away from camera
for(const s of [-1,1]){line(torso,[[0,1.95,-.3],[s*.12,2.1,-.3],[s*.24,2.22,-.29]],mats.redBright,.025);line(torso,[[0,1.8,-.3],[s*.14,1.65,-.3],[s*.24,1.52,-.29]],mats.redBright,.025)}

// One contained street encounter: the courier and two hired escorts.
const enemies=[];
function makeEnemy(x,z,role='lookout',index=0){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const isBoss=role==='courier';const e={group:g,health:isBoss?180:75,maxHealth:isBoss?180:75,alive:true,boss:isBoss,stun:0,attack:0,warning:0,phase:Math.random()*5,speed:isBoss?1.45:1.75};enemies.push(e);
 const armor=isBoss?mats.enemyRed:mats.enemy,scale=isBoss?1.15:1;
 box(g,armor,[0,1.45,0],[.82*scale,.85*scale,.5*scale]);sphere(g,armor,[0,2.13,0],[.33*scale,.39*scale,.3*scale]);
 for(const s of [-1,1]){sphere(g,armor,[s*.48*scale,1.78,0],[.26*scale,.29*scale,.27*scale]);cylinder(g,armor,[s*.49*scale,1.37,0],.17*scale,.2*scale,.58*scale,[0,0,s*.08]);sphere(g,armor,[s*.5*scale,1.02,.08],[.17*scale,.13,.19]);cylinder(g,armor,[s*.18*scale,.64,0],.17*scale,.14*scale,.61*scale);sphere(g,armor,[s*.18*scale,.12,.1],[.18,.13,.28]);}
 const visor=sphere(g,mats.enemyGlow,[0,2.15,.275],[.2,.055,.04]);
 if(isBoss){box(g,mats.metal,[0,2.55,-.03],[.84,.12,.75]);for(const s of [-1,1])box(g,mats.enemyGlow,[s*.48,1.75,0],[.08,.48,.1]);}
 e.visor=visor;e.hitFlash=0;return e}
makeEnemy(0,-5,'courier');makeEnemy(-5,-1,'lookout');makeEnemy(5,-2,'lookout');
// anchor points are deliberately readable rooftop corners, not unlimited flight.
const anchors=[];for(const p of [[-18,24,-28],[17,31,-29],[-18,19,1],[17,29,1],[-18,23,32],[18,30,33],[-47,42,-18],[47,50,-17]])anchors.push(new THREE.Vector3(...p));
const tetherGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);const tether=new THREE.Line(tetherGeo,new THREE.LineBasicMaterial({color:0xe9e9df,transparent:true,opacity:.9}));tether.visible=false;scene.add(tether);
const webShots=[];const particles=[];
function makeParticle(pos,color=0xe7eee9){const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(.12,0),new THREE.MeshBasicMaterial({color,transparent:true}));mesh.position.copy(pos);scene.add(mesh);particles.push({mesh,vel:new THREE.Vector3((Math.random()-.5)*5,Math.random()*4,(Math.random()-.5)*5),life:.42});}
function updateEffects(dt){for(let i=webShots.length-1;i>=0;i--){const w=webShots[i];w.t+=dt;const t=Math.min(1,w.t/w.duration);w.mesh.position.lerpVectors(w.from,w.to,t);if(t>=1){if(w.target&&w.target.alive){for(let p=0;p<7;p++)makeParticle(w.to)}scene.remove(w.mesh);webShots.splice(i,1)}}for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.mesh.position.addScaledVector(p.vel,dt);p.vel.y-=8*dt;p.mesh.material.opacity=Math.max(0,p.life/.42);if(p.life<=0){scene.remove(p.mesh);particles.splice(i,1)}}}
function spawnWeb(from,to){const material=new THREE.MeshBasicMaterial({color:0xf0f0e8});const orb=new THREE.Mesh(new THREE.SphereGeometry(.11,8,6),material);orb.position.copy(from);scene.add(orb);webShots.push({mesh:orb,from:from.clone(),to:to.clone(),t:0,duration:.19,target:null});}
const player={vel:new THREE.Vector3(),health:100,maxHealth:100,suit:100,webEnergy:100,webAmmo:6,onGround:true,groundY:0,swing:false,anchor:null,shotCooldown:0,attackCooldown:0,invuln:0,damageTimer:0,healing:0,attacking:0};
const state={started:false,complete:false,kills:0,dead:false,target:null,mouseDown:false,lookX:0,lookY:0,yaw:0,camPitch:0,time:0,quote:0,subtitleTimer:0,lastLine:'',webAmmo:6,webReload:0};
const key=new Set();
const el=id=>document.getElementById(id);
const healthFill=el('health-fill'),suitFill=el('suit-fill'),healthValue=el('health-value'),suitValue=el('suit-value'),enemyFill=el('enemy-fill'),enemyHealthValue=el('enemy-health-value');
function say(text,duration=2.3){const s=el('subtitles');s.textContent=text;s.classList.add('visible');state.subtitleTimer=duration}
function toast(text){const t=el('toast');t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1350)}
function remaining(){return enemies.filter(e=>e.alive).length}
function updateObjective(){const n=remaining();el('objective-subtitle').textContent=n?`${n} HOSTILE${n===1?'':'S'} · LAST KNOWN POSITION`:'THREAT CONTAINED';el('objective-check').textContent=n?`0${Math.min(state.kills+1,3)}`:'✓';el('hud-objective').textContent=n?'DISABLE THE CREW':'DISTRICT SECURE';el('hud-distance').textContent=n?`${Math.max(4,Math.round(hero.position.distanceTo(new THREE.Vector3(0,0,-5))*1.1))} M · COURIER IN SIGHT`:'GOOD WORK. KEEP MOVING.';el('status-text').textContent=n?'OPERATION ACTIVE':'OPERATION COMPLETE';}
function updateEnemyHud(){let target=state.target;if(!target||!target.alive)target=enemies.find(e=>e.alive&&e.boss)||enemies.find(e=>e.alive);state.target=target;if(!target){el('encounter-name').innerHTML='THREAT <b>CONTAINED</b>';enemyFill.style.width='0%';enemyHealthValue.textContent='0%';return}const pct=Math.max(0,target.health/target.maxHealth*100);el('encounter-name').innerHTML=target.boss?'THE <b>COURIER</b>':`ESCORT <b>${String(enemies.indexOf(target)+1).padStart(2,'0')}</b>`;enemyFill.style.width=pct+'%';enemyHealthValue.textContent=Math.ceil(pct)+'%';}
function selectTarget(){let best=null,score=1e6;const forward=new THREE.Vector3(Math.sin(state.yaw),0,-Math.cos(state.yaw));for(const e of enemies){if(!e.alive)continue;const d=e.group.position.distanceTo(hero.position);const dir=e.group.position.clone().sub(hero.position).normalize();const inFront=dir.dot(forward);const s=d+(1-inFront)*8;if(d<32&&inFront>-.15&&s<score){score=s;best=e}}state.target=best;const label=el('crosshair-label');label.style.opacity=best?'1':'0';}
function damageEnemy(e,amount,stun=1.1){if(!e||!e.alive)return;e.health-=amount;e.stun=Math.max(e.stun,stun);e.hitFlash=.15;if(e.health<=0){e.health=0;e.alive=false;scene.remove(e.group);state.kills++;if(Math.random()<.5)say(['“Should have stayed home.”','“That was the quiet option.”','“You can stop now.”'][Math.floor(Math.random()*3)],2);toast('HOSTILE NEUTRALIZED');updateObjective();if(!remaining()){finishEncounter()}}updateEnemyHud()}
function finishEncounter(){if(state.complete)return;state.complete=true;el('objective-complete').classList.add('show');el('comms-line').textContent='“You got them all. Coming in?”';say('“No. I’m good.”',3);updateObjective()}
function startEncounter(){if(state.started)return;state.started=true;document.body.classList.add('started');el('mission-card').classList.add('hidden');el('comms-card').classList.add('hidden');el('hud').classList.remove('hidden');el('controls-hint').classList.add('active');el('controls-hint').style.opacity='1';say('“I’m here. Don’t make it a thing.”',2.4);setTimeout(()=>{if(state.started&&!state.complete)el('comms-line').textContent='“Copy that. Stay with me, Aoi.”'},1800);updateObjective()}
el('deploy-btn').addEventListener('click',startEncounter);el('continue-btn').addEventListener('click',()=>{el('objective-complete').classList.remove('show');say('“I said I’m good.”',2)});
window.addEventListener('keydown',e=>{key.add(e.code);if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='KeyF'&&!e.repeat)strike();if(e.code==='Space'&&player.swing){player.swing=false;player.vel.y=Math.max(player.vel.y,2.4);tether.visible=false}});
window.addEventListener('keyup',e=>key.delete(e.code));
window.addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('mousedown',e=>{if(e.button===2){state.mouseDown=true;state.lastMouseX=e.clientX;state.lastMouseY=e.clientY}else if(e.button===0&&state.started)shoot()});
window.addEventListener('mouseup',e=>{if(e.button===2)state.mouseDown=false});
window.addEventListener('mousemove',e=>{if(state.mouseDown){state.yaw-=(e.clientX-state.lastMouseX)*.004;state.camPitch=THREE.MathUtils.clamp(state.camPitch+(e.clientY-state.lastMouseY)*.002,-.22,.55);state.lastMouseX=e.clientX;state.lastMouseY=e.clientY}});
window.addEventListener('wheel',e=>{camera.userData.distance=THREE.MathUtils.clamp((camera.userData.distance||7)+Math.sign(e.deltaY)*.45,4.7,10)});
function shoot(){if(player.shotCooldown>0||player.webReload>0||player.webAmmo<=0)return;selectTarget();const forward=new THREE.Vector3(Math.sin(state.yaw),.02,-Math.cos(state.yaw));const origin=hero.position.clone().add(new THREE.Vector3(0,1.9,0)).add(forward.clone().multiplyScalar(.45));const e=state.target;const dest=e?e.group.position.clone().add(new THREE.Vector3(0,1.45,0)):origin.clone().add(forward.multiplyScalar(24));spawnWeb(origin,dest);if(e)webShots[webShots.length-1].target=e;player.shotCooldown=.28;player.webAmmo--;if(player.webAmmo===0){player.webReload=2.5;toast('WEB FLUID RELOADING')}if(e){damageEnemy(e,e.boss?17:25,1.25);if(e.alive)say('“Hold still.”',1.25)}}
function strike(){if(!state.started||player.attackCooldown>0)return;selectTarget();const e=state.target;if(!e||hero.position.distanceTo(e.group.position)>4.4){say('“A little closer.”',1.1);return}player.attackCooldown=.48;player.attacking=.25;player.vel.add(new THREE.Vector3(Math.sin(state.yaw)*2,0,-Math.cos(state.yaw)*2));damageEnemy(e,e.boss?31:42,1.05);if(e.alive)say(['“No.”','“Stay down.”','“Bad idea.”'][Math.floor(Math.random()*3)],1.2)}
function beginSwing(){if(player.swing||player.webEnergy<8)return;const forward=new THREE.Vector3(Math.sin(state.yaw),0,-Math.cos(state.yaw));let best=null,score=0;for(const a of anchors){const delta=a.clone().sub(hero.position),d=delta.length(),dot=delta.normalize().dot(forward);if(d<43&&d>8&&dot>-.2){const s=dot*1.6-d*.012;if(s>score){score=s;best=a}}}if(best){player.anchor=best;player.swing=true;player.vel.y=Math.max(player.vel.y,2.8);player.vel.add(forward.clone().multiplyScalar(5.5));tether.visible=true}else if(Math.random()<.06)toast('NO ANCHOR IN RANGE')}
function toggleSense(on){const flash=el('sense-flash');flash.style.opacity=on?'1':'0'}
function updateEnemyLogic(dt){let danger=false;for(const e of enemies){if(!e.alive)continue;e.phase+=dt;const pos=e.group.position,delta=hero.position.clone().sub(pos);delta.y=0;const dist=delta.length();if(e.stun>0){e.stun-=dt;e.group.rotation.y+=Math.sin(e.phase*18)*dt*.6;e.visor.material=mats.web}else{e.visor.material=mats.enemyGlow;if(e.warning>0){e.warning-=dt;if(e.warning<.46)danger=true;if(e.warning<=0){e.warning=0;e.attack=e.boss?2.45:2.1;if(dist<3.6&&player.invuln<=0){player.health=Math.max(0,player.health-(e.boss?17:12));player.suit=Math.max(0,player.suit-8);player.invuln=.8;player.damageTimer=3;player.vel.add(delta.normalize().multiplyScalar(4));player.vel.y=2.2;toast('IMPACT · VITALS DAMAGED');say('“That one landed.”',1.3);if(player.health<=0)respawn()}}}else if(e.attack>0)e.attack-=dt;
 if(dist>1.8&&dist<24&&e.warning<=0){const v=delta.normalize();pos.add(v.multiplyScalar(e.speed*dt));e.group.rotation.y=Math.atan2(v.x,v.z)}else if(dist<=2.8&&e.warning<=0&&e.attack<=0){e.warning=e.boss?.96:.78;e.group.rotation.y=Math.atan2(delta.x,delta.z)}
 }
 }
 if(danger){toggleSense(true);document.body.classList.add('danger')}else{toggleSense(false);document.body.classList.remove('danger')}}
function respawn(){player.health=50;player.suit=35;player.vel.set(0,0,0);hero.position.set(0,0,16);player.invuln=2;toast('RECOVERY · HEALING FACTOR ENGAGED');say('“I’m not dead. That’s inconvenient.”',2)}
function updatePlayer(dt){const forward=new THREE.Vector3(Math.sin(state.yaw),0,-Math.cos(state.yaw));const right=new THREE.Vector3(Math.cos(state.yaw),0,Math.sin(state.yaw));const move=new THREE.Vector3();if(key.has('KeyW')||key.has('ArrowUp'))move.add(forward);if(key.has('KeyS')||key.has('ArrowDown'))move.sub(forward);if(key.has('KeyD')||key.has('ArrowRight'))move.add(right);if(key.has('KeyA')||key.has('ArrowLeft'))move.sub(right);if(move.lengthSq())move.normalize();const running=key.has('ShiftLeft')||key.has('ShiftRight');const speed=running?8.3:5.7;
 if(move.lengthSq()){const targetRot=Math.atan2(-move.x,-move.z)+Math.PI;hero.rotation.y+=THREE.MathUtils.clamp(Math.atan2(Math.sin(targetRot-hero.rotation.y),Math.cos(targetRot-hero.rotation.y)),-dt*7,dt*7)}
 if(key.has('Space')&&player.onGround){player.vel.y=7.6;player.onGround=false;key.delete('Space')}
 if(key.has('KeyE')&&!player.swing)beginSwing();if(!key.has('KeyE')&&player.swing){player.swing=false;tether.visible=false}
 if(player.swing){const a=player.anchor;const anchorPoint=hero.position.clone().add(new THREE.Vector3(0,2.5,0));const to=anchorPoint.clone().sub(a);const length=to.length();const radial=to.normalize();const tangential=new THREE.Vector3(forward.x,0,forward.z);player.vel.add(tangential.multiplyScalar(9*dt));player.vel.y-=7.4*dt;player.vel.add(radial.multiplyScalar(-Math.max(0,length-18)*.42*dt));player.webEnergy=Math.max(0,player.webEnergy-10*dt);if(player.webEnergy<=0){player.swing=false;tether.visible=false}const points=[a,anchorPoint];tether.geometry.setFromPoints(points)}else{player.webEnergy=Math.min(100,player.webEnergy+14*dt);player.vel.y-=19*dt;player.vel.x+=(move.x*speed-player.vel.x)*Math.min(1,dt*5.5);player.vel.z+=(move.z*speed-player.vel.z)*Math.min(1,dt*5.5)}
 player.vel.x*=Math.pow(player.swing?.995:.91,dt*60);player.vel.z*=Math.pow(player.swing?.995:.91,dt*60);hero.position.addScaledVector(player.vel,dt);if(hero.position.y<=0){hero.position.y=0;player.vel.y=0;player.onGround=true}else player.onGround=false;hero.position.x=THREE.MathUtils.clamp(hero.position.x,-88,88);hero.position.z=THREE.MathUtils.clamp(hero.position.z,-88,88);
 torso.position.y=Math.sin(state.time*(running?13:8))*(move.lengthSq()?0.035:0.012);for(let i=0;i<2;i++){const leg=legs[i],arm=arms[i],phase=state.time*(running?9:6)+i*Math.PI;const gait=move.lengthSq()&&!player.swing?Math.sin(phase)*.48:0;leg.rotation.x=gait;arm.rotation.x=-gait*.75+(player.attacking>0?-.5:0);}
 if(player.attacking>0)player.attacking-=dt;if(player.invuln>0)player.invuln-=dt;if(player.shotCooldown>0)player.shotCooldown-=dt;if(player.attackCooldown>0)player.attackCooldown-=dt;if(player.webReload>0){player.webReload-=dt;if(player.webReload<=0)player.webAmmo=6}
 if(player.damageTimer>0)player.damageTimer-=dt;else if(player.health<100)player.health=Math.min(100,player.health+dt*2.7);if(player.suit<100)player.suit=Math.min(100,player.suit+dt*.75);
 healthFill.style.width=player.health+'%';suitFill.style.width=player.suit+'%';healthValue.textContent=Math.round(player.health);suitValue.textContent=Math.round(player.suit);
}

const clock=new THREE.Clock();
const cameraTarget=new THREE.Vector3();
const cameraDesired=new THREE.Vector3();
camera.userData.distance=7.2;
camera.position.set(0,4.2,21);
camera.lookAt(0,1.8,13);
let lastTargetRefresh=0;
function updateCamera(dt){
  const distance=camera.userData.distance||7.2;
  const pitch=state.camPitch;
  const horizontal=Math.cos(pitch)*distance;
  cameraDesired.set(hero.position.x+Math.sin(state.yaw)*horizontal,hero.position.y+2.2+Math.sin(pitch)*distance,hero.position.z+Math.cos(state.yaw)*horizontal);
  cameraTarget.set(hero.position.x,hero.position.y+1.55,hero.position.z);
  const blend=1-Math.exp(-dt*7.5);
  camera.position.lerp(cameraDesired,blend);
  camera.lookAt(cameraTarget);
}
function updateUi(dt){
  state.time+=dt;
  if(state.started&&!state.complete){
    lastTargetRefresh-=dt;
    if(lastTargetRefresh<=0){selectTarget();updateEnemyHud();lastTargetRefresh=.22}
    const e=state.target;
    const distance=e&&e.alive?hero.position.distanceTo(e.group.position):Infinity;
    const interaction=el('interaction');
    if(player.swing){interaction.classList.add('active');interaction.innerHTML='<span class="keycap">E</span><span>RELEASE TO DROP</span>'}
    else if(anchors.some(a=>a.distanceTo(hero.position)>8&&a.distanceTo(hero.position)<43)){
      interaction.classList.add('active');interaction.innerHTML='<span class="keycap">E</span><span>HOLD TO SWING</span>';
    }else interaction.classList.remove('active');
    el('crosshair-label').textContent=e&&distance<32?(distance<4.4?'F · STRIKE':'CLICK · WEB SHOT'):'NO THREAT IN SIGHT';
    el('crosshair-label').style.opacity=e&&distance<32?'1':'0';
    el('reticle').classList.toggle('locked',!!e&&distance<32);
  }
  if(state.subtitleTimer>0){state.subtitleTimer-=dt;if(state.subtitleTimer<=0)el('subtitles').classList.remove('visible')}
}
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.035);
  if(state.started){updatePlayer(dt);updateEnemyLogic(dt);updateEffects(dt)}
  else updateEffects(dt);
  updateCamera(dt);
  updateUi(dt);
  renderer.render(scene,camera);
}
function resize(){
  const width=innerWidth,height=innerHeight;
  camera.aspect=width/height;camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setSize(width,height);
}
window.addEventListener('resize',resize);
setTimeout(()=>{el('loading').classList.add('hidden')},650);
updateObjective();updateEnemyHud();
animate();
