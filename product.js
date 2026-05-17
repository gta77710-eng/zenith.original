/* ========== ZENITH ORIGINAL — Product Detail Page ========== */

document.addEventListener('DOMContentLoaded', () => {

  /* --- Get product ID from URL --- */
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  
  if (!productId) {
    window.location.href = 'index.html#store';
    return;
  }

  /* --- Default products (same as admin/main) --- */
  const DEFAULT_PRODUCTS = [
    {id:'tee-404',name:'404 Pipeline Tee',price:349,img:'assets/images/product-tee-real.png',category:'collection',tag:'New',
     description:'Signature 404 Pipeline Tee from ZENITH ORIGINAL. Premium oversized fit with contrast piping and exclusive 404 branding. Designed for the bold, crafted for the elite.',
     images:['assets/images/product-tee-real.png'],
     details:{material:'100% Premium Cotton',fit:'Oversized',color:'Black / White piping',brand:'ZENITH ORIGINAL',origin:'Meknes, Morocco',care:'Machine wash cold, hang dry'}},
    {id:'drop-hoodie',name:'Creepy Hoodie',price:699,img:'assets/images/drop-hoodie-front.png',category:'drop',tag:'New Drop',
     description:'The Creepy Hoodie from Season 02. Bold graphic print, premium heavyweight fleece. Front and back artwork. Limited edition — once it\'s gone, it\'s gone.',
     images:['assets/images/drop-hoodie-front.png','assets/images/drop-hoodie-back.png'],
     details:{material:'Premium Heavyweight Fleece',fit:'Oversized',color:'Black / Print',brand:'ZENITH ORIGINAL',origin:'Meknes, Morocco',care:'Machine wash cold, inside out'}},
    {id:'drop-jogger',name:'Zenith Jogger',price:499,img:'assets/images/drop-jogger.png',category:'drop',tag:'New Drop',
     description:'Zenith Jogger from Season 02. Tapered fit with contrast piping, elastic waistband, and premium build quality. Perfect match for the Creepy Hoodie.',
     images:['assets/images/drop-jogger.png'],
     details:{material:'Premium Cotton Blend',fit:'Tapered',color:'Black / White piping',brand:'ZENITH ORIGINAL',origin:'Meknes, Morocco',care:'Machine wash cold, hang dry'}}
  ];

  /* --- Get products from localStorage --- */
  function getProducts(){
    const stored = localStorage.getItem('zenith_products');
    if(!stored) return DEFAULT_PRODUCTS;
    return JSON.parse(stored);
  }

  const products = getProducts();
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    window.location.href = 'index.html#store';
    return;
  }

  /* --- Check sold out --- */
  const soldOut = JSON.parse(localStorage.getItem('zenith_soldout') || '[]');
  const isSoldOut = soldOut.includes(product.id);

  /* --- Populate page --- */
  document.title = `${product.name} — ZENITH ORIGINAL`;
  document.getElementById('pdName').textContent = product.name;
  const priceEl = document.getElementById('pdPrice');
  priceEl.innerHTML = `${product.price.toLocaleString('fr-MA')} <span style="font-size:0.6em;letter-spacing:2px;color:#888">MAD</span>`;
  document.getElementById('pdBreadcrumbName').textContent = product.name;
  
  // Main image
  const mainImg = document.getElementById('pdImg');
  mainImg.src = product.img;
  mainImg.alt = product.name;

  // Description
  const defaultDesc = 'Premium streetwear piece from ZENITH ORIGINAL. Crafted with high-quality materials for a bold, urban look. Designed in Meknes, Morocco.';
  document.getElementById('pdDesc').textContent = product.description || defaultDesc;

  // Details list
  const detailsList = document.getElementById('pdDetailsList');
  if (product.details) {
    detailsList.innerHTML = Object.entries(product.details).map(([key, val]) => `
      <li><span>${key}</span><span>${val}</span></li>
    `).join('');
  }

  // Multiple images / thumbnails
  const images = product.images || [product.img];
  const thumbsContainer = document.getElementById('pdThumbs');
  
  if (images.length > 1) {
    thumbsContainer.innerHTML = images.map((src, i) => `
      <div class="pd-thumb ${i===0?'active':''}" data-index="${i}">
        <img src="${src}" alt="${product.name} ${i+1}">
      </div>
    `).join('');

    thumbsContainer.querySelectorAll('.pd-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const idx = parseInt(thumb.dataset.index);
        mainImg.src = images[idx];
        thumbsContainer.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  } else {
    thumbsContainer.style.display = 'none';
  }

  // Sold out state
  if (isSoldOut) {
    document.getElementById('pdSoldOutBanner').style.display = 'block';
    document.getElementById('pdOrderBtn').disabled = true;
    document.getElementById('pdOrderBtn').textContent = 'SOLD OUT';
    document.getElementById('pdSizeSection').style.opacity = '0.4';
    document.getElementById('pdSizeSection').style.pointerEvents = 'none';
  }

  /* --- Size Selection --- */
  let selectedSize = '';
  document.querySelectorAll('.pd-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pd-size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.dataset.size;
    });
  });

  /* --- Size Guide --- */
  const sizeGuidePopup = document.getElementById('sizeGuidePopup');
  document.getElementById('sizeGuideBtn').addEventListener('click', () => {
    sizeGuidePopup.classList.add('active');
  });
  document.getElementById('sgClose').addEventListener('click', () => {
    sizeGuidePopup.classList.remove('active');
  });
  sizeGuidePopup.addEventListener('click', (e) => {
    if (e.target === sizeGuidePopup) sizeGuidePopup.classList.remove('active');
  });

  /* --- Zoom Functionality --- */
  const zoomOverlay = document.getElementById('zoomOverlay');
  const zoomImg = document.getElementById('zoomImg');
  const zoomContainer = document.getElementById('zoomContainer');
  let scale = 1, posX = 0, posY = 0;
  let isDragging = false, startX, startY;

  // Open zoom
  document.getElementById('pdMainImage').addEventListener('click', () => {
    zoomImg.src = mainImg.src;
    scale = 1; posX = 0; posY = 0;
    updateZoomTransform();
    zoomOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  // Close zoom
  document.getElementById('zoomClose').addEventListener('click', closeZoom);
  zoomOverlay.addEventListener('click', (e) => {
    if (e.target === zoomOverlay || e.target === zoomContainer) closeZoom();
  });

  function closeZoom() {
    zoomOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateZoomTransform() {
    zoomImg.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
  }

  // Mouse wheel zoom
  zoomContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    scale = Math.min(Math.max(0.5, scale + delta), 5);
    updateZoomTransform();
  }, { passive: false });

  // Mouse drag
  zoomImg.addEventListener('mousedown', (e) => {
    if (scale <= 1) return;
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
    e.preventDefault();
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    updateZoomTransform();
  });
  document.addEventListener('mouseup', () => { isDragging = false; });

  // Touch pinch zoom
  let lastTouchDist = 0;
  let lastTouchCenter = null;
  
  zoomContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      lastTouchDist = getTouchDist(e.touches);
      lastTouchCenter = getTouchCenter(e.touches);
    } else if (e.touches.length === 1 && scale > 1) {
      isDragging = true;
      startX = e.touches[0].clientX - posX;
      startY = e.touches[0].clientY - posY;
    }
  }, { passive: true });

  zoomContainer.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = getTouchDist(e.touches);
      const delta = (dist - lastTouchDist) * 0.008;
      scale = Math.min(Math.max(0.5, scale + delta), 5);
      lastTouchDist = dist;
      updateZoomTransform();
    } else if (e.touches.length === 1 && isDragging) {
      posX = e.touches[0].clientX - startX;
      posY = e.touches[0].clientY - startY;
      updateZoomTransform();
    }
  }, { passive: false });

  zoomContainer.addEventListener('touchend', () => {
    isDragging = false;
    lastTouchDist = 0;
  });

  // Double tap to zoom
  let lastTap = 0;
  zoomContainer.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      scale = scale > 1.5 ? 1 : 3;
      posX = 0; posY = 0;
      updateZoomTransform();
    }
    lastTap = now;
  });

  function getTouchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx*dx + dy*dy);
  }
  function getTouchCenter(touches) {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  }

  /* --- Order Flow --- */
  const orderModal = document.getElementById('orderModal');
  
  document.getElementById('pdOrderBtn').addEventListener('click', () => {
    if (isSoldOut) return;
    if (!selectedSize) {
      // Scroll to sizes and highlight
      document.getElementById('pdSizeSection').scrollIntoView({ behavior: 'smooth' });
      document.getElementById('pdSizeSection').style.animation = 'flash 0.5s ease 3';
      setTimeout(() => {
        document.getElementById('pdSizeSection').style.animation = '';
      }, 1500);
      return;
    }
    showStep(1);
    orderModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  document.getElementById('modalClose').addEventListener('click', closeOrderModal);
  orderModal.addEventListener('click', (e) => {
    if (e.target === orderModal) closeOrderModal();
  });

  document.getElementById('confirmOrder').addEventListener('click', () => {
    const name = document.getElementById('orderName').value.trim();
    const phone = document.getElementById('orderPhone').value.trim();
    const city = document.getElementById('orderCity').value.trim();
    if (!name || !phone || !city) { alert('Please fill all fields'); return; }
    
    const orderId = 'ZN' + Date.now().toString(36).toUpperCase();
    const orders = JSON.parse(localStorage.getItem('zenith_orders') || '[]');
    orders.push({
      id: orderId,
      name: name, phone: phone, city: city,
      items: [{
        id: product.id,
        name: product.name,
        price: product.price,
        img: product.img,
        size: selectedSize
      }],
      status: 'new',
      timestamp: Date.now()
    });
    localStorage.setItem('zenith_orders', JSON.stringify(orders));
    
    document.getElementById('orderNumber').textContent = 'Order #' + orderId;
    document.getElementById('orderName').value = '';
    document.getElementById('orderPhone').value = '';
    document.getElementById('orderCity').value = '';
    showStep(2);
  });

  document.getElementById('closeSuccess').addEventListener('click', () => {
    closeOrderModal();
    window.location.href = 'index.html#store';
  });

  function showStep(n) {
    document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step' + n).classList.add('active');
  }
  function closeOrderModal() {
    orderModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* --- Hide zoom hint after first interaction --- */
  document.getElementById('pdMainImage').addEventListener('click', () => {
    document.getElementById('zoomHint').style.display = 'none';
  }, { once: true });

});

/* Flash animation for size reminder */
const flashStyle = document.createElement('style');
flashStyle.textContent = `
  @keyframes flash {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; border-color: #ff0000; }
  }
`;
document.head.appendChild(flashStyle);
