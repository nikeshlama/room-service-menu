import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  
  const API_URL = 'https://pestos-backend.onrender.com/api/menu';

  const fetchMenu = () => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setMenuItems(data))
      .catch(err => console.error("Error:", err));
  };

  useEffect(() => { fetchMenu(); }, []);

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, price: parseFloat(newPrice), available: true })
    })
    .then(() => { fetchMenu(); setNewName(''); setNewPrice(''); });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this dish?")) {
      fetch(`${API_URL}/${id}`, { method: 'DELETE' })
        .then(() => fetchMenu());
    }
  };

  // Toggle function for the switch
  const handleToggleAvailable = (id, currentStatus) => {
    fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !currentStatus })
    })
    .then(() => fetchMenu());
  };

  return (
    <div className="admin-container">
      <h1>Pesto's Control Panel</h1>
      
      <form className="admin-form" onSubmit={handleAddItemSubmit}>
        <input placeholder="Dish Name" value={newName} onChange={e => setNewName(e.target.value)} required />
        <input type="number" placeholder="Price" value={newPrice} onChange={e => setNewPrice(e.target.value)} required />
        <button type="submit" className="submit-btn">Save to Cloud</button>
      </form>

      <h3>Live Inventory</h3>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Dish Name</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map(item => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>${item.price?.toFixed(2)}</td>
                <td>
                  {/* Toggle Switch */}
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={item.available} 
                      onChange={() => handleToggleAvailable(item._id, item.available)} 
                    />
                    <span className="slider"></span>
                  </label>
                </td>
                <td>
                  <button onClick={() => handleDelete(item._id)} className="back-btn" style={{backgroundColor: '#c62828'}}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;