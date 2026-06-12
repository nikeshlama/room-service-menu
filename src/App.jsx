import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'https://pestos-backend.onrender.com/api/menu';

function App() {
  const [menuItems, setMenuItems] = useState([]);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Appetizers');
  const [description, setDescription] = useState('');
  const [available, setAvailable] = useState(true);

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
      console.error('Fetch Error:', err);
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          category,
          description,
          available
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
      setDescription('');
      setAvailable(true);

      fetchMenu();
    } catch (err) {
      console.error('Add Error:', err);
    }
  };

  const deleteItem = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this menu item?'
    );

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
      console.error('Delete Error:', err);
    }
  };

  return (
    <div className="app-container">

      <header className="menu-header">
        <h1>Pesto's Eatery</h1>
        <p className="subtitle">
          Fresh • Authentic • Delicious
        </p>
      </header>

      <form
        className="admin-form"
        onSubmit={addItem}
      >
        <h2>Add Menu Item</h2>

        <input
          type="text"
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

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

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label>
          <input
            type="checkbox"
            checked={available}
            onChange={(e) =>
              setAvailable(e.target.checked)
            }
          />
          Available
        </label>

        <button type="submit">
          Add Item
        </button>
      </form>

      <div className="menu-grid">
        {menuItems.map((item) => (
          <div
            className="menu-card"
            key={item._id}
          >
            <h3>{item.name}</h3>

            <p>
              <strong>Category:</strong>{' '}
              {item.category}
            </p>

            <p>{item.description}</p>

            <p>
              <strong>
                ${Number(item.price).toFixed(2)}
              </strong>
            </p>

            <p>
              Status:{' '}
              {item.available !== false
                ? '✅ Available'
                : '❌ Unavailable'}
            </p>

            <button
              onClick={() =>
                deleteItem(item._id)
              }
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                cursor: 'pointer'
              }}
            >
              Delete Item
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;