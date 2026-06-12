import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'https://pestos-backend.onrender.com/api/menu';

function App() {
  const [menuItems, setMenuItems] = useState([]);

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
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const addItem = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        alert(data.message || 'Failed to add item');
        return;
      }

      setName('');
      setPrice('');
      setCategory('Appetizers');
      setTags('');
      setDescription('');

      fetchMenu();
    } catch (err) {
      console.error('Add error:', err);
      alert('Could not add item');
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await fetch(`${API_URL}/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          available: item.available === false ? true : false
        })
      });

      fetchMenu();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const deleteItem = async (id) => {
    const confirmDelete = window.confirm('Delete this menu item?');

    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        fetchMenu();
      } else {
        alert('Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Could not delete item');
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="top-row">
          <div>
            <h1>Pesto's Control Panel</h1>
            <p className="subtitle">Database Live Dashboard</p>
          </div>
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

              {menuItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-text">
                    No menu items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;