const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

app.use('/profilePhoto', express.static('profilePhoto'));
app.use('/coverPhoto', express.static('coverPhoto'));
app.use('/postPhotos', express.static('postPhotos'));

mongoose.connect(process.env.MONGODB_CONNECTION_URL);
console.log('MongoDB URL:', process.env.MONGODB_CONNECTION_URL);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error: '));
db.once('open', () => {
    console.log('Connected to mongodb successfully!');
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
    origin: process.env.FRONTEND_ROUTE,
    credentials: true
}));

app.use('/', require('./routes/authRoutes'));

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});