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