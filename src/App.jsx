import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://pestos-backend.onrender.com/api/menu';

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Appetizers');
  const [description, setDescription] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Appetizers',
    'Salads & Sandwiches',
    'Pasta',
    'Pizza',
    'Desserts',
    'Beverages'
  ];

  const fetchMenu = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMenu();

    const token = localStorage.getItem('admin_token');

    if (token) {
      setIsAdmin(true);
    }
  }, []);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('admin_token')}`
  });

  const handleSecretClick = async () => {
    const count = clickCount + 1;

    setClickCount(count);

    if (count === 3) {
      const password = prompt('Admin Password');

      const res = await fetch(
        'https://pestos-backend.onrender.com/api/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password })
        }
      );

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        setIsAdmin(true);
      } else {
        alert('Wrong password');
      }

      setClickCount(0);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsAdmin(false);
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
        description,
        available: true
      })
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || 'Failed');
      return;
    }

    setName('');
    setPrice('');
    setDescription('');

    await fetchMenu();
  };

  const deleteItem = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    await fetchMenu();
  };

  const toggleAvailability = async (item) => {
    await fetch(`${API_URL}/${item._id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        available: !item.available
      })
    });

    await fetchMenu();
  };

  const visibleItems =
    selectedCategory === 'All'
      ? menuItems.filter(item => item.available)
      : menuItems.filter(
          item =>
            item.available &&
            item.category === selectedCategory
        );

  return (
    <div className="app-container">

      <header className="menu-header">
        <h1 onClick={handleSecretClick}>
          Pesto's Eatery
        </h1>

        <p className="subtitle">
          Fresh • Authentic • Delicious
        </p>

        <div className="header-line"></div>
      </header>

      {!isAdmin && (
        <>
          <div className="category-nav">
            {categories.map(cat => (
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

          <div className="menu-grid">
            {visibleItems.map(item => (
              <div
                className={`menu-card ${
                  !item.available ? 'sold-out' : ''
                }`}
                key={item._id}
              >
                <div className="card-header">
                  <h3>{item.name}</h3>

                  <span className="price">
                    ${Number(item.price).toFixed(2)}
                  </span>
                </div>

                <p className="description">
                  {item.description}
                </p>

                <div className="card-footer">
                  <span
                    className={`status-badge ${
                      item.available
                        ? 'available'
                        : 'unavailable'
                    }`}
                  >
                    {item.available
                      ? 'Available'
                      : 'Unavailable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isAdmin && (
        <div className="admin-container">

          <div className="admin-header">
            <h2>Admin Panel</h2>

            <button
              className="back-btn"
              onClick={logout}
            >
              Logout
            </button>
          </div>

          <form
            className="admin-form"
            onSubmit={addItem}
          >
            <div className="form-grid">

              <div className="form-group">
                <label>Name</label>
                <input
                  value={name}
                  onChange={e =>
                    setName(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={e =>
                    setPrice(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={category}
                  onChange={e =>
                    setCategory(e.target.value)
                  }
                >
                  {categories
                    .filter(c => c !== 'All')
                    .map(c => (
                      <option key={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={e =>
                  setDescription(e.target.value)
                }
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
            >
              Add Item
            </button>
          </form>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {menuItems.map(item => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>${item.price}</td>
                    <td>
                      {item.available
                        ? 'Available'
                        : 'Unavailable'}
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          toggleAvailability(item)
                        }
                      >
                        Toggle
                      </button>

                      <button
                        onClick={() =>
                          deleteItem(item._id)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </div>
      )}

    </div>
  );
}

export default App;