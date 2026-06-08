import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdminView, setIsAdminView] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const API_URL = 'https://pestos-backend.onrender.com/api/menu';

  const fetchMenu = () => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => { setMenuItems(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchMenu(); }, []);

  const handleToggleAvailable = (id, currentStatus) => {
    fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !currentStatus })
    })
    .then(() => fetchMenu())
    .catch(err => console.error("Error:", err));
  };

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, price: parseFloat(newPrice), available: true })
    })
    .then(() => { setNewName(''); setNewPrice(''); fetchMenu(); })
    .catch(err => console.error("Error:", err));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="app-container">
      <header onClick={() => setIsAdminView(!isAdminView)} style={{cursor:'pointer'}}>
        <h1>Pesto's Eatery</h1>
      </header>
      {isAdminView ? (
        <div className="admin-container">
          <form onSubmit={handleAddItemSubmit}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" />
            <input value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="Price" />
            <button type="submit">Save</button>
          </form>
          {menuItems.map(item => (
            <div key={item._id}>
              {item.name} <input type="checkbox" checked={item.available} onChange={() => handleToggleAvailable(item._id, item.available)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="menu-grid">
          {menuItems.map(item => (
            <div key={item._id} className={!item.available ? 'sold-out' : ''}>
              <h3>{item.name}</h3>
              <p>${item.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default App;