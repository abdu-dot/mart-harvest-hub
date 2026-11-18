import { useEffect, useState } from 'react'
import chickenFarm from './assets/chicken-farm.png'
import './App.css'

const initialProducts = [
  {
    id: 1,
    name: 'Chickens',
    description: 'Healthy chickens raised with proper care and attention.',
    category: 'livestock',
    price: 8000,
    unit: 'Per chicken',
    stock: 100,
    icon: '🐔',
    image: chickenFarm,
  },
  {
    id: 2,
    name: 'Pigs',
    description: 'Quality pigs raised on our farm and ready for customers.',
    category: 'livestock',
    price: 120000,
    unit: 'Per pig',
    stock: 20,
    icon: '🐖',
    image: '',
  },
  {
    id: 3,
    name: 'Fresh Eggs',
    description: 'Fresh farm eggs carefully collected and packed.',
    category: 'eggs',
    price: 4000,
    unit: 'Per tray',
    stock: 50,
    icon: '🥚',
    image: '',
  },
  {
    id: 4,
    name: 'Other Livestock',
    description: 'More livestock products will be available soon.',
    category: 'livestock',
    price: 0,
    unit: 'Coming soon',
    stock: 0,
    icon: '🐄',
    image: '',
  },
]

const emptyProduct = {
  name: '',
  description: '',
  category: 'livestock',
  price: '',
  unit: '',
  stock: '',
  icon: '🐄',
  image: '',
}

const formatPrice = (price) =>
  `${Number(price || 0).toLocaleString('en-US')} RWF`

function App() {
  const [language, setLanguage] = useState('EN')
  const [mobileMenu, setMobileMenu] = useState(false)

  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('shh_products')
      return saved ? JSON.parse(saved) : initialProducts
    } catch {
      return initialProducts
    }
  })

  const [cart, setCart] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderMessage, setOrderMessage] = useState('')

  const [checkout, setCheckout] = useState({
    name: '',
    phone: '',
    district: '',
    province: '',
    delivery: 'delivery',
    address: '',
    payment: 'MTN Mobile Money',
    paymentPhone: '',
    notes: '',
  })

  const [adminMode, setAdminMode] = useState(false)
  const [adminLoggedIn, setAdminLoggedIn] = useState(false)
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminPage, setAdminPage] = useState('dashboard')

  const [adminSetup, setAdminSetup] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [setupError, setSetupError] = useState('')

  const [productForm, setProductForm] = useState(emptyProduct)
  const [editingProductId, setEditingProductId] = useState(null)
  const [productMessage, setProductMessage] = useState('')

  const adminExists = Boolean(
    localStorage.getItem('shh_admin_username'),
  )

  useEffect(() => {
    localStorage.setItem('shh_products', JSON.stringify(products))
  }, [products])

  const rw = language === 'RW'

  const translations = {
    home: rw ? 'Ahabanza' : 'Home',
    about: rw ? 'Abo Turibo' : 'About Us',
    products: rw ? 'Ibicuruzwa' : 'Products',
    services: rw ? 'Serivisi' : 'Services',
    contact: rw ? 'Twandikire' : 'Contact',
    explore: rw ? 'Reba Ibicuruzwa' : 'Explore Products',
    add: rw ? 'Ongeramo mu Gitebo' : 'Add to Cart',
    cart: rw ? 'Igitebo Cyawe' : 'Your Cart',
  }

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0,
  )

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      filter === 'all' || product.category === filter

    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const addToCart = (product) => {
    if (product.stock <= 0) return

    setCart((current) => {
      const existing = current.find(
        (item) => item.id === product.id,
      )

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  product.stock,
                ),
              }
            : item,
        )
      }

      return [...current, { ...product, quantity: 1 }]
    })
  }

  const changeQuantity = (id, amount) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== id) return item

          const product = products.find((p) => p.id === id)
          const quantity = item.quantity + amount

          if (quantity <= 0) return null
          if (product && quantity > product.stock) return item

          return { ...item, quantity }
        })
        .filter(Boolean),
    )
  }

  const removeFromCart = (id) => {
    setCart((current) =>
      current.filter((item) => item.id !== id),
    )
  }

  const handleCheckoutInput = (event) => {
    const { name, value } = event.target
    setCheckout((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const submitOrder = (event) => {
    event.preventDefault()

    if (cart.length === 0) {
      setOrderMessage('Your cart is empty.')
      return
    }

    if (
      checkout.delivery === 'delivery' &&
      !checkout.address.trim()
    ) {
      setOrderMessage('Please enter your delivery address.')
      return
    }

    setOrderMessage(
      'Order preview completed. This is not a real order yet. Backend and payment integration are required.',
    )
  }

  const openAdmin = () => {
    setAdminMode(true)
    setAdminLoggedIn(false)
    setAdminError('')
    setSetupError('')
  }

  const handleAdminSetup = (event) => {
    event.preventDefault()

    if (adminSetup.username.trim().length < 3) {
      setSetupError('Username must have at least 3 characters.')
      return
    }

    if (adminSetup.password.length < 8) {
      setSetupError('Password must have at least 8 characters.')
      return
    }

    if (
      adminSetup.password !== adminSetup.confirmPassword
    ) {
      setSetupError('Passwords do not match.')
      return
    }

    localStorage.setItem(
      'shh_admin_username',
      adminSetup.username.trim(),
    )
    localStorage.setItem(
      'shh_admin_password',
      adminSetup.password,
    )

    setAdminSetup({
      username: '',
      password: '',
      confirmPassword: '',
    })
    setSetupError('')
  }

  const handleAdminLogin = (event) => {
    event.preventDefault()

    const savedUsername = localStorage.getItem(
      'shh_admin_username',
    )
    const savedPassword = localStorage.getItem(
      'shh_admin_password',
    )

    if (
      adminUsername.trim() === savedUsername &&
      adminPassword === savedPassword
    ) {
      setAdminLoggedIn(true)
      setAdminError('')
      setAdminUsername('')
      setAdminPassword('')
      setAdminPage('dashboard')
    } else {
      setAdminError('Incorrect username or password.')
    }
  }

  const handleAdminLogout = () => {
    setAdminLoggedIn(false)
    setAdminMode(false)
    setAdminPage('dashboard')
  }

  const handleProductInput = (event) => {
    const { name, value } = event.target
    setProductForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleProductImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setProductMessage('Please select a valid image.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setProductMessage('Image must be smaller than 2MB.')
      return
    }

    const reader = new FileReader()

    reader.onloadend = () => {
      setProductForm((current) => ({
        ...current,
        image: reader.result,
      }))
      setProductMessage('')
    }

    reader.readAsDataURL(file)
  }

  const resetProductForm = () => {
    setProductForm(emptyProduct)
    setEditingProductId(null)
    setProductMessage('')
  }

  const handleSaveProduct = (event) => {
    event.preventDefault()

    const price = Number(productForm.price)
    const stock = Number(productForm.stock)

    if (
      !productForm.name.trim() ||
      !productForm.description.trim()
    ) {
      setProductMessage('Enter product name and description.')
      return
    }

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setProductMessage('Enter a valid price and stock quantity.')
      return
    }

    const updatedProduct = {
      ...productForm,
      id: editingProductId || Date.now(),
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price,
      stock,
    }

    if (editingProductId) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingProductId
            ? updatedProduct
            : product,
        ),
      )
      setProductMessage('Product updated successfully!')
    } else {
      setProducts((current) => [
        ...current,
        updatedProduct,
      ])
      setProductMessage('Product added successfully!')
    }

    setEditingProductId(null)
    setProductForm(emptyProduct)
  }

  const handleEditProduct = (product) => {
    setProductForm({
      ...product,
      price: String(product.price),
      stock: String(product.stock),
    })
    setEditingProductId(product.id)
    setProductMessage('')
    setAdminPage('products')
  }

  const handleDeleteProduct = (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this product?',
      )
    ) {
      return
    }

    setProducts((current) =>
      current.filter((product) => product.id !== id),
    )

    setCart((current) =>
      current.filter((item) => item.id !== id),
    )

    setProductMessage('Product deleted successfully!')
  }

  if (adminMode && !adminLoggedIn) {
    return (
      <div className="admin-auth-page">
        <div className="admin-auth-card">
          <div className="admin-logo">🌱</div>
          <h1>Smart Harvest Hub</h1>
          <p className="admin-subtitle">Farm Administration</p>

          {!adminExists ? (
            <>
              <h2>Create Admin Account</h2>
              <p>Set your own username and password.</p>

              <form onSubmit={handleAdminSetup}>
                <label>Username</label>
                <input
                  value={adminSetup.username}
                  onChange={(e) =>
                    setAdminSetup({
                      ...adminSetup,
                      username: e.target.value,
                    })
                  }
                  required
                />

                <label>Password</label>
                <input
                  type="password"
                  value={adminSetup.password}
                  onChange={(e) =>
                    setAdminSetup({
                      ...adminSetup,
                      password: e.target.value,
                    })
                  }
                  required
                />

                <label>Confirm Password</label>
                <input
                  type="password"
                  value={adminSetup.confirmPassword}
                  onChange={(e) =>
                    setAdminSetup({
                      ...adminSetup,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />

                {setupError && (
                  <p className="admin-error">{setupError}</p>
                )}

                <button className="admin-primary-button">
                  Create Admin Account
                </button>
              </form>
            </>
          ) : (
            <>
              <h2>Admin Login</h2>
              <p>Enter your administrator credentials.</p>

              <form onSubmit={handleAdminLogin}>
                <label>Username</label>
                <input
                  value={adminUsername}
                  onChange={(e) =>
                    setAdminUsername(e.target.value)
                  }
                  required
                />

                <label>Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) =>
                    setAdminPassword(e.target.value)
                  }
                  required
                />

                {adminError && (
                  <p className="admin-error">{adminError}</p>
                )}

                <button className="admin-primary-button">
                  Login
                </button>
              </form>
            </>
          )}

          <button
            className="admin-back-button full-button"
            onClick={() => setAdminMode(false)}
          >
            Back to Website
          </button>
        </div>
      </div>
    )
  }

  if (adminMode && adminLoggedIn) {
    return (
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <span>🌱</span>
            <div>
              <strong>Smart Harvest</strong>
              <small>Admin Panel</small>
            </div>
          </div>

          <nav className="admin-menu">
            {[
              ['dashboard', '▦ Dashboard'],
              ['products', '📦 Products'],
              ['stock', '📊 Stock Overview'],
              ['settings', '⚙️ Settings'],
            ].map(([page, label]) => (
              <button
                key={page}
                className={adminPage === page ? 'active' : ''}
                onClick={() => setAdminPage(page)}
              >
                {label}
              </button>
            ))}
          </nav>

          <button
            className="admin-logout"
            onClick={handleAdminLogout}
          >
            ↩ Logout
          </button>
        </aside>

        <main className="admin-main">
          <header className="admin-topbar">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Manage your farm business</p>
            </div>
            <button onClick={() => setAdminMode(false)}>
              View Website
            </button>
          </header>

          {adminPage === 'dashboard' && (
            <>
              <div className="admin-welcome">
                <h2>Welcome to Smart Harvest Hub</h2>
                <p>Here is your farm business overview.</p>
              </div>

              <div className="admin-stats">
                <div className="admin-stat-card">
                  <span>📦</span>
                  <p>Total Products</p>
                  <strong>{products.length}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>✅</span>
                  <p>Available Products</p>
                  <strong>
                    {products.filter((p) => p.stock > 0).length}
                  </strong>
                </div>
                <div className="admin-stat-card">
                  <span>🐔</span>
                  <p>Total Stock</p>
                  <strong>
                    {products.reduce(
                      (sum, p) => sum + Number(p.stock),
                      0,
                    )}
                  </strong>
                </div>
                <div className="admin-stat-card">
                  <span>🛒</span>
                  <p>Cart Items</p>
                  <strong>{totalItems}</strong>
                </div>
              </div>

              <div className="admin-panel">
                <h2>Products Overview</h2>
                <ProductTable
                  products={products}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              </div>
            </>
          )}

          {adminPage === 'products' && (
            <section className="admin-panel">
              <h2>Product Management</h2>
              <p>Add, edit and manage your farm products.</p>

              <form
                className="admin-product-form"
                onSubmit={handleSaveProduct}
              >
                <h3>
                  {editingProductId
                    ? 'Edit Product'
                    : 'Add New Product'}
                </h3>

                <label>Product Name *</label>
                <input
                  name="name"
                  value={productForm.name}
                  onChange={handleProductInput}
                  placeholder="Example: Goats"
                  required
                />

                <label>Description *</label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductInput}
                  required
                />

                <div className="form-row">
                  <div>
                    <label>Category</label>
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleProductInput}
                    >
                      <option value="livestock">Livestock</option>
                      <option value="eggs">Eggs</option>
                    </select>
                  </div>

                  <div>
                    <label>Icon</label>
                    <input
                      name="icon"
                      value={productForm.icon}
                      onChange={handleProductInput}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div>
                    <label>Price (RWF) *</label>
                    <input
                      type="number"
                      min="0"
                      name="price"
                      value={productForm.price}
                      onChange={handleProductInput}
                      required
                    />
                  </div>

                  <div>
                    <label>Stock *</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      name="stock"
                      value={productForm.stock}
                      onChange={handleProductInput}
                      required
                    />
                  </div>
                </div>

                <label>Unit</label>
                <input
                  name="unit"
                  value={productForm.unit}
                  onChange={handleProductInput}
                  placeholder="Per animal, per tray..."
                />

                <label>Product Image (Maximum 2MB)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProductImage}
                />

                {productForm.image && (
                  <img
                    src={productForm.image}
                    alt="Product preview"
                    className="admin-image-preview"
                  />
                )}

                {productMessage && (
                  <p
                    className={
                      productMessage.includes('successfully')
                        ? 'admin-success'
                        : 'admin-error'
                    }
                  >
                    {productMessage}
                  </p>
                )}

                <div className="admin-form-actions">
                  <button
                    type="submit"
                    className="admin-primary-button"
                  >
                    {editingProductId
                      ? 'Update Product'
                      : 'Add Product'}
                  </button>

                  {editingProductId && (
                    <button
                      type="button"
                      className="admin-back-button"
                      onClick={resetProductForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <h2>Registered Products ({products.length})</h2>

              <ProductTable
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            </section>
          )}

          {adminPage === 'stock' && (
            <section className="admin-panel">
              <h2>Stock Overview</h2>
              <p>Monitor your farm product quantities.</p>

              <div className="stock-list">
                {products.map((product) => (
                  <div className="stock-item" key={product.id}>
                    <div>
                      <strong>
                        {product.icon} {product.name}
                      </strong>
                      <small>{product.unit}</small>
                    </div>

                    <strong>{product.stock} in stock</strong>

                    <span
                      className={
                        product.stock > 10
                          ? 'stock-good'
                          : product.stock > 0
                            ? 'stock-low'
                            : 'stock-empty'
                      }
                    >
                      {product.stock > 10
                        ? 'Available'
                        : product.stock > 0
                          ? 'Low Stock'
                          : 'Out of Stock'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {adminPage === 'settings' && (
            <section className="admin-panel">
              <h2>Settings</h2>
              <div className="settings-information">
                <h3>Farm Information</h3>
                <p><strong>Business:</strong> Smart Harvest Hub</p>
                <p><strong>Location:</strong> Gicumbi District, Northern Province, Rwanda</p>
                <p><strong>Languages:</strong> English and Kinyarwanda</p>
                <p><strong>Payments planned:</strong> MTN and Airtel Money</p>
              </div>
              <p className="settings-warning">
                Secure account management will be connected to the backend.
              </p>
            </section>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="website">
      <header className="navbar">
        <a href="#home" className="brand">
          <span className="brand-icon">🌱</span>
          <span>
            <strong>Smart Harvest</strong>
            <small>HUB</small>
          </span>
        </a>

        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Toggle navigation"
        >
          {mobileMenu ? '✕' : '☰'}
        </button>

        <nav className={`nav-links ${mobileMenu ? 'nav-open' : ''}`}>
          <a href="#home" onClick={() => setMobileMenu(false)}>
            {translations.home}
          </a>
          <a href="#about" onClick={() => setMobileMenu(false)}>
            {translations.about}
          </a>
          <a href="#products" onClick={() => setMobileMenu(false)}>
            {translations.products}
          </a>
          <a href="#services" onClick={() => setMobileMenu(false)}>
            {translations.services}
          </a>
          <a href="#contact" onClick={() => setMobileMenu(false)}>
            {translations.contact}
          </a>
        </nav>

        <div className="nav-actions">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="language-select"
            aria-label="Choose language"
          >
            <option value="EN">EN</option>
            <option value="RW">RW</option>
          </select>

          <button
            className="cart-button"
            onClick={() => setShowCart(true)}
          >
            🛒 <span>{totalItems}</span>
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-shade">
            <div className="hero-content">
              <span className="hero-label">
                <span className="hero-dot"></span>
                SMART FARMING • QUALITY PRODUCTS
              </span>

              <h1>
                {rw
                  ? 'Ubwiza bw’Umurima, Bugezwa Kuri Wowe.'
                  : 'Growing Quality. Delivering Trust.'}
              </h1>

              <p>
                {rw
                  ? 'Tuguha amatungo meza n’ibikomoka ku murima byujuje ubuziranenge.'
                  : 'Discover quality livestock and fresh farm products, directly from our farm to your home.'}
              </p>

              <div className="hero-buttons">
                <a href="#products" className="primary-hero-button">
                  {translations.explore} <span>→</span>
                </a>
                <a href="#about" className="secondary-hero-button">
                  {translations.about}
                </a>
              </div>

              <div className="hero-trust">
                <span>✓ Quality farm products</span>
                <span>✓ Reliable delivery</span>
                <span>✓ Customer focused</span>
              </div>
            </div>
          </div>
        </section>

        <section className="quick-benefits">
          <div className="benefit-card">
            <span>🌿</span>
            <div>
              <strong>Quality Products</strong>
              <small>Carefully raised livestock</small>
            </div>
          </div>

          <div className="benefit-card">
            <span>🚚</span>
            <div>
              <strong>Reliable Delivery</strong>
              <small>Across Rwanda</small>
            </div>
          </div>

          <div className="benefit-card">
            <span>🏡</span>
            <div>
              <strong>Farm Pickup</strong>
              <small>Collect directly from us</small>
            </div>
          </div>

          <div className="benefit-card">
            <span>🤝</span>
            <div>
              <strong>Trusted Service</strong>
              <small>We value our customers</small>
            </div>
          </div>
        </section>

        <section className="about-section section" id="about">
          <div className="about-image">
            <img src={chickenFarm} alt="Smart Harvest Hub farm" />
            <div className="image-caption">
              <span>🌱</span>
              <div>
                <strong>Smart Harvest Hub</strong>
                <small>Growing with purpose</small>
              </div>
            </div>
          </div>

          <div className="about-content">
            <span className="section-label">ABOUT OUR FARM</span>
            <h2>
              Bringing Farm Quality Closer To You
            </h2>
            <p>
              Smart Harvest Hub is a livestock and agricultural
              business focused on providing quality farm products
              to customers.
            </p>
            <p>
              We make it easier for customers to explore farm
              products, place orders and choose convenient delivery
              or farm pickup.
            </p>

            <div className="about-highlights">
              <div><span>✓</span> Customer-focused service</div>
              <div><span>✓</span> Convenient ordering</div>
              <div><span>✓</span> Farm delivery and pickup</div>
            </div>

            <a href="#products" className="text-link">
              Explore our products →
            </a>
          </div>
        </section>

        <section className="products-section section" id="products">
          <div className="section-heading">
            <span className="section-label">FROM OUR FARM</span>
            <h2>Explore Our Products</h2>
            <p>
              Discover our livestock and fresh farm products.
            </p>
          </div>

          <div className="product-toolbar">
            <div className="product-filters">
              {[
                ['all', 'All Products'],
                ['livestock', 'Livestock'],
                ['eggs', 'Eggs'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={filter === value ? 'filter-active' : ''}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <input
              className="product-search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="products-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <button
                  className="product-image"
                  onClick={() => setSelectedProduct(product)}
                  aria-label={`View ${product.name}`}
                >
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <span className="product-emoji">
                      {product.icon}
                    </span>
                  )}

                  {product.stock <= 0 && (
                    <span className="coming-badge">
                      Coming Soon
                    </span>
                  )}
                </button>

                <div className="product-info">
                  <span className="product-category">
                    {product.category === 'eggs'
                      ? 'FARM EGGS'
                      : 'LIVESTOCK'}
                  </span>

                  <h3>{product.name}</h3>
                  <p>{product.description}</p>

                  <div className="product-price">
                    {product.price > 0
                      ? formatPrice(product.price)
                      : 'Price coming soon'}
                  </div>

                  <small>
                    {product.stock > 0
                      ? `${product.stock} available`
                      : 'Currently unavailable'}
                  </small>

                  <div className="product-actions">
                    <button
                      className="details-button"
                      onClick={() => setSelectedProduct(product)}
                    >
                      Details
                    </button>

                    <button
                      className="add-button"
                      disabled={product.stock <= 0}
                      onClick={() => addToCart(product)}
                    >
                      {translations.add}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="no-products">
              No products found. Try another search.
            </div>
          )}
        </section>

        <section className="services-section section" id="services">
          <div className="section-heading">
            <span className="section-label">WHAT WE OFFER</span>
            <h2>Our Services</h2>
            <p>Making farm product shopping easier and more convenient.</p>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <span>🐓</span>
              <h3>Livestock Sales</h3>
              <p>Explore livestock products available from our farm.</p>
            </div>

            <div className="service-card">
              <span>🥚</span>
              <h3>Fresh Farm Products</h3>
              <p>Find fresh eggs and other products from our farm.</p>
            </div>

            <div className="service-card">
              <span>🚚</span>
              <h3>Home Delivery</h3>
              <p>Choose convenient delivery for your farm purchases.</p>
            </div>

            <div className="service-card">
              <span>🏡</span>
              <h3>Farm Pickup</h3>
              <p>Visit our farm and collect your selected products.</p>
            </div>
          </div>
        </section>

        <section className="delivery-section">
          <div>
            <span className="section-label">DELIVERY & PICKUP</span>
            <h2>Your Farm Products, Your Convenience</h2>
            <p>
              Choose nationwide delivery in Rwanda or collect
              your products directly from our farm.
            </p>
            <a href="#contact" className="delivery-button">
              Contact Us →
            </a>
          </div>

          <div className="delivery-options">
            <div><span>🚚</span><strong>Nationwide Delivery</strong></div>
            <div><span>🏡</span><strong>Farm Pickup</strong></div>
          </div>
        </section>

        <section className="contact-section section" id="contact">
          <div className="section-heading">
            <span className="section-label">GET IN TOUCH</span>
            <h2>Let's Talk About Your Needs</h2>
            <p>We look forward to serving you.</p>
          </div>

          <div className="contact-grid">
            <div className="contact-card">
              <span>📍</span>
              <h3>Our Location</h3>
              <p>Gicumbi District, Northern Province, Rwanda</p>
            </div>

            <div className="contact-card">
              <span>📞</span>
              <h3>Phone</h3>
              <p>Contact number will be added soon.</p>
            </div>

            <div className="contact-card">
              <span>✉️</span>
              <h3>Email</h3>
              <p>Email address will be added soon.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <h2>🌱 Smart Harvest Hub</h2>
            <p>
              Growing quality. Delivering trust.
            </p>
            <p>
              Your trusted destination for quality farm products.
            </p>
          </div>

          <div>
            <h3>Quick Links</h3>
            <a href="#home">Home</a>
            <a href="#about">About Us</a>
            <a href="#products">Products</a>
            <a href="#contact">Contact</a>
          </div>

          <div>
            <h3>Our Services</h3>
            <a href="#services">Livestock Sales</a>
            <a href="#services">Fresh Eggs</a>
            <a href="#services">Farm Delivery</a>
            <a href="#services">Farm Pickup</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Smart Harvest Hub.
            All rights reserved.
          </span>
          <button onClick={openAdmin}>Admin Login</button>
        </div>
      </footer>

      {selectedProduct && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="modal product-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedProduct(null)}
            >
              ×
            </button>

            {selectedProduct.image ? (
              <img src={selectedProduct.image} alt={selectedProduct.name} />
            ) : (
              <div className="modal-emoji">
                {selectedProduct.icon}
              </div>
            )}

            <span className="section-label">PRODUCT DETAILS</span>
            <h2>{selectedProduct.name}</h2>
            <p>{selectedProduct.description}</p>
            <h3>{formatPrice(selectedProduct.price)}</h3>
            <p>Available stock: {selectedProduct.stock}</p>

            <button
              className="add-button wide-button"
              disabled={selectedProduct.stock <= 0}
              onClick={() => {
                addToCart(selectedProduct)
                setSelectedProduct(null)
                setShowCart(true)
              }}
            >
              {translations.add}
            </button>
          </div>
        </div>
      )}

      {showCart && (
        <div
          className="modal-backdrop"
          onClick={() => setShowCart(false)}
        >
          <div
            className="modal cart-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowCart(false)}
            >
              ×
            </button>

            <h2>{translations.cart}</h2>

            {cart.length === 0 ? (
              <p className="empty-cart">
                Your shopping cart is empty.
              </p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div className="cart-item-icon">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          item.icon
                        )}
                      </div>

                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        <small>{formatPrice(item.price)}</small>

                        <div className="quantity-controls">
                          <button onClick={() => changeQuantity(item.id, -1)}>
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => changeQuantity(item.id, 1)}>
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        className="remove-button"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <strong>Total</strong>
                  <strong>{formatPrice(cartTotal)}</strong>
                </div>

                <button
                  className="add-button wide-button"
                  onClick={() => {
                    setShowCart(false)
                    setShowCheckout(true)
                    setOrderMessage('')
                  }}
                >
                  Proceed to Checkout
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showCheckout && (
        <div
          className="modal-backdrop"
          onClick={() => setShowCheckout(false)}
        >
          <div
            className="modal checkout-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowCheckout(false)}
            >
              ×
            </button>

            <h2>Checkout</h2>
            <p className="checkout-intro">
              Enter your information to review your order.
            </p>

            <form className="checkout-form" onSubmit={submitOrder}>
              <label>Full Name *</label>
              <input
                name="name"
                value={checkout.name}
                onChange={handleCheckoutInput}
                required
              />

              <label>Phone Number *</label>
              <input
                name="phone"
                value={checkout.phone}
                onChange={handleCheckoutInput}
                required
              />

              <div className="form-row">
                <div>
                  <label>District *</label>
                  <input
                    name="district"
                    value={checkout.district}
                    onChange={handleCheckoutInput}
                    required
                  />
                </div>

                <div>
                  <label>Province *</label>
                  <input
                    name="province"
                    value={checkout.province}
                    onChange={handleCheckoutInput}
                    required
                  />
                </div>
              </div>

              <label>Delivery Method</label>
              <select
                name="delivery"
                value={checkout.delivery}
                onChange={handleCheckoutInput}
              >
                <option value="delivery">Home Delivery</option>
                <option value="pickup">Farm Pickup</option>
              </select>

              {checkout.delivery === 'delivery' && (
                <>
                  <label>Delivery Address *</label>
                  <textarea
                    name="address"
                    value={checkout.address}
                    onChange={handleCheckoutInput}
                    required
                  />
                </>
              )}

              <label>Payment Method</label>
              <select
                name="payment"
                value={checkout.payment}
                onChange={handleCheckoutInput}
              >
                <option>MTN Mobile Money</option>
                <option>Airtel Money</option>
              </select>

              <label>Payment Phone Number *</label>
              <input
                name="paymentPhone"
                value={checkout.paymentPhone}
                onChange={handleCheckoutInput}
                required
              />

              <label>Additional Notes</label>
              <textarea
                name="notes"
                value={checkout.notes}
                onChange={handleCheckoutInput}
              />

              <div className="checkout-total">
                <span>Order Total</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>

              {orderMessage && (
                <p className="order-message">{orderMessage}</p>
              )}

              <button
                type="submit"
                className="add-button wide-button"
              >
                Review Order
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <span className="table-product">
                  {product.image ? (
                    <img src={product.image} alt="" />
                  ) : (
                    product.icon
                  )}
                  {product.name}
                </span>
              </td>

              <td>{formatPrice(product.price)}</td>
              <td>{product.stock}</td>

              <td>
                <span
                  className={
                    product.stock > 0
                      ? 'status-available'
                      : 'status-unavailable'
                  }
                >
                  {product.stock > 0 ? 'Available' : 'Unavailable'}
                </span>
              </td>

              <td className="table-actions">
                <button
                  className="admin-edit-button"
                  onClick={() => onEdit(product)}
                >
                  Edit
                </button>
                <button
                  className="admin-delete-button"
                  onClick={() => onDelete(product.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App