import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'https://pestos-backend.onrender.com/api/menu';
const LOGIN_URL = 'https://pestos-backend.onrender.com/api/login';

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Appetizers');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');

  const categories = [
    'Appetizers',
    'Salads & Sandwiches',
    'Pasta',
    'Pizza',
    'Desserts',
    'Beverages'
  ];

  const fetchMenu = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setMenuItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleSecretClick = async () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 3) {
      const password = prompt('Enter admin password');

      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        setShowAdmin(true);
      } else {
        alert('Wrong password');
      }

      setClickCount(0);
    }
  };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('admin_token')}`
  });

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

    if (!data.success) {
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
    await fetch(`${API_URL}/${item._id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        available: item.available === false ? true : false
      })
    });

    fetchMenu();
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;

    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || 'Delete failed');
      return;
    }

    fetchMenu();
  };

  if (showAdmin) {
    return (
      <div className="page">
        <div className="container">
          <div className="top-row">
            <div>
              <h1>Pesto's Control Panel</h1>
              <p className="subtitle">Database Live Dashboard</p>
            </div>

            <button
              className="back-btn"
              onClick={() => setShowAdmin(false)}
            >
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
                <label>PRICE ($ USD) *</label>
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
                        {item.available !== false ? 'In Stock' : 'Out of Stock'}
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

        <div className="menu-grid">
          {menuItems
            .filter((item) => item.available !== false)
            .map((item) => (
              <div className="menu-card" key={item._id}>
                <div className="card-head">
                  <h3>{item.name}</h3>
                  <span>${Number(item.price).toFixed(2)}</span>
                </div>

                <p className="category">{item.category}</p>
                <p>{item.description}</p>

                {Array.isArray(item.tags) && item.tags.length > 0 && (
                  <p className="tags">{item.tags.join(', ')}</p>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default App;