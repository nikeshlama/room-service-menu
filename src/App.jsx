const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

const menuSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  description: String,
  tags: String,
  available: {
    type: Boolean,
    default: true
  }
});

const Menu = mongoose.model('Menu', menuSchema, 'menuitems');

app.get('/', (req, res) => {
  res.send('Pesto backend is running');
});

app.get('/api/menu', async (req, res) => {
  try {
    const items = await Menu.find().sort({ _id: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const item = await Menu.create({
      name: req.body.name,
      price: Number(req.body.price),
      category: req.body.category,
      description: req.body.description,
      tags: req.body.tags,
      available: req.body.available !== false
    });

    res.json({
      success: true,
      item
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

app.put('/api/menu/:id', async (req, res) => {
  try {
    const updated = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      item: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

app.delete('/api/menu/:id', async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);

    res.json({
      success: true
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});