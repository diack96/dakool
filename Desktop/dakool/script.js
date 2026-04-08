/* ============================================
   DAKOOL - JavaScript Principal
   ============================================ */

'use strict';

/* ---- Navbar Scroll Effect ---- */
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* ---- Mobile Menu ---- */
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ---- Active Nav Link ---- */
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-nav a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
setActiveNavLink();

/* ---- Smooth Scroll for Anchor Links ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ---- Intersection Observer: Scroll Reveal ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

/* ---- Counter Animation ---- */
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2000;
  const stepTime = 16;
  const steps = duration / stepTime;
  const increment = target / steps;
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current).toLocaleString('fr-FR') + suffix;
  }, stepTime);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => {
  counterObserver.observe(el);
});

/* ---- Typewriter Effect for Hero ---- */
function typeWriter(element, text, speed = 60) {
  if (!element) return;
  element.textContent = '';
  let i = 0;
  const timer = setInterval(() => {
    element.textContent += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(timer);
  }, speed);
}

const typewriterEl = document.querySelector('.hero-typewriter');
if (typewriterEl) {
  const text = typewriterEl.getAttribute('data-text') || typewriterEl.textContent;
  setTimeout(() => typeWriter(typewriterEl, text, 55), 800);
}

/* ---- Parallax Effect for Hero ---- */
const heroBg = document.querySelector('.hero-bg');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
  }, { passive: true });
}

/* ---- Animated Particles in Hero ---- */
function createParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;

  const colors = ['#00853F', '#FDEF42', '#E31E24', '#fff'];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 6 + 2;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 12 + 8}s;
      animation-delay: ${Math.random() * 6}s;
    `;
    container.appendChild(p);
  }
}
createParticles();

/* ============================================
   SHOPPING CART
   ============================================ */
let cart = JSON.parse(localStorage.getItem('dakool_cart') || '[]');

function saveCart() {
  localStorage.setItem('dakool_cart', JSON.stringify(cart));
}

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total === 0 ? 'none' : 'flex';
  });
}

function formatPrice(price) {
  return price.toLocaleString('fr-FR') + ' FCFA';
}

function addToCart(id, name, price, category) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, category, qty: 1 });
  }
  saveCart();
  updateCartCount();
  renderCart();
  showToast(`${name} ajouté au panier`);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartCount();
  renderCart();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
  } else {
    saveCart();
    updateCartCount();
    renderCart();
  }
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart() {
  const cartItems = document.querySelector('.cart-items');
  const cartTotal = document.querySelector('.cart-total strong');
  const cartEmpty = document.querySelector('.cart-empty');
  if (!cartItems) return;

  cartItems.innerHTML = '';

  if (cart.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'cart-empty';
    empty.innerHTML = `
      <i class="fa-solid fa-cart-shopping"></i>
      <p>Votre panier est vide</p>
      <a href="produits.html" class="btn btn-sm btn-primary">Voir les produits</a>
    `;
    cartItems.appendChild(empty);
  } else {
    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div class="cart-item-img">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="16" fill="rgba(0,133,63,0.15)" stroke="rgba(0,133,63,0.3)" stroke-width="1.5"/>
            <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="#00853F">⚽</text>
          </svg>
        </div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateQty('${item.id}', -1)">−</button>
            <span style="font-family:'Inter',sans-serif;font-size:14px;">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;
      cartItems.appendChild(div);
    });
  }

  if (cartTotal) {
    cartTotal.textContent = formatPrice(getCartTotal());
  }
}

/* ---- Cart Sidebar Toggle ---- */
const cartBtn = document.querySelector('.cart-btn');
const cartSidebar = document.querySelector('.cart-sidebar');
const cartOverlay = document.querySelector('.cart-overlay');
const cartClose = document.querySelector('.cart-close');

function openCart() {
  if (cartSidebar) cartSidebar.classList.add('open');
  if (cartOverlay) cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCart();
}

function closeCart() {
  if (cartSidebar) cartSidebar.classList.remove('open');
  if (cartOverlay) cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (cartBtn) cartBtn.addEventListener('click', openCart);
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

/* ---- Product Filter ---- */
function initProductFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card[data-category]');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = '';
          card.style.animation = 'none';
          requestAnimationFrame(() => {
            card.style.animation = '';
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}
initProductFilter();

/* ---- Toast Notification ---- */
let toastTimer;
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ---- Add to Cart Buttons Event Delegation ---- */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-to-cart-btn');
  if (btn) {
    const card = btn.closest('.product-card');
    if (card) {
      const id = card.getAttribute('data-id');
      const name = card.querySelector('.product-name')?.textContent || 'Produit';
      const priceStr = card.querySelector('.product-price')?.textContent || '0';
      const price = parseInt(priceStr.replace(/[^\d]/g, ''), 10);
      const category = card.getAttribute('data-category') || 'Produit';
      addToCart(id, name, price, category);
    }
  }
});

/* ---- Contact Form ---- */
const contactForm = document.querySelector('.contact-form-el');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Envoi en cours...';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Message envoyé !';
      btn.style.background = 'var(--primary)';
      contactForm.reset();
      showToast('Votre message a bien été envoyé !');
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.style.background = '';
      }, 3000);
    }, 1500);
  });
}

/* ---- Initialize on Load ---- */
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderCart();

  // Re-run observer for dynamically created elements
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    if (!el.classList.contains('visible')) {
      revealObserver.observe(el);
    }
  });
});

/* ---- Newsletter Form ---- */
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input').value;
    if (email) {
      showToast('Merci ! Vous êtes maintenant abonné à DAKOOL');
      newsletterForm.reset();
    }
  });
}
