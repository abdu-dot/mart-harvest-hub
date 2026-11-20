import { useEffect, useMemo, useState } from 'react'
import chickenFarm from './assets/chicken-farm.png'
import './App.css'

const initialProducts = [
  { id: 1, name: 'Chickens', description: 'Healthy chickens raised with proper care.', category: 'livestock', price: 8000, unit: 'Per chicken', stock: 500, icon: '🐔', image: '' },
  { id: 2, name: 'Pigs', description: 'Healthy pigs raised in a clean environment.', category: 'livestock', price: 120000, unit: 'Per pig', stock: 200, icon: '🐖', image: '' },
  { id: 3, name: 'Fresh Eggs', description: 'Fresh farm eggs collected carefully.', category: 'products', price: 4000, unit: 'Per tray', stock: 50, icon: '🥚', image: '' },
]

const defaultSettings = {
  name: 'Smart Harvest Hub',
  phone: '+250 788 000 000',
  email: 'info@smartharvesthub.com',
  address: 'Gicumbi District, Giti Sector, Ruzizi Cell, Rwanda',
}

const today = () => new Date().toISOString().slice(0, 10)
const money = (value) => `${Number(value || 0).toLocaleString()} RWF`
const readStore = (key, fallback) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [language, setLanguage] = useState('en')
  const [products, setProducts] = useState(() => readStore('shh_products', initialProducts))
  const [groups, setGroups] = useState(() => readStore('shh_groups', []))
  const [records, setRecords] = useState(() => readStore('shh_farm_records', []))
  const [transfers, setTransfers] = useState(() => readStore('shh_bank_transfers', []))
  const [orders, setOrders] = useState(() => readStore('shh_orders', []))
  const [settings, setSettings] = useState(() => readStore('shh_settings', defaultSettings))
  const [bankDetails, setBankDetails] = useState(() => readStore('shh_bank_details', { bank: 'Bank of Kigali (BK)', accountName: '', accountNumber: '' }))

  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [notice, setNotice] = useState('')

  const [adminLoggedIn, setAdminLoggedIn] = useState(false)
  const [authView, setAuthView] = useState('hidden')
  const [adminPage, setAdminPage] = useState('dashboard')
  const [adminUsername, setAdminUsername] = useState(localStorage.getItem('shh_admin_username') || '')
  const [adminEmail, setAdminEmail] = useState(localStorage.getItem('shh_admin_email') || '')
  const [adminPassword, setAdminPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [resetEmail, setResetEmail] = useState('')

  const [productModal, setProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const emptyProduct = { name: '', description: '', category: 'livestock', price: '', unit: '', stock: '', icon: '🐔', image: '' }
  const [productForm, setProductForm] = useState(emptyProduct)
  const [adminSearch, setAdminSearch] = useState('')

  const [groupModal, setGroupModal] = useState(false)
  const [groupForm, setGroupForm] = useState({ name: '', animalType: 'Chicken', quantity: '', startDate: today(), notes: '' })
  const [editingGroup, setEditingGroup] = useState(null)

  const [recordForm, setRecordForm] = useState({ date: today(), groupId: '', type: 'feed', description: '', quantity: '', unit: 'kg', amount: '', notes: '' })
  const [financeDate, setFinanceDate] = useState(today())
  const [transferForm, setTransferForm] = useState({ amount: '', note: '' })
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', payment: 'MTN Mobile Money', delivery: 'Home Delivery' })

  const rw = language === 'rw'
  const tr = (en, kin) => rw ? kin : en

  useEffect(() => localStorage.setItem('shh_products', JSON.stringify(products)), [products])
  useEffect(() => localStorage.setItem('shh_groups', JSON.stringify(groups)), [groups])
  useEffect(() => localStorage.setItem('shh_farm_records', JSON.stringify(records)), [records])
  useEffect(() => localStorage.setItem('shh_bank_transfers', JSON.stringify(transfers)), [transfers])
  useEffect(() => localStorage.setItem('shh_orders', JSON.stringify(orders)), [orders])
  useEffect(() => localStorage.setItem('shh_settings', JSON.stringify(settings)), [settings])
  useEffect(() => localStorage.setItem('shh_bank_details', JSON.stringify(bankDetails)), [bankDetails])

  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setAuthView('login')
        setLoginPassword('')
      }
    }
    checkHash()
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  const totalStock = useMemo(() => products.reduce((sum, p) => sum + Number(p.stock || 0), 0), [products])
  const inventoryValue = useMemo(() => products.reduce((sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0), 0), [products])
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const filteredProducts = products.filter(p => {
    const term = search.toLowerCase()
    return (p.name || '').toLowerCase().includes(term) &&
      (category === 'all' || p.category === category)
  })
  const filteredAdminProducts = products.filter(p => (p.name || '').toLowerCase().includes(adminSearch.toLowerCase()))

  const dailyRecords = records.filter(r => r.date === financeDate)
  const dailyIncome = dailyRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + Number(r.amount || 0), 0)
  const dailyExpenses = dailyRecords.filter(r => r.type !== 'income').reduce((sum, r) => sum + Number(r.amount || 0), 0)
  const dailyBalance = dailyIncome - dailyExpenses
  const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + Number(r.amount || 0), 0)
  const totalExpenses = records.filter(r => r.type !== 'income').reduce((sum, r) => sum + Number(r.amount || 0), 0)
  const lowStockProducts = products.filter(p => Number(p.stock || 0) <= 10)
  const notifications = [
    ...orders.slice(0, 8).map((o, i) => ({ id: `order-${o.createdAt || i}`, icon: '🛒', title: 'New order received', detail: `${o.customer?.name || 'Customer'} · ${money(o.total)}`, date: o.createdAt || '' })),
    ...lowStockProducts.map(p => ({ id: `stock-${p.id}`, icon: '⚠️', title: 'Low stock alert', detail: `${p.name}: ${p.stock} ${p.unit || 'available'}`, date: '' })),
    ...transfers.slice(0, 5).map(t => ({ id: `transfer-${t.id}`, icon: '🏦', title: 'Bank transfer request', detail: `${money(t.amount)} · ${t.status}`, date: t.date || '' }))
  ]

  function notify(message) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3200)
  }

  function addToCart(product) {
    if (product.stock <= 0) return notify(tr('Out of stock', 'Nta bicuruzwa bihari'))
    setCart(current => {
      const found = current.find(i => i.id === product.id)
      if (found) {
        if (found.quantity >= product.stock) {
          notify(tr('Available stock limit reached.', 'Mugeze ku mubare wa stock uhari.'))
          return current
        }
        return current.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...current, { ...product, quantity: 1 }]
    })
    notify(tr('Added to cart.', 'Igicuruzwa cyashyizwe mu gafuka.'))
  }

  function updateCart(id, amount) {
    const product = products.find(p => p.id === id)
    if (!product) return
    setCart(current => current.map(i => i.id === id ? { ...i, quantity: Math.min(product.stock, Math.max(0, i.quantity + amount)) } : i).filter(i => i.quantity > 0))
  }

  function saveProduct(event) {
    event.preventDefault()
    const data = { ...productForm, name: productForm.name.trim(), price: Number(productForm.price) || 0, stock: Math.max(0, Number(productForm.stock) || 0) }
    if (!data.name) return notify('Product name is required.')
    if (editingProduct) setProducts(current => current.map(p => p.id === editingProduct.id ? { ...p, ...data } : p))
    else setProducts(current => [...current, { ...data, id: Date.now() }])
    setProductModal(false)
    setEditingProduct(null)
    notify(tr('Product saved.', 'Igicuruzwa cyabitswe.'))
  }

  function openProduct(product = null) {
    setEditingProduct(product)
    setProductForm(product ? { ...product } : { ...emptyProduct })
    setProductModal(true)
  }

  function deleteProduct(id) {
    if (!window.confirm('Delete this product?')) return
    setProducts(current => current.filter(p => p.id !== id))
    setCart(current => current.filter(p => p.id !== id))
    notify('Product deleted.')
  }

  function uploadProductImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 3 * 1024 * 1024) return notify('Choose an image smaller than 3MB.')
    const reader = new FileReader()
    reader.onload = () => setProductForm(current => ({ ...current, image: String(reader.result) }))
    reader.readAsDataURL(file)
  }

  function saveGroup(event) {
    event.preventDefault()
    if (!groupForm.name.trim() || Number(groupForm.quantity) < 1) return notify('Enter a group name and a valid quantity.')
    const data = { ...groupForm, quantity: Number(groupForm.quantity) }
    if (editingGroup) setGroups(current => current.map(g => g.id === editingGroup.id ? { ...g, ...data } : g))
    else setGroups(current => [...current, { ...data, id: Date.now() }])
    setGroupModal(false)
    setEditingGroup(null)
    setGroupForm({ name: '', animalType: 'Chicken', quantity: '', startDate: today(), notes: '' })
    notify(tr('Group saved successfully.', 'Itsinda ryabitswe neza.'))
  }

  function openGroup(group = null) {
    setEditingGroup(group)
    setGroupForm(group ? { ...group } : { name: '', animalType: 'Chicken', quantity: '', startDate: today(), notes: '' })
    setGroupModal(true)
  }

  function deleteGroup(id) {
    if (!window.confirm('Delete this livestock group? Existing records will remain.')) return
    setGroups(current => current.filter(g => g.id !== id))
  }

  function saveRecord(event) {
    event.preventDefault()
    if (!recordForm.description.trim() || Number(recordForm.amount) < 0 || !recordForm.amount) return notify('Enter a description and amount.')
    const group = groups.find(g => String(g.id) === String(recordForm.groupId))
    const item = { ...recordForm, id: Date.now(), amount: Number(recordForm.amount), quantity: Number(recordForm.quantity) || 0, groupName: group?.name || 'General Farm' }
    setRecords(current => [item, ...current])
    setRecordForm({ date: today(), groupId: '', type: 'feed', description: '', quantity: '', unit: 'kg', amount: '', notes: '' })
    notify(tr('Farm record saved.', 'Amakuru y’igikorwa yabitswe.'))
  }

  function deleteRecord(id) {
    if (!window.confirm('Delete this farm record?')) return
    setRecords(current => current.filter(r => r.id !== id))
  }

  function saveBankDetails(event) {
    event.preventDefault()
    setBankDetails(current => ({ ...current, bank: 'Bank of Kigali (BK)' }))
    notify('Bank details saved on this browser. Backend security is required before real transfers.')
  }

  function requestTransfer(event) {
    event.preventDefault()
    const amount = Number(transferForm.amount)
    if (!bankDetails.accountName.trim() || !bankDetails.accountNumber.trim()) return notify('Enter the BK account holder and account number first.')
    if (!amount || amount <= 0 || amount > Math.max(0, totalIncome - totalExpenses)) return notify('Enter a valid amount not exceeding the recorded farm balance.')
    setTransfers(current => [{ id: Date.now(), amount, note: transferForm.note, date: today(), status: 'Preview only — not sent' }, ...current])
    setTransferForm({ amount: '', note: '' })
    notify('Transfer request preview saved. No money has been transferred.')
  }

  function createAdmin(event) {
    event.preventDefault()
    if (adminUsername.trim().length < 3) return notify('Username must be at least 3 characters.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) return notify('Enter a valid email.')
    if (adminPassword.length < 8) return notify('Password must be at least 8 characters.')
    if (adminPassword !== confirmPassword) return notify('Passwords do not match.')
    localStorage.setItem('shh_admin_username', adminUsername.trim())
    localStorage.setItem('shh_admin_email', adminEmail.trim())
    localStorage.setItem('shh_admin_password', adminPassword)
    setLoginUsername(adminUsername.trim())
    setAdminPassword('')
    setConfirmPassword('')
    setAuthView('login')
    notify('Admin account created. Please sign in.')
  }

  function loginAdmin(event) {
    event.preventDefault()
    const username = localStorage.getItem('shh_admin_username')
    const password = localStorage.getItem('shh_admin_password')
    if (!username || !password) {
      setAuthView('create')
      return notify('Create the first admin account.')
    }
    if (loginUsername.trim() === username && loginPassword === password) {
      setAdminLoggedIn(true)
      setAuthView('hidden')
      setAdminPage('dashboard')
      notify('Welcome to your farm dashboard.')
    } else notify('Incorrect username or password.')
  }

  function logout() {
    setAdminLoggedIn(false)
    setAdminPage('dashboard')
    setAuthView('hidden')
    setLoginPassword('')
    window.history.replaceState(null, '', window.location.pathname)
  }

  function submitOrder(event) {
    event.preventDefault()
    if (!cart.length) return notify('Your cart is empty.')
    if (customer.delivery === 'Home Delivery' && !customer.address.trim()) return notify('Enter delivery address.')
    const unavailable = cart.some(item => {
      const current = products.find(p => p.id === item.id)
      return !current || current.stock < item.quantity
    })
    if (unavailable) return notify('Some items are no longer available.')
    const order = { customer, items: cart, total: cartTotal, createdAt: new Date().toISOString() }
    setOrders(current => [order, ...current])
    setProducts(current => current.map(p => {
      const item = cart.find(i => i.id === p.id)
      return item ? { ...p, stock: p.stock - item.quantity } : p
    }))
    setCart([])
    setShowCheckout(false)
    setShowCart(false)
    setCustomer({ name: '', phone: '', address: '', payment: 'MTN Mobile Money', delivery: 'Home Delivery' })
    notify('Order preview saved in this browser. Real payment needs backend integration.')
  }

  const navItems = [
    ['dashboard', '📊', tr('Dashboard', 'Imbonerahamwe')],
    ['products', '📦', tr('Products', 'Ibicuruzwa')],
    ['stock', '📋', tr('Stock', 'Stock')],
    ['groups', '🐔', tr('Livestock Groups', 'Amatsinda y’amatungo')],
    ['records', '📝', tr('Farm Records', 'Amakuru y’ubworozi')],
    ['finance', '💰', tr('Daily Finance', 'Imari ya buri munsi')],
    ['bank', '🏦', tr('Bank of Kigali', 'Banki ya Kigali')],
    ['notifications', '🔔', tr('Notifications', 'Amatangazo')],
    ['reports', '📑', tr('Reports', 'Raporo')],
    ['settings', '⚙️', tr('Settings', 'Igenamiterere')],
  ]

  return (
    <div className="app">
      {notice && <div className="toast-message">{notice}</div>}

      {!adminLoggedIn ? (
        <>
          <header className="navbar">
            <a className="logo" href="#home"><span>🌱</span> Smart Harvest Hub</a>
            <nav className="nav-links">
              <a href="#home">{tr('Home', 'Ahabanza')}</a><a href="#products">{tr('Products', 'Ibicuruzwa')}</a><a href="#about">{tr('About', 'Abo turibo')}</a><a href="#services">{tr('Services', 'Serivisi')}</a><a href="#contact">{tr('Contact', 'Twandikire')}</a>
            </nav>
            <div className="nav-actions">
              <select className="language-select" value={language} onChange={e => setLanguage(e.target.value)}><option value="en">English</option><option value="rw">Kinyarwanda</option></select>
              <button className="admin-access-button" type="button" onClick={() => { window.location.hash = 'admin'; setAuthView('login'); setLoginPassword('') }}>🔐 Admin</button>
              <button className="cart-button" onClick={() => setShowCart(true)}>🛒 {tr('Cart', 'Agafuka')} ({cartCount})</button>
            </div>
          </header>

          <main>
            <section className="hero" id="home">
              <div className="hero-content"><span className="hero-tag">🌿 SMART FARMING. BETTER LIVING.</span><h1>{tr('Quality Livestock, Healthy Living', 'Ubworozi Bwiza, Ubuzima Bwiza')}</h1><p>{tr('Your trusted partner for quality livestock and fresh farm products in Rwanda.', 'Umufatanyabikorwa wawe mu kubona amatungo n’ibikomoka ku bworozi byiza mu Rwanda.')}</p><div className="hero-buttons"><button className="primary-button" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>{tr('Explore Products', 'Reba ibicuruzwa')} →</button><button className="secondary-button" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>{tr('Contact Us', 'Twandikire')}</button></div></div>
              <div className="hero-image"><img src={chickenFarm} alt="Livestock farm" /></div>
            </section>
            <section className="section-padding benefits"><div className="section-heading"><span className="section-tag">WHY SMART HARVEST HUB</span><h2>{tr('Why Choose Our Farm?', 'Kuki wahitamo ubworozi bwacu?')}</h2><p>{tr('Quality livestock, careful management and reliable service.', 'Amatungo meza, imicungire myiza na serivisi zizewe.')}</p></div><div className="benefit-grid"><article className="benefit-card"><span>🐓</span><h3>{tr('Quality Products', 'Ibicuruzwa byiza')}</h3><p>{tr('Healthy livestock raised with care.', 'Amatungo yorowe neza kandi yitaweho.')}</p></article><article className="benefit-card"><span>🤝</span><h3>{tr('Trusted Farm', 'Ubworozi bwizewe')}</h3><p>{tr('Reliable service and customer care.', 'Serivisi nziza no kwita ku bakiriya.')}</p></article><article className="benefit-card"><span>🚚</span><h3>{tr('Reliable Delivery', 'Kugeza ibicuruzwa')}</h3><p>{tr('Delivery available across Rwanda.', 'Dugeza ibicuruzwa mu Rwanda hose.')}</p></article></div></section>
            <section className="about-section section-padding" id="about"><div className="about-image"><img src={chickenFarm} alt="Our farm" /></div><div className="about-content"><span className="section-tag">ABOUT SMART HARVEST HUB</span><h2>{tr('About Our Farm', 'Abo turibo')}</h2><p>{tr('Smart Harvest Hub is committed to providing quality livestock and fresh farm products.', 'Smart Harvest Hub yiyemeje gutanga amatungo n’ibikomoka ku bworozi byiza.')}</p><button className="primary-button" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>{tr('Contact Us', 'Twandikire')} →</button></div></section>
            <section className="products-section section-padding" id="products"><div className="section-heading"><span className="section-tag">OUR FARM STORE</span><h2>{tr('Our Products', 'Ibicuruzwa byacu')}</h2><p>{tr('Explore quality livestock and fresh farm products.', 'Reba amatungo n’ibikomoka ku bworozi byiza.')}</p></div><div className="product-filters"><input type="search" placeholder={tr('Search products...', 'Shakisha ibicuruzwa...')} value={search} onChange={e => setSearch(e.target.value)} /><div className="filter-buttons"><button className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>{tr('All', 'Byose')}</button><button className={category === 'livestock' ? 'active' : ''} onClick={() => setCategory('livestock')}>{tr('Livestock', 'Amatungo')}</button><button className={category === 'products' ? 'active' : ''} onClick={() => setCategory('products')}>{tr('Farm Products', 'Ibikomoka ku bworozi')}</button></div></div><div className="product-grid">{filteredProducts.map(p => <article className="product-card" key={p.id}><div className="product-image">{p.image ? <img src={p.image} alt={p.name} /> : <span>{p.icon || '🌱'}</span>}</div><div className="product-info"><span className="product-category">{p.category}</span><h3>{p.name}</h3><p>{p.description}</p><strong>{p.price ? money(p.price) : 'Contact for price'}</strong><small>{p.stock} {p.unit || 'available'}</small><div className="product-card-actions"><button className="secondary-button" onClick={() => setSelectedProduct(p)}>{tr('Details', 'Birambuye')}</button><button className="primary-button" disabled={p.stock <= 0} onClick={() => addToCart(p)}>{tr('Add to Cart', 'Shyira mu gafuka')}</button></div></div></article>)}</div>{!filteredProducts.length && <p className="empty-message">No products found.</p>}</section>
            <section className="services-section section-padding" id="services"><div className="section-heading"><span className="section-tag">WHAT WE DO</span><h2>{tr('Our Services', 'Serivisi zacu')}</h2></div><div className="services-grid"><article className="service-card"><span>🐄</span><h3>{tr('Livestock Sales', 'Kugurisha amatungo')}</h3></article><article className="service-card"><span>🥚</span><h3>{tr('Farm Product Sales', 'Kugurisha ibikomoka ku bworozi')}</h3></article><article className="service-card"><span>🚚</span><h3>{tr('Delivery Services', 'Kugeza ibicuruzwa')}</h3></article></div></section>
            <section className="delivery-section section-padding"><div className="section-heading"><span className="section-tag">DELIVERY & COLLECTION</span><h2>{tr('Delivery Information', 'Amakuru yo kugeza ibicuruzwa')}</h2><p>{tr('Delivery across Rwanda or collect directly from our farm.', 'Dugeza ibicuruzwa mu Rwanda hose cyangwa ukabitora ku bworozi.')}</p></div><div className="delivery-grid"><article className="delivery-card"><span>🏡</span><h3>{tr('Farm Pickup', 'Kubitora ku bworozi')}</h3></article><article className="delivery-card"><span>🚛</span><h3>{tr('Delivery Across Rwanda', 'Kugeza mu Rwanda hose')}</h3></article></div></section>
            <section className="contact-section section-padding" id="contact"><div className="section-heading"><span className="section-tag">GET IN TOUCH</span><h2>{tr('Contact Us', 'Twandikire')}</h2></div><div className="contact-grid"><div className="contact-card"><span>📍</span><h3>{tr('Location', 'Aho duherereye')}</h3><p>{settings.address}</p></div><div className="contact-card"><span>📞</span><h3>{tr('Phone', 'Telefone')}</h3><p>{settings.phone}</p></div><div className="contact-card"><span>✉️</span><h3>Email</h3><p>{settings.email}</p></div></div></section>
          </main>
          <footer className="footer">
              <h3>🌱 Smart Harvest Hub</h3>
              <p>All rights reserved. © {new Date().getFullYear()}</p>
              <div className="footer-admin">
                <a href="#admin" onClick={() => { setAuthView('login'); setLoginPassword('') }}>
                  Admin Login
                </a>
              </div>
            </footer>
        </>
      ) : (
        <div className="admin-layout">
          <aside className="admin-sidebar"><div className="admin-brand"><span>🌱</span><strong>Smart Harvest Hub</strong></div><nav className="admin-nav">{navItems.map(([key, icon, label]) => <button key={key} className={adminPage === key ? 'active' : ''} onClick={() => setAdminPage(key)}>{icon} {label}</button>)}</nav><button className="admin-logout" onClick={logout}>🚪 {tr('Logout', 'Sohoka')}</button></aside>
          <div className="admin-main"><header className="admin-topbar"><div><h2>{navItems.find(i => i[0] === adminPage)?.[2] || 'Dashboard'}</h2><p>{tr('Farm management system', 'Sisitemu yo gucunga ubworozi')}</p></div><div className="admin-top-actions"><select value={language} onChange={e => setLanguage(e.target.value)}><option value="en">English</option><option value="rw">Kinyarwanda</option></select><span className="admin-user">👤 {adminUsername}</span></div></header>

            {adminPage === 'dashboard' && <section className="admin-content"><div className="dashboard-heading"><div><h2>{tr('Farm Overview', 'Incamake y’ubworozi')}</h2><p>{tr('Monitor your farm activities and performance.', 'Kurikirana ibikorwa n’imikorere y’ubworozi.')}</p></div><button className="primary-button" onClick={() => openProduct()}>+ Add Product</button></div><div className="stats-grid"><Stat icon="📦" title="Products" value={products.length} /><Stat icon="📊" title="Total Stock" value={totalStock.toLocaleString()} /><Stat icon="🐔" title="Livestock Groups" value={groups.length} /><Stat icon="💰" title="All-time Income" value={money(totalIncome)} /><Stat icon="🧾" title="All-time Expenses" value={money(totalExpenses)} /><Stat icon="📈" title="Net Balance" value={money(totalIncome - totalExpenses)} /></div><div className="admin-panel"><div className="panel-heading"><h3>{tr('Today at a glance', 'Incamake y’uyu munsi')}</h3><input type="date" value={financeDate} onChange={e => setFinanceDate(e.target.value)} /></div><div className="stats-grid compact"><Stat icon="⬆️" title="Today's Income" value={money(dailyIncome)} /><Stat icon="⬇️" title="Today's Expenses" value={money(dailyExpenses)} /><Stat icon="💵" title="Today's Balance" value={money(dailyBalance)} /></div></div><div className="admin-panel"><h3>Recent farm records</h3><RecordTable records={records.slice(0, 5)} onDelete={deleteRecord} /></div><div className="admin-panel"><div className="panel-heading"><h3>Recent customer orders</h3><span>{orders.length} total</span></div><OrderTable orders={orders.slice(0, 5)} /></div><div className="admin-panel"><h3>Stock alerts</h3>{lowStockProducts.length ? lowStockProducts.map(p => <p className="alert-row" key={p.id}>⚠️ <strong>{p.name}</strong> — {p.stock} remaining</p>) : <p className="empty-message">All products have sufficient stock.</p>}</div></section>}

            {adminPage === 'products' && <section className="admin-content"><div className="dashboard-heading"><div><h2>Manage Products</h2><p>Add, update and remove products for customers.</p></div><button className="primary-button" onClick={() => openProduct()}>+ Add Product</button></div><div className="admin-panel"><input className="admin-search" placeholder="Search products..." value={adminSearch} onChange={e => setAdminSearch(e.target.value)} /><ProductTable products={filteredAdminProducts} onEdit={openProduct} onDelete={deleteProduct} /></div></section>}

            {adminPage === 'stock' && <section className="admin-content"><div className="dashboard-heading"><div><h2>Stock Management</h2><p>Update available product quantities.</p></div></div><div className="admin-panel"><div className="stock-management-list">{products.map(p => <div className="stock-item" key={p.id}><div className="stock-product-info"><span className="stock-product-icon">{p.icon}</span><div><strong>{p.name}</strong><small>{money(p.price)}</small></div></div><div className="stock-quantity"><strong>{p.stock}</strong><small>{p.unit}</small></div><div className="stock-controls"><button onClick={() => setProducts(c => c.map(x => x.id === p.id ? { ...x, stock: Math.max(0, x.stock - 1) } : x))}>−</button><button onClick={() => setProducts(c => c.map(x => x.id === p.id ? { ...x, stock: x.stock + 1 } : x))}>+</button><button className="admin-edit-button" onClick={() => openProduct(p)}>Edit</button></div></div>)}</div></div></section>}

            {adminPage === 'groups' && <section className="admin-content"><div className="dashboard-heading"><div><h2>Livestock Groups</h2><p>Create a separate group for each batch of animals.</p></div><button className="primary-button" onClick={() => openGroup()}>+ Add Group</button></div><div className="stats-grid compact"><Stat icon="🐔" title="Total Groups" value={groups.length} /><Stat icon="🐾" title="Animals Recorded" value={groups.reduce((s, g) => s + Number(g.quantity || 0), 0)} /></div><div className="group-grid">{groups.map(g => <article className="group-card" key={g.id}><div className="group-card-top"><span className="group-icon">{g.animalType === 'Pig' ? '🐖' : g.animalType === 'Cow' ? '🐄' : g.animalType === 'Goat' ? '🐐' : '🐔'}</span><span className="pill">{g.animalType}</span></div><h3>{g.name}</h3><p><strong>{Number(g.quantity).toLocaleString()}</strong> animals</p><small>Started: {g.startDate}</small>{g.notes && <p>{g.notes}</p>}<div className="form-actions"><button className="admin-edit-button" onClick={() => openGroup(g)}>Edit</button><button className="admin-delete-button" onClick={() => deleteGroup(g.id)}>Delete</button></div></article>)}</div>{!groups.length && <div className="admin-panel empty-state"><span>🐔</span><h3>No groups yet</h3><p>Create your first livestock group to begin tracking feed, medicine and expenses.</p></div>}</section>}

            {adminPage === 'records' && <section className="admin-content"><div className="dashboard-heading"><div><h2>Farm Records</h2><p>Record feed, medicine, other expenses and farm income.</p></div></div><div className="admin-panel"><h3>Add Farm Record</h3><form className="admin-form form-grid" onSubmit={saveRecord}><label>Date<input type="date" value={recordForm.date} onChange={e => setRecordForm({ ...recordForm, date: e.target.value })} required /></label><label>Record type<select value={recordForm.type} onChange={e => setRecordForm({ ...recordForm, type: e.target.value })}><option value="feed">Feed / Ibiryo</option><option value="medicine">Medicine / Imiti</option><option value="expense">Other Expense</option><option value="income">Income / Amafaranga yinjiye</option></select></label><label>Livestock group<select value={recordForm.groupId} onChange={e => setRecordForm({ ...recordForm, groupId: e.target.value })}><option value="">General Farm / Nta tsinda</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.animalType})</option>)}</select></label><label>Description<input value={recordForm.description} onChange={e => setRecordForm({ ...recordForm, description: e.target.value })} placeholder="e.g. Chicken feed, vitamins, egg sales" required /></label><label>Quantity<input type="number" min="0" step="any" value={recordForm.quantity} onChange={e => setRecordForm({ ...recordForm, quantity: e.target.value })} /></label><label>Unit<input value={recordForm.unit} onChange={e => setRecordForm({ ...recordForm, unit: e.target.value })} placeholder="kg, bags, bottles..." /></label><label>Amount (RWF)<input type="number" min="0" value={recordForm.amount} onChange={e => setRecordForm({ ...recordForm, amount: e.target.value })} required /></label><label>Notes<input value={recordForm.notes} onChange={e => setRecordForm({ ...recordForm, notes: e.target.value })} /></label><div className="full-width"><button className="primary-button" type="submit">Save Farm Record</button></div></form></div><div className="admin-panel"><div className="panel-heading"><h3>All Farm Records</h3><span>{records.length} records</span></div><RecordTable records={records} onDelete={deleteRecord} /></div></section>}

            {adminPage === 'finance' && <section className="admin-content"><div className="dashboard-heading"><div><h2>Daily Finance</h2><p>Compare income and farm expenses by date.</p></div><label className="date-filter">Select date<input type="date" value={financeDate} onChange={e => setFinanceDate(e.target.value)} /></label></div><div className="stats-grid"><Stat icon="⬆️" title="Daily Income" value={money(dailyIncome)} /><Stat icon="⬇️" title="Daily Expenses" value={money(dailyExpenses)} /><Stat icon="💵" title="Daily Balance" value={money(dailyBalance)} /></div><div className="stats-grid compact"><Stat icon="📈" title="Total Income" value={money(totalIncome)} /><Stat icon="🧾" title="Total Expenses" value={money(totalExpenses)} /><Stat icon="🏦" title="Net Farm Balance" value={money(totalIncome - totalExpenses)} /></div><div className="admin-panel"><h3>Records for {financeDate}</h3><RecordTable records={dailyRecords} onDelete={deleteRecord} /></div><div className="admin-panel"><h3>Financial note</h3><p>Income and expenses are calculated from the farm records entered by the admin. Keep sales and costs recorded accurately for useful reports.</p></div></section>}

            {adminPage === 'bank' && <section className="admin-content"><div className="dashboard-heading"><div><h2>Bank of Kigali (BK)</h2><p>Manage the farm's payout destination and prepare transfer requests.</p></div></div><div className="notice-panel"><strong>Important:</strong> This is a frontend demonstration only. It does not connect to BK and cannot move money. Real transfers require a secure backend and an approved bank/payment integration. Never enter your PIN, password or OTP here.</div><div className="admin-panel"><h3>Farm Bank Account</h3><form className="admin-form form-grid" onSubmit={saveBankDetails}><label>Bank<input value="Bank of Kigali (BK)" disabled /></label><label>Account holder name<input value={bankDetails.accountName} onChange={e => setBankDetails({ ...bankDetails, accountName: e.target.value })} placeholder="Account holder name" required /></label><label className="full-width">BK account number<input value={bankDetails.accountNumber} onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })} placeholder="Enter account number" required /></label><div className="full-width"><button className="primary-button">Save Bank Details</button></div></form><p className="muted">Prototype note: these details are stored only in this browser. Do not use this local-only version for real banking information.</p></div><div className="admin-panel"><h3>Prepare Transfer Request</h3><p>Recorded net balance: <strong>{money(totalIncome - totalExpenses)}</strong></p><form className="admin-form form-grid" onSubmit={requestTransfer}><label>Amount to transfer (RWF)<input type="number" min="1" max={Math.max(0, totalIncome - totalExpenses)} value={transferForm.amount} onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })} required /></label><label>Note<input value={transferForm.note} onChange={e => setTransferForm({ ...transferForm, note: e.target.value })} placeholder="Optional note" /></label><div className="full-width"><button className="primary-button">Create Transfer Preview</button></div></form></div><div className="admin-panel"><h3>Transfer Request History</h3>{transfers.length ? <div className="table-responsive"><table className="admin-product-table"><thead><tr><th>Date</th><th>Amount</th><th>Note</th><th>Status</th></tr></thead><tbody>{transfers.map(x => <tr key={x.id}><td>{x.date}</td><td>{money(x.amount)}</td><td>{x.note || '—'}</td><td><span className="pill warning">{x.status}</span></td></tr>)}</tbody></table></div> : <p className="empty-message">No transfer requests yet.</p>}</div></section>}

            {adminPage === 'notifications' && <section className="admin-content"><div className="dashboard-heading"><div><h2>Notifications Center</h2><p>New customer orders, low stock warnings and bank transfer previews.</p></div><span className="pill">{notifications.length} alerts</span></div>{notifications.length ? <div className="notification-list">{notifications.map(n => <article className="notification-card" key={n.id}><span className="notification-icon">{n.icon}</span><div><strong>{n.title}</strong><p>{n.detail}</p>{n.date && <small>{new Date(n.date).toLocaleString()}</small>}</div></article>)}</div> : <div className="admin-panel empty-state"><span>🔔</span><h3>No notifications</h3><p>New orders and stock warnings will appear here.</p></div>}</section>}

            {adminPage === 'reports' && <section className="admin-content"><div className="dashboard-heading"><div><h2>Farm Reports</h2><p>Review sales orders, stock, income and expenses.</p></div><div className="report-actions"><button className="secondary-button" onClick={() => window.print()}>🖨️ Print report</button><button className="primary-button" onClick={() => { const rows = [['Report date', today()], ['Total orders', orders.length], ['Total sales orders (RWF)', orders.reduce((sum, o) => sum + Number(o.total || 0), 0)], ['Recorded income (RWF)', totalIncome], ['Recorded expenses (RWF)', totalExpenses], ['Net recorded balance (RWF)', totalIncome - totalExpenses], [], ['Product', 'Stock', 'Unit', 'Price (RWF)'], ...products.map(p => [p.name, p.stock, p.unit, p.price]), [], ['Date', 'Type', 'Group', 'Description', 'Quantity', 'Unit', 'Amount (RWF)'], ...records.map(r => [r.date, r.type, r.groupName || 'General Farm', r.description, r.quantity, r.unit, r.amount])]; const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n'); const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `smart-harvest-report-${today()}.csv`; link.click(); URL.revokeObjectURL(url) }}>⬇️ Export CSV</button></div></div><div className="stats-grid"><Stat icon="🛒" title="Customer Orders" value={orders.length} /><Stat icon="💳" title="Order Sales Value" value={money(orders.reduce((sum, o) => sum + Number(o.total || 0), 0))} /><Stat icon="⬆️" title="Recorded Income" value={money(totalIncome)} /><Stat icon="⬇️" title="Recorded Expenses" value={money(totalExpenses)} /><Stat icon="📈" title="Net Farm Balance" value={money(totalIncome - totalExpenses)} /><Stat icon="⚠️" title="Low Stock Items" value={lowStockProducts.length} /></div><div className="admin-panel"><h3>Product Inventory Report</h3><ProductTable products={products} onEdit={openProduct} onDelete={deleteProduct} /></div><div className="admin-panel"><div className="panel-heading"><h3>Customer Orders</h3><span>{orders.length} orders</span></div><OrderTable orders={orders} /></div><div className="admin-panel"><h3>Income and Expense Records</h3><RecordTable records={records} onDelete={deleteRecord} /></div><p className="muted">Reports are calculated from records saved in this browser. Order sales value is shown separately from manually entered farm income to avoid double-counting.</p></section>}

            {adminPage === 'settings' && <section className="admin-content"><div className="admin-panel settings-panel"><h2>Farm Settings</h2><form className="admin-form" onSubmit={e => { e.preventDefault(); notify('Settings saved.') }}><label>Farm name<input value={settings.name} onChange={e => setSettings({ ...settings, name: e.target.value })} /></label><label>Phone<input value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} /></label><label>Email<input type="email" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} /></label><label>Farm address<textarea value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} /></label><button className="primary-button">Save Settings</button></form></div></section>}
          </div>
        </div>
      )}

      {authView !== 'hidden' && !adminLoggedIn && <div className="modal-overlay" onClick={() => setAuthView('hidden')}><div className="modal-content auth-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setAuthView('hidden')}>×</button><div className="auth-heading"><span>🌱</span><h2>Smart Harvest Hub</h2><p>Admin Access</p></div>{authView === 'login' && <form className="admin-form" onSubmit={loginAdmin}><label>Username<input value={loginUsername} onChange={e => setLoginUsername(e.target.value)} required /></label><label>Password<input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required /></label><button className="primary-button">Sign In</button><button type="button" className="text-button" onClick={() => setAuthView('create')}>Create first admin account</button><button type="button" className="text-button" onClick={() => setAuthView('forgot')}>Forgot password?</button></form>}{authView === 'create' && <form className="admin-form" onSubmit={createAdmin}><label>Username<input value={adminUsername} onChange={e => setAdminUsername(e.target.value)} minLength="3" required /></label><label>Email<input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required /></label><label>Password<input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} minLength="8" required /></label><label>Confirm password<input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /></label><button className="primary-button">Create Account</button><button type="button" className="text-button" onClick={() => setAuthView('login')}>Back to login</button></form>}{authView === 'forgot' && <form className="admin-form" onSubmit={e => { e.preventDefault(); notify('Password reset by email will be enabled with the backend.'); }}><p>Password recovery will be connected to email after backend integration.</p><label>Admin email<input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required /></label><button className="primary-button">Continue</button><button type="button" className="text-button" onClick={() => setAuthView('login')}>Back to login</button></form>}</div></div>}

      {productModal && <div className="modal-overlay" onClick={() => setProductModal(false)}><div className="modal-content wide-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setProductModal(false)}>×</button><h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2><form className="admin-form form-grid" onSubmit={saveProduct}><label>Product name<input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required /></label><label>Category<select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}><option value="livestock">Livestock</option><option value="products">Farm products</option></select></label><label>Description<textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} /></label><label>Price (RWF)<input type="number" min="0" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required /></label><label>Unit<input value={productForm.unit} onChange={e => setProductForm({ ...productForm, unit: e.target.value })} /></label><label>Stock quantity<input type="number" min="0" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} required /></label><label>Icon / Emoji<input value={productForm.icon} onChange={e => setProductForm({ ...productForm, icon: e.target.value })} /></label><label>Product image<input type="file" accept="image/*" onChange={uploadProductImage} /></label>{productForm.image && <img className="product-form-preview" src={productForm.image} alt="Preview" />}<div className="full-width form-actions"><button className="primary-button">Save Product</button><button type="button" className="secondary-button" onClick={() => setProductModal(false)}>Cancel</button></div></form></div></div>}

      {groupModal && <div className="modal-overlay" onClick={() => setGroupModal(false)}><div className="modal-content" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setGroupModal(false)}>×</button><h2>{editingGroup ? 'Edit Livestock Group' : 'Create Livestock Group'}</h2><form className="admin-form" onSubmit={saveGroup}><label>Group name<input value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} placeholder="e.g. Chicken Group A" required /></label><label>Animal type<select value={groupForm.animalType} onChange={e => setGroupForm({ ...groupForm, animalType: e.target.value })}><option>Chicken</option><option>Pig</option><option>Cow</option><option>Goat</option><option>Sheep</option><option>Other</option></select></label><label>Number of animals<input type="number" min="1" value={groupForm.quantity} onChange={e => setGroupForm({ ...groupForm, quantity: e.target.value })} required /></label><label>Start date<input type="date" value={groupForm.startDate} onChange={e => setGroupForm({ ...groupForm, startDate: e.target.value })} required /></label><label>Notes<textarea value={groupForm.notes} onChange={e => setGroupForm({ ...groupForm, notes: e.target.value })} /></label><button className="primary-button">Save Group</button></form></div></div>}

      {selectedProduct && <div className="modal-overlay" onClick={() => setSelectedProduct(null)}><div className="modal-content" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setSelectedProduct(null)}>×</button><div className="detail-image">{selectedProduct.image ? <img src={selectedProduct.image} alt={selectedProduct.name} /> : <span>{selectedProduct.icon}</span>}</div><h2>{selectedProduct.name}</h2><p>{selectedProduct.description}</p><h3>{money(selectedProduct.price)}</h3><p>Available: {selectedProduct.stock}</p><button className="primary-button" disabled={selectedProduct.stock <= 0} onClick={() => { addToCart(selectedProduct); setSelectedProduct(null) }}>Add to Cart</button></div></div>}

      {showCart && <div className="modal-overlay" onClick={() => setShowCart(false)}><div className="modal-content cart-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setShowCart(false)}>×</button><h2>Shopping Cart</h2>{!cart.length ? <p className="empty-message">Your cart is empty.</p> : <><div className="cart-items">{cart.map(item => <div className="cart-item" key={item.id}><span>{item.icon}</span><div className="cart-item-info"><strong>{item.name}</strong><small>{money(item.price)}</small></div><div className="cart-quantity"><button onClick={() => updateCart(item.id, -1)}>−</button><span>{item.quantity}</span><button onClick={() => updateCart(item.id, 1)}>+</button></div><button className="remove-cart-item" onClick={() => setCart(c => c.filter(i => i.id !== item.id))}>Remove</button></div>)}</div><div className="cart-total"><strong>Total</strong><strong>{money(cartTotal)}</strong></div><button className="primary-button checkout-button" onClick={() => { setShowCart(false); setShowCheckout(true) }}>Checkout</button></>}</div></div>}

      {showCheckout && <div className="modal-overlay" onClick={() => setShowCheckout(false)}><div className="modal-content" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setShowCheckout(false)}>×</button><h2>Checkout</h2><form className="admin-form" onSubmit={submitOrder}><label>Full name<input value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} required /></label><label>Phone number<input type="tel" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} required /></label><label>Delivery option<select value={customer.delivery} onChange={e => setCustomer({ ...customer, delivery: e.target.value })}><option>Home Delivery</option><option>Farm Pickup</option></select></label>{customer.delivery === 'Home Delivery' && <label>Delivery address<textarea value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} required /></label>}<label>Payment method<select value={customer.payment} onChange={e => setCustomer({ ...customer, payment: e.target.value })}><option>MTN Mobile Money</option><option>Airtel Money</option></select></label><div className="cart-total"><strong>Total</strong><strong>{money(cartTotal)}</strong></div><button className="primary-button">Submit Order Preview</button><p className="muted">Real mobile money collection will be connected through the backend.</p></form></div></div>}
    </div>
  )
}

function Stat({ icon, title, value }) {
  return <article className="stat-card"><span>{icon}</span><p>{title}</p><h3>{value}</h3></article>
}

function ProductTable({ products, onEdit, onDelete }) {
  if (!products.length) return <p className="empty-message">No products found.</p>
  return <div className="table-responsive"><table className="admin-product-table"><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>{products.map(p => <tr key={p.id}><td><span className="table-product-name">{p.icon} {p.name}</span></td><td>{money(p.price)}</td><td>{p.stock}</td><td><div className="table-actions"><button className="admin-edit-button" onClick={() => onEdit(p)}>Edit</button><button className="admin-delete-button" onClick={() => onDelete(p.id)}>Delete</button></div></td></tr>)}</tbody></table></div>
}

function OrderTable({ orders }) {
  if (!orders.length) return <p className="empty-message">No customer orders have been received yet.</p>
  return <div className="table-responsive"><table className="admin-product-table"><thead><tr><th>Date</th><th>Customer</th><th>Phone</th><th>Items</th><th>Total</th><th>Delivery</th><th>Payment</th></tr></thead><tbody>{orders.map((o, i) => <tr key={o.createdAt || i}><td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</td><td>{o.customer?.name || '—'}</td><td>{o.customer?.phone || '—'}</td><td>{(o.items || []).map(item => `${item.name} × ${item.quantity}`).join(', ')}</td><td>{money(o.total)}</td><td>{o.customer?.delivery || '—'}{o.customer?.address ? `: ${o.customer.address}` : ''}</td><td>{o.customer?.payment || '—'}</td></tr>)}</tbody></table></div>
}

function RecordTable({ records, onDelete }) {
  if (!records.length) return <p className="empty-message">No farm records yet.</p>
  return <div className="table-responsive"><table className="admin-product-table"><thead><tr><th>Date</th><th>Type</th><th>Group</th><th>Description</th><th>Quantity</th><th>Amount</th><th>Action</th></tr></thead><tbody>{records.map(r => <tr key={r.id}><td>{r.date}</td><td><span className={`pill ${r.type === 'income' ? 'positive' : 'warning'}`}>{r.type}</span></td><td>{r.groupName || 'General Farm'}</td><td>{r.description}</td><td>{r.quantity ? `${r.quantity} ${r.unit || ''}` : '—'}</td><td>{money(r.amount)}</td><td><button className="admin-delete-button" onClick={() => onDelete(r.id)}>Delete</button></td></tr>)}</tbody></table></div>
}

export default App
