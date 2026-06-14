import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'https://pestos-backend.onrender.com/api/menu';
const LOGIN_URL = 'https://pestos-backend.onrender.com/api/login';
const ORDERS_URL = 'https://pestos-backend.onrender.com/api/orders';
const TAX_RATE = 0.13;

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPage, setAdminPage] = useState('inventory');
  const [showCheckout, setShowCheckout] = useState(false);

  const [clickCount, setClickCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Featured');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [guestName, setGuestName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [guestMessage, setGuestMessage] = useState('');

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Featured');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');

  const categories = [
    'Featured',
    'Appetizers',
    'Salads & Sandwiches',
    'Pasta',
    'Pizza',
    'Kids Menu',
    'Desserts',
    'Beverages'
  ];

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const wordCount = guestMessage
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('admin_token')}`
  });

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('GET MENU ERROR:', err);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(ORDERS_URL, {
        headers: getAuthHeaders()
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('GET ORDERS ERROR:', err);
    }
  };

  useEffect(() => {
    localStorage.removeItem('admin_token');
    setShowAdmin(false);
    fetchMenu();
  }, []);

  const handleSecretClick = async () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 3) {
      const password = prompt('Enter admin password');

      if (!password) {
        setClickCount(0);
        return;
      }

      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || 'Wrong password');
        setClickCount(0);
        return;
      }

      localStorage.setItem('admin_token', data.token);
      setShowAdmin(true);
      setAdminPage('inventory');
      setClickCount(0);
      fetchOrders();
    }
  };

  const addItem = async (e) => {
    e.preventDefault();

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name,
        price: Number(price),
        category,
        tags,
        description,
        available: true
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || 'Save failed');
      return;
    }

    setName('');
    setPrice('');
    setCategory('Featured');
    setTags('');
    setDescription('');
    fetchMenu();
  };

  const toggleAvailability = async (item) => {
    const res = await fetch(`${API_URL}/${item._id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        available: item.available === false ? true : false
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || 'Update failed');
      return;
    }

    fetchMenu();
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;

    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || 'Delete failed');
      return;
    }

    fetchMenu();
  };

  const addToCart = (item) => {
    if (item.available === false) return;

    setCartOpen(true);

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (cartItem) => cartItem._id === item._id
      );

      if (existingItem) {
        return currentCart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [
        ...currentCart,
        {
          _id: item._id,
          name: item.name,
          price: Number(item.price),
          quantity: 1
        }
      ];
    });
  };

  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item._id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item._id !== id)
    );
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (wordCount > 50) {
      alert('Message must be 50 words or less.');
      return;
    }

    const res = await fetch(ORDERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestName,
        roomNumber,
        message: guestMessage,
        items: cart,
        subtotal,
        tax,
        total
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || 'Order failed');
      return;
    }

    alert(`Order placed successfully! Order #${data.order.orderNumber}`);

    setCart([]);
    setCartOpen(false);
    setGuestName('');
    setRoomNumber('');
    setGuestMessage('');
    setShowCheckout(false);
  };

  const backToGuestView = () => {
    localStorage.removeItem('admin_token');
    setShowAdmin(false);
  };

  const visibleItems = menuItems.filter(
    (item) => item.category === selectedCategory
  );

  if (loading && !showAdmin) {
    return (
      <div className="loading-page">
        <div className="pestos-logo">PESTOS</div>
        <p>Loading room service menu...</p>
      </div>
    );
  }

  if (showAdmin) {
    return (
      <div className="page">
        <div className="container">
          <div className="top-row">
            <div>
              <h1>Pesto's Control Panel</h1>
              <p className="subtitle">Database Live Dashboard</p>
            </div>

            <button className="back-btn" onClick={backToGuestView}>
              ← Back to Menu View
            </button>
          </div>

          <div className="gold-line"></div>

          <div className="admin-nav">
            <button
              className={`admin-nav-btn ${
                adminPage === 'inventory' ? 'active-admin' : ''
              }`}
              onClick={() => setAdminPage('inventory')}
            >
              Inventory
            </button>

            <button
              className={`admin-nav-btn ${
                adminPage === 'orders' ? 'active-admin' : ''
              }`}
              onClick={() => {
                setAdminPage('orders');
                fetchOrders();
              }}
            >
              Orders
            </button>
          </div>

          {adminPage === 'inventory' && (
            <>
              <form className="form-card" onSubmit={addItem}>
                <h2>Add New Kitchen Dish Record</h2>

                <div className="form-grid">
                  <div className="form-group">
                    <label>DISH NAME *</label>
                    <input
                      type="text"
                      placeholder="e.g. Garlic Gnocchi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>PRICE</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 24.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>CATEGORY</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>TAGS</label>
                    <input
                      type="text"
                      placeholder="V, GF"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>MENU DESCRIPTION</label>
                  <textarea
                    placeholder="Describe preparation elements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <button className="save-btn" type="submit">
                  SAVE TO CLOUD DATABASE
                </button>
              </form>

              <h2 className="section-title">Live Inventory Control List</h2>

              <div className="table-box">
                <table>
                  <thead>
                    <tr>
                      <th>DISH NAME</th>
                      <th>CATEGORY</th>
                      <th>PRICE</th>
                      <th>STOCK STATUS TOGGLE</th>
                      <th>DELETE</th>
                    </tr>
                  </thead>

                  <tbody>
                    {menuItems.map((item) => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td>{item.category}</td>
                        <td>${Number(item.price).toFixed(2)}</td>

                        <td>
                          <button
                            className={
                              item.available !== false
                                ? 'stock-btn in-stock'
                                : 'stock-btn out-stock'
                            }
                            onClick={() => toggleAvailability(item)}
                          >
                            {item.available !== false
                              ? 'In Stock'
                              : 'Out of Stock'}
                          </button>
                        </td>

                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => deleteItem(item._id)}
                          >
                            DELETE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {adminPage === 'orders' && (
            <>
              <h2 className="section-title">Guest Orders</h2>

              <div className="orders-list">
                {orders.length === 0 && (
                  <p className="empty-cart">No orders placed yet.</p>
                )}

                {orders.map((order) => (
                  <div className="order-card" key={order._id}>
                    <div className="order-header">
                      <h3>Order #{order.orderNumber}</h3>
                      <span>
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="order-info">
                      <p>
                        <strong>Guest:</strong> {order.guestName}
                      </p>

                      <p>
                        <strong>Room:</strong> {order.roomNumber}
                      </p>

                      {order.message && (
                        <p>
                          <strong>Message:</strong> {order.message}
                        </p>
                      )}
                    </div>

                    <div className="order-items">
                      {order.items.map((item, index) => (
                        <p key={index}>
                          {item.quantity} × {item.name} — $
                          {(item.price * item.quantity).toFixed(2)}
                        </p>
                      ))}
                    </div>

                    <div className="order-total">
                      Total: ${Number(order.total).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="page">
        <div className="container">
          <h1>Pesto's Checkout</h1>
          <p className="subtitle">Guest Information</p>

          <div className="gold-line"></div>

          <form className="checkout-form" onSubmit={placeOrder}>
            <div className="form-group">
              <label>FULL NAME *</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>ROOM NUMBER *</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>MESSAGE / SPECIAL REQUESTS</label>
              <textarea
                value={guestMessage}
                onChange={(e) => setGuestMessage(e.target.value)}
                placeholder="Maximum 50 words"
              />
              <small>{wordCount}/50 words</small>
            </div>

            <div className="checkout-summary">
              <h2>Order Summary</h2>

              {cart.map((item) => (
                <p key={item._id}>
                  {item.quantity} × {item.name} — $
                  {(item.price * item.quantity).toFixed(2)}
                </p>
              ))}

              <hr />

              <p>Subtotal: ${subtotal.toFixed(2)}</p>
              <p>Tax 13%: ${tax.toFixed(2)}</p>
              <h3>Total: ${total.toFixed(2)}</h3>
            </div>

            <div className="checkout-buttons">
              <button
                type="button"
                className="back-btn"
                onClick={() => setShowCheckout(false)}
              >
                ← Back to Order
              </button>

              <button type="submit" className="save-btn">
                PLACE ORDER
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="top-row">
          <div>
            <h1 onClick={handleSecretClick}>Pesto's Eatery</h1>
            <p className="subtitle">Fresh • Authentic • Delicious</p>
          </div>
        </div>

        <div className="gold-line"></div>

        <div className="category-nav">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${
                selectedCategory === cat ? 'active' : ''
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {selectedCategory === 'Featured' && (
          <h2 className="section-title">Today&apos;s Featured Specials</h2>
        )}

        <div className="guest-layout">
          <div className="menu-grid">
            {visibleItems.length === 0 && (
              <p className="empty-cart">
                No items available in this category right now.
              </p>
            )}

            {visibleItems.map((item) => (
              <div
                className={`menu-card ${
                  item.available === false ? 'unavailable-card' : ''
                }`}
                key={item._id}
                onClick={() => addToCart(item)}
              >
                <div className="card-head">
                  <h3>{item.name}</h3>
                  <span>${Number(item.price).toFixed(2)}</span>
                </div>

                <p className="category">{item.category}</p>
                <p>{item.description}</p>

                {Array.isArray(item.tags) && item.tags.length > 0 && (
                  <p className="tags">{item.tags.join(', ')}</p>
                )}

                {item.available === false ? (
                  <p className="unavailable-label">
                    Currently unavailable
                  </p>
                ) : (
                  <p className="add-hint">Click to add to cart</p>
                )}
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div className={`cart-box ${cartOpen ? 'cart-open' : 'cart-closed'}`}>
              <div
                className="cart-header"
                onClick={() => setCartOpen(!cartOpen)}
              >
                <h2>Your Order</h2>
                <span>{cartOpen ? '−' : '+'}</span>
              </div>

              {!cartOpen && (
                <p className="cart-mini-text">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} item
                  {cart.reduce((sum, item) => sum + item.quantity, 0) > 1
                    ? 's'
                    : ''}{' '}
                  • Total ${total.toFixed(2)}
                </p>
              )}

              {cartOpen && (
                <>
                  {cart.map((item) => (
                    <div className="cart-item" key={item._id}>
                      <div>
                        <strong>{item.name}</strong>
                        <p>
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>

                      <div className="cart-controls">
                        <button onClick={() => decreaseQuantity(item._id)}>
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button onClick={() => increaseQuantity(item._id)}>
                          +
                        </button>

                        <button
                          className="remove-cart-btn"
                          onClick={() => removeFromCart(item._id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="cart-summary">
                    <div>
                      <span>Subtotal</span>
                      <strong>${subtotal.toFixed(2)}</strong>
                    </div>

                    <div>
                      <span>Tax 13%</span>
                      <strong>${tax.toFixed(2)}</strong>
                    </div>

                    <div className="cart-total">
                      <span>Total</span>
                      <strong>${total.toFixed(2)}</strong>
                    </div>

                    <button
                      className="checkout-btn"
                      onClick={() => setShowCheckout(true)}
                    >
                      CHECKOUT
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;