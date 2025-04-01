require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Define Schema & Model
const DataSchema = new mongoose.Schema({
    field1: String,
    field2: String
});
const DataModel = mongoose.model('Data', DataSchema);

// Route to store data
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

// Route to fetch data
app.get('/fetch', async (req, res) => {
    try {
        const data = await DataModel.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
