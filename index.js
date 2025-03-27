require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}?${process.env.MONGO_OPTIONS}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

const Customer = mongoose.model('Customer', new mongoose.Schema({
    cid: String,
    name: { type: String, default: "NewUser" },
    phone: String,
    macid: String,
    email: String,
    address: String,
    state: String,
    country: String,
    pincode: String,
    logon: { type: String, default: "yes" },
    user_status: { type: String, default: "Active" },
    datetime: String,
    ctype: { type: String, default: "App User" }
}));

app.post('/user/auth', async (req, res) => {
    try {
        const { phone, macid } = req.body;
        if (!phone || !macid) return res.status(400).json({ error: "Phone and Mac ID are required" });

        const existingUser = await Customer.findOne({ phone });

        console.log("Existing User:", existingUser); // Debugging Log

        if (existingUser) {
            await Customer.updateOne({ phone }, { macid, logon: 'yes' });
            await Customer.updateMany({ phone: { $ne: phone }, macid }, { logon: 'no' });

            return res.json(existingUser.user_status === "Active" ? existingUser.name : "Deactivated");
        } else {
            console.log("User not found, creating a new user...");
            return res.json("NewUser");
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
