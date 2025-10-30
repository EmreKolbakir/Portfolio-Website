document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.body.classList.add('js-animate');

    initRevealAnimations(prefersReducedMotion);
    initGlitchHeadings(prefersReducedMotion);
    initTimelineSpark(prefersReducedMotion);
    initTypewriter(prefersReducedMotion);

    if (!prefersReducedMotion) {
        initHeroParallax();
        initParticleField();
        initProjectTilt();
    }

    initProjectModal();
});

function initRevealAnimations(prefersReducedMotion) {
    const animateTargets = document.querySelectorAll('[data-animate]');
    if (!animateTargets.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        animateTargets.forEach(element => element.classList.add('animate-in'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -12% 0px' });

    animateTargets.forEach(element => observer.observe(element));
}

function initHeroParallax() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: pointer.x, y: pointer.y };
    let scrollInfluence = 0;

    const updateScrollInfluence = () => {
        const rect = heroSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight || 1;
        const visibility = 1 - Math.min(1, Math.max(0, rect.top / viewportHeight));
        scrollInfluence = (visibility - 0.5) * 1.2;
    };

    window.addEventListener('mousemove', (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
    }, { passive: true });

    window.addEventListener('scroll', updateScrollInfluence, { passive: true });
    window.addEventListener('resize', updateScrollInfluence);
    updateScrollInfluence();

    const animate = () => {
        current.x += (pointer.x - current.x) * 0.08;
        current.y += (pointer.y - current.y) * 0.08;

        const width = window.innerWidth || 1;
        const height = window.innerHeight || 1;
        const offsetX = current.x / width - 0.5;
        const offsetY = current.y / height - 0.5;

        const time = performance.now() * 0.00018;

        const orb1x = offsetX * 45 + Math.sin(time) * 25;
        const orb1y = scrollInfluence * 120 + Math.cos(time * 1.8) * 30 + offsetY * 35;
        const orb2x = offsetX * -35 + Math.cos(time * 1.4) * 22;
        const orb2y = scrollInfluence * -110 + Math.sin(time * 1.6) * 28 + offsetY * -30;

        heroSection.style.setProperty('--hero-orb1-x', `${orb1x}px`);
        heroSection.style.setProperty('--hero-orb1-y', `${orb1y}px`);
        heroSection.style.setProperty('--hero-orb2-x', `${orb2x}px`);
        heroSection.style.setProperty('--hero-orb2-y', `${orb2y}px`);

        requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
}

function initParticleField() {
    if (document.getElementById('background-particles')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'background-particles';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false, radius: 140 };
    let particles = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    const MAX_PARTICLES = 160;
    const CONNECTION_DISTANCE = 140;
    const BASE_VELOCITY = 0.12;

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = window.devicePixelRatio || 1;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        const desiredCount = Math.min(MAX_PARTICLES, Math.round((width * height) / 12000));
        if (particles.length > desiredCount) {
            particles = particles.slice(0, desiredCount);
        } else {
            while (particles.length < desiredCount) {
                particles.push(createParticle());
            }
        }
    };

    const createParticle = () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * BASE_VELOCITY * (Math.random() * 3 + 1),
        vy: (Math.random() - 0.5) * BASE_VELOCITY * (Math.random() * 3 + 1),
        radius: Math.random() * 1.8 + 0.6
    });

    const updateParticles = () => {
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            if (pointer.active) {
                const dx = p.x - pointer.x;
                const dy = p.y - pointer.y;
                const dist = Math.hypot(dx, dy) || 1;

                if (dist < pointer.radius) {
                    const force = (pointer.radius - dist) / pointer.radius;
                    p.vx += (dx / dist) * force * 0.45;
                    p.vy += (dy / dist) * force * 0.45;
                }
            }

            p.vx *= 0.99;
            p.vy *= 0.99;
        });
    };

    const drawParticles = () => {
        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(0, 255, 255, 0.35)';
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.hypot(dx, dy);

                if (dist < CONNECTION_DISTANCE) {
                    const alpha = 0.15 * (1 - dist / CONNECTION_DISTANCE);
                    ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
    };

    const tick = () => {
        updateParticles();
        drawParticles();
        requestAnimationFrame(tick);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
    }, { passive: true });
    window.addEventListener('mouseleave', () => {
        pointer.active = false;
    });

    resize();
    tick();
}

function initProjectTilt() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const cards = document.querySelectorAll('.projects-grid .project-card');
    if (!cards.length) return;

    const strength = 12;

    cards.forEach(card => {
        card.addEventListener('pointerenter', (event) => {
            if (event.pointerType !== 'mouse') return;
            card.classList.add('tilt-active');
        });

        card.addEventListener('pointermove', (event) => {
            if (event.pointerType !== 'mouse') return;

            const rect = card.getBoundingClientRect();
            const relX = (event.clientX - rect.left) / rect.width;
            const relY = (event.clientY - rect.top) / rect.height;

            const tiltX = (0.5 - relY) * strength;
            const tiltY = (relX - 0.5) * strength * 1.3;

            card.style.transform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
        });

        card.addEventListener('pointerleave', () => {
            card.classList.remove('tilt-active');
            card.style.transform = '';
        });

    });
}

function initTimelineSpark(prefersReducedMotion) {
    const timelineItems = document.querySelectorAll('.experience-item');
    if (!timelineItems.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        timelineItems.forEach(item => item.classList.add('sparked'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('sparked');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4, rootMargin: '0px 0px -10% 0px' });

    timelineItems.forEach(item => observer.observe(item));
}

function initTypewriter(prefersReducedMotion) {
    const textEl = document.querySelector('.typewriter-text');
    if (!textEl) return;

    let phrases = [];
    const raw = textEl.dataset.phrases;
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                phrases = parsed.filter(Boolean);
            }
        } catch (err) {
            console.warn('Typewriter phrases JSON parse failed:', err);
        }
    }

    if (!phrases.length) {
        phrases = [textEl.textContent.trim()].filter(Boolean);
    }

    const wrapper = textEl.closest('.typewriter');
    if (prefersReducedMotion) {
        textEl.textContent = phrases[0] || '';
        if (wrapper) wrapper.classList.add('typewriter-static');
        return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let typingForward = true;
    const typeSpeed = () => 70 + Math.random() * 40;
    const deleteSpeed = () => 40 + Math.random() * 30;
    const holdDuration = 2000;

    const setText = (value) => {
        textEl.textContent = value;
    };

    const step = () => {
        const currentPhrase = phrases[phraseIndex] || '';

        if (typingForward) {
            charIndex += 1;
            setText(currentPhrase.slice(0, charIndex));

            if (charIndex === currentPhrase.length) {
                typingForward = false;
                setTimeout(step, holdDuration);
                return;
            }

            setTimeout(step, typeSpeed());
            return;
        }

        charIndex -= 1;
        setText(currentPhrase.slice(0, Math.max(charIndex, 0)));

        if (charIndex <= 0) {
            typingForward = true;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(step, 400);
            return;
        }

        setTimeout(step, deleteSpeed());
    };

    setText('');
    setTimeout(step, 500);
}

function initGlitchHeadings(prefersReducedMotion) {
    const headingNodes = [
        ...document.querySelectorAll('.section-title'),
        ...document.querySelectorAll('.project-header h1')
    ];

    if (!headingNodes.length) return;

    const glitchElements = headingNodes.map(node => {
        let span = node.querySelector('.glitch-text');
        if (!span) {
            const text = node.textContent.trim();
            span = document.createElement('span');
            span.className = 'glitch-text';
            span.dataset.text = text;
            span.textContent = text;
            node.textContent = '';
            node.appendChild(span);
        }
        return span;
    });

    if (prefersReducedMotion) return;

    glitchElements.forEach(element => {
        const runGlitch = () => {
            element.classList.add('glitch-active');
            setTimeout(() => element.classList.remove('glitch-active'), 500);
        };
        const schedule = () => {
            const delay = 4000 + Math.random() * 3500;
            setTimeout(() => {
                runGlitch();
                schedule();
            }, delay);
        };
        schedule();
    });
}

function initProjectModal() {
    const modal = document.getElementById('project-modal');
    const modalContentBody = document.getElementById('modal-body-content');
    const closeModalButton = modal ? modal.querySelector('.modal-close') : null;

    const projectCards = document.querySelectorAll('.project-card[data-project-id]');
    if (!modal || !modalContentBody || !closeModalButton || !projectCards.length) return;

    const projectData = {
        'tone-polish': {
            title: '📝 TonePolish',
            color: 'var(--neon-yellow)',
            content: `
                <h3>✨ Emotion- & Tone-Aware Text Rewriter for Professional English Communication</h3>
                <p>TonePolish is an NLP-powered web application that helps users rewrite any sentence into a more polished, clear, and professional version — tailored to the tone they choose.</p>
                
                <h3>🧠 Motivation</h3>
                <p>Writing professionally can be tricky, especially for non-native speakers. TonePolish solves that by offering real-time tone-aware rewriting, powered by open-source LLMs, for LinkedIn posts, job applications, and emails.</p>
                
                <h3>🚀 What It Does</h3>
                <ul>
                    <li>Analyzes the emotional tone of your original sentence (positive, negative, neutral).</li>
                    <li>Rewrites the input sentence in your desired tone: Friendly, Confident, Humble, or Formal.</li>
                    <li>Outputs the original vs. rewritten text side-by-side for comparison.</li>
                </ul>

                <h3>🧱 Tech Stack</h3>
                <ul>
                    <li><strong>Frontend (UI):</strong> Streamlit</li>
                    <li><strong>Backend Logic:</strong> Pure Python</li>
                    <li><strong>Emotion Detection:</strong> HuggingFace Transformers (distilbert-base-uncased)</li>
                    <li><strong>Tone Rewriting:</strong> HuggingFace Transformers (Nous Hermes 2 - Mistral 7B)</li>
                </ul>
            `
        },
        'object-detection': {
            title: 'Real-Time Object Detection',
            color: 'var(--neon-yellow)',
            content: `<h3>Coming Soon</h3><p>Detailed information for this project will be added soon.</p>`
        },
        'rover-simulation': {
            title: 'Autonomous Rover Simulation',
            color: 'var(--neon-yellow)',
            content: `<h3>Coming Soon</h3><p>Detailed information for this project will be added soon.</p>`
        },
        'face-recognition': {
            title: 'Face Recognition System',
            color: 'var(--neon-yellow)',
            content: `<h3>Coming Soon</h3><p>Detailed information for this project will be added soon.</p>`
        }
    };

    const openModal = (projectId) => {
        const data = projectData[projectId];
        if (!data) return;

        modalContentBody.innerHTML = data.content;
        const heading = modalContentBody.querySelector('h2, h3');
        if (heading) {
            heading.style.color = data.color;
        }
        modal.classList.add('active');
    };

    const closeModal = () => {
        modal.classList.remove('active');
    };

    projectCards.forEach(card => {
        card.addEventListener('click', (event) => {
            event.preventDefault();
            const projectId = card.getAttribute('data-project-id');
            openModal(projectId);
        });
    });

    closeModalButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
}
