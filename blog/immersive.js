(() => {
  const canvas=document.getElementById('hp-scene');
  if(!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const reduced=window.matchMedia('(max-width:700px)').matches;
  const script=document.createElement('script');
  script.src='https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.min.js';
  script.onload=()=>{
    if(!window.THREE)return;
    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,reduced?1:1.35));
    renderer.setSize(innerWidth,innerHeight);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,100);
    camera.position.z=7;
    const pts=new THREE.BufferGeometry(),count=reduced?260:520,arr=new Float32Array(count*3);
    for(let i=0;i<arr.length;i+=3){arr[i]=(Math.random()-.5)*18;arr[i+1]=(Math.random()-.5)*11;arr[i+2]=(Math.random()-.5)*10}
    pts.setAttribute('position',new THREE.BufferAttribute(arr,3));
    scene.add(new THREE.Points(pts,new THREE.PointsMaterial({color:0x38bdf8,size:.018,transparent:true,opacity:.42})));
    const group=new THREE.Group();
    [1.25,.72,.42].forEach((s,i)=>{const m=new THREE.Mesh(new THREE.IcosahedronGeometry(s,1),new THREE.MeshBasicMaterial({color:i%2?0x8b5cf6:0x38bdf8,wireframe:true,transparent:true,opacity:.10}));m.position.set(i*2-2,1-i*.65,-2-i*.5);group.add(m)});
    scene.add(group);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.4,.007,8,150),new THREE.MeshBasicMaterial({color:0x8b5cf6,transparent:true,opacity:.16}));ring.rotation.x=1.05;scene.add(ring);
    let tx=0,ty=0;addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*.28;ty=(e.clientY/innerHeight-.5)*.16},{passive:true});
    const animate=t=>{pts.rotation.y=t*.000014;group.rotation.y=t*.0001;ring.rotation.z=t*.00007;camera.position.x+=(tx-camera.position.x)*.01;camera.position.y+=(-ty-camera.position.y)*.01;renderer.render(scene,camera);requestAnimationFrame(animate)};animate(0);
    addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)},{passive:true});
  };
  document.head.appendChild(script);
})();
document.querySelectorAll('.hp-panel').forEach(el=>{el.addEventListener('pointermove',e=>{if(innerWidth<900)return;const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform='perspective(900px) rotateX('+(-y*2)+'deg) rotateY('+(x*3)+'deg) translateY(-2px)'});el.addEventListener('pointerleave',()=>el.style.transform='')});
