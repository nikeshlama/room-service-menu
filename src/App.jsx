import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import * as XLSX from 'xlsx';

const API_URL = 'https://pestos-backend.onrender.com/api/menu';
const LOGIN_URL = 'https://pestos-backend.onrender.com/api/login';
const ORDERS_URL = 'https://pestos-backend.onrender.com/api/orders';
const GUESTS_URL = 'https://pestos-backend.onrender.com/api/guests';
const GUEST_UPLOAD_URL = 'https://pestos-backend.onrender.com/api/guests/upload';

const TAX_RATE = 0.13;
const GRATUITY_RATE = 0.18;
const NOTIFICATION_SOUND = `${import.meta.env.BASE_URL}notification.mp3`;
const REPORTS_URL = 'https://pestos-backend.onrender.com/api/reports';
const OUT_OF_STOCK_URL ='https://pestos-backend.onrender.com/api/out-of-stock';

const menuImages = {
  'Arranchini ': 'menu-images/aranchini.png',
  'Classic Caesar Salad': 'menu-images/ceasersalad.png',
  'Italian Cobb Salad': 'menu-images/cobbsalad.png',
  'Tronchetto Di Mozzarella (Mozza Log)': 'menu-images/mozzalog.png',
  'Porchetta Slider Trio': 'menu-images/prochettaslidertrio.png',
  'Garlic Parm Rolls': 'menu-images/garlicparmrolls.png',
  'Chicken Marsala': 'menu-images/chickenmarsala.png',
  'Chicken Parmesan': 'menu-images/chickenparm.png',
  'Paperdelle Primavera con aglio e olio': 'menu-images/primavera.png',
  'Chicken & Sherry Cream Fettuccine': 'menu-images/shericreamfettuchini.png',
  'Spaghetti & Meatballs': 'menu-images/spanmeatballs.png',
  'Beef Tagliata Di Manzo': 'menu-images/steak.png',
  'Chicken Wings & Fries': 'menu-images/wingsnfries.png'
};

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [guests, setGuests] = useState([]);
  const [guestUploadMessage, setGuestUploadMessage] = useState('');
  const [guestUploading, setGuestUploading] = useState(false);

  const [reportType, setReportType] = useState('day');
  const [reportDate, setReportDate] = useState('');
  const [reportMonth, setReportMonth] = useState('');
  const [reportItems, setReportItems] = useState([]);
  const [reportGrandTotal, setReportGrandTotal] = useState(0);
  const [reportOrderCount, setReportOrderCount] = useState(0);


  const [loading, setLoading] = useState(true);

  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPage, setAdminPage] = useState('inventory');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [alarmEnabled, setAlarmEnabled] = useState(false);

  const [clickCount, setClickCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Featured');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [openDescriptions, setOpenDescriptions] = useState({});

  const [guestName, setGuestName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [guestMessage, setGuestMessage] = useState('');

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Featured');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);

  const [outOfStockName, setOutOfStockName] = useState('');
  const [outOfStockItems, setOutOfStockItems] = useState([]);

  const [stockStartDate, setStockStartDate] = useState('');
  const [stockEndDate, setStockEndDate] = useState('');

  const categoryRefs = useRef({});
  const lastOrderIdRef = useRef(null);
  const ordersLoadedRef = useRef(false);
  const alarmRef = useRef(null);

  const categories = [
    'Featured',
    'Appetizers',
    'Salads & Sandwiches',
    'Pasta',
    'Pizza',
    'Kids Menu',
    'Desserts',
    'Beverages'
  ];

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const gratuity = subtotal * GRATUITY_RATE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + gratuity + tax;

  const wordCount = guestMessage
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('admin_token')}`
  });

  const getMenuImage = (itemName) => {
    const imagePath = menuImages[itemName] || menuImages[itemName?.trim()];
    return imagePath ? `${import.meta.env.BASE_URL}${imagePath}` : null;
  };

  const enableAlarmSound = () => {
    if (!alarmRef.current) {
      alarmRef.current = new Audio(NOTIFICATION_SOUND);
      alarmRef.current.loop = true;
      alarmRef.current.volume = 1;
    }

    alarmRef.current
      .play()
      .then(() => {
        alarmRef.current.pause();
        alarmRef.current.currentTime = 0;
        setAlarmEnabled(true);
        alert('Alarm sound enabled successfully.');
      })
      .catch(() => {
        alert('Please tap/click again to enable alarm sound.');
      });
  };

  const startAlarm = () => {
    if (!alarmRef.current) {
      alarmRef.current = new Audio(NOTIFICATION_SOUND);
      alarmRef.current.loop = true;
      alarmRef.current.volume = 1;
    }

    alarmRef.current.play().catch(() => {
      console.log('Alarm blocked until admin enables sound.');
    });
  };

  const stopAlarm = () => {
    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
    }

    setNewOrderAlert(false);
  };

  const centerCategory = (cat) => {
    setSelectedCategory(cat);

    setTimeout(() => {
      categoryRefs.current[cat]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }, 50);
  };

  const toggleDescription = (id) => {
    setOpenDescriptions((current) => ({
      ...current,
      [id]: !current[id]
    }));
  };

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('GET MENU ERROR:', err);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (checkNew = false) => {
    try {
      const res = await fetch(ORDERS_URL, {
        headers: getAuthHeaders()
      });

      const data = await res.json();

      if (data.success) {
        const newestOrder = data.orders[0];
        const newestOrderId = newestOrder?._id;

        if (
          checkNew &&
          ordersLoadedRef.current &&
          newestOrderId &&
          lastOrderIdRef.current &&
          newestOrderId !== lastOrderIdRef.current
        ) {
          setNewOrderAlert(true);
          startAlarm();
        }

        if (newestOrderId) {
          lastOrderIdRef.current = newestOrderId;
        }

        ordersLoadedRef.current = true;
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('GET ORDERS ERROR:', err);
    }
  };

  const fetchReport = async () => {
  try {
    const query =
      reportType === 'day'
        ? `type=day&date=${reportDate}`
        : `type=month&month=${reportMonth}`;

    const res = await fetch(`${REPORTS_URL}?${query}`, {
      headers: getAuthHeaders()
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || 'Report failed');
      return;
    }

    setReportItems(data.reportItems);
    setReportGrandTotal(data.grandTotal);
    setReportOrderCount(data.orderCount);
  } catch (err) {
    console.error('REPORT ERROR:', err);
  }
};

  const downloadReportExcel = () => {
  if (reportItems.length === 0) {
    alert('Please generate a report first.');
    return;
  }

  const excelData = reportItems.map(item => ({
    'Item Name': item.itemName,
    Price: Number(item.price).toFixed(2),
    'Quantity Sold': item.quantitySold,
    Total: Number(item.total).toFixed(2)
  }));

  excelData.push({});

  excelData.push({
    'Item Name': 'TOTAL ORDERS',
    Price: reportOrderCount
  });

  excelData.push({
    'Item Name': 'GRAND TOTAL',
    Price: `$${Number(reportGrandTotal).toFixed(2)}`
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Sales Report'
  );

  const fileName =
    reportType === 'day'
      ? `Pestos_Daily_Report_${reportDate}.xlsx`
      : `Pestos_Monthly_Report_${reportMonth}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};

  const fetchGuests = async () => {
    try {
      const res = await fetch(GUESTS_URL, {
        headers: getAuthHeaders()
      });

      const data = await res.json();

      if (data.success) {
        setGuests(data.guests);
      }
    } catch (err) {
      console.error('GET GUESTS ERROR:', err);
    }
  };

  const fetchOutOfStockItems = async () => {
    try {
      const res = await fetch(OUT_OF_STOCK_URL, {
        headers: getAuthHeaders()
      });

      const data = await res.json();

      if (data.success) {
      setOutOfStockItems(data.items);
      }
    } catch (err) {
      console.error(err);
    }
};

const addOutOfStockItem = async () => {
  if (!outOfStockName.trim()) {
    alert('Enter item name');
    return;
  }

  const res = await fetch(OUT_OF_STOCK_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      itemName: outOfStockName
    })
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    alert(data.message || 'Failed');
    return;
  }

  setOutOfStockName('');
  fetchOutOfStockItems();
};

const downloadOutOfStockExcel = async () => {
  if (!stockStartDate || !stockEndDate) {
    alert('Select start and end date');
    return;
  }

  const res = await fetch(
    `${OUT_OF_STOCK_URL}/report?startDate=${stockStartDate}&endDate=${stockEndDate}`,
    {
      headers: getAuthHeaders()
    }
  );

  const data = await res.json();

  if (!data.success) {
    alert('Report failed');
    return;
  }

  const rows = data.items.map(item => ({
    Item: item.itemName,
    Date: new Date(item.createdAt).toLocaleDateString(),
    Time: new Date(item.createdAt).toLocaleTimeString()
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Out Of Stock'
  );

  XLSX.writeFile(
    workbook,
    `OutOfStock_${stockStartDate}_to_${stockEndDate}.xlsx`
  );
};

  const uploadGuestExcel = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setGuestUploading(true);
    setGuestUploadMessage('Uploading guest list...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(GUEST_UPLOAD_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setGuestUploadMessage(data.message || 'Guest upload failed.');
        return;
      }

      setGuestUploadMessage(data.message || 'Guest list uploaded successfully.');
      fetchGuests();
    } catch (err) {
      console.error('UPLOAD GUEST ERROR:', err);
      setGuestUploadMessage('Guest upload failed.');
    } finally {
      setGuestUploading(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    localStorage.removeItem('admin_token');
    setShowAdmin(false);
    fetchMenu();
  }, []);

  useEffect(() => {
    if (showAdmin && adminPage === 'orders') {
      fetchOrders(false);

      const interval = setInterval(() => {
        fetchOrders(true);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [showAdmin, adminPage]);

  const handleSecretClick = async () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 3) {
      const password = prompt('Enter admin password');

      if (!password) {
        setClickCount(0);
        return;
      }

      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || 'Wrong password');
        setClickCount(0);
        return;
      }

      localStorage.setItem('admin_token', data.token);
      setShowAdmin(true);
      setAdminPage('orders');
      setClickCount(0);
      fetchOrders(false);
    }
  };

  const clearForm = () => {
    setName('');
    setPrice('');
    setCategory('Featured');
    setTags('');
    setDescription('');
    setEditingItemId(null);
  };

  const saveItem = async (e) => {
    e.preventDefault();

    const itemData = {
      name,
      price: Number(price),
      category,
      tags,
      description,
      available: true
    };

    const url = editingItemId ? `${API_URL}/${editingItemId}` : API_URL;
    const method = editingItemId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData)
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || 'Save failed');
      return;
    }

    clearForm();
    fetchMenu();
  };

  const startEditItem = (item) => {
    setEditingItemId(item._id);
    setName(item.name || '');
    setPrice(item.price || '');
    setCategory(item.category || 'Featured');
    setTags(Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '');
    setDescription(item.description || '');
    setAdminPage('inventory');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const toggleAvailability = async (item) => {
    const res = await fetch(`${API_URL}/${item._id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        available: item.available === false ? true : false
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || 'Update failed');
      return;
    }

    fetchMenu();
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;

    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || 'Delete failed');
      return;
    }

    if (editingItemId === id) {
      clearForm();
    }

    fetchMenu();
  };

  const addToCart = (item) => {
    if (item.available === false) return;

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (cartItem) => cartItem._id === item._id
      );

      if (existingItem) {
        return currentCart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [
        ...currentCart,
        {
          _id: item._id,
          name: item.name,
          price: Number(item.price),
          quantity: 1
        }
      ];
    });
  };

  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item._id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item._id !== id)
    );
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (wordCount > 50) {
      alert('Message must be 50 words or less.');
      return;
    }

    const res = await fetch(ORDERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestName,
        roomNumber,
        message: guestMessage,
        items: cart,
        subtotal,
        gratuity,
        tax,
        total
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(
        data.message ||
          'Guest name and room number do not match our check-in records. Please enter the correct room number and the exact name used during hotel check-in.'
      );
      return;
    }

    setReceiptData({
      orderNumber: data.order.orderNumber,
      guestName,
      roomNumber,
      message: guestMessage,
      items: cart,
      subtotal,
      gratuity,
      tax,
      total,
      date: new Date().toLocaleString()
    });

    setShowReceipt(true);
    setShowCheckout(false);
  };

  const resetAfterReceipt = () => {
    setShowReceipt(false);
    setReceiptData(null);
    setCart([]);
    setCartOpen(false);
    setGuestName('');
    setRoomNumber('');
    setGuestMessage('');
  };

  const backToGuestView = () => {
    localStorage.removeItem('admin_token');
    setShowAdmin(false);
    stopAlarm();
  };

  const visibleItems = menuItems.filter(
    (item) => item.category === selectedCategory
  );

  if (loading && !showAdmin) {
    return (
      <div className="loading-page">
        <div className="pestos-logo">PESTOS</div>
        <p>Loading room service menu...</p>
      </div>
    );
  }

  if (showReceipt && receiptData) {
    return (
      <div className="page">
        <div className="container receipt-page">
          <h1>Pesto&apos;s Eatery</h1>
          <p className="subtitle">Room Service Receipt</p>

          <div className="gold-line"></div>

          <div className="receipt-box">
            <h2>Order #{receiptData.orderNumber}</h2>

            <p><strong>Date:</strong> {receiptData.date}</p>
            <p><strong>Guest:</strong> {receiptData.guestName}</p>
            <p><strong>Room:</strong> {receiptData.roomNumber}</p>

            {receiptData.message && (
              <p><strong>Message:</strong> {receiptData.message}</p>
            )}

            <hr />

            {receiptData.items.map((item) => (
              <div className="receipt-item" key={item._id}>
                <span>{item.quantity} × {item.name}</span>
                <strong>${(item.quantity * item.price).toFixed(2)}</strong>
              </div>
            ))}

            <hr />

            <div className="receipt-row">
              <span>Subtotal</span>
              <strong>${receiptData.subtotal.toFixed(2)}</strong>
            </div>

            <div className="receipt-row">
              <span>Gratuity 18%</span>
              <strong>${receiptData.gratuity.toFixed(2)}</strong>
            </div>

            <div className="receipt-row">
              <span>Tax 13%</span>
              <strong>${receiptData.tax.toFixed(2)}</strong>
            </div>

            <div className="receipt-total">
              <span>Total</span>
              <strong>${receiptData.total.toFixed(2)}</strong>
            </div>

            <p className="receipt-footer">
              Thank you for dining with us. Please keep this receipt for your reference.
            </p>

            <div className="receipt-buttons">
              <button className="save-btn" onClick={() => window.print()}>
                PRINT RECEIPT
              </button>

              <button className="back-btn" onClick={resetAfterReceipt}>
                RETURN TO MENU
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showAdmin) {
    return (
      <div className="page">
        <div className="container">
          <div className="top-row">
            <div>
              <h1>Pesto&apos;s Control Panel</h1>
              <p className="subtitle">Database Live Dashboard</p>
            </div>

            <button className="back-btn" onClick={backToGuestView}>
              ← Back to Menu View
            </button>
          </div>

          <div className="gold-line"></div>

          <div className="admin-nav">
            <button
              className={`admin-nav-btn ${
                adminPage === 'orders' ? 'active-admin' : ''
              }`}
              onClick={() => {
                setAdminPage('orders');
                fetchOrders(false);
              }}
            >
              Orders
            </button>

            <button
              className={`admin-nav-btn ${
                adminPage === 'inventory' ? 'active-admin' : ''
              }`}
              onClick={() => setAdminPage('inventory')}
            >
              Inventory
            </button>

            <button
              className={`admin-nav-btn ${
                adminPage === 'guests' ? 'active-admin' : ''
              }`}
              onClick={() => {
                setAdminPage('guests');
                fetchGuests();
              }}
            >
              Guest Info
            </button>
            

            <button
  className={`admin-nav-btn ${
    adminPage === 'reports' ? 'active-admin' : ''
  }`}
  onClick={() => setAdminPage('reports')}
>
  Reports
</button>

          </div>

          {adminPage === 'kitchen' && (
  <>
    <h2 className="section-title">
      Kitchen Inventory
    </h2>

    <div className="form-card">

      <div className="form-group">
        <label>OUT OF STOCK ITEM</label>

        <input
          type="text"
          value={outOfStockName}
          onChange={(e) =>
            setOutOfStockName(e.target.value)
          }
          placeholder="Example: Coke"
        />
      </div>

      <button
        className="save-btn"
        type="button"
        onClick={addOutOfStockItem}
      >
        ADD OUT OF STOCK ITEM
      </button>
    </div>

    <div className="form-card">
      <h3>Generate Excel Report</h3>

      <div className="form-grid">
        <div className="form-group">
          <label>START DATE</label>

          <input
            type="date"
            value={stockStartDate}
            onChange={(e) =>
              setStockStartDate(e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>END DATE</label>

          <input
            type="date"
            value={stockEndDate}
            onChange={(e) =>
              setStockEndDate(e.target.value)
            }
          />
        </div>
      </div>

      <button
        className="back-btn"
        type="button"
        onClick={downloadOutOfStockExcel}
      >
        DOWNLOAD EXCEL REPORT
      </button>
    </div>

    <div className="table-box">
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Date & Time Reported</th>
          </tr>
        </thead>

        <tbody>
          {outOfStockItems.map(item => (
            <tr key={item._id}>
              <td>{item.itemName}</td>

              <td>
                {new Date(
                  item.createdAt
                ).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
)}

          {adminPage === 'inventory' && (
            <>
              <form className="form-card" onSubmit={saveItem}>
                <h2>
                  {editingItemId
                    ? 'Edit Kitchen Dish Record'
                    : 'Add New Kitchen Dish Record'}
                </h2>

                <div className="form-grid reports-grid">
                  <div className="form-group">
                    <label>DISH NAME *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>PRICE</label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>CATEGORY</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>TAGS</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>MENU DESCRIPTION</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="checkout-buttons">
                  <button className="save-btn" type="submit">
                    {editingItemId ? 'UPDATE ITEM' : 'SAVE TO CLOUD DATABASE'}
                  </button>

                  {editingItemId && (
                    <button className="back-btn" type="button" onClick={clearForm}>
                      CANCEL EDIT
                    </button>
                  )}
                </div>
              </form>

              <h2 className="section-title">Live Inventory Control List</h2>

              <div className="table-box">
                <table>
                  <thead>
                    <tr>
                      <th>DISH NAME</th>
                      <th>CATEGORY</th>
                      <th>PRICE</th>
                      <th>STOCK STATUS</th>
                      <th>EDIT</th>
                      <th>DELETE</th>
                    </tr>
                  </thead>

                  <tbody>
                    {menuItems.map((item) => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td>{item.category}</td>
                        <td>${Number(item.price).toFixed(2)}</td>

                        <td>
                          <button
                            className={
                              item.available !== false
                                ? 'stock-btn in-stock'
                                : 'stock-btn out-stock'
                            }
                            onClick={() => toggleAvailability(item)}
                          >
                            {item.available !== false ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </td>

                        <td>
                          <button
                            className="edit-btn"
                            onClick={() => startEditItem(item)}
                          >
                            EDIT
                          </button>
                        </td>

                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => deleteItem(item._id)}
                          >
                            DELETE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {adminPage === 'orders' && (
            <>
              <h2 className="section-title">Guest Orders</h2>

              <button
                className="save-btn"
                type="button"
                onClick={enableAlarmSound}
                style={{ marginBottom: '16px' }}
              >
                {alarmEnabled ? 'ALARM SOUND ENABLED' : 'ENABLE ALARM SOUND'}
              </button>

              {newOrderAlert && (
                <div className="new-order-alert alarm-alert">
                  <span>New order received!</span>

                  <button onClick={stopAlarm}>
                    Checked / Stop Alarm
                  </button>
                </div>
              )}

              <div className="orders-list">
                {orders.length === 0 && (
                  <p className="empty-cart">No orders placed yet.</p>
                )}

                {orders.map((order) => (
                  <div className="order-card" key={order._id}>
                    <div className="order-header">
                      <h3>Order #{order.orderNumber}</h3>
                      <span>
                       {new Date(order.createdAt).toLocaleString('en-CA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                      </span>
                    </div>

                    <div className="order-info">
                      <p><strong>Guest:</strong> {order.guestName}</p>
                      <p><strong>Room:</strong> {order.roomNumber}</p>

                      {order.message && (
                        <p><strong>Message:</strong> {order.message}</p>
                      )}
                    </div>

                    <div className="order-items">
                      {order.items.map((item, index) => (
                        <p key={index}>
                          {item.quantity} × {item.name} — $
                          {(item.price * item.quantity).toFixed(2)}
                        </p>
                      ))}
                    </div>

                    <div className="order-total">
                      <p>Subtotal: ${Number(order.subtotal || 0).toFixed(2)}</p>
                      <p>Gratuity 18%: ${Number(order.gratuity || 0).toFixed(2)}</p>
                      <p>Tax 13%: ${Number(order.tax || 0).toFixed(2)}</p>
                      <strong>Total: ${Number(order.total || 0).toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {adminPage === 'guests' && (
            <>
              <h2 className="section-title">Guest Verification List</h2>

              <div className="form-card">
                <h2>Upload Guest Excel Sheet</h2>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={uploadGuestExcel}
                  disabled={guestUploading}
                />

                {guestUploadMessage && (
                  <p className="add-hint">{guestUploadMessage}</p>
                )}
              </div>

              <h2 className="section-title">Uploaded Guest List</h2>

              <div className="table-box">
                <table>
                  <thead>
                    <tr>
                      <th>Room No</th>
                      <th>Guest Name</th>
                    </tr>
                  </thead>

                  <tbody>
                    {guests.length === 0 && (
                      <tr>
                        <td colSpan="2">No guest list uploaded yet.</td>
                      </tr>
                    )}

                    {guests.map((guest) => (
                      <tr key={guest._id}>
                        <td>{guest.roomNumber}</td>
                        <td>{guest.guestName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}


          {adminPage === 'reports' && (
  <>
    <h2 className="section-title">Sales Reports</h2>

    <div className="form-card">
      <div className="form-grid">
        <div className="form-group">
          <label>REPORT TYPE</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="day">Day by Day Report</option>
            <option value="month">Monthly Report</option>
          </select>
        </div>

        {reportType === 'day' && (
          <div className="form-group">
            <label>SELECT DATE</label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
            />
          </div>
        )}

        {reportType === 'month' && (
          <div className="form-group">
            <label>SELECT MONTH</label>
            <input
              type="month"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label>&nbsp;</label>
          <button
            className="save-btn"
            type="button"
            onClick={fetchReport}
          >
            GENERATE REPORT
          </button>
          <button
            className="back-btn"
            type="button"
            onClick={downloadReportExcel}
            style={{ marginTop: '10px' }}
        >
            DOWNLOAD EXCEL REPORT
          </button>
        </div>
      </div>
    </div>

    <div className="table-box">
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Price</th>
            <th>Quantity Sold</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {reportItems.length === 0 && (
            <tr>
              <td colSpan="4">No report data available.</td>
            </tr>
          )}

          {reportItems.map((item) => (
            <tr key={item.itemName}>
              <td>{item.itemName}</td>
              <td>${Number(item.price).toFixed(2)}</td>
              <td>{item.quantitySold}</td>
              <td>${Number(item.total).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="checkout-summary professional-summary">
      <h2>Report Summary</h2>

      <div className="summary-row">
        <span>Total Orders</span>
        <strong>{reportOrderCount}</strong>
      </div>

      <div className="summary-total-row">
        <span>Grand Total</span>
        <strong>${Number(reportGrandTotal).toFixed(2)}</strong>
      </div>
    </div>
  </>
)}
        </div>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="page">
        <div className="container">
          <h1>Pesto&apos;s Checkout</h1>
          <p className="subtitle">Guest Information</p>

          <div className="gold-line"></div>

          <form className="checkout-form" onSubmit={placeOrder}>
            <div className="form-group">
              <label>FULL NAME *</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Please enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>ROOM NUMBER *</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Please enter your room number"
                required
              />
            </div>

            <div className="form-group">
              <label>MESSAGE / SPECIAL REQUESTS</label>
              <textarea
                value={guestMessage}
                onChange={(e) => setGuestMessage(e.target.value)}
                placeholder="Maximum 50 words"
              />
              <small>{wordCount}/50 words</small>
            </div>

            <div className="checkout-summary professional-summary">
              <h2>Order Summary</h2>

              <div className="summary-items">
                {cart.map((item) => (
                  <div className="summary-item" key={item._id}>
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.quantity} × ${item.price.toFixed(2)}</p>
                    </div>

                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>

              <div className="summary-row">
                <span>Gratuity 18%</span>
                <strong>${gratuity.toFixed(2)}</strong>
              </div>

              <div className="summary-row">
                <span>Tax 13%</span>
                <strong>${tax.toFixed(2)}</strong>
              </div>

              <div className="summary-total-row">
                <span>Total</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
            </div>

            <div className="checkout-buttons">
              <button type="submit" className="save-btn">
                PLACE ORDER
              </button>

              <button
                type="button"
                className="back-btn"
                onClick={() => setShowCheckout(false)}
              >
                ← BACK TO ORDER
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="top-row">
          <div>
            <h1 onClick={handleSecretClick}>Pesto&apos;s Eatery</h1>
            <p className="subtitle">Fresh • Authentic • Delicious</p>
          </div>
        </div>

        <div className="gold-line"></div>

        <div className="category-nav">
          {categories.map((cat) => (
            <button
              key={cat}
              ref={(el) => {
                categoryRefs.current[cat] = el;
              }}
              className={`category-btn ${
                selectedCategory === cat ? 'active' : ''
              }`}
              onClick={() => centerCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {selectedCategory === 'Featured' && (
          <h2 className="section-title">Today&apos;s Featured Specials</h2>
        )}

        <div className="guest-layout">
          <div className="menu-grid">
            {visibleItems.length === 0 && (
              <p className="empty-cart">
                No items available in this category right now.
              </p>
            )}

            {visibleItems.map((item) => {
              const itemImage = getMenuImage(item.name);

              return (
                <div
                  className={`menu-card compact-menu-card premium-menu-card ${
                    item.available === false ? 'unavailable-card' : ''
                  }`}
                  key={item._id}
                >
                  <div className="premium-card-main">
                    <div className="premium-card-info">
                      <div className="compact-menu-top">
                        <div className="compact-menu-info">
                          <h3>{item.name}</h3>
                        </div>

                        <div className="compact-menu-actions">
                          <span className="compact-price">
                            ${Number(item.price).toFixed(2)}
                          </span>

                          {item.available !== false && (
                            <button
                              className="item-add-btn"
                              onClick={() => addToCart(item)}
                              type="button"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </div>

                      {Array.isArray(item.tags) && item.tags.length > 0 && (
                        <p className="tags compact-tags">
                          {item.tags.join(', ')}
                        </p>
                      )}

                      {item.description && (
                        <button
                          type="button"
                          className="description-toggle"
                          onClick={() => toggleDescription(item._id)}
                        >
                          {openDescriptions[item._id]
                            ? 'Hide description ▲'
                            : 'View description ▼'}
                        </button>
                      )}
                    </div>

                    {itemImage && (
                      <img
                        src={itemImage}
                        alt={item.name}
                        className="menu-thumbnail"
                      />
                    )}
                  </div>

                  {item.description && openDescriptions[item._id] && (
                    <div className="description-section">
                      <p className="item-description">
                        {item.description}
                      </p>
                    </div>
                  )}

                  {item.available === false && (
                    <p className="unavailable-label">
                      Currently unavailable
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {cart.length > 0 && (
            <div className={`cart-box ${cartOpen ? 'cart-open' : 'cart-closed'}`}>
              <div
                className="cart-header"
                onClick={() => setCartOpen(!cartOpen)}
              >
                <h2>Your Order</h2>
                <span>{cartOpen ? '−' : '+'}</span>
              </div>

              {!cartOpen && (
                <p className="cart-mini-text">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} item
                  {cart.reduce((sum, item) => sum + item.quantity, 0) > 1
                    ? 's'
                    : ''}{' '}
                  • Total ${total.toFixed(2)}
                </p>
              )}

              {cartOpen && (
                <>
                  {cart.map((item) => (
                    <div className="cart-item" key={item._id}>
                      <div>
                        <strong>{item.name}</strong>
                        <p>
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>

                      <div className="cart-controls">
                        <button onClick={() => decreaseQuantity(item._id)}>
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button onClick={() => increaseQuantity(item._id)}>
                          +
                        </button>

                        <button
                          className="remove-cart-btn"
                          onClick={() => removeFromCart(item._id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="cart-summary">
                    <div>
                      <span>Subtotal</span>
                      <strong>${subtotal.toFixed(2)}</strong>
                    </div>

                    <div>
                      <span>Gratuity 18%</span>
                      <strong>${gratuity.toFixed(2)}</strong>
                    </div>

                    <div>
                      <span>Tax 13%</span>
                      <strong>${tax.toFixed(2)}</strong>
                    </div>

                    <div className="cart-total">
                      <span>Total</span>
                      <strong>${total.toFixed(2)}</strong>
                    </div>

                    <button
                      className="checkout-btn"
                      onClick={() => setShowCheckout(true)}
                    >
                      CHECKOUT
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;