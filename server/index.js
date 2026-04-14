const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for logo base64

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/visiting-card-gen';
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, // Wait 10s for server
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    if (err.message.includes('SSL')) {
      console.warn('⚠️ SSL/TLS Error detected. Check if your IP is whitelisted in MongoDB Atlas.');
    }
  });

// Schema definition (keep as is)
const cardSchema = new mongoose.Schema({
  formData: {
    name: String,
    title: String,
    company: String,
    phone: String,
    email: String,
    website: String,
    location: String,
    tagline: String,
    linkedin: String,
    twitter: String,
    facebook: String,
  },
  designParams: {
    template: String,
    bgPrimary: String,
    bgSecondary: String,
    textPrimary: String,
    textSecondary: String,
    accentColor: String,
  },
  logoUrl: String, 
  createdAt: { type: Date, default: Date.now }
});

const Card = mongoose.model('Card', cardSchema);

// Routes
// 1. Create or return existing card (prevents duplicates)
app.post('/api/cards', async (req, res) => {
  try {
    const { formData, designParams, logoUrl } = req.body;
    console.log(`[POST] Save request for: ${formData?.name || 'Unknown'}`);

    // Build a fingerprint query: match by name + phone + email + template
    const query = {
      'formData.name': formData?.name || '',
      'formData.phone': formData?.phone || '',
      'formData.email': formData?.email || '',
      'designParams.template': designParams?.template || '',
    };

    // Check if this exact card already exists
    const existingCard = await Card.findOne(query).sort({ createdAt: -1 });

    if (existingCard) {
      // Update existing card with latest data instead of creating duplicate
      existingCard.formData = formData;
      existingCard.designParams = designParams;
      existingCard.logoUrl = logoUrl;
      const updatedCard = await existingCard.save();
      console.log('♻️ Existing card updated (no duplicate created):', updatedCard._id);
      return res.status(200).json({
        success: true,
        message: 'Existing card updated!',
        card: updatedCard
      });
    }

    // No match found: create new card
    const newCard = new Card(req.body);
    const savedCard = await newCard.save();
    console.log('✅ New card saved:', savedCard._id);
    res.status(201).json({
      success: true,
      message: 'Card saved successfully to MongoDB!',
      card: savedCard
    });
  } catch (err) {
    console.error('[POST ERROR]', err.message);
    res.status(400).json({ success: false, message: 'Database save failed: ' + err.message });
  }
});

// 2. Get all cards
app.get('/api/cards', async (req, res) => {
  try {
    console.log(`[GET] Fetching all saved cards...`);
    const cards = await Card.find().sort({ createdAt: -1 });
    console.log(`✅ Returned ${cards.length} cards`);
    res.json({ success: true, cards });
  } catch (err) {
    console.error('[GET ERROR]', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Database query failed. Is MongoDB running?', 
      error: err.message 
    });
  }
});

// 3. Get a single card by ID (with logging)
app.get('/api/cards/:id', async (req, res) => {
  try {
    console.log(`[GET] Fetching card ID: ${req.params.id}`);
    const card = await Card.findById(req.params.id);
    if (!card) {
        console.log('⚠️ Card not found');
        return res.status(404).json({ success: false, message: 'Card not found' });
    }
    res.json({ success: true, card });
  } catch (err) {
    console.error('[GET ONE ERROR]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Update a card
app.put('/api/cards/:id', async (req, res) => {
  try {
    console.log(`[PUT] Updating card ID: ${req.params.id}`);
    const updatedCard = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCard) return res.status(404).json({ success: false, message: 'Card not found' });
    res.json({ success: true, card: updatedCard });
  } catch (err) {
    console.error('[PUT ERROR]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Delete a card
app.delete('/api/cards/:id', async (req, res) => {
  try {
    console.log(`[DELETE] Removing card ID: ${req.params.id}`);
    const deletedCard = await Card.findByIdAndDelete(req.params.id);
    if (!deletedCard) return res.status(404).json({ success: false, message: 'Card not found' });
    res.json({ success: true, message: 'Card deleted successfully' });
  } catch (err) {
    console.error('[DELETE ERROR]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => {
    console.log(`backend server port ${PORT}`);
});

