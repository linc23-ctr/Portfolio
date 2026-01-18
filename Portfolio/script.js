document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Theme Toggle Logic ---
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const html = document.documentElement;

    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'light' || (!savedTheme && !systemDark)) {
        html.setAttribute('data-theme', 'light');
        themeIcon.classList.replace('ph-moon', 'ph-sun');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        if (newTheme === 'light') {
            themeIcon.classList.replace('ph-moon', 'ph-sun');
        } else {
            themeIcon.classList.replace('ph-sun', 'ph-moon');
        }
    });

    // --- 2. Navigation Logic ---
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinksMobile = document.getElementById('nav-links-mobile');
    const navLinksItems = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    hamburger.addEventListener('click', () => {
        navLinksMobile.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinksMobile.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    const sections = document.querySelectorAll('section, header');

    // Function to highlight the active link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // If we have scrolled past 1/3rd of the section
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinksItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // --- 3. Scroll Animation ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- 4. Particle Background (Theme Aware) ---
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas.getContext('2d');
    let particlesArray;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    });

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x; this.y = y;
            this.directionX = directionX; this.directionY = directionY;
            this.size = size; this.color = color;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            // Get current theme color
            const style = getComputedStyle(document.documentElement);
            ctx.fillStyle = style.getPropertyValue('--particle-color').trim();
            ctx.fill();
        }

        update() {
            if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
            if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;

            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < mouse.radius + this.size){
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) this.x += 2;
                if (mouse.x > this.x && this.x > this.size * 10) this.x -= 2;
                if (mouse.y < this.y && this.y < canvas.height - this.size * 10) this.y += 2;
                if (mouse.y > this.y && this.y > this.size * 10) this.y -= 2;
            }

            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function init() {
        particlesArray = [];
        let numberOfParticles = (canvas.height * canvas.width) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 1) - 0.5;
            let directionY = (Math.random() * 1) - 0.5;
            particlesArray.push(new Particle(x, y, directionX, directionY, size, '#6d28d9'));
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        for (let i = 0; i < particlesArray.length; i++) particlesArray[i].update();
        connect();
    }

    function connect() {
        let opacityValue = 1;
        const style = getComputedStyle(document.documentElement);
        const lineColor = style.getPropertyValue('--particle-line').trim();
        
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                               ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < (canvas.width/7) * (canvas.height/7)) {
                    opacityValue = 1 - (distance/20000);
                    // Use RGBA for lines to allow opacity
                    ctx.strokeStyle = lineColor.replace('1)', `${opacityValue})`);
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    init();
    animate();
});

// --- Toast Function (Must be global scope for HTML onclick) ---
function showToast() {
    const toast = document.getElementById("toast");
    toast.className = "show";
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
    document.getElementById('contactForm').reset();
}