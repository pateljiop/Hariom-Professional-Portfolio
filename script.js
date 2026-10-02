document.addEventListener("DOMContentLoaded", () => {

    // 1. Scroll Reveal Fade-in Observer
    const observerOptions = {
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll(".fade-in").forEach(section => {
        observer.observe(section);
    });

    // 2. Dynamic Typewriter Effect for Hero Section
    const words = [
        "Python Utilities",
        "Web Automation Scripts",
        "Data Analysis Tools",
        "AI Workflows & APIs"
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typewriterElement = document.getElementById('typewriter');

    function type() {
        if (!typewriterElement) return;

        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 40 : 80;

        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 2000; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    type();

    // 3. Active Nav-Link Highlighting on Scroll
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll("nav .nav-links a");

    window.addEventListener("scroll", () => {
        let currentSection = "";
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                currentSection = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSection}`) {
                link.classList.add("active");
            }
        });
    });
});

// 4. Share Link Copy Toast Notification
function copyPortfolioLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const toast = document.getElementById("toast");
        if (toast) {
            toast.classList.add("show");
            setTimeout(() => {
                toast.classList.remove("show");
            }, 3000);
        }
    }).catch(err => {
        console.error("Failed to copy link: ", err);
    });
}

/* ===== THREE.JS 3D BACKGROUND ===== */
(function(){
  if(!window.THREE||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const canvas=document.getElementById('scene'); if(!canvas)return;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  renderer.setSize(innerWidth,innerHeight);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,100);
  camera.position.z=7;
  const points=new THREE.BufferGeometry(), count=700, p=new Float32Array(count*3);
  for(let i=0;i<p.length;i+=3){p[i]=(Math.random()-.5)*18;p[i+1]=(Math.random()-.5)*11;p[i+2]=(Math.random()-.5)*10}
  points.setAttribute('position',new THREE.BufferAttribute(p,3));
  const stars=new THREE.Points(points,new THREE.PointsMaterial({color:0x38bdf8,size:.018,transparent:true,opacity:.48}));
  scene.add(stars);
  const group=new THREE.Group();
  const mat=new THREE.MeshBasicMaterial({color:0x38bdf8,wireframe:true,transparent:true,opacity:.13});
  [1.3,.8,.45].forEach((s,i)=>{const m=new THREE.Mesh(new THREE.IcosahedronGeometry(s,1),mat.clone());m.material.opacity=.12-i*.025;m.position.set(i*2-2,1.2-i*.7,-2-i*.4);group.add(m)});
  scene.add(group);
  const line=new THREE.Mesh(new THREE.TorusGeometry(2.5,.008,8,160),new THREE.MeshBasicMaterial({color:0x8b5cf6,transparent:true,opacity:.18}));
  line.rotation.x=1.05; scene.add(line);
  let tx=0,ty=0;
  addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*.35;ty=(e.clientY/innerHeight-.5)*.2});
  function animate(t){stars.rotation.y=t*.000018;stars.rotation.x=t*.000006;group.rotation.y=t*.00012;group.rotation.x=t*.00005;line.rotation.z=t*.00008;camera.position.x+=(tx-camera.position.x)*.012;camera.position.y+=(-ty-camera.position.y)*.012;renderer.render(scene,camera);requestAnimationFrame(animate)}
  animate(0);
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
})();
document.querySelectorAll('[data-tilt],.hero-banner-card,.card').forEach(el=>{
  el.addEventListener('pointermove',e=>{if(innerWidth<900)return;const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform='perspective(900px) rotateX('+(-y*3)+'deg) rotateY('+(x*4)+'deg) translateZ(5px)'});
  el.addEventListener('pointerleave',()=>el.style.transform='');
});

/* Workspace parallax: the 3D hero follows pointer movement without hijacking scroll. */
(function(){
 const root=document.querySelector('.hero-graphic-container');
 if(!root||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const targets=root.querySelectorAll('.hero-avatar-shell,.floating-screen,.hero-orb,.workspace-floor');
 root.addEventListener('pointermove',e=>{
   if(innerWidth<900)return;
   const r=root.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
   targets.forEach((el,i)=>{const d=(i+1)*1.8;el.style.transform='translate3d('+x*d+'px,'+y*d+'px,0) rotateY('+x*(i%2? -10:7)+'deg) rotateX('+(-y*5)+'deg)'});
 });
 root.addEventListener('pointerleave',()=>targets.forEach(el=>el.style.transform=''));
})();

document.querySelectorAll('.project-3d-card').forEach(card=>{card.addEventListener('pointermove',e=>{if(innerWidth<900)return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform='translateY('+(card.matches(':nth-child(even)')?35:0)+'px) rotateX('+(-y*4)+'deg) rotateY('+(x*6)+'deg)'});card.addEventListener('pointerleave',()=>card.style.transform=innerWidth>=901&&card.matches(':nth-child(even)')?'translateY(35px)':'' )});
/* ===== SCROLL JOURNEY HUD ===== */
(function(){
 const hud=document.getElementById('hud-section'),bar=document.getElementById('hud-progress'),orb=document.getElementById('cursor-orb');
 const sections=[...document.querySelectorAll('main section[id]')];
 const names={about:'HOME',code:'CODE',setup:'WORKSPACE',updates:'LIVE FEED',skills:'SKILLS',projects:'PROJECTS',contact:'CONTACT'};
 function update(){const max=document.documentElement.scrollHeight-innerHeight,p=max>0?scrollY/max:0;if(bar)bar.style.height=(p*100)+'%';let active=sections[0];sections.forEach(s=>{if(scrollY+innerHeight*.35>=s.offsetTop)active=s});if(hud)hud.textContent=names[active?.id]||active?.id?.toUpperCase()||'HOME'}
 addEventListener('scroll',update,{passive:true});update();
 if(orb&&innerWidth>768){let x=-100,y=-100,tx=x,ty=y;addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;orb.style.opacity='.7'});function move(){x+=(tx-x)*.12;y+=(ty-y)*.12;orb.style.left=x+'px';orb.style.top=y+'px';requestAnimationFrame(move)}move();addEventListener('pointerleave',()=>orb.style.opacity='0')}
})();

(function(){
  const launcher=document.getElementById('ai-launcher');
  const panel=document.getElementById('ai-panel');
  const close=document.getElementById('ai-close');
  const form=document.getElementById('ai-form');
  const input=document.getElementById('ai-input');
  const messages=document.getElementById('ai-messages');
  const companion=document.getElementById('ai-companion');
  const pandaStatus=document.getElementById('panda-status');
  const voiceButton=document.getElementById('ai-voice');
  if(!launcher||!panel||!form||!input||!messages)return;

  const history=[];
  let busy=false;
  let voiceEnabled=false;
  function speak(text){
    if(!voiceEnabled||!('speechSynthesis' in window))return;
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.rate=.98;
    utterance.pitch=1.02;
    utterance.volume=.9;
    window.speechSynthesis.speak(utterance);
  }

  function show(){
    panel.classList.add('open');
    panel.setAttribute('aria-hidden','false');
    input.focus();
  }
  function hide(){
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden','true');
  }
  function addMessage(text,type){
    const el=document.createElement('div');
    el.className='ai-msg '+type;
    el.textContent=text;
    messages.appendChild(el);
    messages.scrollTop=messages.scrollHeight;
    return el;
  }
  function setPanda(state){
    if(!companion)return;
    companion.classList.remove('thinking','responding');
    if(state)companion.classList.add(state);
    if(pandaStatus)pandaStatus.textContent=state==='thinking'?'THINKING':state==='responding'?'ONLINE':'READY';
  }
  function setBusy(state){
    busy=state;
    setPanda(state?'thinking':'ready');
    input.disabled=state;
    form.querySelector('button').disabled=state;
  }

  async function askHariomAI(question){
    const typing=addMessage('Hariom AI is thinking…','bot ai-thinking');
    try{
      const response=await fetch('/api/chat',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:question,history:history.slice(-10)})
      });
      const data=await response.json().catch(()=>({}));
      typing.remove();
      if(!response.ok)throw new Error(data.error||'AI unavailable');
      const answer=(data.reply||'').trim();
      if(!answer)throw new Error('Empty AI response');
      addMessage(answer,'bot');
      speak(answer);
      setPanda('responding');
      setTimeout(()=>setPanda('ready'),900);
      history.push({role:'user',text:question},{role:'model',text:answer});
      localStorage.setItem('hariom_ai_history',JSON.stringify(history.slice(-20)));
    }catch(error){
      typing.remove();
      addMessage('AI backend is not available right now. Try again in a moment, or ask about projects, skills, GitHub or contact details.','bot');
      console.warn('Hariom AI:',error);
    }finally{
      setBusy(false);
      input.focus();
    }
  }

  try{
    const saved=JSON.parse(localStorage.getItem('hariom_ai_history')||'[]');
    if(Array.isArray(saved))saved.slice(-10).forEach(item=>{
      if(item&&typeof item.text==='string'){
        history.push(item);
        addMessage(item.text,item.role==='user'?'user':'bot');
      }
    });
  }catch(_){}

  if(companion){companion.setAttribute('aria-hidden','false');}
  launcher.addEventListener('click',show);
  if(voiceButton){
    if(!('speechSynthesis' in window))voiceButton.disabled=true;
    voiceButton.addEventListener('click',()=>{
      voiceEnabled=!voiceEnabled;
      voiceButton.textContent=voiceEnabled?'🔊':'🔇';
      voiceButton.setAttribute('aria-label',voiceEnabled?'Disable voice replies':'Enable voice replies');
      if(!voiceEnabled&&'speechSynthesis' in window)window.speechSynthesis.cancel();
    });
  }
  close.addEventListener('click',hide);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
  window.addEventListener('beforeunload',()=>{if('speechSynthesis' in window)window.speechSynthesis.cancel()});

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(busy)return;
    const question=input.value.trim();
    if(!question)return;
    addMessage(question,'user');
    input.value='';
    setBusy(true);
    await askHariomAI(question);
  });

  document.querySelectorAll('.ai-suggestions button').forEach(button=>{
    button.addEventListener('click',()=>{
      if(busy)return;
      input.value=button.getAttribute('data-q')||'';
      form.requestSubmit();
    });
  });
})();
