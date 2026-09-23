// Sociup landing — motion and interactions.
// Content is fully readable without JS or GSAP; everything here is enhancement.

(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

    /* ---------- Header: solid on scroll + mobile menu ---------- */
    const header = document.querySelector('.header');
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const toggle = document.querySelector('.menu-toggle');
    const nav = document.getElementById('menu');
    const setMenu = (open) => {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    };
    toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    });

    /* ---------- Feed wall ---------- */
    const CLIENTS = [
        { h: '@padaria.lua', a: '#FFC168' },
        { h: '@clinica.sorriso', a: '#6FB6D6' },
        { h: '@studio.forma', a: '#A6AEE8' },
        { h: '@cafe.ponto', a: '#F47C48' },
        { h: '@academia.pulso', a: '#6FB6D6' },
        { h: '@livraria.margem', a: '#FFC168' },
        { h: '@petshop.bento', a: '#F47C48' },
        { h: '@imob.horizonte', a: '#A6AEE8' },
        { h: '@vinicola.serra', a: '#F47C48' },
        { h: '@moda.aurea', a: '#FFC168' },
        { h: '@oficina.torque', a: '#6FB6D6' },
        { h: '@doceria.nuvem', a: '#A6AEE8' },
    ];
    const CAPTIONS = [
        'Pão de fermentação natural em 5 passos',
        'Clareamento: o que ninguém te conta',
        'Casa de 42 m² que parece ter o dobro',
        'Novo blend chegou. Notas de caramelo e cacau',
        'Treino de 20 minutos para quem não tem tempo',
        'Os 7 livros mais pedidos de setembro',
        'Banho e tosa: como deixar seu pet tranquilo',
        'Apartamento com vista para o parque, 3 quartos',
        'Harmonização para o fim de semana',
        'Coleção primavera: peças que combinam entre si',
        'Revisão antes da viagem: checklist completo',
        'Bolo do dia: pistache com frutas vermelhas',
    ];
    const FORMATS = [
        { f: 'Carrossel', r: '4 / 5' },
        { f: 'Reel', r: '9 / 13' },
        { f: 'Post', r: '1 / 1' },
        { f: 'Story', r: '9 / 14' },
    ];
    const ARTS = [
        { bg: '#1B2C40', fg: '#F47C48', fg2: '#FFC168', x: '38%', y: '14%', s: '50%' },
        { bg: '#FFC168', fg: '#0A0718', fg2: '#F47C48', x: '46%', y: '30%', s: '12%' },
        { bg: '#6FB6D6', fg: '#F9F9F9', fg2: '#0A0718', x: '20%', y: '8%', s: '50%' },
        { bg: '#F47C48', fg: '#A6AEE8', fg2: '#F9F9F9', x: '50%', y: '40%', s: '8%' },
        { bg: '#12192B', fg: '#6FB6D6', fg2: '#F47C48', x: '30%', y: '26%', s: '50%' },
        { bg: '#A6AEE8', fg: '#FFC168', fg2: '#0A0718', x: '42%', y: '6%', s: '20%' },
    ];
    const STATES = [
        { cls: 'st-draft', label: 'Rascunho' },
        { cls: 'st-review', label: 'Em aprovação' },
        { cls: 'st-approved', label: 'Aprovado' },
        { cls: 'st-scheduled', label: 'Agendado 18:00' },
        { cls: 'st-published', label: 'Publicado' },
    ];

    const wall = document.getElementById('wall');
    const chips = [];

    const buildPost = (i) => {
        const c = CLIENTS[i % CLIENTS.length];
        const fmt = FORMATS[(i * 3 + 1) % FORMATS.length];
        const art = ARTS[(i * 5 + 2) % ARTS.length];
        const st = STATES[(i * 2 + 1) % STATES.length];

        const el = document.createElement('div');
        el.className = 'post';
        el.innerHTML = `
            <div class="post-head"><span class="post-avatar" style="--a:${c.a}"></span><span class="post-handle">${c.h}</span></div>
            <div class="post-art" style="--ratio:${fmt.r};--bg:${art.bg};--fg:${art.fg};--fg2:${art.fg2};--x:${art.x};--y:${art.y};--shape:${art.s}">
                <span class="post-format">${fmt.f}</span>
            </div>
            <p class="post-cap">${CAPTIONS[i % CAPTIONS.length]}</p>
            <i class="chip-s ${st.cls}" data-state="${STATES.indexOf(st)}">${st.label}</i>`;
        return el;
    };

    if (wall) {
        const cols = [...wall.querySelectorAll('.wall-col')];
        const perCol = 5;
        cols.forEach((col, ci) => {
            const track = document.createElement('div');
            track.className = 'wall-track';
            const posts = [];
            for (let k = 0; k < perCol; k++) posts.push(buildPost(ci * perCol + k + ci));
            // Two copies so the loop is seamless (the track moves by exactly 50%).
            [...posts, ...posts.map((p) => p.cloneNode(true))].forEach((p) => track.appendChild(p));
            col.appendChild(track);
        });
        chips.push(...wall.querySelectorAll('.chip-s'));

        // Posts advance through their lifecycle. Pause when offscreen or the tab is hidden.
        let visible = true;
        const reviewCount = document.getElementById('review-count');
        const updateReviewCount = () => {
            if (!reviewCount) return;
            const n = chips.filter((c) => c.dataset.state === '1').length / 2; // halved: each post exists twice
            reviewCount.textContent = String(Math.max(1, Math.round(n + 8)));
        };

        const advance = () => {
            if (!visible || document.hidden) return;
            const chip = chips[Math.floor(Math.random() * chips.length)];
            const next = (Number(chip.dataset.state) + 1) % STATES.length;
            // Update the post and its twin together so the seamless loop stays consistent.
            const post = chip.closest('.post');
            const idx = [...post.parentElement.children].indexOf(post);
            const half = post.parentElement.children.length / 2;
            const twin = post.parentElement.children[idx < half ? idx + half : idx - half];
            [chip, twin && twin.querySelector('.chip-s')].forEach((c) => {
                if (!c) return;
                c.className = `chip-s ${STATES[next].cls}`;
                c.dataset.state = String(next);
                c.textContent = STATES[next].label;
                if (!reduceMotion) {
                    void c.offsetWidth; // restart the pop animation
                    c.classList.add('is-flip');
                }
            });
            updateReviewCount();
        };

        if (!reduceMotion) {
            new IntersectionObserver(([entry]) => {
                visible = entry.isIntersecting;
                wall.classList.toggle('is-offscreen', !visible);
            }).observe(wall);
            setInterval(advance, 1400);
        }
    }

    /* ---------- Loop: active step drives the stage ---------- */
    const steps = [...document.querySelectorAll('.loop-step')];
    const panes = [...document.querySelectorAll('.pane')];
    const progress = document.getElementById('loop-progress');
    let current = 0;

    const typeText = (el) => {
        const full = el.dataset.text || '';
        if (reduceMotion) { el.textContent = full; return; }
        clearInterval(el._t);
        el.textContent = '';
        el.classList.add('is-typing');
        let i = 0;
        el._t = setInterval(() => {
            i += 1;
            el.textContent = full.slice(0, i);
            if (i >= full.length) { clearInterval(el._t); el.classList.remove('is-typing'); }
        }, 22);
    };

    const countUp = (el) => {
        const target = parseFloat(el.dataset.count);
        const decimals = Number(el.dataset.decimals || 0);
        const suffix = el.dataset.suffix || '';
        const fmt = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        if (reduceMotion) { el.textContent = fmt(target); return; }
        const start = performance.now();
        const dur = 1100;
        const tick = (now) => {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = fmt(target * eased);
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    const activate = (i) => {
        if (i === current && panes[i].classList.contains('is-active')) return;
        current = i;
        steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
        panes.forEach((p, k) => p.classList.toggle('is-active', k === i));
        if (progress) progress.style.setProperty('--progress', String((i + 1) / steps.length));
        const pane = panes[i];
        pane.querySelectorAll('.typed').forEach(typeText);
        pane.querySelectorAll('.metric').forEach(countUp);
    };

    if (steps.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) activate(Number(entry.target.dataset.step));
            });
        }, { rootMargin: '-45% 0px -45% 0px' });
        steps.forEach((s) => io.observe(s));
        if (progress) progress.style.setProperty('--progress', String(1 / steps.length));
    }

    /* ---------- Bento: pointer-follow glow + batch bars ---------- */
    document.querySelectorAll('[data-tile]').forEach((tile) => {
        tile.addEventListener('pointermove', (e) => {
            const r = tile.getBoundingClientRect();
            tile.style.setProperty('--mx', `${e.clientX - r.left}px`);
            tile.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
    });

    const batch = document.querySelector('.batch');
    if (batch) {
        new IntersectionObserver(([entry], obs) => {
            if (entry.isIntersecting) { batch.classList.add('is-in'); obs.disconnect(); }
        }, { threshold: 0.4 }).observe(batch);
    }

    /* ---------- Magnetic buttons ---------- */
    if (finePointer && !reduceMotion) {
        document.querySelectorAll('.magnetic').forEach((btn) => {
            btn.addEventListener('pointermove', (e) => {
                const r = btn.getBoundingClientRect();
                const x = (e.clientX - r.left - r.width / 2) * 0.22;
                const y = (e.clientY - r.top - r.height / 2) * 0.32;
                btn.style.transition = 'transform 120ms ease-out';
                btn.style.transform = `translate(${x}px, ${y}px)`;
            });
            btn.addEventListener('pointerleave', () => {
                btn.style.transition = 'transform 600ms cubic-bezier(0.22, 1.4, 0.36, 1)';
                btn.style.transform = '';
            });
        });
    }

    /* ---------- CTA form ---------- */
    const form = document.getElementById('cta-form');
    if (form) {
        const input = form.querySelector('#email');
        const msg = form.querySelector('#email-msg');
        const valid = () => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
        input.addEventListener('blur', () => {
            if (input.value && !valid()) {
                input.setAttribute('aria-invalid', 'true');
                msg.textContent = 'Confira o e-mail: falta algo como “@agencia.com.br”.';
            }
        });
        input.addEventListener('input', () => {
            if (input.getAttribute('aria-invalid') === 'true' && valid()) {
                input.removeAttribute('aria-invalid');
                msg.textContent = '';
            }
        });
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!valid()) {
                input.setAttribute('aria-invalid', 'true');
                msg.textContent = input.value ? 'Confira o e-mail: falta algo como “@agencia.com.br”.' : 'Digite seu e-mail de trabalho para criar a conta.';
                input.focus();
                return;
            }
            input.removeAttribute('aria-invalid');
            // TODO: connect to the real sign-up endpoint.
            msg.textContent = `Recebemos ${input.value.trim()}. O próximo passo chega no seu e-mail.`;
            form.reset();
        });
    }

    /* ---------- GSAP choreography ---------- */
    if (!hasGsap || reduceMotion) return;
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    // Split the headline into masked words, preserving <em>.
    const title = document.querySelector('[data-split]');
    const wrapWords = (node) => {
        [...node.childNodes].forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
                const frag = document.createDocumentFragment();
                child.textContent.split(/(\s+)/).forEach((part) => {
                    if (!part) return;
                    if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
                    const w = document.createElement('span');
                    w.className = 'w';
                    w.innerHTML = `<span class="wi">${part}</span>`;
                    frag.appendChild(w);
                });
                child.replaceWith(frag);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                // Keep "uma tela" together as a single masked unit.
                const w = document.createElement('span');
                w.className = 'w';
                const inner = document.createElement('span');
                inner.className = 'wi';
                child.replaceWith(w);
                inner.appendChild(child);
                w.appendChild(inner);
            }
        });
    };
    if (title) {
        title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
        wrapWords(title);
        [...title.children].forEach((c) => c.setAttribute('aria-hidden', 'true'));
    }
    const em = title && title.querySelector('em');

    const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
    intro
        .from('.hero-title .wi', { yPercent: 115, rotate: 4, duration: 1.1, stagger: 0.06 })
        .fromTo(em, { '--underline': 0 }, { '--underline': 1, duration: 0.9, ease: 'power3.inOut' }, '-=0.45')
        .from('[data-intro]', { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.35)
        .from('.wall-frame', { y: 60, rotate: 6, autoAlpha: 0, duration: 1.4 }, 0.2)
        .from('.wall-col', { yPercent: 12, autoAlpha: 0, duration: 1.2, stagger: 0.12 }, 0.45);

    // Wall drifts slightly slower than the page for depth.
    gsap.to('.wall-frame', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    // Section heads and the CTA rise in once.
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
            y: 40,
            autoAlpha: 0,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
    });

    // Bento tiles stagger in as a group.
    ScrollTrigger.batch('[data-tile]', {
        start: 'top 88%',
        once: true,
        onEnter: (batchEls) => gsap.from(batchEls, {
            y: 48,
            autoAlpha: 0,
            duration: 0.9,
            ease: 'expo.out',
            stagger: 0.08,
        }),
    });

    // Old routine gets crossed out as you read it.
    gsap.utils.toArray('.strike').forEach((el) => {
        gsap.fromTo(el, { '--strike': 0 }, {
            '--strike': 1,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 80%', end: 'top 55%', scrub: 0.6 },
        });
    });
    gsap.from('.swap-col--new li', {
        x: 24,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '.swap-col--new', start: 'top 75%', once: true },
    });
})();
