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
      .then(res => res.json())
      .then(data => { setMenuItems(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchMenu(); }, []);

  const handleToggleAvailable = (id, currentStatus) => {
    fetch(`https://pestos-backend.onrender.com/api/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !currentStatus })
    })
    .then(() => fetchMenu())
    .catch(err => console.error("Error updating:", err));
  };

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    const itemPayload = { name: newName, price: parseFloat(newPrice), category: newCategory, description: newDescription, tags: newTags.split(','), available: true };
    fetch('https://pestos-backend.onrender.com/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemPayload)
    })
    .then(() => { fetchMenu(); alert("Added!"); })
    .catch(err => console.error("Error adding:", err));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="app-container">
      <header onClick={() => setIsAdminView(!isAdminView)}><h1>Pesto's Eatery</h1></header>
      {isAdminView ? (
        <div className="admin-container">
          <form onSubmit={handleAddItemSubmit}>
            <input placeholder="Name" onChange={(e) => setNewName(e.target.value)} />
            <input placeholder="Price" onChange={(e) => setNewPrice(e.target.value)} />
            <button type="submit">Save</button>
          </form>
          {menuItems.map(item => (
            <div key={item._id}>
              {item.name} <input type="checkbox" checked={item.available} onChange={() => handleToggleAvailable(item._id, item.available)} />
            </div>
          ))}
        </div>
      ) : (
        <main className="menu-grid">
          {menuItems.filter(i => activeCategory === 'All' || i.category === activeCategory).map(item => (
            <div key={item._id} className={!item.available ? 'sold-out' : ''}>
              <h3>{item.name}</h3>
            </div>
          ))}
        </main>
      )}
    </div>
  );
}

export default App;