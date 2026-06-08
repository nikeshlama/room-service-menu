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

  return (
    <div className="app-container">
      <h1>Pesto's Control Panel</h1>
      <form onSubmit={handleAddItemSubmit}>
        <input placeholder="Dish Name" value={newName} onChange={e => setNewName(e.target.value)} />
        <input type="number" placeholder="Price" value={newPrice} onChange={e => setNewPrice(e.target.value)} />
        <button type="submit">Save to Cloud</button>
      </form>

      <h3>Live Inventory</h3>
      <table>
        <tbody>
          {menuItems.map(item => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>${item.price?.toFixed(2)}</td>
              <td>
                <button onClick={() => handleDelete(item._id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default App;