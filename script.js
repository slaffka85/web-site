// ===========================
// SMOOTH SCROLL & NAVIGATION
// ===========================

// Navigation scroll effect
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===========================
// ANIMATE ON SCROLL (AOS)
// ===========================

const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with data-aos attribute
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('[data-aos]');
    animatedElements.forEach(el => {
        observer.observe(el);

        // Add delay if specified
        const delay = el.getAttribute('data-aos-delay');
        if (delay) {
            el.style.transitionDelay = `${delay}ms`;
        }
    });
});

// ===========================
// PARALLAX EFFECTS
// ===========================

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');

    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// ===========================
// ACTIVE NAVIGATION LINK
// ===========================

const sections = document.querySelectorAll('section[id]');

function highlightNavigation() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 150;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// ===========================
// HERO TYPING EFFECT (Optional)
// ===========================

function initTypingEffect() {
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (!heroSubtitle) return;

    const text = heroSubtitle.textContent;
    heroSubtitle.textContent = '';
    heroSubtitle.style.opacity = '1';

    let index = 0;

    function type() {
        if (index < text.length) {
            heroSubtitle.textContent += text.charAt(index);
            index++;
            setTimeout(type, 100);
        }
    }

    // Start typing after a short delay
    setTimeout(type, 500);
}

// Uncomment to enable typing effect
// window.addEventListener('load', initTypingEffect);

// ===========================
// CURSOR TRAIL EFFECT (Premium)
// ===========================

class CursorTrail {
    constructor() {
        this.dots = [];
        this.mouse = { x: 0, y: 0 };
        this.init();
    }

    init() {
        // Create cursor dots
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'cursor-dot';
            dot.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: rgba(255, 255, 255, ${0.3 - i * 0.1});
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transition: opacity 0.3s;
                opacity: 0;
            `;
            document.body.appendChild(dot);
            this.dots.push({
                element: dot,
                x: 0,
                y: 0
            });
        }

        // Track mouse movement
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.dots.forEach(dot => dot.element.style.opacity = '1');
        });

        document.addEventListener('mouseleave', () => {
            this.dots.forEach(dot => dot.element.style.opacity = '0');
        });

        // Animate dots
        this.animate();
    }

    animate() {
        let x = this.mouse.x;
        let y = this.mouse.y;

        this.dots.forEach((dot, index) => {
            dot.x += (x - dot.x) * (0.3 - index * 0.05);
            dot.y += (y - dot.y) * (0.3 - index * 0.05);

            dot.element.style.left = dot.x + 'px';
            dot.element.style.top = dot.y + 'px';

            x = dot.x;
            y = dot.y;
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize cursor trail on desktop only
if (window.innerWidth > 1024) {
    new CursorTrail();
}

// ===========================
// SMOOTH REVEAL ON LOAD
// ===========================

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// ===========================
// UTILITY: Debounce Function
// ===========================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance optimization for scroll events
const debouncedScroll = debounce(() => {
    highlightNavigation();
}, 10);

window.addEventListener('scroll', debouncedScroll);
