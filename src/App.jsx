import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdminView, setIsAdminView] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

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
    fetch('https://pestos-backend.onrender.com/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, price: parseFloat(newPrice), available: true })
    })
    .then(() => { setNewName(''); setNewPrice(''); fetchMenu(); alert("Added!"); })
    .catch(err => console.error("Error adding:", err));
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
            <input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <input placeholder="Price" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
            <button type="submit">Save to Cloud</button>
          </form>
          <table>
            {menuItems.map(item => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>
                  <input type="checkbox" checked={item.available} onChange={() => handleToggleAvailable(item._id, item.available)} />
                </td>
              </tr>
            ))}
          </table>
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