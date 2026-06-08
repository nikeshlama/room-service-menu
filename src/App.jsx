import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isAdminView, setIsAdminView] = useState(false); // Controls view panel toggle

  // Admin Panel New Form Input Fields States
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Appetizers');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');

  const categories = ['All', 'Appetizers', 'Salads & Sandwiches', 'Entrées & Pasta', 'Kids Menu', 'Desserts'];

  // Fetch from Live Cloud Backend
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

  // Admin Function: Toggle Available / Sold out via API Update
  const handleToggleAvailable = (id, currentStatus) => {
    fetch(`https://pestos-backend.onrender.com/api/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !currentStatus })
    })
    .then(res => res.json())
    .then(() => {
      // Refresh local array values to reflect changes instantly
      fetchMenu();
    })
    .catch(err => console.error("Error updating stock item:", err));
  };

  // Admin Function: Post an Entirely New Dish to Database
  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    if (!newName || !newPrice) return alert("Please fill out Name and Price fields!");

    // Convert comma tags string to functional clean data array
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
      // Clear input form fields upon success
      setNewName('');
      setNewPrice('');
      setNewDescription('');
      setNewTags('');
      fetchMenu(); // Re-fetch list
      alert("New menu dish successfully saved to database!");
    })
    .catch(err => console.error("Error adding dish:", err));
  };

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h2>Loading Pesto's Cloud Database...</h2>
      </div>
    );
  }

  // ==========================================
  // VIEW SCREEN 1: ADMIN MANAGEMENT DASHBOARD
  // ==========================================
  if (isAdminView) {
    return (
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <h1>Pesto's Control Panel</h1>
            <p className="subtitle">Database Live Dashboard</p>
          </div>
          <button className="back-btn" onClick={() => setIsAdminView(false)}>← Back to Menu View</button>
        </header>

        {/* Create Dish Form Box */}
        <form className="admin-form" onSubmit={handleAddItemSubmit}>
          <h3>Add New Kitchen Dish Record</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Dish Name *</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Garlic Gnocchi" />
            </div>
            <div className="form-group">
              <label>Price ($ USD) *</label>
              <input type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="e.g. 24.99" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Tags (Comma separated)</label>
              <input type="text" value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="V, GF" />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Menu Description</label>
            <textarea rows="2" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Describe preparation elements..."></textarea>
          </div>
          <button type="submit" className="submit-btn">Save to Cloud Database</button>
        </form>

        {/* Database Inventory Table */}
        <h3>Live Inventory Control List</h3>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Dish Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Status Toggle</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item.id || item._id}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.category}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={item.available} 
                          onChange={() => handleToggleAvailable(item.id, item.available)} 
                        />
                        <span className="slider"></span>
                      </label>
                      <span style={{ fontWeight: 'bold', color: item.available ? '#2e7d32' : '#c62828' }}>
                        {item.available ? 'In Stock' : 'Sold Out'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW SCREEN 2: STANDARD CUSTOMER VIEW
  // ==========================================
  return (
    <div className="app-container">
      <header className="menu-header">
        <h1>Pesto's Italian Eatery</h1>
        {/* Clicking this subtitle link jumps back-door straight into the Admin Controls! */}
        <p className="subtitle" onClick={() => setIsAdminView(true)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
          Authentic Sudbury Kitchen • Room Test Menu
        </p>
        <div className="header-line"></div>
      </header>

      <nav className="category-nav">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </nav>

      <main className="menu-grid">
        {filteredItems.map((item) => (
          <div key={item.id || item._id} className={`menu-card ${!item.available ? 'sold-out' : ''}`}>
            <div className="card-header">
              <h3>{item.name}</h3>
              <span className="price">${item.price.toFixed(2)}</span>
            </div>
            
            <p className="description">{item.description}</p>
            
            <div className="card-footer">
              <div className="tags-container">
                {item.tags && item.tags.map((tag) => (
                  <span key={tag} className={`tag-badge ${tag}`}>
                    {tag === 'V' ? 'Vegetarian' : tag === 'GF' ? 'Gluten-Free' : tag}
                  </span>
                ))}
              </div>
              
              <span className={`status-badge ${item.available ? 'available' : 'unavailable'}`}>
                {item.available ? 'Available' : 'Sold Out'}
              </span>
            </div>
          </div>
        ))}
      </main>

      <footer className="menu-footer">
        <p>To place your order, please dial <strong>Ext. 404</strong> from your room telephone.</p>
        <p className="footer-note">15% service charge and applicable taxes will be added to your bill.</p>
      </footer>
    </div>
  );
}

export default App;