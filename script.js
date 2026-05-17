/* ========== ZENITH ORIGINAL — Script ========== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Loading Screen ---------- */
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingBar = document.getElementById('loadingBar');
  let loadProgress = 0;
  const loadInterval = setInterval(() => {
    loadProgress += Math.random() * 15 + 5;
    if (loadProgress >= 100) {
      loadProgress = 100;
      loadingBar.style.width = '100%';
      clearInterval(loadInterval);
      setTimeout(() => { loadingScreen.classList.add('hidden'); }, 600);
    } else {
      loadingBar.style.width = loadProgress + '%';
    }
  }, 200);

  /* ---------- Hero Slideshow ---------- */
  const heroSlides = document.querySelectorAll('.hero-slide');
  let currentSlide = 0;
  if (heroSlides.length > 1) {
    setInterval(() => {
      heroSlides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % heroSlides.length;
      heroSlides[currentSlide].classList.add('active');
    }, 5000);
  }

  /* ---------- Custom Cursor ---------- */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  if (cursorDot && cursorRing && window.innerWidth > 768) {
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.left = mouseX - 4 + 'px';
      cursorDot.style.top = mouseY - 4 + 'px';
    });
    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX - 20 + 'px';
      cursorRing.style.top = ringY - 20 + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();
    const hoverTargets = document.querySelectorAll('a, button, .product-card, .store-card, .insta-item');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
    });
  }

  /* ---------- Navbar Scroll ---------- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  });

  /* ---------- Hamburger Menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  /* ---------- Scroll Reveal ---------- */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));

  /* ---------- Red Flash Effect ---------- */
  const redFlash = document.getElementById('redFlash');
  function triggerFlash() {
    redFlash.classList.add('active');
    setTimeout(() => redFlash.classList.remove('active'), 100);
    setTimeout(triggerFlash, Math.random() * 12000 + 8000);
  }
  setTimeout(triggerFlash, 5000);

  /* ---------- Smooth Scroll for Anchor Links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ============================================================
     DYNAMIC PRODUCT RENDERING — Only real products
     ============================================================ */

  const DEFAULT_PRODUCTS = [
    {id:'tee-404',name:'404 Pipeline Tee',price:349,img:'assets/images/product-tee-real.png',category:'collection',tag:'New',
     description:'Signature 404 Pipeline Tee from ZENITH ORIGINAL. Premium oversized fit with contrast piping and exclusive 404 branding.',
     images:['assets/images/product-tee-real.png'],
     details:{material:'100% Premium Cotton',fit:'Oversized',color:'Black / White piping',brand:'ZENITH ORIGINAL',origin:'Meknes, Morocco',care:'Machine wash cold, hang dry'}},
    {id:'drop-hoodie',name:'Creepy Hoodie',price:699,img:'assets/images/drop-hoodie-front.png',category:'drop',tag:'New Drop',
     description:'The Creepy Hoodie from Season 02. Bold graphic print, premium heavyweight fleece. Front and back artwork.',
     images:['assets/images/drop-hoodie-front.png','assets/images/drop-hoodie-back.png'],
     details:{material:'Premium Heavyweight Fleece',fit:'Oversized',color:'Black / Print',brand:'ZENITH ORIGINAL',origin:'Meknes, Morocco',care:'Machine wash cold, inside out'}},
    {id:'drop-jogger',name:'Zenith Jogger',price:499,img:'assets/images/drop-jogger.png',category:'drop',tag:'New Drop',
     description:'Zenith Jogger from Season 02. Tapered fit with contrast piping, elastic waistband, and premium build quality.',
     images:['assets/images/drop-jogger.png'],
     details:{material:'Premium Cotton Blend',fit:'Tapered',color:'Black / White piping',brand:'ZENITH ORIGINAL',origin:'Meknes, Morocco',care:'Machine wash cold, hang dry'}}
  ];

  function getProducts(){
    const stored = localStorage.getItem('zenith_products');
    if(!stored){
      localStorage.setItem('zenith_products', JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    return JSON.parse(stored);
  }

  function renderProducts(){
    const products = getProducts();
    const soldOut = JSON.parse(localStorage.getItem('zenith_soldout') || '[]');

    // Render Collection products
    const collectionGrid = document.getElementById('collectionGrid');
    const collectionProducts = products.filter(p => p.category === 'collection');
    
    if(collectionGrid){
      if(collectionProducts.length === 0){
        const storeSection = document.getElementById('store');
        if(storeSection) storeSection.style.display = 'none';
      } else {
        collectionGrid.innerHTML = collectionProducts.map((p, i) => {
          const isSoldOut = soldOut.includes(p.id);
          const delayClass = `reveal-delay-${Math.min(i+1, 5)}`;
          return `
          <div class="product-card reveal ${delayClass} ${isSoldOut?'sold-out':''}" 
               data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-img="${p.img}">
            ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}
            ${isSoldOut ? '<span class="product-tag soldout-tag">Sold Out</span>' : ''}
            <div class="product-image">
              <img src="${p.img}" alt="${p.name}">
              <div class="product-overlay">
                <span class="product-overlay-text">${isSoldOut ? 'SOLD OUT' : 'VIEW PRODUCT'}</span>
              </div>
            </div>
            <div class="product-info">
              <h3>${p.name}</h3>
              <p class="price"><span>${p.price} MAD</span></p>
            </div>
          </div>`;
        }).join('');
      }
    }

    // Render Drop products
    const dropGrid = document.getElementById('dropGrid');
    const dropProducts = products.filter(p => p.category === 'drop');
    
    if(dropGrid){
      const dropSection = document.getElementById('drop');
      if(dropProducts.length === 0){
        if(dropSection) dropSection.style.display = 'none';
      } else {
        if(dropSection) dropSection.style.display = '';
        dropGrid.innerHTML = dropProducts.map((p, i) => {
          const isSoldOut = soldOut.includes(p.id);
          const delayClass = `reveal-delay-${Math.min(i+1, 5)}`;
          return `
          <div class="product-card drop-card reveal ${delayClass} ${isSoldOut?'sold-out':''}" 
               data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-img="${p.img}">
            ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}
            ${isSoldOut ? '<span class="product-tag soldout-tag">Sold Out</span>' : ''}
            <div class="product-image">
              <img src="${p.img}" alt="${p.name}">
              <div class="product-overlay">
                <span class="product-overlay-text">${isSoldOut ? 'SOLD OUT' : 'VIEW PRODUCT'}</span>
              </div>
            </div>
            <div class="product-info">
              <h3>${p.name}</h3>
              <p class="price"><span>${p.price} MAD</span></p>
            </div>
          </div>`;
        }).join('');
      }
    }

    // Re-observe for scroll reveal
    document.querySelectorAll('.product-card.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
    attachProductClickHandlers();
    
    // Glitch hover
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.animation = 'cardGlitch 0.3s ease';
        setTimeout(() => { card.style.animation = ''; }, 300);
      });
    });
  }

  renderProducts();

  /* ---------- Product Click → Navigate to Detail Page ---------- */
  function attachProductClickHandlers(){
    document.querySelectorAll('.product-card[data-id]').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        window.location.href = `product.html?id=${id}`;
      });
    });
  }

  /* ---------- Reviews Display ---------- */
  function loadSiteReviews() {
    const reviews = JSON.parse(localStorage.getItem('zenith_reviews') || '[]');
    const approved = reviews.filter(r => r.status === 'approved');
    const grid = document.getElementById('reviewsGrid');
    if (!approved.length) {
      grid.innerHTML = '<p class="empty-reviews">No reviews yet — be the first to drop one.</p>' +
        '<button class="leave-review-btn" id="openReviewModal">LEAVE A REVIEW</button>';
    } else {
      grid.innerHTML = approved.map(r => {
        const initials = r.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
        return `
        <div class="review-card-site reveal">
          <div class="rc-header">
            <div class="rc-avatar">${initials}</div>
            <div>
              <div class="rc-name">${r.name}</div>
              <div class="rc-date">${new Date(r.timestamp).toLocaleDateString()}</div>
            </div>
            <div class="rc-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
          </div>
          <p class="rc-text">"${r.comment}"</p>
        </div>`;
      }).join('') +
        '<button class="leave-review-btn" id="openReviewModal">LEAVE A REVIEW</button>';
    }
    const openBtn = document.getElementById('openReviewModal');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        document.getElementById('reviewModal').classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }
  }
  loadSiteReviews();

  /* ---------- Review Modal ---------- */
  const reviewModal = document.getElementById('reviewModal');
  const reviewModalClose = document.getElementById('reviewModalClose');
  let selectedRating = 0;

  document.querySelectorAll('#starInput span').forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.star);
      document.querySelectorAll('#starInput span').forEach((s, i) => {
        s.classList.toggle('active', i < selectedRating);
      });
    });
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.dataset.star);
      document.querySelectorAll('#starInput span').forEach((s, i) => {
        s.classList.toggle('hover', i < val);
      });
    });
    star.addEventListener('mouseleave', () => {
      document.querySelectorAll('#starInput span').forEach(s => s.classList.remove('hover'));
    });
  });

  document.getElementById('submitReview').addEventListener('click', () => {
    const name = document.getElementById('reviewName').value.trim();
    const comment = document.getElementById('reviewComment').value.trim();
    if (!name || !comment || !selectedRating) { alert('Please fill all fields and select a rating'); return; }
    
    const reviews = JSON.parse(localStorage.getItem('zenith_reviews') || '[]');
    reviews.push({
      id: 'RV' + Date.now().toString(36).toUpperCase(),
      name: name,
      rating: selectedRating,
      comment: comment,
      status: 'pending',
      timestamp: Date.now()
    });
    localStorage.setItem('zenith_reviews', JSON.stringify(reviews));
    
    document.getElementById('reviewName').value = '';
    document.getElementById('reviewComment').value = '';
    selectedRating = 0;
    document.querySelectorAll('#starInput span').forEach(s => s.classList.remove('active'));
    reviewModal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Show success toast instead of alert
    showToast('Thank you! Your review will appear after approval. ✓');
  });

  reviewModalClose.addEventListener('click', () => {
    reviewModal.classList.remove('active');
    document.body.style.overflow = '';
  });
  reviewModal.addEventListener('click', (e) => {
    if (e.target === reviewModal) {
      reviewModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  /* ---------- Toast Notification ---------- */
  function showToast(msg) {
    let toast = document.getElementById('siteToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'siteToast';
      toast.className = 'site-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

});

/* Inject card glitch keyframes */
const glitchStyle = document.createElement('style');
glitchStyle.textContent = `
  @keyframes cardGlitch {
    0% { transform: translateY(-5px); }
    25% { transform: translate(-2px, -5px) skewX(-1deg); }
    50% { transform: translate(2px, -5px) skewX(1deg); }
    75% { transform: translate(-1px, -5px); }
    100% { transform: translateY(-5px); }
  }
`;
document.head.appendChild(glitchStyle);
