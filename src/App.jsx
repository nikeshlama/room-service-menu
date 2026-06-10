import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clickCount, setClickCount] = useState(0);
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

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount === 3) {
      const password = prompt("Enter Admin Password:");
      if (password === "Pesto123") {
        setIsAdmin(true);
      } else {
        alert("Access Denied");
      }
      setClickCount(0);
    }
  };

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

  const handleToggleAvailable = (id, currentStatus) => {
    fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !currentStatus })
    })
    .then(() => fetchMenu());
  };

  return (
    <div>
      {/* HEADER: Triple-click the title to trigger Admin */}
      <h1 onClick={handleSecretClick} style={{ cursor: 'pointer', textAlign: 'center' }}>
        Pesto's Eatery
      </h1>

      {isAdmin ? (
        // ADMIN PANEL VIEW
        <div className="admin-container">
          <button onClick={() => setIsAdmin(false)} className="back-btn" style={{marginBottom: '20px'}}>
            Log Out of Admin
          </button>
          
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
                      <label className="switch">
                        <input type="checkbox" checked={item.available} onChange={() => handleToggleAvailable(item._id, item.available)} />
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
      ) : (
        // PUBLIC VIEW
        <div className="app-container">
          <h2 style={{textAlign: 'center'}}>Our Menu</h2>
          <div className="menu-grid">
            {menuItems.filter(item => item.available).map(item => (
              <div key={item._id} className="menu-card">
                <h3>{item.name}</h3>
                <p className="price">${item.price?.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default App;