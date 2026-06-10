import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const API_URL = 'https://pestos-backend.onrender.com/api/menu';

  const [menuItems, setMenuItems] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  /* =========================
     FETCH MENU
  ========================= */
  const fetchMenu = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      console.log("MENU:", data);

      setMenuItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMenu();

    const token = localStorage.getItem('admin_token');
    if (token) setIsAdmin(true);
  }, []);

  /* =========================
     AUTH HEADERS
  ========================= */
  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');

    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  };

  /* =========================
     SECRET LOGIN
  ========================= */
  const handleSecretClick = async () => {
    const count = clickCount + 1;
    setClickCount(count);

    if (count === 3) {
      const password = prompt("Admin Password:");

      const res = await fetch('https://pestos-backend.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        setIsAdmin(true);
      } else {
        alert("Wrong password");
      }

      setClickCount(0);
    }
  };

  /* =========================
     LOGOUT
  ========================= */
  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsAdmin(false);
  };

  /* =========================
     ADD ITEM (FIXED)
  ========================= */
  const addItem = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newName,
          price: Number(newPrice),
          available: true
        })
      });

      const data = await res.json();
      console.log("ADD RESPONSE:", data);

      if (!res.ok || !data.success) {
        alert(data.message || "Add failed");
        return;
      }

      // instant UI update
      setMenuItems(prev => [...prev, data.item]);

      setNewName('');
      setNewPrice('');

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  /* =========================
     DELETE ITEM
  ========================= */
  const deleteItem = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    setMenuItems(prev => prev.filter(i => i._id !== id));
  };

  /* =========================
     TOGGLE AVAILABLE
  ========================= */
  const toggleAvailable = async (id, current) => {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ available: !current })
    });

    setMenuItems(prev =>
      prev.map(item =>
        item._id === id
          ? { ...item, available: !current }
          : item
      )
    );
  };

  return (
    <div>

      <h1 onClick={handleSecretClick} style={{ textAlign: 'center' }}>
        Pesto's Eatery
      </h1>

      {!isAdmin && (
        <div>
          <h2>Menu</h2>

          <div className="menu-grid">
            {menuItems
              .filter(i => i.available)
              .map(item => (
                <div key={item._id}>
                  <h3>{item.name}</h3>
                  <p>${Number(item.price).toFixed(2)}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {isAdmin && (
        <div>

          <button onClick={logout}>Logout</button>

          <form onSubmit={addItem}>
            <input
              placeholder="Name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />

            <input
              placeholder="Price"
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
            />

            <button type="submit">Add</button>
          </form>

          <h3>Admin Panel</h3>

          {menuItems.map(item => (
            <div key={item._id}>
              <span>{item.name}</span>

              <button onClick={() => toggleAvailable(item._id, item.available)}>
                Toggle
              </button>

              <button onClick={() => deleteItem(item._id)}>
                Delete
              </button>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default App;