import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdminView, setIsAdminView] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Use your live Render backend URL here
  const API_URL = 'https://pestos-backend.onrender.com/api/menu';

  const fetchMenu = () => {
    fetch(API_URL)
      .then((res) => res.json())
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
    fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !currentStatus })
    })
    .then((res) => res.json())
    .then(() => {
      fetchMenu(); // Refresh the list after update
    })
    .catch((err) => console.error("Error updating item:", err));
  };

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    if (!newName || !newPrice) return alert("Please fill out Name and Price fields!");

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        price: parseFloat(newPrice),
        available: true
      })
    })
    .then((res) => res.json())
    .then(() => {
      setNewName('');
      setNewPrice('');
      fetchMenu();
      alert("Dish added successfully!");
    })
    .catch((err) => console.error("Error adding dish:", err));
  };

  if (loading) {
    return <div className="loading">Loading Pesto's Menu...</div>;
  }

  return (
    <div className="app-container">
      <header onClick={() => setIsAdminView(!isAdminView)} style={{ cursor: 'pointer' }}>
        <h1>PESTO'S ITALIAN EATERY</h1>
        <p>Authentic Sudbury Kitchen</p>
      </header>

      {isAdminView ? (
        <div className="admin-container">
          <h2>Admin Dashboard</h2>
          <form onSubmit={handleAddItemSubmit}>
            <input placeholder="Dish Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <input type="number" step="0.01" placeholder="Price" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
            <button type="submit">Save to Cloud</button>
          </form>
          
          <table className="admin-table">
            <thead><tr><th>Dish</th><th>Available</th></tr></thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={item.available} 
                      onChange={() => handleToggleAvailable(item._id, item.available)} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="menu-grid">
          {menuItems.map((item) => (
            <div key={item._id} className={`menu-card ${!item.available ? 'sold-out' : ''}`}>
              <h3>{item.name}</h3>
              <p>${item.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;