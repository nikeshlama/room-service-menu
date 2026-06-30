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
const WING_SAUCES_URL = 'https://pestos-backend.onrender.com/api/wing-sauces';
const ROOM_SERVICE_STATUS_URL ='https://pestos-backend.onrender.com/api/room-service-status';
const ADDONS_URL = 'https://pestos-backend.onrender.com/api/addons';
const GLUTEN_OPTIONS_URL ='https://pestos-backend.onrender.com/api/gluten-options';

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
  'Chicken Wings & Fries': 'menu-images/wingsnfries.png',
  //Beverages images
  'Coke': 'menu-images/Coke.png',
  'Diet Coke': 'menu-images/DietCoke.png',
  'Sprite': 'menu-images/Sprite.png',
  'Ginger Ale': 'menu-images/GingerAle.png',
  'Fuze Iced Tea': 'menu-images/FuzeIcedTea.png',
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

  const [showOptionModal, setShowOptionModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [glutenFree, setGlutenFree] = useState(false);

  const [wingSauces, setWingSauces] = useState([]);
  const [selectedSauce, setSelectedSauce] = useState('');
  const [showWingSauceModal, setShowWingSauceModal] = useState(false);
  const [showSecondPoundModal, setShowSecondPoundModal] = useState(false);
  const [secondPound, setSecondPound] = useState(false);

  const [showSandwichSideModal, setShowSandwichSideModal] = useState(false);
  const [showFriesUpgradeModal, setShowFriesUpgradeModal] = useState(false);
  const [showSaladUpgradeModal, setShowSaladUpgradeModal] = useState(false);
  const [showDressingModal, setShowDressingModal] = useState(false);

  const [selectedSide, setSelectedSide] = useState('');
  const [sideUpgrade, setSideUpgrade] = useState('');
  const [dressing, setDressing] = useState('');

  const [showSaladDressingModal, setShowSaladDressingModal] = useState(false);

  const [showCaesarProteinModal, setShowCaesarProteinModal] = useState(false);

  const [showFettuccineShrimpModal, setShowFettuccineShrimpModal] = useState(false);

  const [showSteakDonenessModal, setShowSteakDonenessModal] = useState(false);

  const [showBurgerCheeseModal, setShowBurgerCheeseModal] = useState(false);
  const [showBurgerToppingsModal, setShowBurgerToppingsModal] = useState(false);
  const [burgerCheese, setBurgerCheese] = useState(false);
  const [burgerToppings, setBurgerToppings] = useState([]);

  const [toastMessage, setToastMessage] = useState('');

  const [checkoutError, setCheckoutError] = useState('');
  const [sauceError, setSauceError] = useState('');

  const [roomServiceLive, setRoomServiceLive] = useState(true);

  const [addons, setAddons] = useState([]);

  const [showKidsSpaghettiModal, setShowKidsSpaghettiModal] = useState(false);
  const [kidsSpaghettiOption, setKidsSpaghettiOption] = useState('');

  const [glutenOptions, setGlutenOptions] = useState([]);

  const [guestSearch, setGuestSearch] = useState('');
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuestRoom, setNewGuestRoom] = useState('');
  const [newGuestName, setNewGuestName] = useState('');


  const categoryRefs = useRef({});
  const lastOrderIdRef = useRef(null);
  const ordersLoadedRef = useRef(false);
  const alarmRef = useRef(null);

  const categories = [
    'Featured',
    'Appetizers',
    'Salads',
    'Sandwiches',
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

  const isAddonAvailable = (addonName) => {
  const addon = addons.find((item) => item.name === addonName);
  return addon ? addon.available !== false : true;
};

const isGlutenOptionAvailable = (itemName) => {
  const option = glutenOptions.find(
    (item) => item.itemName === itemName
  );

  return option ? option.available !== false : true;
};

  const getMenuImage = (itemName) => {
    const imagePath = menuImages[itemName] || menuImages[itemName?.trim()];
    return imagePath ? `${import.meta.env.BASE_URL}${imagePath}` : null;
  };

  const toastTimerRef = useRef(null);
  const showToast = (message) => {
  setToastMessage(message);

  clearTimeout(toastTimerRef.current);

  toastTimerRef.current = setTimeout(() => {
    setToastMessage('');
  }, 3000);
};

 // ===== BACK BUTTON HANDLER =====

 useEffect(() => {
  const pushAppHistory = () => {
    window.history.pushState({ app: true }, '', window.location.href);
  };

  pushAppHistory();
  pushAppHistory();

  const handleBackButton = () => {
    if (showReceipt) {
      setShowReceipt(false);
      pushAppHistory();
      return;
    }

    if (showCheckout) {
      setShowCheckout(false);
      pushAppHistory();
      return;
    }

    if (cartOpen) {
      setCartOpen(false);
      pushAppHistory();
      return;
    }

    pushAppHistory();
  };

  window.addEventListener('popstate', handleBackButton);

  return () => {
    window.removeEventListener('popstate', handleBackButton);
  };
}, [showReceipt, showCheckout, cartOpen]);
  
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

  const fetchRoomServiceStatus = async () => {
  try {
    const res = await fetch(ROOM_SERVICE_STATUS_URL);
    const data = await res.json();

    if (data.success) {
      setRoomServiceLive(data.isLive);
    }
  } catch (err) {
    console.error('GET ROOM SERVICE STATUS ERROR:', err);
  }
};

const updateRoomServiceStatus = async (isLive) => {
  try {
    const res = await fetch(ROOM_SERVICE_STATUS_URL, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isLive })
    });

    const data = await res.json();

    if (data.success) {
      setRoomServiceLive(data.isLive);
    }
  } catch (err) {
    console.error('UPDATE ROOM SERVICE STATUS ERROR:', err);
  }
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

  const fetchWingSauces = async () => {
  try {
    const res = await fetch(WING_SAUCES_URL);
    const data = await res.json();

    if (data.success) {
      setWingSauces(data.sauces);
    }
  } catch (err) {
    console.error('GET WING SAUCES ERROR:', err);
  }
 };

 const fetchAddons = async () => {
  try {
    const res = await fetch(ADDONS_URL);
    const data = await res.json();

    if (data.success) {
      setAddons(data.addons);
    }
  } catch (err) {
    console.error('GET ADDONS ERROR:', err);
  }
};

const fetchGlutenOptions = async () => {
  try {
    const res = await fetch(GLUTEN_OPTIONS_URL);
    const data = await res.json();

    if (data.success) {
      setGlutenOptions(data.options);
    }
  } catch (err) {
    console.error('GET GLUTEN OPTIONS ERROR:', err);
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

  const filteredGuests = guests.filter((guest) => {
  const search = guestSearch.toLowerCase().trim();

  if (!search) return true;

  return (
    String(guest.roomNumber).toLowerCase().includes(search) ||
    String(guest.guestName).toLowerCase().includes(search)
  );
});

const addSingleGuest = async () => {
  if (!newGuestRoom.trim() || !newGuestName.trim()) {
    alert('Room number and guest name are required.');
    return;
  }

  const res = await fetch(GUESTS_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      roomNumber: newGuestRoom,
      guestName: newGuestName
    })
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    alert(data.message || 'Failed to add guest');
    return;
  }

  setNewGuestRoom('');
  setNewGuestName('');
  setShowAddGuestModal(false);
  fetchGuests();
};

const deleteGuest = async (guestId) => {
  if (!window.confirm('Remove this guest?')) return;

  const res = await fetch(`${GUESTS_URL}/${guestId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    alert(data.message || 'Failed to remove guest');
    return;
  }

  fetchGuests();
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
  fetchWingSauces();
  fetchAddons();
  fetchGlutenOptions();
  fetchRoomServiceStatus();
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    fetchAddons();
  }, 2000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    fetchGlutenOptions();
  }, 2000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    fetchRoomServiceStatus();
  }, 2000);

  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    if (showAdmin && adminPage === 'orders') {
      fetchOrders(false);

      const interval = setInterval(() => {
        fetchOrders(true);
      }, 2000);

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

  const toggleAddonAvailability = async (addon) => {
  try {
    const res = await fetch(`${ADDONS_URL}/${addon._id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        available: addon.available === false ? true : false
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || 'Failed to update add-on');
      return;
    }

    fetchAddons();
  } catch (err) {
    console.error('UPDATE ADDON ERROR:', err);
  }
};

const toggleGlutenOptionAvailability = async (option) => {
  try {
    const res = await fetch(`${GLUTEN_OPTIONS_URL}/${option._id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        available: option.available === false ? true : false
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || 'Failed to update gluten option');
      return;
    }

    fetchGlutenOptions();
  } catch (err) {
    console.error('UPDATE GLUTEN OPTION ERROR:', err);
  }
};

const toggleSauceAvailability = async (sauce) => {
  try {
    const res = await fetch(`${WING_SAUCES_URL}/${sauce._id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        available: sauce.available === false ? true : false
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || 'Failed to update sauce');
      return;
    }

    fetchWingSauces();
  } catch (err) {
    console.error('UPDATE SAUCE ERROR:', err);
  }
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
  if (!roomServiceLive) {
    showToast('Room service hours have ended for the night.');
    return;
  }

  if (item.available === false) return;

  if (item.name === 'Classic Burger' ||
  item.name === 'Kids Burger & Fries') {
  setSelectedMenuItem(item);
  setBurgerCheese(false);
  setShowBurgerCheeseModal(true);
  return;
}

  if (item.name === 'Beef Tagliata Di Manzo') {
  setSelectedMenuItem(item);
  setShowSteakDonenessModal(true);
  return;
}

  if (item.name === 'Chicken Wings & Fries') {
    setSelectedMenuItem(item);
    setSelectedSauce('');
    setSecondPound(false);
    setSauceError('');
    setShowWingSauceModal(true);
    return;
  }

  if (item.name === 'Kids Spaghetti & Meatball') {
  setSelectedMenuItem(item);
  setKidsSpaghettiOption('');
  setShowKidsSpaghettiModal(true);
  return;
}

  if (item.category === 'Sandwiches') {
  setSelectedMenuItem(item);
  setSelectedSide('');
  setSideUpgrade('');
  setDressing('');
  setShowSandwichSideModal(true);
  return;
}

if (
  item.category === 'Salads' &&
  item.name !== 'Classic Caesar Salad'
) {
  setSelectedMenuItem(item);
  setDressing('');
  setShowSaladDressingModal(true);
  return;
}

if (
  item.category === 'Salads' &&
  item.name === 'Classic Caesar Salad'
) {
  setSelectedMenuItem(item);
  setShowCaesarProteinModal(true);
  return;
}

if (
  item.name === 'Spinach & Artichoke Dip' ||
  item.name === 'Paperdelle Primavera con aglio e olio' ||
  item.name === 'Chicken & Sherry Cream Fettuccine'
) {
  setSelectedMenuItem(item);
  setGlutenFree(false);

  if (isGlutenOptionAvailable(item.name)) {
    setShowOptionModal(true);
    return;
  }

  addPoutineToCart();
  return;
}

if (
  item.name === 'Poutine Platter' ||
  item.name === 'Signature Porchetta' ||
  item.name === 'Chicken Marsala' ||
  item.name === 'Beef Tagliata di Manzo'
) {
  setSelectedMenuItem(item);
  setGlutenFree(false);
  setShowOptionModal(true);
  return;
}

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
  showToast(`${item.name} added to cart`);
};

const addSandwichToCart = (
  finalSide,
  finalUpgrade = '',
  finalDressing = ''
) => {
  if (!selectedMenuItem || !finalSide) return;

  const item = selectedMenuItem;

  const extraPrice =
    finalUpgrade === 'Poutine Upgrade' ||
    finalUpgrade === 'Small Caesar Salad Upgrade'
      ? 3.99
      : 0;

  const cartItem = {
    _id: item._id,
    cartKey: `${item._id}-${finalSide}-${finalUpgrade}-${finalDressing}-${Date.now()}`,
    menuItemId: item._id,
    name: item.name,
    price: Number(item.price) + extraPrice,
    quantity: 1,

    side: finalSide,
    sideUpgrade: finalUpgrade,
    dressing: finalDressing
  };

  setCart((currentCart) => [...currentCart, cartItem]);
  showToast(`${cartItem.name} added to cart`);

  setShowSandwichSideModal(false);
  setShowFriesUpgradeModal(false);
  setShowSaladUpgradeModal(false);
  setShowDressingModal(false);

  setSelectedMenuItem(null);
  setSelectedSide('');
  setSideUpgrade('');
  setDressing('');
};

const addSaladToCart = (finalDressing) => {
  if (!selectedMenuItem || !finalDressing) return;

  const item = selectedMenuItem;

  const cartItem = {
    _id: item._id,
    cartKey: `${item._id}-salad-${finalDressing}-${Date.now()}`,
    menuItemId: item._id,
    name: item.name,
    price: Number(item.price),
    quantity: 1,
    dressing: finalDressing
  };

  setCart((currentCart) => [...currentCart, cartItem]);
  showToast(`${cartItem.name} added to cart`);

  setShowSaladDressingModal(false);
  setSelectedMenuItem(null);
  setDressing('');
};


const addCaesarSaladToCart = (protein = '', extraPrice = 0) => {
  if (!selectedMenuItem) return;

  const item = selectedMenuItem;

  const cartItem = {
  _id: item._id,
  cartKey: `${item._id}-${dressing}-${protein || 'none'}-${Date.now()}`,
  menuItemId: item._id,
  name: item.name,
  price: Number(item.price) + extraPrice,
  quantity: 1,
  dressing,
  saladProtein: protein
};

  setCart((currentCart) => [...currentCart, cartItem]);
  showToast(`${cartItem.name} added to cart`);

  setShowCaesarProteinModal(false);
  setSelectedMenuItem(null);
  setDressing('');
};

const addPoutineToCart = () => {
  if (
    selectedMenuItem?.name === 'Chicken & Sherry Cream Fettuccine'
  ) {
    setShowOptionModal(false);
    setShowFettuccineShrimpModal(true);
    return;
  }

  if (!selectedMenuItem) return;

  const item = selectedMenuItem;

  const cartItem = {
    _id: item._id,
    cartKey: `${item._id}-${glutenFree ? 'gf' : 'regular'}-${Date.now()}`,
    menuItemId: item._id,
    name: item.name,
    price: Number(item.price),
    quantity: 1,
    glutenFree
  };

  setCart((currentCart) => [...currentCart, cartItem]);
  showToast(`${cartItem.name} added to cart`);
  setShowOptionModal(false);
  setSelectedMenuItem(null);
  setGlutenFree(false);
};

const addFettuccineToCart = (addShrimp = false) => {
  if (!selectedMenuItem) return;

  const cartItem = {
    _id: selectedMenuItem._id,
    cartKey: `${selectedMenuItem._id}-${glutenFree}-${addShrimp}-${Date.now()}`,
    name: selectedMenuItem.name,
    price: Number(selectedMenuItem.price) + (addShrimp ? 7 : 0),
    quantity: 1,
    glutenFree,
    saladProtein: addShrimp ? 'Garlic Shrimp' : ''
  };

  setCart((currentCart) => [...currentCart, cartItem]);
  showToast(`${cartItem.name} added to cart`);
  setShowFettuccineShrimpModal(false);
  setSelectedMenuItem(null);
  setGlutenFree(false);
};

const addKidsSpaghettiToCart = (option) => {
  if (!selectedMenuItem || !option) return;

  const item = selectedMenuItem;

  const cartItem = {
    _id: item._id,
    cartKey: `${item._id}-${option}-${Date.now()}`,
    menuItemId: item._id,
    name: item.name,
    price: Number(item.price),
    quantity: 1,
    kidsSpaghettiOption: option
  };

  setCart((currentCart) => [...currentCart, cartItem]);
  showToast(`${item.name} added to cart`);

  setShowKidsSpaghettiModal(false);
  setSelectedMenuItem(null);
  setKidsSpaghettiOption('');
};

const addSteakToCart = (doneness) => {
  if (!selectedMenuItem || !doneness) return;

  const cartItem = {
    _id: selectedMenuItem._id,
    cartKey: `${selectedMenuItem._id}-${doneness}-${Date.now()}`,
    menuItemId: selectedMenuItem._id,
    name: selectedMenuItem.name,
    price: Number(selectedMenuItem.price),
    quantity: 1,
    doneness
  };

  setCart((currentCart) => [...currentCart, cartItem]);
  showToast(`${cartItem.name} added to cart`);
  setShowSteakDonenessModal(false);
  setSelectedMenuItem(null);
};

const addBurgerToCart = (finalSide, finalUpgrade = '', finalDressing = '') => {
  if (!selectedMenuItem) return;

  const removedToppings = burgerToppings.length > 0
    ? burgerToppings.join(', ')
    : 'Keep All Toppings';

  const extraPrice =
  (burgerCheese ? 2 : 0) +
  (finalUpgrade === 'Poutine Upgrade' ||
  finalUpgrade === 'Small Caesar Salad Upgrade'
    ? 3.99
    : 0);

  const cartItem = {
    _id: selectedMenuItem._id,
    cartKey: `${selectedMenuItem._id}-${burgerCheese}-${removedToppings}-${finalSide}-${finalUpgrade}-${finalDressing}-${Date.now()}`,
    menuItemId: selectedMenuItem._id,
    name: selectedMenuItem.name,
    price: Number(selectedMenuItem.price) + extraPrice,
    quantity: 1,
    burgerCheese,
    burgerToppings: removedToppings,
    side: finalSide,
    sideUpgrade: finalUpgrade,
    dressing: finalDressing
  };

  setCart((currentCart) => [...currentCart, cartItem]);
  showToast(`${cartItem.name} added to cart`);
  setShowBurgerCheeseModal(false);
  setShowBurgerToppingsModal(false);
  setShowSandwichSideModal(false);
  setShowFriesUpgradeModal(false);
  setShowSaladUpgradeModal(false);
  setShowDressingModal(false);

  setSelectedMenuItem(null);
  setBurgerCheese(false);
  setBurgerToppings([]);
};

const addWingsToCart = () => {
  if (!selectedMenuItem || !selectedSauce) {
  setSauceError('Please choose one sauce.');
  return;
}

  const item = selectedMenuItem;
  const extraPrice = secondPound ? 10 : 0;

  const cartItem = {
  ...selectedMenuItem,

  _id: item._id,
  cartKey:
    selectedMenuItem.editingCartKey ||
    `${item._id}-${selectedSauce}-${secondPound ? 'second-pound' : 'regular'}-${Date.now()}`,

  menuItemId: item._id,
  sauce: selectedSauce,
  secondPound,
  price: selectedMenuItem.editingCartKey
  ? Number(selectedMenuItem.price) + (secondPound && !selectedMenuItem.secondPound ? 10 : 0)
  : Number(item.price) + extraPrice,
  quantity: selectedMenuItem.quantity || 1
};

  if (selectedMenuItem.editingCartKey) {
  setCart((currentCart) =>
    currentCart.map((item) =>
      (item.cartKey || item._id) === selectedMenuItem.editingCartKey
        ? cartItem
        : item
    )
  );
} else {
  setCart((currentCart) => [...currentCart, cartItem]);
}
  showToast(
  selectedMenuItem.editingCartKey
    ? 'Wing sauce updated'
    : `${cartItem.name} added to cart`
);
  setCheckoutError('');
  setShowSecondPoundModal(false);
  setSelectedMenuItem(null);
  setSelectedSauce('');
  setSecondPound(false);
};

const increaseQuantity = (cartKey) => {
  const cartItem = cart.find(
    (item) => (item.cartKey || item._id) === cartKey
  );

  if (!cartItem) return;

  if (cartItem.name === 'Chicken Wings & Fries') {
  const originalMenuItem = menuItems.find(
    (item) => item._id === (cartItem.menuItemId || cartItem._id)
  );

  if (!originalMenuItem) return;

  setSelectedMenuItem({
    ...originalMenuItem
  });

  setSelectedSauce('');
  setSecondPound(false);
  setSauceError('');

  setShowWingSauceModal(true);

  return;
}

  setCart((currentCart) =>
    currentCart.map((item) =>
      (item.cartKey || item._id) === cartKey
        ? { ...item, quantity: item.quantity + 1 }
        : item
    )
  );
};

 const decreaseQuantity = (cartKey) => {
  setCart((currentCart) =>
    currentCart
      .map((item) =>
        (item.cartKey || item._id) === cartKey
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
};

const editWingSauce = (cartKey) => {
  const cartItem = cart.find(
    (item) => (item.cartKey || item._id) === cartKey
  );

  if (!cartItem) return;

  setSelectedMenuItem({
    ...cartItem,
    editingCartKey: cartKey
  });

  setSelectedSauce(cartItem.sauce || '');
  setSecondPound(cartItem.secondPound || false);
  setSauceError('');

  setShowWingSauceModal(true);
};

 const removeFromCart = (cartKey) => {
  setCart((currentCart) =>
    currentCart.filter(
      (item) => (item.cartKey || item._id) !== cartKey
    )
  );
};

const removeUnavailableAddonsFromCart = (latestAddons) => {
  const unavailableAddons = latestAddons
    .filter((addon) => addon.available === false)
    .map((addon) => addon.name);

  if (unavailableAddons.length === 0) {
    return false;
  }

  const cartItemsToUpdate = cart.filter(
    (item) =>
      item.saladProtein &&
      unavailableAddons.includes(item.saladProtein)
  );

  if (cartItemsToUpdate.length === 0) {
    return false;
  }

  const uniqueRemoved = [
    ...new Set(cartItemsToUpdate.map((item) => item.saladProtein))
  ];

  setCart((currentCart) =>
    currentCart.map((item) => {
      if (
        item.saladProtein &&
        unavailableAddons.includes(item.saladProtein)
      ) {
        const priceReduction =
          item.saladProtein === 'Garlic Shrimp' ? 7 : 8;

        return {
          ...item,
          price: Math.max(0, item.price - priceReduction),
          saladProtein: ''
        };
      }

      return item;
    })
  );

  setCheckoutError(
    `Sorry, we just ran out of ${uniqueRemoved.join(
      ', '
    )}. We removed it from your order and updated your final total. Please review your new total before placing the order.`
  );
console.log('REMOVED ADDONS:', uniqueRemoved);
  return true;
};

const removeUnavailableSaucesFromCart = (latestSauces) => {
  const unavailableSauces = latestSauces
    .filter((sauce) => sauce.available === false)
    .map((sauce) => sauce.name);

  if (unavailableSauces.length === 0) {
    return false;
  }

  let removedSauces = [];

  setCart((currentCart) =>
    currentCart.map((item) => {
      if (
        item.sauce &&
        unavailableSauces.includes(item.sauce)
      ) {
        removedSauces.push(item.sauce);

        return {
          ...item,
          sauce: ''
        };
      }

      return item;
    })
  );

  if (removedSauces.length > 0) {
    const uniqueRemoved = [...new Set(removedSauces)];

    setCheckoutError(
      `${uniqueRemoved.join(
        ', '
      )} sauce is currently out of stock and has been removed from your wings. Please use the Edit Sauce button in your cart to select another sauce.`
    );

    return true;
  }

  return false;
};

const placeOrder = async (e) => {
  e.preventDefault();

  setCheckoutError('');

  if (cart.length === 0) {
    setShowCheckout(false);
    setCartOpen(false);

    showToast(
      'Your cart is empty. Please add an item before checkout.'
    );

    return;
  }

  try {
    const statusRes = await fetch(ROOM_SERVICE_STATUS_URL);
    const statusData = await statusRes.json();

    if (!statusData.isLive) {
      setCheckoutError(
        'Room service hours have ended for the night.'
      );
      return;
    }

  } catch (err) {
  console.error(err);
  setCheckoutError(
    'Something went wrong. Please try again.'
  );
  return;
}

const addonRes = await fetch(ADDONS_URL);
const addonData = await addonRes.json();

if (addonData.success) {
  setAddons(addonData.addons);

  const removedUnavailableAddons =
    removeUnavailableAddonsFromCart(addonData.addons);

  if (removedUnavailableAddons) {
    return;
  }
}

const glutenRes = await fetch(GLUTEN_OPTIONS_URL);
const glutenData = await glutenRes.json();

if (glutenData.success) {
  setGlutenOptions(glutenData.options);

  const unavailableGlutenItems = glutenData.options
    .filter((option) => option.available === false)
    .map((option) => option.itemName);

  const cartHasUnavailableGlutenOption = cart.find(
    (item) =>
      item.glutenFree &&
      unavailableGlutenItems.includes(item.name)
  );

  if (cartHasUnavailableGlutenOption) {
    setCheckoutError(
      `Sorry, gluten option for ${cartHasUnavailableGlutenOption.name} got out of stock, please order another item.`
    );

    return;
  }
}

const sauceRes = await fetch(WING_SAUCES_URL);
const sauceData = await sauceRes.json();

if (sauceData.success) {
  setWingSauces(sauceData.sauces);

  const unavailableSauces = sauceData.sauces
    .filter((sauce) => sauce.available === false)
    .map((sauce) => sauce.name);

  const cartHasUnavailableSauce = cart.some(
    (item) =>
      item.sauce &&
      unavailableSauces.includes(item.sauce)
  );

  if (cartHasUnavailableSauce) {
    const removedSauces = [];

    setCart((currentCart) =>
      currentCart.map((item) => {
        if (
          item.sauce &&
          unavailableSauces.includes(item.sauce)
        ) {
          removedSauces.push(item.sauce);

          return {
            ...item,
            sauce: ''
          };
        }

        return item;
      })
    );

    setCheckoutError(
  `${[...new Set(removedSauces)].join(', ')} are now out of stock and have been removed from your cart. Please use Edit Sauce to choose another sauce.`
);

    return;
  }
}

const wingsWithoutSauce = cart.some(
  (item) =>
    item.name === 'Chicken Wings & Fries' &&
    !item.sauce
);

if (wingsWithoutSauce) {
  setCheckoutError(
    'One or more wing orders require a sauce selection. Please edit your cart and choose a sauce.'
  );
  return;
}

    if (wordCount > 50) {
      setCheckoutError('Message must be 50 words or less.');
      return;
    }

    const res = await fetch(ORDERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestName,
        roomNumber,
        message: guestMessage,
        items: cart.map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,

        glutenFree: item.glutenFree || false,
        sauce: item.sauce || '',
        secondPound: item.secondPound || false,

        side: item.side || '',
        sideUpgrade: item.sideUpgrade || '',
        dressing: item.dressing || '',
        saladProtein: item.saladProtein || '',
        doneness: item.doneness || '',
        kidsSpaghettiOption: item.kidsSpaghettiOption || '',
        burgerCheese: item.burgerCheese || false,
        burgerToppings: item.burgerToppings || ''})),
        subtotal,
        gratuity,
        tax,
        total
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
  setCheckoutError(
    data.message ||
      'Guest name and room number do not match our check-in records. Please enter the correct room number and exact check-in name.'
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
      date: new Date().toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
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
          <div className="receipt-box">
            <div className="receipt-letterhead">
  <p><strong>Pesto's</strong></p>
  <p>Italian Eatery & Saloon</p>
  <p>85 ST ANNE ROAD</p>
  <p>Sudbury, ON P3E-454</p>
  <p>705-671-6662</p>
  <p>GST# 887494516</p>
</div>

<hr />

<p>Room {receiptData.roomNumber}</p>
<p>Guest: {receiptData.guestName}</p>

<hr />

<p>Check #{receiptData.orderNumber}</p>
<p>{receiptData.date}</p>

<hr />
            {receiptData.items.map((item) => (
              <div className="receipt-item" key={item._id}>
                <div>
  <span>
    {item.quantity} × {item.name}
  </span>

  {item.glutenFree && (
    <div className="option-text">
      Gluten Free
    </div>
  )}

  {item.sauce && (
    <div className="option-text">
      Sauce: {item.sauce}
    </div>
  )}

  {item.secondPound && (
    <div className="option-text">
      + 2nd Pound Wings
    </div>
  )}

  {item.side && (
  <div className="option-text">
    Side: {item.side}
  </div>
)}

{item.sideUpgrade && (
  <div className="option-text">
    Upgrade: {item.sideUpgrade}
  </div>
)}

{item.dressing && (
  <div className="option-text">
    Dressing: {item.dressing}
  </div>
)}

{item.saladProtein && (
  <div className="option-text">
    Add-on: {item.saladProtein}
  </div>
)}

{item.doneness && (
  <div className="option-text">
    Steak: {item.doneness}
  </div>
)}

{item.kidsSpaghettiOption && (
  <p className="option-text">
    {item.kidsSpaghettiOption}
  </p>
)}

{item.burgerCheese && (
  <p className="option-text checkout-option">
    Add Cheese
  </p>
)}

{item.burgerToppings && (
  <p className="option-text checkout-option">
    Toppings: {item.burgerToppings}
  </p>
)}

</div>
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
  THANK YOU FOR DINING WITH US
  <br />
  FOR QUESTIONS CALL 705-671-6662
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

      {showAddGuestModal && (
        <div className="modal-overlay">
          <div className="option-modal">
            <h2>Add Guest</h2>

            <div className="form-group">
              <label>ROOM NUMBER</label>
              <input
                type="text"
                value={newGuestRoom}
                onChange={(e) => setNewGuestRoom(e.target.value)}
                placeholder="Example: 204"
              />
            </div>

            <div className="form-group">
              <label>FULL NAME</label>
              <input
                type="text"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                placeholder="Example: John Smith"
              />
            </div>

            <button
              className="save-btn"
              type="button"
              onClick={addSingleGuest}
            >
              SAVE GUEST
            </button>

            <button
              className="back-btn"
              type="button"
              onClick={() => {
                setShowAddGuestModal(false);
                setNewGuestRoom('');
                setNewGuestName('');
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

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

          <div className="room-service-control">
            <div
            className={`room-service-status ${
              roomServiceLive ? 'service-live' : 'service-stopped'
            }`}
            >
              {roomServiceLive
              ? '✅ Room service is live'
              : '❌ Room service stopped'}
              </div>
              <div className="room-service-buttons">
                <button
                className="save-btn"
                type="button"
                onClick={() => updateRoomServiceStatus(true)}
                >
                  START ROOM SERVICE
                  </button>
                  <button
                  className="back-btn"
                  type="button"
                  onClick={() => updateRoomServiceStatus(false)}
                  >
                    STOP ROOM SERVICE
                    </button>
                    </div>
                    </div>

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

<button
  className={`admin-nav-btn ${
    adminPage === 'kitchen' ? 'active-admin' : ''
  }`}
  onClick={() => {
    setAdminPage('kitchen');
    fetchOutOfStockItems();
  }}
>
  Kitchen Inventory
</button>

<button
  className={`admin-nav-btn ${
    adminPage === 'addons' ? 'active-admin' : ''
  }`}
  onClick={() => {
    setAdminPage('addons');
    fetchAddons();
  }}
>
  Add-on Inventory
</button>

<button
  className={`admin-nav-btn ${
    adminPage === 'sauces' ? 'active-admin' : ''
  }`}
  onClick={() => {
    setAdminPage('sauces');
    fetchWingSauces();
  }}
>
  Sauce Inventory
</button>

<button
  className={`admin-nav-btn ${
    adminPage === 'gluten' ? 'active-admin' : ''
  }`}
  onClick={() => {
    setAdminPage('gluten');
    fetchGlutenOptions();
  }}
>
  Gluten Inventory
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

{adminPage === 'addons' && (
  <>
    <h2 className="section-title">Add-on Inventory</h2>

    <div className="table-box">
      <table>
        <thead>
          <tr>
            <th>Add-on Name</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {addons.map((addon) => (
            <tr key={addon._id}>
              <td>{addon.name}</td>

              <td>
                <button
                  className={
                    addon.available !== false
                      ? 'stock-btn in-stock'
                      : 'stock-btn out-stock'
                  }
                  onClick={() => toggleAddonAvailability(addon)}
                >
                  {addon.available !== false
                    ? 'In Stock'
                    : 'Out of Stock'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
)}

{adminPage === 'gluten' && (
  <>
    <h2 className="section-title">Gluten Inventory</h2>

    <div className="table-box">
      <table>
        <thead>
          <tr>
            <th>Menu Item</th>
            <th>Gluten Option Status</th>
          </tr>
        </thead>

        <tbody>
          {glutenOptions.map((option) => (
            <tr key={option._id}>
              <td>{option.itemName}</td>

              <td>
                <button
                  className={
                    option.available !== false
                      ? 'stock-btn in-stock'
                      : 'stock-btn out-stock'
                  }
                  onClick={() =>
                    toggleGlutenOptionAvailability(option)
                  }
                >
                  {option.available !== false
                    ? 'In Stock'
                    : 'Out of Stock'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
)}

{adminPage === 'sauces' && (
  <>
    <h2 className="section-title">
      Wing Sauce Inventory
    </h2>

    <div className="table-box">
      <table>
        <thead>
          <tr>
            <th>Sauce Name</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {wingSauces.map((sauce) => (
            <tr key={sauce._id}>
              <td>{sauce.name}</td>

              <td>
                <button
                  className={
                    sauce.available !== false
                      ? 'stock-btn in-stock'
                      : 'stock-btn out-stock'
                  }
                  onClick={() =>
                    toggleSauceAvailability(sauce)
                  }
                >
                  {sauce.available !== false
                    ? 'In Stock'
                    : 'Out Of Stock'}
                </button>
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
                        <div key={index}>
  <p>
    {item.quantity} × {item.name} — $
    {(item.price * item.quantity).toFixed(2)}
  </p>

  {item.glutenFree && (
    <p className="option-text">
      Gluten Free
    </p>
  )}

  {item.sauce && (
  <p className="option-text">
    Sauce: {item.sauce}
  </p>
)}

{item.secondPound && (
  <p className="option-text">
    + 2nd Pound Wings
  </p>
)}

{item.side && (
  <p className="option-text">
    Side: {item.side}
  </p>
)}

{item.sideUpgrade && (
  <p className="option-text">
    Upgrade: {item.sideUpgrade}
  </p>
)}

{item.dressing && (
  <p className="option-text">
    Dressing: {item.dressing}
  </p>
)}

{item.saladProtein && (
  <p className="option-text">
    Add-on: {item.saladProtein}
  </p>
)}

{item.kidsSpaghettiOption && (
  <p className="option-text">
    {item.kidsSpaghettiOption}
  </p>
)}

{item.doneness && (
  <p className="option-text">
    Steak: {item.doneness}
  </p>
)}

{item.burgerCheese && (
  <p className="option-text checkout-option">
    Add Cheese
  </p>
)}

{item.burgerToppings && (
  <p className="option-text checkout-option">
    Toppings: {item.burgerToppings}
  </p>
)}

</div>
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

    <div className="form-card">
  <h2>Add Single Guest</h2>

  <button
    className="save-btn"
    type="button"
    onClick={() => setShowAddGuestModal(true)}
  >
    ADD GUEST
  </button>
</div>

<div className="form-card">
  <h2>Search Guest</h2>

  <div className="form-group">
    <label>SEARCH BY NAME OR ROOM</label>
    <input
      type="text"
      value={guestSearch}
      onChange={(e) => setGuestSearch(e.target.value)}
      placeholder="Example: 204 or John"
    />
  </div>
</div>

    <h2 className="section-title">Uploaded Guest List</h2>

    <div className="table-box">
      <table>
        <thead>
          <tr>
            <th>Room No</th>
            <th>Guest Name</th>
            <th>Remove</th>
          </tr>
        </thead>

        <tbody>
          {filteredGuests.length === 0 && (
            <tr>
              <td colSpan="3">No guest found.</td>
            </tr>
          )}

          {filteredGuests.map((guest) => (
            <tr key={guest._id}>
              <td>{guest.roomNumber}</td>
              <td>{guest.guestName}</td>
              <td>
                <button
                  className="delete-btn"
                  type="button"
                  onClick={() => deleteGuest(guest._id)}
                >
                  REMOVE
                </button>
              </td>
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
        {showWingSauceModal && selectedMenuItem && (
  <div className="modal-overlay">
    <div className="option-modal">
      <h2>{selectedMenuItem.name}</h2>

      <p>Choose one sauce</p>

      {sauceError && (
        <p className="field-error">
          {sauceError}
        </p>
      )}

      {wingSauces
        .filter((sauce) => sauce.available)
        .map((sauce) => (
          <label key={sauce._id}>
            <input
              type="radio"
              name="wingSauce"
              checked={selectedSauce === sauce.name}
              onChange={() => {
                setSelectedSauce(sauce.name);
                setSauceError('');
              }}
            />
            {sauce.name}
          </label>
        ))}

<button
  className="save-btn"
  type="button"
  onClick={() => {
  if (!selectedSauce) {
    setSauceError('Please choose one sauce.');
    return;
  }

  // Editing an existing wings order
  if (selectedMenuItem.editingCartKey) {
  if (selectedMenuItem.secondPound) {
    addWingsToCart();
    setShowWingSauceModal(false);
    setShowSecondPoundModal(false);
    return;
  }

  setShowWingSauceModal(false);
  setShowSecondPoundModal(true);
  return;
}

  // Adding a brand-new wings order
  setShowWingSauceModal(false);
  setShowSecondPoundModal(true);
}}
>
  UPDATE SAUCE
</button>
    </div>
  </div>
)}
        <div className="container">
          <h1>Pesto&apos;s Checkout</h1>
          <p className="subtitle">Guest Information</p>

          <div className="gold-line"></div>

          <form className="checkout-form" onSubmit={placeOrder}>
            {checkoutError && (
  <p className="field-error">
    {checkoutError}
  </p>
)}
            <div className="form-group">
              <label>FULL NAME *</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => {setGuestName(e.target.value);setCheckoutError('');}}
                placeholder="Please enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>ROOM NUMBER *</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => {setRoomNumber(e.target.value);setCheckoutError('');}}
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
      <div className="summary-item" key={item.cartKey || item._id}>
        <div>
          <strong>{item.name}</strong>

{item.glutenFree && (
  <p className="option-text">
    Gluten Free
  </p>
)}

{item.sauce?.trim() && (
  <p className="option-text checkout-option">
    Sauce: {item.sauce}
  </p>
)}

{item.name === 'Chicken Wings & Fries' &&
  !item.sauce && (
    <button
      type="button"
      className="sauce-required-btn"
      onClick={() => {
        setShowCheckout(false);
        setCartOpen(true);
      }}
    >
      ⚠ Sauce selection required — tap to edit in cart
    </button>
)}

{item.secondPound && (
  <p className="option-text checkout-option">
    + 2nd Pound Wings
  </p>
)}

{item.side && (
  <p className="option-text checkout-option">
    Side: {item.side}
  </p>
)}

{item.sideUpgrade && (
  <p className="option-text checkout-option">
    Upgrade: {item.sideUpgrade}
  </p>
)}

{item.dressing && (
  <p className="option-text checkout-option">
    Dressing: {item.dressing}
  </p>
)}

{item.saladProtein && (
  <p className="option-text checkout-option">
    Add-on: {item.saladProtein}
  </p>
)}

{item.doneness && (
  <p className="option-text checkout-option">
    Steak: {item.doneness}
  </p>
)}

{item.kidsSpaghettiOption && (
  <p className="option-text">
    {item.kidsSpaghettiOption}
  </p>
)}

{item.burgerCheese && (
  <p className="option-text checkout-option">
    Add Cheese
  </p>
)}

{item.burgerToppings && (
  <p className="option-text checkout-option">
    Toppings: {item.burgerToppings}
  </p>
)}

<p>
  {item.quantity} × ${item.price.toFixed(2)}
</p>

</div>

<span>
  ${(item.price * item.quantity).toFixed(2)}
</span>

      </div>
    ))}
  </div>
  

  {checkoutError && (
  <div className="field-error">
    {checkoutError}
  </div>
)}


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

    {showWingSauceModal && selectedMenuItem && (
  <div className="modal-overlay">
    <div className="option-modal">
      <h2>{selectedMenuItem.name}</h2>

      <p>Choose one sauce</p>
      {sauceError && (
  <p className="field-error">
    {sauceError}
  </p>
)}

      {wingSauces
        .filter((sauce) => sauce.available)
        .map((sauce) => (
          <label key={sauce._id}>
            <input
              type="radio"
              name="wingSauce"
              checked={selectedSauce === sauce.name}
              onChange={() => {
                setSelectedSauce(sauce.name);
                setSauceError('');
                }}
            />
            {sauce.name}
          </label>
        ))}

      <button
        className="save-btn"
        type="button"
        onClick={() => {
  if (!selectedSauce) {
    setSauceError('Please choose one sauce.');
    return;
  }

  if (selectedMenuItem.editingCartKey) {
    if (selectedMenuItem.secondPound) {
      addWingsToCart();
      setShowWingSauceModal(false);
      setShowSecondPoundModal(false);
      return;
    }

    setShowWingSauceModal(false);
    setShowSecondPoundModal(true);
    return;
  }

  setShowWingSauceModal(false);
  setShowSecondPoundModal(true);
}}
      >
        NEXT
      </button>

      <button
        className="back-btn"
        type="button"
        onClick={() => {
          setShowWingSauceModal(false);
          setSelectedMenuItem(null);
          setSelectedSauce('');
          setSecondPound(false);
        }}
      >
        CANCEL
      </button>
    </div>
  </div>
)}

{showKidsSpaghettiModal && selectedMenuItem && (
  <div className="modal-overlay">
    <div className="option-modal">
      <h2>{selectedMenuItem.name}</h2>

      <p>Choose pasta option</p>

      <button
        className="save-btn"
        type="button"
        onClick={() => addKidsSpaghettiToCart('Regular')}
      >
        Regular
      </button>

      <button
        className="save-btn"
        type="button"
        onClick={() =>
          addKidsSpaghettiToCart(
            'No sauce on pasta - Garlic butter on pasta'
          )
        }
      >
        No sauce on pasta & add garlic butter on pasta
      </button>

      <button
        className="back-btn"
        type="button"
        onClick={() => {
          setShowKidsSpaghettiModal(false);
          setSelectedMenuItem(null);
          setKidsSpaghettiOption('');
        }}
      >
        CANCEL
      </button>
    </div>
  </div>
)}

{showBurgerCheeseModal && selectedMenuItem && (
  <div className="modal-overlay">
    <div className="option-modal">
      <h2>{selectedMenuItem.name}</h2>

      <p>Add cheese for $2?</p>

      <button
        className="save-btn"
        type="button"
        onClick={() => {
          setBurgerCheese(true);
          setShowBurgerCheeseModal(false);
          if (selectedMenuItem.name === 'Kids Burger & Fries') {
            addBurgerToCart('', '', '');
          } else {
             setShowBurgerToppingsModal(true);
            }
          }}
      >
        Add Cheese (+$2)
      </button>

      <button
        className="back-btn"
        type="button"
        onClick={() => {
          setBurgerCheese(false);
          setShowBurgerCheeseModal(false);
          if (selectedMenuItem.name === 'Kids Burger & Fries') {
            addBurgerToCart('', '', '');
          } else {
            setShowBurgerToppingsModal(true);
          }
        }}
      >
        No Cheese
      </button>
    </div>
  </div>
)}

{showBurgerToppingsModal && selectedMenuItem && (
  <div className="modal-overlay">
    <div className="option-modal">
      <h2>{selectedMenuItem.name}</h2>
      <p>Choose toppings to remove</p>

      {['No Onion', 'No Tomato', 'No Lettuce', 'No Pickle'].map((option) => (
        <label key={option}>
          <input
            type="checkbox"
            checked={burgerToppings.includes(option)}
            onChange={() => {
              setBurgerToppings((current) =>
                current.includes(option)
                  ? current.filter((item) => item !== option)
                  : [...current, option]
              );
            }}
          />
          {option}
        </label>
      ))}

      <button
        className="save-btn"
        type="button"
        onClick={() => {
          setShowBurgerToppingsModal(false);
          setShowSandwichSideModal(true);
        }}
      >
        NEXT
      </button>
    </div>
  </div>
)}

{showSandwichSideModal && selectedMenuItem && (
  <div className="modal-overlay">
    <div className="option-modal">
      <h2>{selectedMenuItem.name}</h2>
      <p>Choose your side</p>

      <button
        className="save-btn"
        type="button"
        onClick={() => {
          setSelectedSide('Fries');
          setShowSandwichSideModal(false);
          setShowFriesUpgradeModal(true);
        }}
      >
        Fries
      </button>

      <button
        className="save-btn"
        type="button"
        onClick={() => {
          setSelectedSide('Garden Salad');
          setShowSandwichSideModal(false);
          setShowSaladUpgradeModal(true);
        }}
      >
        Salad
      </button>

      <button
        className="back-btn"
        type="button"
        onClick={() => {
          setShowSandwichSideModal(false);
          setSelectedMenuItem(null);
          setSelectedSide('');
          setSideUpgrade('');
          setDressing('');
        }}
      >
        CANCEL
      </button>
    </div>
  </div>
)}

{showFriesUpgradeModal && selectedMenuItem && (
  <div className="modal-overlay">
    <div className="option-modal">
      <h2>{selectedMenuItem.name}</h2>
      <p>Upgrade fries to poutine for $3.99?</p>

      <button
  className="save-btn"
  type="button"
  onClick={() =>
    selectedMenuItem.name === 'Classic Burger'
      ? addBurgerToCart('Fries', 'Poutine Upgrade')
      : addSandwichToCart('Fries', 'Poutine Upgrade')
  }
>
  Yes, upgrade to poutine
</button>

<button
  className="back-btn"
  type="button"
  onClick={() =>
    selectedMenuItem.name === 'Classic Burger'
      ? addBurgerToCart('Fries')
      : addSandwichToCart('Fries')
  }
>
  No, keep fries
</button>
    </div>
  </div>
)}

{showSaladUpgradeModal && selectedMenuItem && (
  <div className="modal-overlay">
    <div className="option-modal">
      <h2>{selectedMenuItem.name}</h2>
      <p>Upgrade garden salad to small Caesar salad for $3.99?</p>

      <button
        className="save-btn"
        type="button"
        onClick={() =>
  selectedMenuItem.name === 'Classic Burger'
    ? addBurgerToCart(
        'Small Caesar Salad',
        'Small Caesar Salad Upgrade'
      )
    : addSandwichToCart(
        'Small Caesar Salad',
        'Small Caesar Salad Upgrade'
      )
}
      >
        Yes, Caesar upgrade
      </button>

      <button
        className="back-btn"
        type="button"
        onClick={() => {
          setSelectedSide('Garden Salad');
          setSideUpgrade('');
          setShowSaladUpgradeModal(false);
          setShowDressingModal(true);
        }}
      >
        No, garden salad
      </button>
    </div>
  </div>
)}

{showDressingModal && selectedMenuItem && (
  <div className="modal-overlay">
    <div className="option-modal">
      <h2>{selectedMenuItem.name}</h2>
      <p>Choose one dressing</p>

      {['Balsamic', 'Ranch', 'Italian', 'French'].map((option) => (
        <button
          key={option}
          className="save-btn"
          type="button"
          onClick={() =>
  selectedMenuItem.name === 'Classic Burger'
    ? addBurgerToCart(
        'Garden Salad',
        '',
        option
      )
    : addSandwichToCart(
        'Garden Salad',
        '',
        option
      )
}
        >
          {option}
        </button>
      ))}

      <button
        className="back-btn"
        type="button"
        onClick={() => {
          setShowDressingModal(false);
          setShowSaladUpgradeModal(true);
        }}
      >
        BACK
      </button>
    </div>
  </div>
)}

{showSaladDressingModal && selectedMenuItem && (
  <div className="modal-overlay">
    <div className="option-modal">
      <h2>{selectedMenuItem.name}</h2>
      <p>Choose one dressing</p>

      {['Balsamic', 'Ranch', 'Italian', 'French'].map((option) => (
  <button
    key={option}
    className="save-btn"
    type="button"
    onClick={() => {
      if (selectedMenuItem.name === "Pesto's House Salad") {
        setDressing(option);
        setShowSaladDressingModal(false);
        setShowCaesarProteinModal(true);
      } else {
        addSaladToCart(option);
      }
    }}
  >
    {option}
  </button>
))}
      <button
        className="back-btn"
        type="button"
        onClick={() => {
          setShowSaladDressingModal(false);
          setSelectedMenuItem(null);
          setDressing('');
        }}
      >
        CANCEL
      </button>
    </div>
  </div>
)}

{showFettuccineShrimpModal && selectedMenuItem && (
  <div className="modal-overlay">
    <div className="option-modal">
      <h2>{selectedMenuItem.name}</h2>

      <p>Add Garlic Shrimp for $7?</p>

      {isAddonAvailable('Garlic Shrimp') && (
  <button
    className="save-btn"
    type="button"
    onClick={() => addFettuccineToCart(true)}
  >
    Add Garlic Shrimp (+$7)
  </button>
)}

      <button
        className="back-btn"
        type="button"
        onClick={() => addFettuccineToCart(false)}
      >
        No Thanks
      </button>
    </div>
  </div>
)}

{showCaesarProteinModal && selectedMenuItem && (
  <div className="modal-overlay">
    <div className="option-modal">
      <h2>{selectedMenuItem.name}</h2>
      <p>
  Would you like to add a protein to your {selectedMenuItem.name}?
</p>

      {isAddonAvailable('Seasoned Chicken Breast') && (
  <button
    className="save-btn"
    type="button"
    onClick={() =>
      addCaesarSaladToCart('Seasoned Chicken Breast', 8)
    }
  >
    Add Seasoned Chicken Breast (+$8)
  </button>
)}

{isAddonAvailable('Garlic Shrimp') && (
  <button
    className="save-btn"
    type="button"
    onClick={() =>
      addCaesarSaladToCart('Garlic Shrimp', 7)
    }
  >
    Add Garlic Shrimp (+$7)
  </button>
)}

      <button
        className="back-btn"
        type="button"
        onClick={() => addCaesarSaladToCart()}
      >
        No protein
      </button>
    </div>
  </div>
)}

{showSteakDonenessModal && selectedMenuItem && (
  <div className="modal-overlay">
    <div className="option-modal">
      <h2>{selectedMenuItem.name}</h2>

      <p>Select steak doneness</p>

      {[
        'Rare',
        'Medium Rare',
        'Medium',
        'Medium Well',
        'Well Done'
      ].map((option) => (
        <button
          key={option}
          className="save-btn"
          type="button"
          onClick={() => addSteakToCart(option)}
        >
          {option}
        </button>
      ))}

      <button
        className="back-btn"
        type="button"
        onClick={() => {
          setShowSteakDonenessModal(false);
          setSelectedMenuItem(null);
        }}
      >
        CANCEL
      </button>
    </div>
  </div>
)}

{showSecondPoundModal && selectedMenuItem && (
  <div className="modal-overlay">
    <div className="option-modal">
      <h2>{selectedMenuItem.name}</h2>

      <p>Add 2nd pound wings for only $10?</p>

      <label>
        <input
          type="radio"
          checked={!secondPound}
          onChange={() => setSecondPound(false)}
        />
        No
      </label>

      <label>
        <input
          type="radio"
          checked={secondPound}
          onChange={() => setSecondPound(true)}
        />
        Yes (+$10)
      </label>

      <button
        className="save-btn"
        type="button"
        onClick={addWingsToCart}
      >
        ADD TO CART
      </button>

      <button
        className="back-btn"
        type="button"
        onClick={() => {
          setShowSecondPoundModal(false);
          setShowWingSauceModal(true);
        }}
      >
        BACK
      </button>
    </div>
  </div>
)}

    {showOptionModal && selectedMenuItem && (
      <div className="modal-overlay">
        <div className="option-modal">
          <h2>{selectedMenuItem.name}</h2>

          <p>Choose your option</p>

          <p style={{ color: '#666', marginBottom: '15px' }}>
             Gluten Free available
          </p>

          <label>
            <input
              type="radio"
              checked={!glutenFree}
              onChange={() => setGlutenFree(false)}
            />
            Regular
          </label>

          <label>
            <input
              type="radio"
              checked={glutenFree}
              onChange={() => setGlutenFree(true)}
            />
            Gluten Free
          </label>

          <button
            className="save-btn"
            onClick={addPoutineToCart}
          >
            ADD TO CART
          </button>

          <button
            className="back-btn"
            onClick={() => {
              setShowOptionModal(false);
              setSelectedMenuItem(null);
              setGlutenFree(false);
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    )}

    <div className="container">
      <div className="top-row">
        <div>
          <h1 onClick={handleSecretClick}>Pesto&apos;s Restaurant</h1>
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

      {!roomServiceLive && (
        <div className="room-service-closed-banner">
          Room Service Hours Have Ended!!!
          Opening Hours: 5:00 P.M. - 9:45 P.M.
          {toastMessage && (
            <div className="room-service-message">
              {toastMessage}
            </div>
          )}
        </div>
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
                          disabled={!roomServiceLive}
                          >
                            +
                            </button>
                        )}
                      </div>
                    </div>

                    {Array.isArray(item.tags) && item.tags.length > 0 && (
  <p className="tags compact-tags">
    {item.tags
      .filter((tag) => {
        const lowerTag = tag.toLowerCase();

        if (
          !isGlutenOptionAvailable(item.name) &&
          lowerTag.includes('gluten')
        ) {
          return false;
        }

        return true;
      })
      .join(', ')}

    {!isGlutenOptionAvailable(item.name) && (
      <span className="gluten-out-tag">
        {' '}• Gluten option out of stock
      </span>
    )}
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
      <div>
        <h2>Your Order</h2>

        {toastMessage && (
          <p className="cart-header-toast">
            {toastMessage}
          </p>
        )}
      </div>

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
                  <div className="cart-item" key={item.cartKey || item._id}>
                    <div>
                      <strong>{item.name}</strong>

                      {item.glutenFree && (
  <p className="option-text">
    Gluten Free
  </p>
)}

{item.sauce && (
  <p className="option-text checkout-option">
    Sauce: {item.sauce}
  </p>
)}

{item.name === 'Chicken Wings & Fries' &&
  !item.sauce && (
    <button
      type="button"
      className="sauce-required-btn"
      onClick={() => {
        editWingSauce(item.cartKey || item._id);
      }}
    >
      ⚠ Sauce selection required — tap to choose sauce
    </button>
)}

{item.secondPound && (
  <p className="option-text checkout-option">
    + 2nd Pound Wings
  </p>
)}

{item.side && (
  <p className="option-text checkout-option">
    Side: {item.side}
  </p>
)}

{item.sideUpgrade && (
  <p className="option-text checkout-option">
    Upgrade: {item.sideUpgrade}
  </p>
)}

{item.dressing && (
  <p className="option-text checkout-option">
    Dressing: {item.dressing}
  </p>
)}

{item.saladProtein && (
  <p className="option-text checkout-option">
    Add-on: {item.saladProtein}
  </p>
)}

{item.doneness && (
  <p className="option-text checkout-option">
    Steak: {item.doneness}
  </p>
)}

{item.kidsSpaghettiOption && (
  <p className="option-text checkout-option">
    {item.kidsSpaghettiOption}
  </p>
)}

{item.burgerCheese && (
  <p className="option-text checkout-option">
    Add Cheese
  </p>
)}

{item.burgerToppings && (
  <p className="option-text checkout-option">
    Toppings: {item.burgerToppings}
  </p>
)}

<p>
  ${item.price.toFixed(2)} × {item.quantity}
</p>
                    </div>

                    <div className="cart-controls">
                      <button
  onClick={() =>
    decreaseQuantity(item.cartKey || item._id)
  }
>
  −
</button>

<span>{item.quantity}</span>

<button
  onClick={() =>
    increaseQuantity(item.cartKey || item._id)
  }
>
  +
</button>

{item.sauce && (
  <button
    className="edit-cart-btn"
    type="button"
    onClick={() =>
      editWingSauce(item.cartKey || item._id)
    }
  >
    Edit
  </button>
)}

<button
  className="remove-cart-btn"
  onClick={() =>
    removeFromCart(item.cartKey || item._id)
  }
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