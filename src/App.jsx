import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Appetizers');
  const [newDescription, setNewDescription] = useState('');

  const API_URL = 'https://pestos-backend.onrender.com/api/menu';

  const fetchMenu = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setMenuItems(data))
      .catch((err) => console.error("Error fetching menu data:", err));
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        price: parseFloat(newPrice),
        category: newCategory,
        description: newDescription,
        available: true
      })
    })
    .then(res => res.json())
    .then(data => {
      alert("Dish added!");
      setNewName('');
      setNewPrice('');
      setNewDescription('');
      fetchMenu(); // Refresh the list
    })
    .catch(err => console.error("Error:", err));
  };

  return (
    <div className="app-container">
      <h1>Pesto's Control Panel</h1>
      
      <form className="admin-form" onSubmit={handleAddItemSubmit}>
        <input 
          placeholder="Dish Name" 
          value={newName} 
          onChange={(e) => setNewName(e.target.value)} 
          required 
        />
        <input 
          type="number" 
          placeholder="Price" 
          value={newPrice} 
          onChange={(e) => setNewPrice(e.target.value)} 
          required 
        />
        <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
          <option value="Appetizers">Appetizers</option>
          <option value="Entrées">Entrées</option>
          <option value="Desserts">Desserts</option>
        </select>
        <textarea 
          placeholder="Description" 
          value={newDescription} 
          onChange={(e) => setNewDescription(e.target.value)} 
        />
        <button type="submit">Save to Cloud Database</button>
      </form>

      <h3>Live Inventory</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.map((item) => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>${item.price ? item.price.toFixed(2) : '0.00'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;