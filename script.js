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
