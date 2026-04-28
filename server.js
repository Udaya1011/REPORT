import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

const reportSchema = new mongoose.Schema({
  brand: String,
  date: String,
  po: String,
  productCode: String,
  quantities: {
    S: Number,
    M: Number,
    L: Number,
    XL: Number,
    '2XL': Number,
    '3XL': Number,
    '4XL': Number
  },
  finish: String,
  status: { type: String, default: 'PASS' },
  unitName: String,
  qamName: String,
  createdAt: { type: Date, default: Date.now }
});

reportSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const Report = mongoose.model('Report', reportSchema);

app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    console.log(`Fetched ${reports.length} reports from MongoDB Atlas`);
    res.json(reports);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    console.log('Received new report:', req.body);
    const newReport = new Report(req.body);
    const savedReport = await newReport.save();
    console.log('Saved report to Atlas:', savedReport.id);
    res.status(201).json(savedReport);
  } catch (err) {
    console.error('Save error:', err);
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

// Additional API routes
app.get('/api/reports/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    console.error('Fetch single error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/reports/:id', async (req, res) => {
  try {
    const updated = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Report not found' });
    res.json(updated);
  } catch (err) {
    console.error('Update error:', err);
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/reports/:id', async (req, res) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Report deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});



// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
