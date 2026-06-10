const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

/* =========================
   DB CONNECTION
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Error:', err));

/* DEBUG (IMPORTANT) */
console.log("MONGO DB URI:", process.env.MONGO_URI);

/* =========================
   MODEL
========================= */
const menuItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  description: String,
  available: { type: Boolean, default: true }
}, { timestamps: true });

const MenuItem = mongoose.model('MenuItem', menuItemSchema, 'menuitems');

/* =========================
   AUTH MIDDLEWARE
========================= */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

/* =========================
   LOGIN
========================= */
app.post('/api/login', (req, res) => {
  const { password } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Wrong password' });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  res.json({ success: true, token });
});

/* =========================
   GET MENU (PUBLIC)
========================= */
app.get('/api/menu', async (req, res) => {
  const items = await MenuItem.find();

  console.log("FOUND ITEMS:", items.length);

  res.json(items);
});

/* =========================
   ADD ITEM
========================= */
app.post('/api/menu', verifyToken, async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    const saved = await item.save();

    console.log("SAVED ITEM:", saved);

    res.status(201).json({ success: true, item: saved });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/* =========================
   UPDATE ITEM
========================= */
app.put('/api/menu/:id', verifyToken, async (req, res) => {
  try {
    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, item: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DELETE ITEM
========================= */
app.delete('/api/menu/:id', verifyToken, async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});