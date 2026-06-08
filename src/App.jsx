import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const API = 'https://pestos-backend.onrender.com/api/menu';

  const fetchItems = () => {
    fetch(API)
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchItems(); }, []);

  const toggleStatus = (id, currentStatus) => {
    fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !currentStatus })
    })
    .then(() => fetchItems())
    .catch(err => console.error("Update failed", err));
  };

  return (
    <div className="app-container">
      {items.map(item => (
        <div key={item._id}>
          {item.name} - {item.available ? "In Stock" : "Out of Stock"}
          <input type="checkbox" checked={item.available} onChange={() => toggleStatus(item._id, item.available)} />
        </div>
      ))}
    </div>
  );
}
export default App;