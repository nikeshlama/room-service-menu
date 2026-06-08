import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isAdminView, setIsAdminView] = useState(false);

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Appetizers');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');

  const categories = ['All', 'Appetizers', 'Salads & Sandwiches', 'Entrées & Pasta', 'Kids Menu', 'Desserts'];

  const fetchMenu = () => {
    fetch('https://pestos-backend.onrender.com/api/menu')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setMenuItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching menu data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleToggleAvailable = (id, currentStatus) => {
    fetch(`https://pestos-backend.onrender.com/api/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !currentStatus })
    })
    .then(res => res.json())
    .then(() => {
      fetchMenu();
    })
    .catch(err => console.error("Error updating stock item:", err));
  };

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    if (!newName || !newPrice) return alert("Please fill out Name and Price fields!");

    const tagsArray = newTags ? newTags.split(',').map(t => t.trim().toUpperCase()) : [];

    const itemPayload = {
      name: newName,
      price: parseFloat(newPrice),
      category: newCategory,
      description: newDescription,
      tags: tagsArray,
      available: true
    };

    fetch('https://pestos-backend.onrender.com/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemPayload)
    })
    .then(res => res.json())
    .then(() => {
      setNewName(''); setNewPrice(''); setNewDescription(''); setNewTags('');
      fetchMenu();
      alert("New menu dish successfully saved to database!");
    })
    .catch(err => console.error("Error adding dish:", err));
  };

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div><h2>Loading Pesto's Cloud Database...</h2></div>;
  }

  if (isAdminView) {
    return (
      <div className="admin-container">
        <header className="admin-header">
          <div><h1>Pesto's Control Panel</h1><p className="subtitle">Database Live Dashboard</p></div>
          <button className="back-btn" onClick={() => setIsAdminView(false)}>← Back to Menu View</button>
        </header>
        <form className="admin-form" onSubmit={handleAddItemSubmit}>
          <h3>Add New Kitchen Dish Record</h3>
          <div className="form-grid">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Dish Name" />
            <input type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="Price" />
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
              {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="Tags (V, GF)" />
          </div>
          <textarea rows="2" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Description..."></textarea>
          <button type="submit" className="submit-btn">Save to Cloud Database</button>
        </form>
        <h3>Live Inventory Control List</h3>
        <table className="admin-table">
          <thead><tr><th>Dish Name</th><th>Status</th></tr></thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item._id}>
                <td><strong>{item.name}</strong></td>
                <td>
                  <label className="switch">
                    <input type="checkbox" checked={item.available} onChange={() => handleToggleAvailable(item._id, item.available)} />
                    <span className="slider"></span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="menu-header">
        <h1>Pesto's Italian Eatery</h1>
        <p className="subtitle" onClick={() => setIsAdminView(true)} style={{cursor: 'pointer'}}>Authentic Sudbury Kitchen</p>
      </header>
      <main className="menu-grid">
        {filteredItems.map((item) => (
          <div key={item._id} className={`menu-card ${!item.available ? 'sold-out' : ''}`}>
            <h3>{item.name}</h3>
            <span>${item.price.toFixed(2)}</span>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;