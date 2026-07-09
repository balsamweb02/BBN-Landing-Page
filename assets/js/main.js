//age load fade-in 
window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    document.body.classList.remove('pre-load');
    document.body.classList.add('is-loaded');
  });
});
// Safety net in case 'load' fires before this script attaches a listener
if (document.readyState === 'complete') {
  document.body.classList.remove('pre-load');
  document.body.classList.add('is-loaded');
}

const navbar = document.getElementById('navbar');
const setNavbarState = () => {
  navbar.classList.toggle('scrolled', window.scrollY > 8);
};
setNavbarState();
window.addEventListener('scroll', setNavbarState, { passive: true });

// Brand title: swap to short "Balsam BBN" only when the full title
// doesn't actually fit in the available navbar space — not at a fixed
// screen-size breakpoint. Re-checked on load and on every resize.
const brandTextWrap = document.querySelector('.nav-brand-text');
const brandDesktopTitle = brandTextWrap ? brandTextWrap.querySelector('.desktop-title') : null;

function updateBrandTitle() {
  if (!brandTextWrap || !brandDesktopTitle) return;
  // Show the full title first so we get its true, un-clipped width
  brandTextWrap.classList.remove('short-title');
  // .desktop-title itself has overflow:hidden + white-space:nowrap, so
  // comparing its own scrollWidth vs clientWidth (not the wrapper's)
  // correctly tells us whether the text is being visually clipped.
  const isOverflowing = brandDesktopTitle.scrollWidth > brandDesktopTitle.clientWidth + 1;
  brandTextWrap.classList.toggle('short-title', isOverflowing);
}

updateBrandTitle();
window.addEventListener('resize', updateBrandTitle, { passive: true });
window.addEventListener('load', updateBrandTitle);

//Cursor glow follows the pointer across the page
const cursorGlow = document.getElementById('cursor-glow');
const supportsFineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (cursorGlow && supportsFineHover) {
  let glowActive = false;
  window.addEventListener('mousemove', (e) => {
    cursorGlow.style.setProperty('--cx', `${e.clientX}px`);
    cursorGlow.style.setProperty('--cy', `${e.clientY}px`);
    if (!glowActive) {
      cursorGlow.classList.add('active');
      glowActive = true;
    }
  }, { passive: true });
  window.addEventListener('mouseleave', () => {
    cursorGlow.classList.remove('active');
    glowActive = false;
  });
}

//Scroll progress bar 
const progressBar = document.getElementById('scroll-progress');
function updateScrollProgress(){
  if (!progressBar) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${pct}%`;
}
updateScrollProgress();

// Hero parallax 
const hero = document.querySelector('.hero');
const heroGlow = document.querySelector('.hero-glow');

//Hero spotlight follows the pointer within the hero only
const heroSpotlight = document.getElementById('hero-spotlight');
if (heroSpotlight && hero && supportsFineHover) {
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    heroSpotlight.style.setProperty('--sx', `${x}%`);
    heroSpotlight.style.setProperty('--sy', `${y}%`);
  }, { passive: true });
}

function onScrollParallax(){
  const y = window.scrollY;
  if (hero) {
    const offset = Math.min(60, y * 0.12);
    hero.style.setProperty('--hero-offset', `${offset}px`);
  }
  if (heroGlow) {
    const glowOffset = Math.min(120, y * 0.08);
    heroGlow.style.transform = `translate(${glowOffset}px, ${-glowOffset / 2}px) scale(1.02)`;
  }
}
window.addEventListener('scroll', () => {
  window.requestAnimationFrame(() => {
    onScrollParallax();
    updateScrollProgress();
  });
}, { passive: true });

//Ripple effect on button clicks 
document.querySelectorAll('.btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

const notifyBtn = document.getElementById('notify-btn');
if (notifyBtn) {
  notifyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert("Thanks for your interest! Registration for Balsam Business Network is opening soon — stay tuned.");
  });
}

//Mobile nav toggle 
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
const navBackdrop = document.getElementById('nav-backdrop');

function closeMobileNav() {
  navLinks.classList.remove('open');
  navToggle.classList.remove('active');
  navToggle.setAttribute('aria-expanded', 'false');
  if (navBackdrop) navBackdrop.classList.remove('active');
  document.body.classList.remove('nav-open');
}

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    if (navBackdrop) navBackdrop.classList.toggle('active', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });

  if (navBackdrop) {
    navBackdrop.addEventListener('click', closeMobileNav);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMobileNav();
    }
  });

  // Close the mobile menu automatically if the viewport grows back to desktop size
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && navLinks.classList.contains('open')) {
      closeMobileNav();
    }
  });
}

//Smooth scroll with fixed-navbar offset 
const navHeight = () => navbar.getBoundingClientRect().height;

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight() - 12;
    window.scrollTo({ top, behavior: 'smooth' });
    try {
      history.replaceState(null, '', targetId);
    } catch (err) { /* ignore on older browsers */ }
    setTimeout(() => {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }, 600);
  });
});

//Scroll-triggered reveal animations
const revealEls = document.querySelectorAll('[data-reveal]');

revealEls.forEach((el) => {
  const delay = el.getAttribute('data-reveal-delay');
  if (delay) el.style.setProperty('--reveal-delay', delay);
});

if ('IntersectionObserver' in window && revealEls.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in-view'));
}

//Highlight nav links based on the visible section
const sections = document.querySelectorAll('section[id]');
if ('IntersectionObserver' in window && sections.length) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.id;
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        document.querySelectorAll('.nav-links a').forEach((a) => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { threshold: 0.55 });
  sections.forEach((s) => navObserver.observe(s));
}

// Magnetic buttons: a subtle, professional pull toward the cursor
const magneticEls = document.querySelectorAll('.magnetic');
const supportsHover = supportsFineHover;

if (supportsHover) {
  magneticEls.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.15}px, ${y * 0.35 - 2}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

// Back to top button
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  const toggleBackToTop = () => {
    backToTop.classList.toggle('visible', window.scrollY > 480);
  };
  toggleBackToTop();
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Gentle tilt on "who can join" cards
const tiltEls = document.querySelectorAll('.join-card');
if (supportsHover) {
  tiltEls.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `translateY(-8px) rotateX(${py * -4}deg) rotateY(${px * 4}deg)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}