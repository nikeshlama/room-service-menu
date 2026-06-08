import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State management for database values, active category filters, and loading sequences
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Categorization headers matching the database schema
  const categories = ['All', 'Appetizers', 'Salads & Sandwiches', 'Entrées & Pasta', 'Kids Menu', 'Desserts'];

  // Fetch the menu database dynamically from your live Render backend cloud link
  useEffect(() => {
    // NOTE: Replace this URL with your exact live Render link if it looks different!
    fetch('https://pestos-backend.onrender.com/api/menu')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        setMenuItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching menu data from Render backend:", err);
        setLoading(false);
      });
  }, []);

  // Filter the menu items based on which category button the user clicks
  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  // Clean loading view while waiting for the server to transmit the JSON array
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h2>Loading Pesto's Delicious Menu...</h2>
        <p>Our free server takes a moment to wake up on the first load. Thank you for your patience!</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Restaurant Branding Header */}
      <header className="menu-header">
        <h1>Pesto's Italian Eatery</h1>
        <p className="subtitle">Authentic Sudbury Kitchen • Room Service Menu</p>
        <div className="header-line"></div>
      </header>

      {/* Dynamic Category Navigation Filter Bar */}
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

      {/* Grid Layout of Filtered Food Cards */}
      <main className="menu-grid">
        {filteredItems.map((item) => (
          <div key={item.id} className={`menu-card ${!item.available ? 'sold-out' : ''}`}>
            <div className="card-header">
              <h3>{item.name}</h3>
              <span className="price">${item.price.toFixed(2)}</span>
            </div>
            
            <p className="description">{item.description}</p>
            
            <div className="card-footer">
              {/* Special dietary tag indicators */}
              <div className="tags-container">
                {item.tags.map((tag) => (
                  <span key={tag} className={`tag-badge ${tag}`}>
                    {tag === 'V' ? 'Vegetarian' : tag === 'GF' ? 'Gluten-Free' : tag}
                  </span>
                ))}
              </div>
              
              {/* Availability Status Button */}
              <span className={`status-badge ${item.available ? 'available' : 'unavailable'}`}>
                {item.available ? 'Available' : 'Sold Out'}
              </span>
            </div>
          </div>
        ))}
      </main>

      {/* Room Service Instructions Footer */}
      <footer className="menu-footer">
        <p>To place your order, please dial <strong>Ext. 404</strong> from your room telephone.</p>
        <p className="footer-note">15% service charge and applicable taxes will be added to your bill.</p>
      </footer>
    </div>
  );
}

export default App;