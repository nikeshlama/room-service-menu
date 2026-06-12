import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'https://pestos-backend.onrender.com/api/menu';
const LOGIN_URL = 'https://pestos-backend.onrender.com/api/login';
const TAX_RATE = 0.13;

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Appetizers');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');

  const categories = [
    'All',
    'Appetizers',
    'Salads & Sandwiches',
    'Pasta',
    'Pizza',
    'Kids Menu',
    'Desserts',
    'Beverages'
  ];

  const adminCategories = categories.filter((cat) => cat !== 'All');

  const fetchMenu = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('GET ERROR:', err);
    }
  };

  useEffect(() => {
    localStorage.removeItem('admin_token');
    setShowAdmin(false);
    fetchMenu();
  }, []);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('admin_token')}`
  });

  const handleSecretClick = async () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 3) {
      const password = prompt('Enter admin password');

      if (!password) {
        setClickCount(0);
        return;
      }

      try {
        const res = await fetch(LOGIN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
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
        setClickCount(0);
      } catch (err) {
        alert('Could not login');
        setClickCount(0);
      }
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
    setCategory('Appetizers');
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

  const backToGuestView = () => {
    localStorage.removeItem('admin_token');
    setShowAdmin(false);
  };

  const addToCart = (item) => {
    if (item.available === false) return;

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

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const visibleItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

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
                  {adminCategories.map((cat) => (
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

        <div className="guest-layout">
          <div className="menu-grid">
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

          <div className="cart-box">
            <h2>Your Order</h2>

            {cart.length === 0 && (
              <p className="empty-cart">No items added yet.</p>
            )}

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

            {cart.length > 0 && (
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;