import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const canvas=document.getElementById('escena'),overlay=document.getElementById('carga'),hint=document.getElementById('hint'),reset=document.getElementById('reset');
if(matchMedia('(hover: none)').matches)hint.textContent='Arrastra para girar · pellizca para acercar';
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true})}catch(e){overlay.innerHTML='<p class="err">Sin WebGL. Usa Chrome o Safari actualizados.</p>';throw e}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const FONDO=0x0d1a22,scene=new THREE.Scene();
scene.background=bg();scene.fog=new THREE.Fog(FONDO,22,95);
function bg(){const c=document.createElement('canvas');c.width=8;c.height=512;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,512);gr.addColorStop(0,'#1c3040');gr.addColorStop(.45,'#0d1a22');gr.addColorStop(1,'#04080b');g.fillStyle=gr;g.fillRect(0,0,8,512);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const MIRA=new THREE.Vector3(0,4.1,0),camera=new THREE.PerspectiveCamera(36,1,.1,200);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.copy(MIRA);controls.enableDamping=true;controls.dampingFactor=.06;controls.enablePan=false;controls.minPolarAngle=.12;controls.maxPolarAngle=1.52;
const V={ancha:{dir:new THREE.Vector3(.62,.26,.72).normalize(),fov:36,ancho:6.4,alto:10.6,margen:1.22},vertical:{dir:new THREE.Vector3(.55,.30,.62).normalize(),fov:42,ancho:5.6,alto:11,margen:1.14}};
let vista=V.ancha,dist=14;
const key=new THREE.DirectionalLight(0xffffff,2.6);key.position.set(6,12,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=12;key.shadow.camera.bottom=-4;key.shadow.camera.far=40;key.shadow.bias=-.0006;key.shadow.normalBias=.02;scene.add(key);
scene.add(new THREE.HemisphereLight(0xcfe6ff,0x1a2027,.6));
const rel=new THREE.DirectionalLight(0x9fc0ff,1);rel.position.set(-7,5,4);scene.add(rel);
const con=new THREE.DirectionalLight(0xffc98a,1.3);con.position.set(-4,4,-8);scene.add(con);
const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose();
const piso=new THREE.Mesh(new THREE.CircleGeometry(120,48),new THREE.MeshStandardMaterial({color:0x141e28,roughness:.6,metalness:.2}));
piso.rotation.x=-Math.PI/2;piso.receiveShadow=true;scene.add(piso);
// materiales
const patina=new THREE.MeshStandardMaterial({color:0x53b898,metalness:.35,roughness:.5,flatShading:true});
const patinaO=new THREE.MeshStandardMaterial({color:0x479e82,metalness:.35,roughness:.55,flatShading:true});
const piedra=new THREE.MeshStandardMaterial({color:0x9aa3ab,metalness:.05,roughness:.9,flatShading:true});
const piedraO=new THREE.MeshStandardMaterial({color:0x7e8891,metalness:.05,roughness:.9,flatShading:true});
const oro=new THREE.MeshStandardMaterial({color:0xd9a441,metalness:.9,roughness:.3,flatShading:true});
const llama=new THREE.MeshStandardMaterial({color:0xffb020,emissive:0xff7700,emissiveIntensity:2.2,roughness:.4,flatShading:true});
const g=new THREE.Group();scene.add(g);
function m(geo,mat,x=0,y=0,z=0){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
// pedestal escalonado
m(new THREE.BoxGeometry(3.4,.7,3.4),piedraO,0,.35,0);
m(new THREE.BoxGeometry(2.7,1.3,2.7),piedra,0,1.35,0);
m(new THREE.BoxGeometry(2,.9,2),piedraO,0,2.45,0);
m(new THREE.CylinderGeometry(1.15,1.3,.35,8),piedra,0,3.05,0);
// tunica: cono escalonado low-poly
m(new THREE.CylinderGeometry(.72,1.02,1.5,7),patinaO,0,3.95,0);
m(new THREE.CylinderGeometry(.55,.72,1.3,7),patina,0,5.3,0);
// pliegues de la tunica
for(let i=0;i<7;i++){const a=i/7*Math.PI*2+.3;const p=m(new THREE.BoxGeometry(.12,2.1,.22),patinaO,Math.cos(a)*.82,4.3,Math.sin(a)*.82);p.rotation.y=-a;p.rotation.z=Math.cos(a)*.08}
// torso y hombros
m(new THREE.CylinderGeometry(.5,.56,.7,7),patina,0,6.15,0);
m(new THREE.SphereGeometry(.5,7,6),patina,.0,6.4,0).scale.set(1.15,.6,.8);
// cabeza + diadema
m(new THREE.IcosahedronGeometry(.34,0),patina,0,6.95,0);
m(new THREE.CylinderGeometry(.37,.34,.2,9),patinaO,0,7.12,0);
// picos de la corona (7) en abanico radial
for(let i=0;i<7;i++){const a=(i/6-.5)*Math.PI*.95;const px=Math.sin(a)*.42,pz=Math.cos(a)*.30-.12;const s=m(new THREE.ConeGeometry(.085,.6,5),patina,px,7.48,pz);s.rotation.set(-.35*Math.cos(a),0,-Math.sin(a)*.9)}
// brazo derecho alzado -> antorcha
brazo(new THREE.Vector3(.4,6.3,0),new THREE.Vector3(1.05,7.6,.1),.14);
m(new THREE.CylinderGeometry(.09,.12,.7,7),oro,1.05,8.05,.1);
m(new THREE.CylinderGeometry(.26,.12,.3,7),oro,1.05,8.5,.1);
m(new THREE.ConeGeometry(.2,.55,7),llama,1.05,8.95,.1);
const luz=new THREE.PointLight(0xff9a2a,12,9);luz.position.set(1.05,9,.1);scene.add(luz);
function brazo(a,b,r){const d=new THREE.Vector3().subVectors(b,a);const l=d.length();const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r*.85,l,7),patina);o.position.copy(a).addScaledVector(d,.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());o.castShadow=true;g.add(o);return o}
// brazo izquierdo + tabula
brazo(new THREE.Vector3(-.42,6.25,0),new THREE.Vector3(-.95,5.4,.35),.14);
const tab=m(new THREE.BoxGeometry(.55,.7,.09),patinaO,-1.0,5.05,.5);tab.rotation.set(-.2,.5,-.12);
// antorcha: base en mano ya puesta. listo
function encuadrar(keep){const t=Math.tan(THREE.MathUtils.degToRad(camera.fov)/2);const dV=(vista.alto/2)/t,dH=(vista.ancho/2)/(t*camera.aspect);dist=Math.max(dV,dH)*vista.margen;if(keep){const v=camera.position.clone().sub(MIRA).setLength(dist);camera.position.copy(MIRA).add(v)}else camera.position.copy(vista.dir).multiplyScalar(dist).add(MIRA);controls.minDistance=dist*.4;controls.maxDistance=dist*2.2;controls.update()}
function ajustar(k){const w=innerWidth,h=innerHeight;renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(w,h,false);camera.aspect=w/h;vista=camera.aspect<1?V.vertical:V.ancha;camera.fov=vista.fov;camera.updateProjectionMatrix();encuadrar(k===undefined?true:k)}
addEventListener('resize',()=>ajustar());addEventListener('orientationchange',()=>ajustar());
reset.addEventListener('click',()=>{vista=camera.aspect<1?V.vertical:V.ancha;camera.position.copy(vista.dir).multiplyScalar(dist).add(MIRA);controls.target.copy(MIRA);controls.update()});
ajustar(false);
let first=true;
(function loop(){requestAnimationFrame(loop);controls.update();renderer.render(scene,camera);if(first){first=false;overlay.classList.add('fuera');setTimeout(()=>overlay.remove(),520)}})();
document.addEventListener('visibilitychange',()=>{if(!document.hidden)ajustar()});
