/* ZENITH ADMIN PANEL — Full Product Management */
const ADMIN_CODE = 'zenith2026';

/* Default products — used to seed localStorage on first visit */
const DEFAULT_PRODUCTS = [
  {id:'tee-404',name:'404 Pipeline Tee',price:349,img:'assets/images/product-tee-real.png',category:'collection',tag:'New',
   description:'Signature 404 Pipeline Tee from ZENITH ORIGINAL. Premium oversized fit with contrast piping and exclusive 404 branding.',
   images:['assets/images/product-tee-real.png'],
   details:{material:'100% Premium Cotton',fit:'Oversized',color:'Black / White piping',brand:'ZENITH ORIGINAL',origin:'Meknes, Morocco',care:'Machine wash cold, hang dry'}},
  {id:'drop-hoodie',name:'Creepy Hoodie',price:699,img:'assets/images/drop-hoodie-front.png',category:'drop',tag:'New Drop',
   description:'The Creepy Hoodie from Season 02. Bold graphic print, premium heavyweight fleece.',
   images:['assets/images/drop-hoodie-front.png','assets/images/drop-hoodie-back.png'],
   details:{material:'Premium Heavyweight Fleece',fit:'Oversized',color:'Black / Print',brand:'ZENITH ORIGINAL',origin:'Meknes, Morocco',care:'Machine wash cold, inside out'}},
  {id:'drop-jogger',name:'Zenith Jogger',price:499,img:'assets/images/drop-jogger.png',category:'drop',tag:'New Drop',
   description:'Zenith Jogger from Season 02. Tapered fit with contrast piping and premium build quality.',
   images:['assets/images/drop-jogger.png'],
   details:{material:'Premium Cotton Blend',fit:'Tapered',color:'Black / White piping',brand:'ZENITH ORIGINAL',origin:'Meknes, Morocco',care:'Machine wash cold, hang dry'}}
];

/* --- Storage Helpers --- */
function getProducts(){
  const stored = localStorage.getItem('zenith_products');
  if(!stored){
    localStorage.setItem('zenith_products', JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
  return JSON.parse(stored);
}
function saveProducts(p){ localStorage.setItem('zenith_products', JSON.stringify(p)); }
function getOrders(){ return JSON.parse(localStorage.getItem('zenith_orders')||'[]'); }
function saveOrders(o){ localStorage.setItem('zenith_orders',JSON.stringify(o)); }
function getSoldOut(){ return JSON.parse(localStorage.getItem('zenith_soldout')||'[]'); }
function saveSoldOut(s){ localStorage.setItem('zenith_soldout',JSON.stringify(s)); }
function getReviews(){ return JSON.parse(localStorage.getItem('zenith_reviews')||'[]'); }
function saveReviews(r){ localStorage.setItem('zenith_reviews',JSON.stringify(r)); }

/* --- Toast --- */
function showToast(msg){
  let toast = document.querySelector('.admin-toast');
  if(!toast){
    toast = document.createElement('div');
    toast.className = 'admin-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(()=> toast.classList.remove('show'), 2500);
}

/* --- Login --- */
document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('loginCode').addEventListener('keydown', e=>{ if(e.key==='Enter') login(); });
function login(){
  const code = document.getElementById('loginCode').value;
  if(code === ADMIN_CODE){
    document.getElementById('loginScreen').style.display='none';
    document.getElementById('adminDashboard').style.display='block';
    loadAll();
  } else {
    document.getElementById('loginError').textContent='INVALID CODE';
  }
}
document.getElementById('logoutBtn').addEventListener('click',()=>{
  document.getElementById('adminDashboard').style.display='none';
  document.getElementById('loginScreen').style.display='flex';
  document.getElementById('loginCode').value='';
  document.getElementById('loginError').textContent='';
});

/* --- Tabs --- */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
  });
});

/* --- Load All --- */
function loadAll(){ loadOrders(); loadProducts(); loadReviews(); }

/* ============================================================
   ORDERS
   ============================================================ */
let currentFilter = 'all';
document.querySelectorAll('.filter-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    loadOrders();
  });
});

function loadOrders(){
  const orders = getOrders();
  const filtered = currentFilter==='all' ? orders : orders.filter(o=>o.status===currentFilter);
  const newCount = orders.filter(o=>o.status==='new').length;
  document.getElementById('ordersBadge').textContent = newCount;
  const container = document.getElementById('ordersList');
  if(!filtered.length){ container.innerHTML='<p class="empty-state">No orders found</p>'; return; }
  container.innerHTML = filtered.sort((a,b)=>b.timestamp-a.timestamp).map(order=>{
    const products = order.items.map(item=>`
      <div class="order-product-item">
        <img src="${item.img}" alt="${item.name}">
        <span>${item.name} — ${item.size}</span>
        <span class="op-price">${item.price} MAD</span>
      </div>`).join('');
    const total = order.items.reduce((s,i)=>s+i.price,0);
    return `
    <div class="order-card">
      <div class="order-top">
        <span class="order-id">#${order.id}</span>
        <span class="order-date">${new Date(order.timestamp).toLocaleString()}</span>
        <span class="order-status status-${order.status}">${order.status}</span>
      </div>
      <div class="order-details">
        <div class="order-detail"><label>Customer</label><span>${order.name}</span></div>
        <div class="order-detail"><label>Phone</label><span>${order.phone}</span></div>
        <div class="order-detail"><label>City / Address</label><span>${order.city}</span></div>
      </div>
      <div class="order-products"><h4>Products</h4>${products}</div>
      <div class="order-actions">
        <select onchange="updateOrderStatus('${order.id}',this.value)">
          <option value="new" ${order.status==='new'?'selected':''}>New</option>
          <option value="processing" ${order.status==='processing'?'selected':''}>Processing</option>
          <option value="shipped" ${order.status==='shipped'?'selected':''}>Shipped</option>
          <option value="delivered" ${order.status==='delivered'?'selected':''}>Delivered</option>
        </select>
        <button onclick="deleteOrder('${order.id}')">DELETE</button>
        <span class="order-total">TOTAL: ${total} MAD</span>
      </div>
    </div>`;
  }).join('');
}
function updateOrderStatus(id,status){
  const orders = getOrders();
  const order = orders.find(o=>o.id===id);
  if(order){ order.status=status; saveOrders(orders); loadOrders(); showToast('Order status updated'); }
}
function deleteOrder(id){
  if(!confirm('Delete this order?')) return;
  saveOrders(getOrders().filter(o=>o.id!==id));
  loadOrders();
  showToast('Order deleted');
}

/* ============================================================
   PRODUCTS — Full CRUD with Image Upload
   ============================================================ */
let currentImageData = ''; // holds base64 or path

function loadProducts(){
  const products = getProducts();
  const soldOut = getSoldOut();
  document.getElementById('productsAdminGrid').innerHTML = products.map(p=>`
    <div class="product-admin-card">
      <img src="${p.img}" alt="${p.name}">
      <div class="product-admin-info">
        <h3>${p.name}</h3>
        <p>${p.price} MAD</p>
        <span class="pa-category">${p.category}</span>
        ${p.tag ? `<span class="pa-tag">${p.tag}</span>` : ''}
      </div>
      <div class="product-admin-actions">
        <label class="soldout-toggle">
          <input type="checkbox" ${soldOut.includes(p.id)?'checked':''} onchange="toggleSoldOut('${p.id}',this.checked)">
          <span class="soldout-slider"></span>
        </label>
        <div class="soldout-label">${soldOut.includes(p.id)?'SOLD OUT':'AVAILABLE'}</div>
        <div class="pa-btn-row">
          <button class="pa-edit-btn" onclick="editProduct('${p.id}')">EDIT</button>
          <button class="pa-delete-btn" onclick="deleteProduct('${p.id}')">DELETE</button>
        </div>
      </div>
    </div>`).join('');
}

function toggleSoldOut(id,checked){
  let soldOut = getSoldOut();
  if(checked){ if(!soldOut.includes(id)) soldOut.push(id); }
  else { soldOut = soldOut.filter(s=>s!==id); }
  saveSoldOut(soldOut);
  loadProducts();
  showToast(checked ? 'Marked as SOLD OUT' : 'Marked as AVAILABLE');
}

function deleteProduct(id){
  if(!confirm('Delete this product? This cannot be undone.')) return;
  const products = getProducts().filter(p=>p.id!==id);
  saveProducts(products);
  loadProducts();
  showToast('Product deleted');
}

/* --- Product Modal --- */
const productModal = document.getElementById('productModal');
const pmClose = document.getElementById('productModalClose');
const pmImagePreview = document.getElementById('pmImagePreview');
const pmImageInput = document.getElementById('pmImageInput');
const pmSubmit = document.getElementById('pmSubmit');
const pmTitle = document.getElementById('pmTitle');

// Open Add modal
document.getElementById('addProductBtn').addEventListener('click', ()=>{
  resetProductModal();
  pmTitle.textContent = 'ADD NEW PRODUCT';
  pmSubmit.textContent = 'ADD PRODUCT';
  document.getElementById('pmEditId').value = '';
  productModal.classList.add('active');
});

// Close modal
pmClose.addEventListener('click', ()=> productModal.classList.remove('active'));
productModal.addEventListener('click', (e)=>{ if(e.target===productModal) productModal.classList.remove('active'); });

// Image upload click
pmImagePreview.addEventListener('click', ()=> pmImageInput.click());

// Image file selected
pmImageInput.addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    currentImageData = ev.target.result; // base64
    pmImagePreview.innerHTML = `<img src="${currentImageData}" alt="Preview">`;
    pmImagePreview.classList.add('has-image');
  };
  reader.readAsDataURL(file);
});

// Submit (Add or Edit)
pmSubmit.addEventListener('click', ()=>{
  const name = document.getElementById('pmName').value.trim();
  const price = parseInt(document.getElementById('pmPrice').value);
  const category = document.getElementById('pmCategory').value;
  const tag = document.getElementById('pmTag').value;
  const editId = document.getElementById('pmEditId').value;
  
  if(!name || !price || isNaN(price)){
    alert('Please fill product name and price');
    return;
  }
  if(!currentImageData && !editId){
    alert('Please upload a product image');
    return;
  }
  
  const products = getProducts();
  
  if(editId){
    // Edit existing
    const idx = products.findIndex(p=>p.id===editId);
    if(idx>-1){
      products[idx].name = name;
      products[idx].price = price;
      products[idx].category = category;
      products[idx].tag = tag;
      if(currentImageData) products[idx].img = currentImageData;
    }
    showToast('Product updated');
  } else {
    // Add new
    const newId = 'prod-' + Date.now().toString(36);
    products.push({
      id: newId,
      name: name,
      price: price,
      img: currentImageData,
      category: category,
      tag: tag
    });
    showToast('Product added');
  }
  
  saveProducts(products);
  loadProducts();
  productModal.classList.remove('active');
  resetProductModal();
});

function resetProductModal(){
  document.getElementById('pmName').value = '';
  document.getElementById('pmPrice').value = '';
  document.getElementById('pmCategory').value = 'collection';
  document.getElementById('pmTag').value = '';
  document.getElementById('pmEditId').value = '';
  currentImageData = '';
  pmImagePreview.innerHTML = '<span class="pm-upload-icon">📷</span><span class="pm-upload-text">Click to upload image</span>';
  pmImagePreview.classList.remove('has-image');
}

// Edit product
function editProduct(id){
  const products = getProducts();
  const p = products.find(x=>x.id===id);
  if(!p) return;
  
  pmTitle.textContent = 'EDIT PRODUCT';
  pmSubmit.textContent = 'SAVE CHANGES';
  document.getElementById('pmEditId').value = p.id;
  document.getElementById('pmName').value = p.name;
  document.getElementById('pmPrice').value = p.price;
  document.getElementById('pmCategory').value = p.category || 'collection';
  document.getElementById('pmTag').value = p.tag || '';
  currentImageData = p.img;
  pmImagePreview.innerHTML = `<img src="${p.img}" alt="Preview">`;
  pmImagePreview.classList.add('has-image');
  productModal.classList.add('active');
}

/* ============================================================
   REVIEWS
   ============================================================ */
function loadReviews(){
  const reviews = getReviews();
  const pending = reviews.filter(r=>r.status==='pending').length;
  document.getElementById('reviewsBadge').textContent = pending;
  const container = document.getElementById('reviewsList');
  if(!reviews.length){ container.innerHTML='<p class="empty-state">No reviews yet</p>'; return; }
  container.innerHTML = reviews.sort((a,b)=>b.timestamp-a.timestamp).map(r=>`
    <div class="review-card">
      <div class="review-top">
        <span class="review-customer">${r.name}</span>
        <span class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>
        <span class="review-status review-${r.status}">${r.status}</span>
      </div>
      <p class="review-text">${r.comment}</p>
      <span class="review-date">${new Date(r.timestamp).toLocaleDateString()}</span>
      ${r.status==='pending'?`
        <div class="review-actions">
          <button class="btn-approve" onclick="approveReview('${r.id}')">APPROVE</button>
          <button class="btn-reject" onclick="rejectReview('${r.id}')">REJECT</button>
        </div>`:'' }
    </div>`).join('');
}
function approveReview(id){
  const reviews = getReviews();
  const r = reviews.find(x=>x.id===id);
  if(r){ r.status='approved'; saveReviews(reviews); loadReviews(); showToast('Review approved'); }
}
function rejectReview(id){
  const reviews = getReviews();
  saveReviews(reviews.filter(x=>x.id!==id));
  loadReviews();
  showToast('Review rejected');
}
