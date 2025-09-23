// backend/index.js (Full Code with Correct Order)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const twilio = require('twilio');
const crypto = require('crypto');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET || 'srestamart_super_secret_key';

const allowedOrigins = [
  'https://www.srestamart.com', 
  'https://srestamart.com',
  'https://srestamart.onrender.com',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(bodyParser.json());
app.use('/images/products', express.static(path.join(__dirname, 'public/products')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/products'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- MIDDLEWARE ---
const checkAdminToken = (req, res, next) => {
  const token = req.header('x-admin-token');
  if (!token) return res.status(401).json({ msg: 'No admin token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role === 'admin') { req.user = decoded; next(); }
    else { throw new Error('Invalid token type'); }
  } catch (e) { res.status(401).json({ msg: 'Admin token is not valid' }); }
};
const checkPartnerToken = (req, res, next) => {
  const token = req.header('x-partner-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role === 'partner') { req.partner = decoded; next(); }
    else { throw new Error('Invalid token type'); }
  } catch (e) { res.status(401).json({ msg: 'Token is not valid' }); }
};
const checkUserToken = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) { res.status(401).json({ msg: 'Token is not valid' }); }
};

// --- API ROUTES ---

// --- ADMIN ROUTES ---
app.post('/api/admin/upload', checkAdminToken, upload.single('productImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded.' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/images/products/${req.file.filename}`;
    res.json({ success: true, imageUrl: imageUrl });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const payload = { id: 1, username: username, role: 'admin' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, msg: 'Invalid Admin Credentials' });
  }
});

app.get('/api/admin/users', checkAdminToken, async (req, res) => {
  try {
    const usersResult = await pool.query('SELECT id, name, phone, created_at, is_admin, addresses FROM users ORDER BY id ASC');
    res.json(usersResult.rows);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/api/admin/orders', checkAdminToken, async (req, res) => {
  try {
    const query = `
      SELECT
        o.id, o.total_amount, o.status, o.created_at, o.items,
        o.shipping_address, o.delivery_status, o.assigned_to_id,
        u.name as customer_name,
        dp.name as partner_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN delivery_partners dp ON o.assigned_to_id = dp.id
      ORDER BY o.created_at DESC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).send('Server Error fetching all orders');
  }
});

app.get('/api/admin/delivery-partners', checkAdminToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM delivery_partners ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching delivery partners:', err.message);
    res.status(500).send('Server Error');
  }
});

app.put('/api/admin/orders/:orderId/assign', checkAdminToken, async (req, res) => {
  const { partnerId } = req.body;
  try {
    const result = await pool.query(
      'UPDATE orders SET assigned_to_id = $1, delivery_status = $2, status = $2 WHERE id = $3 RETURNING *',
      [partnerId, 'Assigned', req.params.orderId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Order not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error assigning order:', err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/api/admin/products', checkAdminToken, async (req, res) => {
  const { product, variant } = req.body;
  if (!product || !product.name || !product.category) {
    return res.status(400).json({ msg: 'Product Name and Category are required.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const newProductQuery = `INSERT INTO products (name, description, category, image_url) VALUES ($1, $2, $3, $4) RETURNING *`;
    const newProduct = await client.query(newProductQuery, [product.name, product.description || '', product.category, product.image_url || null]);
    const createdProduct = newProduct.rows[0];
    if (variant && variant.label && variant.price) {
      const newVariantQuery = `INSERT INTO product_variants (product_id, label, price) VALUES ($1, $2, $3)`;
      await client.query(newVariantQuery, [createdProduct.id, variant.label, variant.price]);
    }
    await client.query('COMMIT');
    res.status(201).json(createdProduct);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating product:', err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});

app.put('/api/admin/products/:id', checkAdminToken, async (req, res) => {
  const { name, description, category, image_url } = req.body;
  try {
    const updatedProduct = await pool.query(
      'UPDATE products SET name = $1, description = $2, category = $3, image_url = $4 WHERE id = $5 RETURNING *',
      [name, description, category, image_url, req.params.id]
    );
    res.json(updatedProduct.rows[0]);
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/api/admin/products/:id', checkAdminToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ msg: 'Product and its variants deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err.message);
    res.status(500).send('Server Error');
  }
});

// ... after app.delete('/api/admin/products/:id', ...)

// --- ADD THESE THREE NEW ROUTES FOR VARIANTS ---

// 1. CREATE a new variant
app.post('/api/admin/variants', checkAdminToken, async (req, res) => {
    const { product_id, label, price } = req.body;
    if (!product_id || !label || price === undefined) {
        return res.status(400).json({ msg: 'Product ID, label, and price are required.' });
    }
    try {
        const newVariant = await pool.query(
            'INSERT INTO product_variants (product_id, label, price) VALUES ($1, $2, $3) RETURNING *',
            [product_id, label, price]
        );
        res.status(201).json(newVariant.rows[0]);
    } catch (err) {
        console.error('Error creating variant:', err.message);
        res.status(500).send('Server Error');
    }
});

// 2. UPDATE an existing variant
app.put('/api/admin/variants/:id', checkAdminToken, async (req, res) => {
    const { label, price } = req.body;
    if (label === undefined || price === undefined) {
        return res.status(400).json({ msg: 'Label and price are required.' });
    }
    try {
        const updatedVariant = await pool.query(
            'UPDATE product_variants SET label = $1, price = $2 WHERE id = $3 RETURNING *',
            [label, price, req.params.id]
        );
        if (updatedVariant.rows.length === 0) {
            return res.status(404).json({ msg: 'Variant not found' });
        }
        res.json(updatedVariant.rows[0]);
    } catch (err) {
        console.error('Error updating variant:', err.message);
        res.status(500).send('Server Error');
    }
});

// 3. DELETE a variant
app.delete('/api/admin/variants/:id', checkAdminToken, async (req, res) => {
    try {
        const deletedVariant = await pool.query(
            'DELETE FROM product_variants WHERE id = $1 RETURNING *',
            [req.params.id]
        );
        if (deletedVariant.rows.length === 0) {
            return res.status(404).json({ msg: 'Variant not found' });
        }
        res.json({ msg: 'Variant deleted successfully' });
    } catch (err) {
        console.error('Error deleting variant:', err.message);
        res.status(500).send('Server Error');
    }
});

// --- USER & PUBLIC ROUTES (MOVED TO CORRECT POSITION) ---
app.post('/api/register', async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) return res.status(400).json({ msg: 'Please enter all fields' });
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (userExists.rows.length > 0) return res.status(400).json({ msg: 'User with this phone number already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await pool.query(
      'INSERT INTO users (name, phone, password, created_at, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, phone',
      [name, phone, hashedPassword, new Date(), false]
    );
    res.status(201).json({ msg: 'User registered successfully!', user: newUser.rows[0] });
  } catch (err) {
    console.error('Error registering user:', err.message); res.status(500).send('Server error');
  }
});

app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ msg: 'Please provide phone and password' });
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (userResult.rows.length === 0) return res.status(400).json({ msg: 'Invalid credentials' });
    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, name: user.name, role: user.is_admin ? 'admin' : 'user' }, JWT_SECRET, { expiresIn: '3h' });
    res.json({ msg: `Welcome back, ${user.name}!`, token, user: { id: user.id, name: user.name, phone: user.phone, is_admin: user.is_admin } });
  } catch (err) {
    console.error('Error logging in:', err.message); res.status(500).send('Server error');
  }
});

app.post('/api/forgot-password-twilio', async (req, res) => {
    const { phone } = req.body;
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
        if (userResult.rows.length === 0) {
            return res.json({ msg: 'If an account exists, an OTP has been sent.' });
        }
        const otp = crypto.randomInt(100000, 999999).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000);
        await pool.query(
            'UPDATE users SET reset_password_otp = $1, reset_password_expires = $2 WHERE phone = $3',
            [otp, expires, phone]
        );
        await twilioClient.messages.create({
            body: `Your Sresta Mart password reset code is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${phone}`
        });
        res.json({ msg: 'OTP has been sent to your mobile number.' });
    } catch (err) {
        console.error("Twilio Send Error:", err.message);
        res.status(500).json({ msg: 'Failed to send OTP. Please try again later.' });
    }
});

app.post('/api/reset-password-twilio', async (req, res) => {
    const { phone, otp, newPassword } = req.body;
    try {
        const userResult = await pool.query(
            'SELECT * FROM users WHERE phone = $1 AND reset_password_otp = $2 AND reset_password_expires > NOW()',
            [phone, otp]
        );
        if (userResult.rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid or expired OTP.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await pool.query(
            'UPDATE users SET password = $1, reset_password_otp = NULL, reset_password_expires = NULL WHERE phone = $2',
            [hashedPassword, phone]
        );
        res.json({ msg: 'Password reset successfully! You can now log in.' });
    } catch (err) {
        console.error("Reset Password Error:", err.message);
        res.status(500).send('Server error during password reset.');
    }
});

app.get('/api/products', async (req, res) => {
  try {
    const category = req.query.category; 
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const offset = (page - 1) * limit;
    let countQuery = 'SELECT COUNT(*) FROM products';
    let productsQuery = 'SELECT id FROM products';
    const queryParams = [];
    if (category) {
      countQuery += ' WHERE LOWER(REPLACE(category, \' \', \'\')) = $1';
      productsQuery += ' WHERE LOWER(REPLACE(category, \' \', \'\')) = $1';
      queryParams.push(category);
    }
    const totalProductsResult = await pool.query(countQuery, queryParams);
    const totalProducts = parseInt(totalProductsResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalProducts / limit);
    productsQuery += ` ORDER BY id ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    const productIdsResult = await pool.query(
      productsQuery,
      [...queryParams, limit, offset]
    );
    const productIds = productIdsResult.rows.map(row => row.id);
    if (productIds.length === 0) {
      return res.status(200).json({
        products: [],
        currentPage: page,
        totalPages,
        totalProducts,
      });
    }
    const productsAndVariantsQuery = `
      SELECT p.id, p.name, p.description, p.category, p.image_url, v.id as variant_id, v.label, v.price
      FROM products p
      LEFT JOIN product_variants v ON p.id = v.product_id
      WHERE p.id = ANY($1::int[])
      ORDER BY p.id, v.price;
    `;
    const { rows } = await pool.query(productsAndVariantsQuery, [productIds]);
    const productsMap = new Map();
    rows.forEach(row => {
      if (!productsMap.has(row.id)) {
        productsMap.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          category: row.category,
          image_url: row.image_url,
          variants: []
        });
      }
      if (row.variant_id) {
        productsMap.get(row.id).variants.push({
          id: row.variant_id,
          label: row.label,
          price: parseFloat(row.price)
        });
      }
    });
    res.status(200).json({
      products: Array.from(productsMap.values()),
      currentPage: page,
      totalPages,
      totalProducts,
    });
  } catch (err) {
    console.error("Error fetching paginated products:", err.message);
    res.status(500).json({ msg: 'Server Error while fetching products.' });
  }
});

app.get('/api/addresses', checkUserToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT addresses FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0].addresses || []);
  } catch (err) {
    console.error('Error fetching addresses:', err.message);
    res.status(500).json({ msg: 'Server error fetching addresses' });
  }
});

app.post('/api/addresses', checkUserToken, async (req, res) => {
  const { newAddress } = req.body;
  if (!newAddress || !newAddress.label || !newAddress.value) {
    return res.status(400).json({ msg: 'Address label and value are required.' });
  }
  try {
    const result = await pool.query(
      "UPDATE users SET addresses = addresses || $1::jsonb WHERE id = $2 RETURNING addresses",
      [JSON.stringify(newAddress), req.user.id]
    );
    res.status(201).json(result.rows[0].addresses);
  } catch (err) {
    console.error('Error adding address:', err.message);
    res.status(500).json({ msg: 'Server error adding address' });
  }
});

app.post('/api/orders', checkUserToken, async (req, res) => {
  const { userId, cartItems, shippingAddress, totalAmount } = req.body;
  if (req.user.id !== userId) return res.status(403).json({ msg: 'User not authorized.' });
  try {
    const orderQuery = `
      INSERT INTO orders (user_id, items, total_amount, shipping_address, status, delivery_status)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;
    `;
    const orderResult = await pool.query(orderQuery, [userId, JSON.stringify(cartItems), totalAmount, shippingAddress, 'Processing', 'Pending']);
    res.status(201).json({ success: true, orderId: orderResult.rows[0].id, message: 'Order placed successfully!' });
  } catch (err) {
    console.error('Error creating order:', err.message);
    res.status(500).json({ msg: 'Server Error while creating order' });
  }
});

app.get('/api/orders', checkUserToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const query = `
      SELECT
        o.*,
        dp.name as partner_name
      FROM orders o
      LEFT JOIN delivery_partners dp ON o.assigned_to_id = dp.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC;
    `;
    const { rows } = await pool.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).send('Server error fetching orders');
  }
});

// --- SERVE REACT FRONTEND (MUST BE NEAR THE END) ---
app.use(express.static(path.join('/opt/render/project/src/frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join('/opt/render/project/src/frontend/dist/index.html'));
});

// --- START SERVER (MUST BE THE VERY LAST THING) ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} at Sresta Mart.`);
});