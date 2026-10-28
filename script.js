function showPage(name){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  window.scrollTo(0, 0);
}

const PRODUCTS = [
  { id: 1, name: "Moonstone Drop Pendant", desc: "Sterling silver, natural moonstone", price:200, image: "", category: "Pendants" },
  { id: 2, name: "Sun Disc Pendant", desc: "Brushed brass finish", price:250 ,image: "", category: "Pendants" },
  { id: 3, name: "Stacking Band Ring", desc: "Adjustable, gold-plated", price:250 , image: "", category: "Rings" },
  { id: 4, name: "Turquoise Statement Ring", desc: "Hand-set stone, oxidised silver", price:270, image: "", category: "Rings" },
  { id: 5, name: "Beaded Charm Bracelet", desc: "Glass beads, adjustable cord", price:150, image: "", category: "Bracelets" },
  { id: 6, name: "Thin Chain Bracelet", desc: "Delicate gold-plated chain", price:190, image: "", category: "Bracelets" },
  { id: 7, name: "Festive Hamper Set", desc: "Pendant + ring + bracelet, gift boxed", price:999, image: "", category: "Set Combos & Hampers" },
  { id: 8, name: "Bridesmaid Gift Combo", desc: "Earrings + bracelet, set of 3", price:1599, image: "", category: "Set Combos & Hampers" },
  { id: 9, name: "Weekend Sale Pendant", desc: "Limited stock, was ₹300", price:250, image: "", category: "Special Offers" },
];

let activeCategory = "All";
let searchQuery = "";

function setSearch(value){
  searchQuery = value.trim().toLowerCase();
  renderProducts();
}
const firebaseConfig = {
  apiKey: "AIzaSyD_yFQ6ZwwnOmrQ4DlNfRuS3mxQ-HPClkE",
  authDomain: "orelle-53a0b.firebaseapp.com",
  projectId: "orelle-53a0b",
  storageBucket: "orelle-53a0b.firebasestorage.app",
  messagingSenderId: "606427409393",
  appId: "1:606427409393:web:4fa6832defe9cdaeb37250",
  measurementId: "G-T6P0Q9Q48W"
};

let cloudEnabled = false;
let db = null;
let cloudOverrides = {};

if (firebaseConfig.apiKey !== "PASTE_YOUR_FIREBASE_CONFIG_HERE"){
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    cloudEnabled = true;
  } catch(e){
    console.error('Firebase failed to start:', e);
  }
}

async function loadOverridesFromCloud(){
  if (!cloudEnabled) {
    try { cloudOverrides = JSON.parse(localStorage.getItem('productOverrides')) || {}; }
    catch(e){ cloudOverrides = {}; }
    return;
  }
  try {
    const doc = await db.collection('store').doc('productOverrides').get();
    cloudOverrides = doc.exists ? (doc.data() || {}) : {};
  } catch(e){
    console.error('Could not load from Firebase:', e);
  }
}

async function saveOverride(id, changes){
  cloudOverrides[id] = { ...cloudOverrides[id], ...changes };
  if (!cloudEnabled){
    localStorage.setItem('productOverrides', JSON.stringify(cloudOverrides));
    return;
  }
  try {
    await db.collection('store').doc('productOverrides').set(cloudOverrides);
  } catch(e){
    alert('Saved on screen, but could not reach the cloud database - check your Firebase setup and internet connection.');
    console.error(e);
  }
}

const ADMIN_EMAIL = "kalayna63@gmail.com";
let isAdmin = false;

function openAdminLogin(){
  document.getElementById('admin-modal').classList.add('open');
  document.getElementById('admin-overlay').classList.add('open');
}
function closeAdminLogin(){
  document.getElementById('admin-modal').classList.remove('open');
  document.getElementById('admin-overlay').classList.remove('open');
}
async function submitAdminLogin(e){
  e.preventDefault();

  const email = document.getElementById('admin-email').value.trim();
  const pass = document.getElementById('admin-password').value;

  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, pass);

    if (userCredential.user.email !== ADMIN_EMAIL) {
      await firebase.auth().signOut();
      alert('This account is not authorized as Admin.');
      return;
    }

    isAdmin = true;
    closeAdminLogin();
    document.getElementById('admin-form').reset();
    document.getElementById('admin-badge').style.display = 'flex';
    renderProducts();

  } catch (error) {
    console.error('Firebase login error:', error);
    alert('Incorrect email or password.');
  }
}
function logoutAdmin(){
  isAdmin = false;
  document.getElementById('admin-badge').style.display = 'none';
  renderProducts();
}

function getProduct(id){
  const base = PRODUCTS.find(p => p.id === id);
  return { ...base, ...(cloudOverrides[id] || {}) };
}
async function editProduct(id){
  const p = getProduct(id);
  const newName = prompt('Product name:', p.name);
  if (newName === null) return;
  const newPrice = prompt('Price (numbers only):', p.price);
  if (newPrice === null) return;
  const newDesc = prompt('Description:', p.desc);
  if (newDesc === null) return;
  await saveOverride(id, { name: newName, price: Number(newPrice) || p.price, desc: newDesc });
  renderProducts();
}

let cart = {}; 

function renderCategories(){
  const bar = document.getElementById('category-bar');
  const categories = ["All", ...new Set(PRODUCTS.map(p => p.category))];
  bar.innerHTML = categories.map(c => `
    <button class="cat-btn ${c === activeCategory ? 'active' : ''}" onclick="setCategory('${c}')">${c}</button>
  `).join('');
}
function setCategory(c){
  activeCategory = c;
  renderCategories();
  renderProducts();
}

function productCard(rawP){
  const p = getProduct(rawP.id);
  return `
    <div class="product">
      <div class="product-img">${p.image ? `<img src="${p.image}" alt="${p.name}">` : `Photo of<br>${p.name}`}</div>
      <div class="product-info">
        <div class="cat-tag">${p.category}</div>
        <h3>${p.name}</h3>
        <div class="desc">${p.desc}</div>
        <div class="price">₹${p.price}</div>
        <button class="add-btn" onclick="addToCart(${p.id})">Add to cart</button>
        ${isAdmin ? `<button class="edit-btn" onclick="editProduct(${p.id})">✎ Edit</button>` : ''}
      </div>
    </div>
    `;
}

function renderProducts(){
  const grid = document.getElementById('product-grid');
  let list = activeCategory === "All" ? PRODUCTS : PRODUCTS.filter(p => p.category === activeCategory);

  if (searchQuery){
    list = PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery));
  }

  grid.innerHTML = list.length
    ? `<div class="category-grid">${list.map(productCard).join('')}</div>`
    : `<div class="empty-msg">No products match "${searchQuery}".</div>`;
}
function addToCart(id){
  cart[id] = (cart[id] || 0) + 1;
  renderCart();

  const toast = document.getElementById('cart-toast');
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);

  openCart();
}

function changeQty(id, delta){
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
}

const SHIPPING_FEE = 49;
const FREE_SHIPPING_ABOVE = 999;

function renderCart(){
  const itemsEl = document.getElementById('cart-items');
  const ids = Object.keys(cart);
  let subtotal = 0;
  let count = 0;

  if (ids.length === 0){
    itemsEl.innerHTML = '<div class="empty-msg">Your cart is empty.</div>';
  } else {
    itemsEl.innerHTML = ids.map(id => {
      const p = getProduct(Number(id));
      const qty = cart[id];
      subtotal += p.price * qty;
      count += qty;
      return `
        <div class="cart-line">
          <div class="cart-line-info">
            <span class="cart-line-name">${p.name}</span>
            <span class="cart-line-price">₹${p.price} × ${qty} = ₹${p.price * qty}</span>
          </div>
          <div class="qty-controls">
            <button onclick="changeQty(${id}, -1)">−</button>
            <span>${qty}</span>
            <button onclick="changeQty(${id}, 1)">+</button>
          </div>
        </div>
      `;
    }).join('');
  }

  const shipping = (subtotal === 0 || subtotal >= FREE_SHIPPING_ABOVE) ? 0 : SHIPPING_FEE;
  const grandTotal = subtotal + shipping;

  document.getElementById('cart-subtotal').textContent = '₹' + subtotal;
  document.getElementById('cart-shipping').textContent = shipping === 0 ? 'Free' : '₹' + shipping;
  document.getElementById('cart-total').textContent = '₹' + grandTotal;
  document.getElementById('cart-count').textContent = count;
}

function openCart(){
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
}
function closeCart(){
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
}

function checkout(){
  if (Object.keys(cart).length === 0){
    alert('Your cart is empty.');
    return;
  }
  closeCart();
  openShipping();
}

function openShipping(){
  goToStep1();

  document.getElementById('ship-subtotal').textContent = document.getElementById('cart-subtotal').textContent;
  document.getElementById('ship-shipping').textContent = document.getElementById('cart-shipping').textContent;
  document.getElementById('ship-total').textContent = document.getElementById('cart-total').textContent;
  
  const itemsContainer = document.getElementById('modal-order-items');
  const ids = Object.keys(cart);
  itemsContainer.innerHTML = ids.map(id => {
    const p = getProduct(Number(id));
    const qty = cart[id];
    return `<div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:5px;">
              <span>${p.name} (x${qty})</span>
              <span>₹${p.price * qty}</span>
            </div>`;
  }).join('');

  document.getElementById('shipping-modal').classList.add('open');
  document.getElementById('shipping-overlay').classList.add('open');
}

function closeShipping(){
  document.getElementById('shipping-modal').classList.remove('open');
  document.getElementById('shipping-overlay').classList.remove('open');
}

// STEP 3: Razorpay Key
const RAZORPAY_KEY_ID = "PASTE_YOUR_RAZORPAY_KEY_ID_HERE";

// STEP 4: Put your WhatsApp phone number here (country code + mobile number, no + or spaces)
const BRAND_WHATSAPP_NUMBER = "919353607091"; 

function goToStep2() {
  const form = document.getElementById('shipping-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  document.getElementById('step-1-shipping').style.display = 'none';
  document.getElementById('step-2-payment').style.display = 'block';
}

function goToStep1() {
  document.getElementById('step-2-payment').style.display = 'none';
  document.getElementById('step-1-shipping').style.display = 'block';
}

function sendWhatsAppOrder() {
  let itemsList = '';
  let subtotal = 0;
  
  Object.keys(cart).forEach(id => {
    const p = getProduct(Number(id));
    const qty = cart[id];
    itemsList += `• ${p.name} (x${qty}) - ₹${p.price * qty}\n`;
    subtotal += p.price * qty;
  });

  const shipping = (subtotal === 0 || subtotal >= FREE_SHIPPING_ABOVE) ? 0 : SHIPPING_FEE;
  const grandTotal = subtotal + shipping;

  const name = document.getElementById('ship-name').value;
  const phone = document.getElementById('ship-phone').value;
  const email = document.getElementById('ship-email').value;
  const address = document.getElementById('ship-address').value;
  const landmark = document.getElementById('ship-landmark').value;
  const city = document.getElementById('ship-city').value;
  const state = document.getElementById('ship-state').value;
  const pincode = document.getElementById('ship-pincode').value;

  const message = 
`*NEW ORDER REQUEST - ORELLE*

*CART Items:*
${itemsList}
*Subtotal:* ₹${subtotal}
*Shipping:* ${shipping === 0 ? 'Free' : '₹' + shipping}
*Total Amount:* ₹${grandTotal}

*Shipping Address:*
• Name: ${name}
• Phone: ${phone}
• Email: ${email}
• Address: ${address}${landmark ? ', ' + landmark : ''}, ${city}, ${state} - ${pincode}`;

  const encodedMessage = encodeURIComponent(message);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  const whatsappUrl = isMobile 
    ? `whatsapp://send?phone=${BRAND_WHATSAPP_NUMBER}&text=${encodedMessage}`
    : `https://web.whatsapp.com/send?phone=${BRAND_WHATSAPP_NUMBER}&text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
}

// EXISTING RAZORPAY SUBMIT FUNCTION (Preserved)
function submitShipping(e){
  e.preventDefault();

  const details = {
    name: document.getElementById('ship-name').value,
    phone: document.getElementById('ship-phone').value,
    email: document.getElementById('ship-email').value,
    address: document.getElementById('ship-address').value,
    landmark: document.getElementById('ship-landmark').value, 
    city: document.getElementById('ship-city').value,
    state: document.getElementById('ship-state').value,
    pincode: document.getElementById('ship-pincode').value,
  };

  let subtotal = 0;
  Object.keys(cart).forEach(id => {
    const p = getProduct(Number(id));
    subtotal += p.price * cart[id];
  });
  const shipping = (subtotal === 0 || subtotal >= FREE_SHIPPING_ABOVE) ? 0 : SHIPPING_FEE;
  const grandTotal = subtotal + shipping;

  if (RAZORPAY_KEY_ID === "PASTE_YOUR_RAZORPAY_KEY_ID_HERE"){
    console.log('Shipping details captured:', details, 'Total:', grandTotal);
    alert('Details saved! Payment isn\'t connected yet — add your Razorpay key to go live.');
    return;
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: grandTotal * 100,
    currency: "INR",
    name: "ORELLE",
    description: "Order payment",
    prefill: {
      name: details.name,
      email: details.email,
      contact: details.phone
    },
    notes: {
      address: details.address,
      landmark: details.landmark,
      city: details.city,
      state: details.state,
      pincode: details.pincode
    },
    theme: { color: "#b6502f" },
    handler: function(response){
      console.log('Payment successful:', response.razorpay_payment_id);
      alert('Payment successful! Order confirmed for ' + details.name + '.');
      cart = {};
      renderCart();
      closeShipping();
      document.getElementById('shipping-form').reset();
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}

document.getElementById('cart-btn').addEventListener('click', openCart);
document.getElementById('year').textContent = new Date().getFullYear();
renderCategories();
renderProducts();
renderCart();

loadOverridesFromCloud().then(() => {
  renderProducts();
});
