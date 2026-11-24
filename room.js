/* 3D Hong Kong Flat Engine — Revamped Dynamic Version */
window.Room=(function(){
const T=window.THREE;if(!T)return null;
let R,scene,cam,root,canvas,onPick,onFrame,W=7,H=2.7,D=6,type='compact',era='80',st={traits:[],dishes:[],photos:[],weather:'clear',mood:'calm'};
let curtains=[],fan,smoke=[],steam=[],rainPts,hands=[],tv,lamp,sun,hemi,fam=[],dishG,offers={},wallPh=[],portraitMesh,viewMesh,anchors={},traitG,modeG,plants=[];
let pos=new T.Vector3(),look=new T.Vector3(),yaw=0,pitch=0,tyaw=0,tpitch=0,tween=null,breezeT=0,running=false,quiet=false,sleeping=false,seed=7;
const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function tex(size,draw,rx=1,ry=1){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx,ry);t.encoding=T.sRGBEncoding;return t}
function wood(base,dark,rx,ry){return tex(256,(x,s)=>{x.fillStyle=base;x.fillRect(0,0,s,s);for(let i=0;i<140;i++){x.strokeStyle=dark;x.globalAlpha=.08;x.beginPath();const y=rnd()*s;x.moveTo(0,y);x.lineTo(s,y+rnd()*6-3);x.stroke()}x.globalAlpha=1},rx,ry)}
function plaster(c){return tex(256,(x,s)=>{x.fillStyle=c;x.fillRect(0,0,s,s);for(let i=0;i<1200;i++){x.fillStyle=`rgba(0,0,0,${rnd()*.03})`;x.fillRect(rnd()*s,rnd()*s,2,2)}},2,1)}
const floors={
  '80':()=>tex(256,(x,s)=>{const n=8,q=s/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){x.fillStyle=(i+j)%2?'#92a696':'#dcd4be';x.fillRect(i*q,j*q,q,q);x.strokeStyle='rgba(60,50,40,.35)';x.strokeRect(i*q,j*q,q,q)}},3,3),
  '00':()=>tex(256,(x,s)=>{x.fillStyle='#dfd1ba';x.fillRect(0,0,s,s);x.strokeStyle='rgba(120,100,80,.4)';x.lineWidth=2;x.strokeRect(0,0,s/2,s/2);x.strokeRect(s/2,s/2,s/2,s/2)},5,5),
  'now':()=>wood('#c9a77e','#7a5230',2.5,2.5)
};
function skyTex(hr,weather){
  const night=hr<6||hr>=19,dusk=hr>=17&&hr<19||hr>=6&&hr<8,dark=weather==='typhoon'||weather==='rain';
  return tex(512,(x,s)=>{
    const g=x.createLinearGradient(0,0,0,s);
    const cols=night?['#141e36','#2c3954','#5a4f5e']:dark?['#4a5666','#758291','#9da8b3']:dusk?['#6d88b5','#eab08a','#f7d7a8']:['#7fb2d9','#bcd9e8','#eef1e6'];
    cols.forEach((c,i)=>g.addColorStop(i/2,c));x.fillStyle=g;x.fillRect(0,0,s,s);
    for(let L=0;L<2;L++){let px=-10;while(px<s){const w=55+rnd()*50,h=s*(.3+rnd()*.3);x.fillStyle=night?'#1f2638':'#8a96a3';x.fillRect(px,s-h,w,h);for(let yy=s-h+8;yy<s-6;yy+=14)for(let xx=px+6;xx<px+w-8;xx+=12){x.fillStyle=night?(rnd()>.45?'#ffdf9e':'#121624'):'rgba(50,65,80,.35)';x.fillRect(xx,yy,6,7)}px+=w+12}}
  });
}

let mats={};
function mat(k,o){return mats[k]||(mats[k]=new T.MeshStandardMaterial(Object.assign({roughness:.75,metalness:0},o)))}
function add(p,g,m,x=0,y=0,z=0,cast=true){const e=new T.Mesh(g,m);e.position.set(x,y,z);e.castShadow=cast;e.receiveShadow=true;p.add(e);return e}
function box(p,w,h,d,m,x,y,z){return add(p,new T.BoxGeometry(w,h,d),m,x,y,z)}
function cyl(p,r1,r2,h,m,x,y,z,n=20){return add(p,new T.CylinderGeometry(r1,r2,h,n),m,x,y,z)}
function grp(place,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);if(place)g.userData.place=place;root.add(g);return g}
function puff(){return tex(64,(c,s)=>{const g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,250,240,.75)');g.addColorStop(1,'rgba(255,250,240,0)');c.fillStyle=g;c.fillRect(0,0,s,s)})}
let puffT;function vapour(list,n,x,y,z,sz){puffT=puffT||puff();for(let i=0;i<n;i++){const s=new T.Sprite(new T.SpriteMaterial({map:puffT,transparent:true,depthWrite:false,opacity:0}));s.userData={x,y,z,o:i/n,sz};root.add(s);list.push(s)}}
const loader=new T.TextureLoader();
function fitPhoto(mesh,url){loader.load(url,t=>{t.encoding=T.sRGBEncoding;mesh.material.map=t;mesh.material.needsUpdate=true})}

function build(){
  if(root){scene.remove(root);root.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
  Object.values(mats).forEach(m=>{if(m.map)m.map.dispose();m.dispose()});mats={};seed=7;
  curtains=[];fan=null;smoke=[];steam=[];hands=[];tv=null;fam=[];offers={};wallPh=[];plants=[];anchors={};
  root=new T.Group();scene.add(root);
  const comp=type==='compact';W=comp?6.2:7.4;H=comp?2.6:2.95;D=6;
  const hr=new Date().getHours(),night=hr<6||hr>=19,e80=era==='80',e00=era==='00',now=era==='now';

  const woodM=mat('wood',{map:e80?wood('#6d3a24','#2b1208',1,1):e00?wood('#8a5132','#3d1c0d',1,1):wood('#c8a070','#80562e',1,1),roughness:.5});
  const metal=mat('metal',{color:e80?'#4d7a68':e00?'#b9bcc0':'#2e2f31',roughness:.4,metalness:.5});
  const white=mat('white',{color:'#f3efe6',roughness:.5}),brass=mat('brass',{color:'#b98b3e',roughness:.32,metalness:.8}),red=mat('red',{color:'#9d3029',roughness:.5});
  const wallM=mat('wall',{map:plaster(e80?'#e8e1cb':e00?'#eee0c6':'#ece8e0'),roughness:.92});

  /* 地板與牆身 */
  const floor=add(root,new T.PlaneGeometry(W,D+4),mat('floor',{map:floors[era](),roughness:.45}),0,0,2,false);floor.rotation.x=-Math.PI/2;
  const wx=-W/2+1.45,ww=comp?1.5:2.1,wh=1.3,wy=1.62;
  const s=new T.Shape();s.moveTo(-W/2,0);s.lineTo(W/2,0);s.lineTo(W/2,H);s.lineTo(-W/2,H);s.closePath();
  const hole=new T.Path();hole.moveTo(wx-ww/2,wy-wh/2);hole.lineTo(wx-ww/2,wy+wh/2);hole.lineTo(wx+ww/2,wy+wh/2);hole.lineTo(wx+ww/2,wy-wh/2);hole.closePath();s.holes.push(hole);
  add(root,new T.ExtrudeGeometry(s,{depth:.18,bevelEnabled:false}),wallM,0,0,-D/2-.18);
  box(root,.15,H,D+4,wallM,-W/2-.075,H/2,2);box(root,.15,H,D+4,wallM,W/2+.075,H/2,2);
  box(root,W,.12,D+4,mat('ceil',{color:'#f2eee4',roughness:1}),0,H+.06,2);
  if(comp&&!now){const pipe=mat('pipe',{color:'#d8d2c2'});cyl(root,.045,.045,H,pipe,W/2-.12,H/2,-D/2+.14);box(root,W,.2,.22,mat('ceil'),0,H-.1,1.2)}

  /* 窗戶與窗外景觀 */
  const win=grp('window',wx,0,-D/2);
  viewMesh=new T.Mesh(new T.PlaneGeometry(9,6),new T.MeshBasicMaterial({map:skyTex(hr,st.weather)}));
  viewMesh.position.set(wx,wy+.2,-D/2-3);root.add(viewMesh);
  box(win,ww+.2,.06,comp?.24:.52,now?white:mat('sill',{color:'#d5cbb8',roughness:.3}),0,wy-wh/2-.02,comp?.06:.22);
  const cm=new T.MeshStandardMaterial({color:e80?'#c9936d':e00?'#b78f66':'#e7e2d6',side:T.DoubleSide,roughness:.95,transparent:now,opacity:now?.85:1});
  [-1,1].forEach(k=>{const g=new T.PlaneGeometry(.52,1.75,16,10);const c=add(win,g,cm,k*(ww/2+.02),wy-.1,.14);c.userData={k,base:g.attributes.position.array.slice()};curtains.push(c)});
  const ch=grp('window',wx,0,-D/2+1.05);box(ch,.78,.42,.72,mat('up',{color:e80?'#9b5f43':'#8a7e72'}),0,.28,0);box(ch,.78,.5,.16,mat('up'),0,.65,-.28);ch.rotation.y=.35;

  /* 神位 */
  const ax=comp?.15:0,az=-D/2+.32,al=grp('altar',ax,0,az),cabH=.98;
  box(al,1.25,cabH,.46,woodM,0,cabH/2,0);
  portraitMesh=new T.Mesh(new T.PlaneGeometry(.5,.62),new T.MeshStandardMaterial({color:'#e5d3b3',roughness:.4}));portraitMesh.position.set(0,1.65,-.25);al.add(portraitMesh);
  if(st.portrait)fitPhoto(portraitMesh,st.portrait);
  const inc=new T.Group();al.add(inc);offers.incG=inc;cyl(inc,.09,.07,.12,brass,0,cabH+.06,.06);
  const sticks=new T.Group();inc.add(sticks);offers.incense=sticks;[-.025,0,.025].forEach(x=>cyl(sticks,.004,.004,.26,red,x,cabH+.24,.06,8));
  vapour(smoke,14,ax,cabH+.38,az+.06,.15);
  const cup=new T.Group();al.add(cup);offers.tea=cup;[-.4,-.3,-.2].forEach(x=>cyl(cup,.03,.02,.05,white,x,cabH+.03,.12,12));
  const fl=new T.Group();al.add(fl);offers.flower=fl;cyl(fl,.05,.04,.18,mat('vase',{color:'#b9ccd0'}),.4,cabH+.09,0,12);

  /* 通勝日曆與相簿櫃 */
  const cx=ax+1.12,cal=grp('days',cx,1.6,-D/2+.02);box(cal,.45,.58,.03,white,0,0,0);box(cal,.45,.12,.035,red,0,.23,0);
  const bx=W/2-1.15,ab=grp('album',bx,0,-D/2+.28);box(ab,1.05,1.35,.38,woodM,0,.675,0);
  for(let i=0;i<3;i++){const m=new T.Mesh(new T.PlaneGeometry(.26,.22),new T.MeshStandardMaterial({color:'#e2d2b4'}));m.position.set(-.32+i*.32,1.5,.02);ab.add(m);wallPh.push(m);if(st.photos[i])fitPhoto(m,st.photos[i])}

  /* 書房門 */
  const sd=grp('study',W/2-.02,0,-1.1);box(sd,.08,2.1,1.05,woodM,0,1.05,0);cyl(sd,.03,.03,.06,brass,-.08,1.02,.38,12).rotation.z=Math.PI/2;

  /* 飯桌 */
  const tx=W/2-2.0,tz=.75,tb=grp('table',tx,0,tz),tr=comp?.62:.75;
  cyl(tb,tr,tr,.04,woodM,0,.74,0,36);cyl(tb,.06,.08,.72,woodM,0,.36,0,16);
  dishG=new T.Group();dishG.position.y=.76;tb.add(dishG);vapour(steam,10,tx,.82,tz,.18);
  traitG=new T.Group();root.add(traitG);modeG=new T.Group();root.add(modeG);

  /* 梳化與電視 */
  const sf=grp(null,-W/2+.65,0,.75);sf.rotation.y=Math.PI/2;box(sf,1.8,.35,.82,mat('up'),0,.25,0);box(sf,1.8,.55,.2,mat('up'),0,.62,-.3);
  const tg=grp(null,W/2-.36,0,1.9);tg.rotation.y=-Math.PI/2;box(tg,1.25,.42,.42,woodM,0,.21,0);
  tv=new T.MeshStandardMaterial({color:'#11181a',emissive:'#6f9fb5',emissiveIntensity:0});box(tg,1.1,.65,.04,tv,0,.85,0);

  /* 吊扇或吊燈 + 光線 */
  if(!now){fan=new T.Group();fan.position.set(.2,H-.28,.4);root.add(fan);for(let i=0;i<3;i++){const b=new T.Group();b.rotation.y=i*2.09;box(b,.6,.012,.12,woodM,.38,0,0);fan.add(b)}}
  lamp=new T.PointLight('#ffcf9a',night?1.3:.7,12,1.5);lamp.position.set(.2,H-.6,.4);lamp.castShadow=true;root.add(lamp);
  sun=new T.DirectionalLight(night?'#8fa6d8':'#fff0d2',night?.25:1.4);sun.position.set(wx-1.6,4.4,-D/2-4);root.add(sun);
  hemi=new T.HemisphereLight('#eef3f5','#9a826a',.45);root.add(hemi);

  /* 家人燈泡 */
  for(let i=0;i<5;i++){const b=add(root,new T.SphereGeometry(.045,12,10),new T.MeshStandardMaterial({color:'#ffe2b0',emissive:'#ffb04d',emissiveIntensity:0}),tx-.8+i*.4,H-.35,tz-.4,false);fam.push(b)}
  fam.light=new T.PointLight('#ffb766',0,4,1.6);fam.light.position.set(tx,H-.6,tz-.2);root.add(fam.light);

  /* 雨滴粒子（窗外） */
  const RN=140,ra=new Float32Array(RN*3);for(let i=0;i<RN;i++){ra[i*3]=wx-1.2+rnd()*2.4;ra[i*3+1]=.5+rnd()*2.5;ra[i*3+2]=-D/2-.5-rnd()*1.5}
  const rg=new T.BufferGeometry();rg.setAttribute('position',new T.BufferAttribute(ra,3));
  rainPts=new T.Points(rg,new T.PointsMaterial({color:'#d8e8f5',size:.035,transparent:true,opacity:0}));root.add(rainPts);

  anchors={window:[wx,.98,-D/2+1.2],altar:[ax,.62,az+.35],days:[cx,1.2,-D/2+.1],album:[bx,.55,-D/2+.55],study:[W/2-.15,1.3,-1.1],table:[tx,.55,tz+.5]};
  views={home:[[0,1.5,D/2+1.15],[0,1.18,-2]],window:[[wx+.75,1.35,-D/2+3.1],[wx,1.25,-D/2]],altar:[[ax,1.4,az+1.75],[ax,1.32,az]],days:[[cx,1.65,-D/2+1.3],[cx,1.65,-D/2]],album:[[bx-.2,1.3,-D/2+2.1],[bx,1.0,-D/2]],study:[[W/2-2.2,1.4,-.6],[W/2,1.2,-1.1]],table:[[tx-.75,1.5,tz+1.95],[tx,.8,tz]]};
  apply();
}
let views={};

function apply(){
  if(!root)return;
  offers.incense.visible=!!st.incense;offers.incG.visible=st.altar!=='photo';offers.tea.visible=!!st.tea;offers.flower.visible=!!st.flower;
  fam.forEach(b=>{b.material.emissiveIntensity=st.family?1.6:0;b.visible=!!st.family});fam.light.intensity=st.family?.9:0;

  /* 情緒燈色與天氣連動 */
  const moodCol=st.mood==='tired'?'#ffae66':st.mood==='anxious'?'#b8d4ff':'#ffdfba';
  lamp.color.set(moodCol);
  lamp.intensity=sleeping?.05:(st.family?1.15:.75);
  sun.intensity=sleeping?.08:(st.weather==='typhoon'?.25:st.weather==='rain'?.5:1.3);
  hemi.intensity=sleeping?.1:.45;
  if(viewMesh)viewMesh.material.map=skyTex(new Date().getHours(),st.weather);
  if(rainPts)rainPts.material.opacity=st.weather==='clear'?0:(st.weather==='typhoon'?.85:.55);

  /* 飯桌餸菜 */
  dishG.clear();const cer=mat('cer',{color:'#f4f0e4',roughness:.2}),n=st.dishes.length;
  st.dishes.forEach((k,i)=>{const a=i/Math.max(1,n)*6.28,r=n>1?.32:0;cyl(dishG,.12,.09,.03,cer,Math.cos(a)*r,.015,Math.sin(a)*r,16)});
  if(st.chop)box(dishG,.02,.01,.22,mat('red',{color:'#9d3029'}),0,.02,.42);

  /* 「一家人」vs「自己一個」空間物件差異 */
  modeG.clear();
  const slipM=mat('slip',{color:'#9b4a44'}),boxM=mat('takeout',{color:'#f5f2ea'});
  if(st.family){
    /* 玄關三對拖鞋 + 飯桌保溫湯壺 + 梳化額外咕𠱸 */
    for(let i=0;i<3;i++)box(modeG,.24,.04,.1,slipM,W/2-.45,.02,.5+i*.22);
    cyl(modeG,.09,.09,.24,mat('thermos',{color:'#b5523b',roughness:.3}),W/2-2.0,.88,.75,16);
    box(modeG,.36,.36,.12,mat('cush2',{color:'#d9a74a'}),-W/2+.7,.65,.45);
  }else{
    /* 玄關一對拖鞋 + 枱面外賣盒與水杯 + 梳化隨意放外套 */
    box(modeG,.24,.04,.1,slipM,W/2-.45,.02,.55);
    box(modeG,.16,.06,.14,boxM,W/2-2.1,.79,.85);
    cyl(modeG,.035,.03,.09,cer,W/2-1.85,.8,.82,12);
    box(modeG,.42,.08,.35,mat('coat',{color:'#4a5d6e'}),-W/2+.65,.48,1.05);
  }

  tv.emissiveIntensity=(st.traits||[]).includes('tv')||st.family?.55:0;
}

const v3=new T.Vector3(),q=new T.Vector3();let last=0,t=0;
function tick(ms){
  if(!running)return;requestAnimationFrame(tick);if(document.hidden)return;
  const dt=Math.min(.05,(ms-last)/1000);last=ms;t+=dt;
  if(tween){tween.k=Math.min(1,tween.k+dt/tween.dur);const e=tween.k<.5?4*tween.k**3:1-(-2*tween.k+2)**3/2;pos.lerpVectors(tween.p0,tween.p1,e);look.lerpVectors(tween.l0,tween.l1,e);if(tween.k===1){const f=tween.cb;tween=null;f&&f()}}
  yaw+=(tyaw-yaw)*Math.min(1,dt*7);pitch+=(tpitch-pitch)*Math.min(1,dt*7);
  cam.position.copy(pos);q.copy(look).sub(pos);
  const a=Math.atan2(q.x,-q.z)+yaw,p=Math.atan2(q.y,Math.hypot(q.x,q.z))+pitch;
  v3.set(Math.sin(a)*Math.cos(p),Math.sin(p),-Math.cos(a)*Math.cos(p)).add(cam.position);cam.lookAt(v3);

  breezeT=Math.max(0,breezeT-dt);
  const wind=st.weather==='typhoon'?.06:.014+breezeT*.025;
  curtains.forEach(c=>{const b=c.userData.base,pa=c.geometry.attributes.position;for(let i=0;i<pa.count;i++){const x=b[i*3],y=b[i*3+1],f=(.875-y)/1.75;pa.setZ(i,Math.sin(t*2+y*2+x*3)*wind*f*2)}pa.needsUpdate=true});
  if(fan)fan.rotation.y+=dt*(st.weather==='typhoon'?2.6:1.4);
  smoke.forEach(s=>{const u=s.userData,k=(t*.13+u.o)%1;s.position.set(u.x+Math.sin(k*7+t)*.04*k,u.y+k*.7,u.z+.03);s.scale.setScalar(.03+k*u.sz);s.material.opacity=st.incense&&st.altar!=='photo'?Math.sin(k*3.14)*.22:0});
  steam.forEach((s,i)=>{const u=s.userData,k=(t*.22+u.o)%1;s.position.set(u.x+Math.sin(i*2)*.14,u.y+.05+k*.42,u.z+Math.cos(i*2)*.14);s.scale.setScalar(.05+k*u.sz);s.material.opacity=st.dishes.length?Math.sin(k*3.14)*.14:0});
  if(rainPts&&st.weather!=='clear'){const pa=rainPts.geometry.attributes.position;for(let i=0;i<pa.count;i++){let y=pa.getY(i)-dt*(st.weather==='typhoon'?5:2.8);if(y<.4)y=2.9;pa.setY(i,y)}pa.needsUpdate=true}

  R.render(scene,cam);onFrame&&onFrame();
}
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=cam.aspect<.8?68:50;cam.updateProjectionMatrix()}

return{
  init(o){
    canvas=o.canvas;onPick=o.onPick;onFrame=o.onFrame;
    R=new T.WebGLRenderer({canvas,antialias:true});R.setPixelRatio(Math.min(devicePixelRatio||1,1.75));R.outputEncoding=T.sRGBEncoding;R.shadowMap.enabled=true;
    scene=new T.Scene();scene.background=new T.Color('#241c17');cam=new T.PerspectiveCamera(50,1,.05,40);
    Object.assign(st,o.state||{});type=o.type;era=o.era;build();pos.set(0,1.55,D/2+2.6);look.set(0,1.2,-2);resize();new ResizeObserver(resize).observe(canvas);
    let dn=null,ray=new T.Raycaster();
    canvas.addEventListener('pointerdown',e=>{dn={x:e.clientX,y:e.clientY,ty:tyaw,tp:tpitch,m:0};try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
    canvas.addEventListener('pointermove',e=>{if(!dn)return;const dx=e.clientX-dn.x,dy=e.clientY-dn.y;dn.m=Math.max(dn.m,Math.hypot(dx,dy));tyaw=clamp(dn.ty-dx*.003,-.85,.85);tpitch=clamp(dn.tp+dy*.002,-.35,.35)});
    canvas.addEventListener('pointerup',e=>{if(dn&&dn.m<8){const b=canvas.getBoundingClientRect();ray.setFromCamera({x:(e.clientX-b.left)/b.width*2-1,y:-(e.clientY-b.top)/b.height*2+1},cam);for(const hit of ray.intersectObjects(root.children,true)){let o2=hit.object;while(o2&&!o2.userData.place)o2=o2.parent;if(o2){onPick(o2.userData.place);break}}}dn=null});
    running=true;requestAnimationFrame(tick);
  },
  go(p,cb){const v=views[p]||views.home;tyaw=tpitch=0;tween={k:0,dur:1.1,p0:pos.clone(),p1:new T.Vector3(...v[0]),l0:look.clone(),l1:new T.Vector3(...v[1]),cb}},
  style(ty,er){type=ty;era=er;build()},
  set(o){const pho=JSON.stringify(st.photos),por=st.portrait;Object.assign(st,o);if(JSON.stringify(st.photos)!==pho)wallPh.forEach((m,i)=>{if(st.photos[i])fitPhoto(m,st.photos[i])});if(st.portrait&&st.portrait!==por)fitPhoto(portraitMesh,st.portrait);apply()},
  breeze(){breezeT=3},
  sleep(v){sleeping=v;apply()},
  quiet(v){quiet=v},
  project(k){const a=anchors[k];if(!a)return null;v3.set(...a).project(cam);return v3.z<1&&Math.abs(v3.x)<.96&&Math.abs(v3.y)<.96?[(v3.x+1)/2,(1-v3.y)/2]:null}
};
})();