require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Serve Static Files
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Data Schema & Model
const DataSchema = new mongoose.Schema({
    field1: String,
    field2: String
});
const DataModel = mongoose.model('Data', DataSchema);

// Media Schema & Model
const MediaSchema = new mongoose.Schema({
    type: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true },
});
const MediaModel = mongoose.model('Media', MediaSchema);

// Multer Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes

// Store Data
app.post('/store', async (req, res) => {
    try {
        const { field1, field2 } = req.body;
        const newData = new DataModel({ field1, field2 });
        await newData.save();
        res.status(201).json({ message: 'Data stored successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch Data
app.get('/fetch', async (req, res) => {
    try {
        const data = await DataModel.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload Media
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const fileType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const newMedia = new MediaModel({
            type: fileType,
            url: fileUrl
        });

        await newMedia.save();
        res.status(201).json({ message: 'Media uploaded successfully', url: fileUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch Media
app.get('/media', async (req, res) => {
    try {
        const media = await MediaModel.find();
        res.status(200).json(media);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
