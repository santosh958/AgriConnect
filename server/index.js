const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path'); 
require('dotenv').config();
const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // React frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use('/receipts', express.static(path.join(__dirname, 'receipts')));

// DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});
db.connect(err => {
  if (err) return console.log("DB Error:", err);
  console.log("DB connected ✅");
});

// ==================== Auth Routes =====================
app.post('/register', async (req, res) => {
  const { name, email, password, role, place, phone } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  // Generate Farmer ID only for farmers
  const farmer_id = role === 'farmer'
    ? `FARM${Math.floor(10000 + Math.random() * 90000)}`
    : null;
  const buyer_id = role === 'buyer'
    ? `BUYR${Math.floor(10000 + Math.random() * 90000)}`
    : null;

  const sql = `INSERT INTO users (name, email, password, role, place, phone, farmer_id, buyer_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [name, email, hashed, role, place, phone, farmer_id, buyer_id], (err, result) => {
    if (err) {
      console.error("Register Error:", err);
      return res.status(500).send("User already exists or registration error");
    }

    res.json({
      message: "Registered Successfully ✅",
      farmer_id: farmer_id,
      buyer_id: buyer_id
    });
  });
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).send("User not found");
    const isMatch = await bcrypt.compare(password, results[0].password);
    if (!isMatch) return res.status(401).send("Invalid credentials");
    const token = jwt.sign({ id: results[0].id }, "secret_key");
    res.json({
    message: "Login Success ✅",
    token,
    user: {
        id: results[0].id,
        name: results[0].name,
        email: results[0].email,
        role: results[0].role,
        place: results[0].place,
        farmer_id: results[0].farmer_id || null,
        buyer_id: results[0].buyer_id || null
      }
    });

  });
});

// ==================== Crop Routes =====================
const multer = require('multer');

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// Add Crop Route
app.post('/add-crop', upload.single('photo'), (req, res) => {
  console.log("📩 req.body:", req.body);
  console.log("📸 req.file:", req.file);

  const { category, crop_name, quantity_kg, price_per_kg, description, farmer_id } = req.body;
  const photo = req.file ? req.file.filename : null;

  if (!category || !crop_name || !quantity_kg || !price_per_kg || !description || !farmer_id || !photo) {
    return res.status(400).send({ message: "All fields including photo are required" });
  }

  const sql = `
    INSERT INTO crops (category, crop_name, quantity_kg, price_per_kg, description, farmer_id, photo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [category, crop_name, quantity_kg, price_per_kg, description, farmer_id, photo], (err) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.status(500).send({ message: "Error adding crop" });
    }
    res.send({ message: "✅ Crop added successfully!" });
  });
});
app.delete("/delete-crop/:id", (req, res) => {
  const cropId = req.params.id;
  if (!cropId) return res.status(400).send({ message: "Crop ID missing" });

  const sql = "DELETE FROM crops WHERE id = ?";
  db.query(sql, [cropId], (err, result) => {
    if (err) {
      console.error("❌ Error deleting crop:", err);
      return res.status(500).send({ message: "Error deleting crop" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Crop not found" });
    }
    res.send({ message: "✅ Crop deleted successfully" });
  });
});




app.get('/my-crops', (req, res) => {
  const { farmer_id } = req.query;
  const sql = `SELECT * FROM crops WHERE farmer_id = ?`;
  db.query(sql, [farmer_id], (err, result) => {
    if (err) return res.status(500).send("Error fetching crops");
    res.json(result);
  });
});
app.put("/update-crop/:id", async (req, res) => {
  const cropId = req.params.id;
  const { price_per_kg, quantity_kg } = req.body;

  console.log("Updating crop:", cropId, price_per_kg, quantity_kg); // debug

  try {
    // Example for MySQL
    const sql = "UPDATE crops SET price_per_kg=?, quantity_kg=? WHERE id=?";
    db.query(sql, [price_per_kg, quantity_kg, cropId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database update failed" });
      }
      res.json({ message: "Crop updated successfully" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});



app.get('/all-crops', (req, res) => {
  const sql = `
    SELECT c.*, u.name AS farmer_name
    FROM crops c
    JOIN users u ON c.farmer_id = u.farmer_id
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send("Error fetching crops");
    res.json(result);
  });
});

// ==================== Reviews ========================
// Add review
app.post('/add-review', (req, res) => {
  const { crop_id, stars, description } = req.body;

  if (!crop_id || !stars) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  db.query(
    'INSERT INTO reviews (crop_id, stars, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE stars = ?, description = ?',
    [crop_id, stars, description || null, stars, description || null],
    (err, result) => {
      if (err) {
        console.error('❌ Add review error:', err);
        console.log(err);
        return res.status(500).json({ message: 'Failed to add review', error: err });
      }
      res.json({ message: 'Review added successfully' });
    }
  );
});

// Get reviews for a crop
app.get('/crop-reviews/:cropId', (req, res) => {
  const cropId = req.params.cropId;

  db.query(
    'SELECT * FROM reviews WHERE crop_id = ?',
    [cropId],
    (err, reviews) => {
      if (err) {
        console.error('❌ Fetch reviews error:', err);
        return res.status(500).json({ message: 'Failed to fetch reviews' });
      }

      const avgRating =
        reviews.reduce((acc, r) => acc + r.stars, 0) / (reviews.length || 1);

      res.json({
        reviews,
        avgStars: parseFloat(avgRating.toFixed(1)),
        reviews_count: reviews.length
      });
    }
  );
});

// ==================== Order Routes =====================
const { v4: uuidv4 } = require('uuid');
const group_id = uuidv4(); // ✅ unique group ID
app.post('/place-group-order', (req, res) => {
  console.log("🛒 Received body:", req.body);

  const {  buyer_id,items, customer_name, shipping_address, payment_method } = req.body;

  if (!buyer_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).send("❌ Missing buyer ID or items");
  }

  const group_id = uuidv4();

  // Save group info if using group_orders table
  const groupSql = `
    INSERT INTO group_orders (group_id, buyer_id, customer_name, shipping_address, payment_method)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(groupSql, [group_id, buyer_id, customer_name, shipping_address, payment_method], (err) => {
    if (err) {
      console.error("❌ Failed to save group info:", err);
      return res.status(500).send("❌ Failed to save group details");
    }

    // Save items
    const values = items
      .filter(item => item.farmer_id && item.crop_id && item.quantity)
      .map(item => [
        buyer_id,
        item.farmer_id,
        item.crop_id,
        item.quantity,
        group_id
      ]);

    const sql = `
      INSERT INTO orders (buyer_id, farmer_id, crop_id, quantity, group_id)
      VALUES ?
    `;

    db.query(sql, [values], (err2) => {
      if (err2) {
        console.error("❌ Insert Error:", err2);
        return res.status(500).send("❌ Failed to place orders");
      }

      res.send({ message: "✅ All orders placed successfully", group_id });
    });
  });
});
// ✅ Buyer orders route
app.get('/my-orders', (req, res) => {
  const { buyer_id } = req.query;
  if (!buyer_id) return res.status(400).json({ message: "buyer_id is required" });

  const sql = `
    SELECT o.*, c.crop_name, u.name AS farmer_name 
    FROM orders o
    JOIN crops c ON o.crop_id = c.id
    JOIN users u ON o.farmer_id = u.farmer_id
    WHERE o.buyer_id = ?
    ORDER BY o.created_at DESC
  `;

  db.query(sql, [buyer_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching orders", error: err });
    res.json(result);
  });
});

// ✅ Farmer orders route
app.get('/farmer-orders', (req, res) => {
  const { farmer_id } = req.query;
  if (!farmer_id) return res.status(400).json({ message: "farmer_id is required" });

  const sql = `
    SELECT o.*, u.name AS buyer_name, c.crop_name 
    FROM orders o
    JOIN users u ON o.buyer_id = u.buyer_id
    JOIN crops c ON o.crop_id = c.id
    WHERE o.farmer_id = ?
    ORDER BY o.created_at DESC
  `;

  db.query(sql, [farmer_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching farmer orders", error: err });
    res.json(result);
  });
});


app.post('/update-order-stage', (req, res) => {
  const { order_id, next_status } = req.body;
  const sql = "UPDATE orders SET status = ? WHERE id = ?";
  db.query(sql, [next_status, order_id], (err) => {
    if (err) return res.status(500).send("Error updating order stage");
    res.send({ message: "Order stage updated ✅" });
  });
});
app.post('/progress-order', (req, res) => {
  const { order_id } = req.body;
  const stages = [
    "Order Under Acceptance",
    "Order Accepted",
    "Order Packed",
    "Order Dispatched",
    "Booked with Delivery Partner",
    "Out for Delivery",
    "Delivered"
  ];

  const sqlGet = "SELECT status FROM orders WHERE id = ?";
  db.query(sqlGet, [order_id], (err, results) => {
    if (err) return res.status(500).send("Error fetching order");
    if (!results.length) return res.status(404).send("Order not found");

    const currentStatus = results[0].status;
    const idx = stages.indexOf(currentStatus);

    if (idx === -1 || idx >= stages.length - 1) {
      return res.status(400).send("Cannot progress this order");
    }

    // Farmer allowed only if current stage < 3 (before "Order Dispatched")
    if (idx >= 3) {
      return res.status(403).send("You are not allowed to change this stage");
    }

    const nextStatus = stages[idx + 1];
    const sqlUpdate = "UPDATE orders SET status = ? WHERE id = ?";
    db.query(sqlUpdate, [nextStatus, order_id], (err2) => {
      if (err2) return res.status(500).send("Error updating status");
      res.send({ message: "Order progressed", newStatus: nextStatus });
    });
  });
});


app.get('/latest-crop-location', (req, res) => {
  const { farmer_id } = req.query;
  const sql = `SELECT location FROM crops WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 1`;
  db.query(sql, [farmer_id], (err, results) => {
    if (err) return res.status(500).send("Error fetching location");
    if (results.length === 0) return res.json({ location: null });
    res.json({ location: results[0].location });
  });
});
// ==================== Crop Prediction Proxy =====================
app.post('/predict-crop', async (req, res) => {
  try {
    const { N, P, K, temperature, humidity, ph, rainfall } = req.body;

    // Send the request to the Python Flask server
    const response = await axios.post('http://127.0.0.1:5100/predict-crop', {
      N, P, K, temperature, humidity, ph, rainfall
    });

    // Return the prediction result to the frontend
    res.json(response.data);
  } catch (error) {
    console.error('Crop Prediction Error:', error.message);
    res.status(500).json({ error: 'Failed to get crop prediction' });
  }
});

// Update Password API
app.post('/change-password', async (req, res) => {
  const { user_id, old_password, new_password } = req.body;
  const sql = 'SELECT * FROM users WHERE id = ?';

  db.query(sql, [user_id], async (err, results) => {
    if (err || results.length === 0) return res.status(404).send("User not found");
    const user = results[0];

    const match = await bcrypt.compare(old_password, user.password);
    if (!match) return res.status(401).send("Old password is incorrect");

    const hashed = await bcrypt.hash(new_password, 10);
    const updateSql = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(updateSql, [hashed, user_id], (err) => {
      if (err) return res.status(500).send("Password update failed");
      res.send({ message: "Password updated successfully ✅" });
    });
  });
});
const { createProxyMiddleware } = require('http-proxy-middleware');

// Proxy to forward /predict-crop to Flask app (running on port 5001)
app.use('/predict-crop', createProxyMiddleware({
  target: 'http://localhost:5100',
  changeOrigin: true
}));

// ==================== Start Server =====================
app.listen(5000, () => console.log("Server running on port 5000"));
