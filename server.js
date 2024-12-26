const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/database');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Dummy for testing
app.get('/', (req, res) => res.send('API is running'));

// start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const productRoutes = require('./routes/ProductRoutes');
app.use('/produk', productRoutes);

