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
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const addItem = async (e) => {
    e.preventDefault();

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    setDescription('');
    setAvailable(true);

    fetchMenu();
  };

  return (
    <div className="app-container">
      <header className="menu-header">
        <h1>Pesto's Eatery</h1>
        <p className="subtitle">Fresh • Authentic • Delicious</p>
      </header>

      <form className="admin-form" onSubmit={addItem}>
        <h2>Add Menu Item</h2>

        <input
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
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
            <option key={cat}>{cat}</option>
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
            onChange={(e) => setAvailable(e.target.checked)}
          />
          Available
        </label>

        <button type="submit">Add Item</button>
      </form>

      <div className="menu-grid">
        {menuItems.map((item) => (
          <div className="menu-card" key={item._id}>
            <h3>{item.name}</h3>
            <p>{item.category}</p>
            <p>{item.description}</p>
            <strong>${Number(item.price).toFixed(2)}</strong>

            <p>
              Status:{' '}
              {item.available !== false ? 'Available' : 'Unavailable'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;