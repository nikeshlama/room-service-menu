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
      setMenuItems(data);
    } catch (err) {
      console.error("Fetch menu error:", err);
    }
  };

  /* =========================
     ON LOAD
  ========================= */
  useEffect(() => {
    fetchMenu();

    const token = localStorage.getItem('admin_token');
    if (token) setIsAdmin(true);
  }, []);

  /* =========================
     AUTH HEADER
  ========================= */
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('admin_token')}`
  });

  /* =========================
     SECRET LOGIN (3 CLICKS)
  ========================= */
  const handleSecretClick = async () => {
    const count = clickCount + 1;
    setClickCount(count);

    if (count === 3) {
      const password = prompt('Enter Admin Password:');

      if (!password) {
        setClickCount(0);
        return;
      }

      try {
        const res = await fetch(
          'https://pestos-backend.onrender.com/api/login',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
          }
        );

        const data = await res.json();

        if (res.ok && data.success) {
          localStorage.setItem('admin_token', data.token);
          setIsAdmin(true);
        } else {
          alert(data.message || 'Wrong password');
        }
      } catch (err) {
        alert('Login failed');
      }

      setClickCount(0);
    }
  };

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAdmin(false);
  };

  /* =========================
     ADD ITEM (FIXED)
  ========================= */
  const handleAddItemSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newName,
          price: parseFloat(newPrice),
          available: true
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to add item");
        return;
      }

      fetchMenu();
      setNewName('');
      setNewPrice('');

    } catch (err) {
      console.error("Add item error:", err);
      alert("Server error while adding item");
    }
  };

  /* =========================
     DELETE ITEM (FIXED)
  ========================= */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert("Delete failed");
        return;
      }

      fetchMenu();
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  /* =========================
     TOGGLE AVAILABLE (FIXED)
  ========================= */
  const handleToggleAvailable = async (id, current) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ available: !current })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert("Update failed");
        return;
      }

      fetchMenu();
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div>

      <h1
        onClick={handleSecretClick}
        style={{ textAlign: 'center', cursor: 'pointer' }}
      >
        Pesto's Eatery
      </h1>

      {/* ================= PUBLIC ================= */}
      {!isAdmin && (
        <div className="app-container">
          <h2 style={{ textAlign: 'center' }}>Our Menu</h2>

          <div className="menu-grid">
            {menuItems
              .filter(i => i.available)
              .map(item => (
                <div key={item._id} className="menu-card">
                  <h3>{item.name}</h3>
                  <p className="price">${item.price?.toFixed(2)}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================= ADMIN ================= */}
      {isAdmin && (
        <div className="admin-container">

          <button onClick={handleLogout} className="back-btn">
            Logout
          </button>

          <form onSubmit={handleAddItemSubmit} className="admin-form">
            <input
              placeholder="Dish Name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Price"
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
              required
            />

            <button type="submit" className="submit-btn">
              Add Item
            </button>
          </form>

          <h3>Menu Control</h3>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {menuItems.map(item => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>${item.price}</td>

                  <td>
                    <input
                      type="checkbox"
                      checked={item.available}
                      onChange={() =>
                        handleToggleAvailable(item._id, item.available)
                      }
                    />
                  </td>

                  <td>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="back-btn"
                      style={{ background: 'red' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}
    </div>
  );
}

export default App;