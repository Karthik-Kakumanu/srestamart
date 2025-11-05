require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const twilio = require('twilio');
const crypto = require('crypto');
const { Resend } = require('resend');

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const Razorpay = require('razorpay');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('⚠️  Warning: JWT_SECRET is not set in env. Using fallback. Set it for production!');
}
const jwtSecret = JWT_SECRET || 'fallback_super_secret_key';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set. Exiting.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY not set. Inquiry email might fail.');
}
const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️ Cloudinary credentials missing. Uploads may fail.');
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sresta-mart-products',
    format: async (req, file) => 'webp',
    public_id: (req, file) => {
      const baseName = file.originalname.split('.').slice(0, -1).join('.');
      return `${Date.now()}-${baseName}`;
    }
  }
});
const upload = multer({ storage: storage });

// Twilio client
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
  console.warn('⚠️ Twilio credentials missing. OTP / SMS may fail.');
}
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('⚠️ Razorpay credentials missing. Payment might fail.');
}
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Auth middlewares
function checkToken(role) {
  return (req, res, next) => {
    const headerName = role === 'user' ? 'x-auth-token' :
                      role === 'admin' ? 'x-admin-token' :
                      role === 'partner' ? 'x-partner-token' : null;
    if (!headerName) {
      return res.status(500).json({ msg: 'Invalid role for token check' });
    }
    const token = req.header(headerName);
    if (!token) {
      return res.status(401).json({ msg: `No ${role} token, authorization denied` });
    }
    try {
      const decoded = jwt.verify(token, jwtSecret);
      if (decoded.role === role) {
        // attach according to role
        if (role === 'user') req.user = decoded;
        if (role === 'admin') req.user = decoded;
        if (role === 'partner') req.partner = decoded;
        next();
      } else {
        throw new Error('Invalid token type');
      }
    } catch (err) {
      return res.status(401).json({ msg: `${role} token is not valid` });
    }
  };
}
const checkAdmin = checkToken('admin');
const checkUser = checkToken('user');
const checkPartner = checkToken('partner');

// --- ADMIN ROUTES ---
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const payload = { id: 'admin', username, role: 'admin' };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '8h' });
    return res.json({ success: true, token });
  } else {
    return res.status(401).json({ success: false, msg: 'Invalid Admin Credentials' });
  }
});

app.post('/api/admin/upload', checkAdmin, upload.single('productImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'No file uploaded.' });
  }
  return res.json({ success: true, imageUrl: req.file.path });
});

app.get('/api/admin/products', checkAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id, p.name, p.description, p.category, p.image_url,
        v.id AS variant_id, v.label, v.price
      FROM products p
      LEFT JOIN product_variants v ON p.id = v.product_id
      ORDER BY p.name ASC, v.price ASC
    `;
    const { rows } = await pool.query(query);
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
    res.json(Array.from(productsMap.values()));
  } catch (err) {
    console.error('Error fetching all products for admin:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

app.post('/api/admin/products', checkAdmin, async (req, res) => {
  const { product, variant } = req.body;
  if (!product || !product.name || !product.category) {
    return res.status(400).json({ msg: 'Product Name and Category are required.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertProductSql = `
      INSERT INTO products (name, description, category, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const newProductRes = await client.query(insertProductSql, [
      product.name,
      product.description || '',
      product.category,
      product.image_url || null
    ]);
    const createdProduct = newProductRes.rows[0];
    if (variant && variant.label && variant.price != null) {
      const insertVariantSql = `
        INSERT INTO product_variants (product_id, label, price)
        VALUES ($1, $2, $3)
      `;
      await client.query(insertVariantSql, [createdProduct.id, variant.label, variant.price]);
    }
    await client.query('COMMIT');
    res.status(201).json(createdProduct);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating product:', err);
    res.status(500).json({ msg: 'Server Error' });
  } finally {
    client.release();
  }
});

app.put('/api/admin/products/:id', checkAdmin, async (req, res) => {
  const { name, description, category, image_url } = req.body;
  try {
    const updateSql = `
      UPDATE products
      SET name = $1, description = $2, category = $3, image_url = $4
      WHERE id = $5
      RETURNING *
    `;
    const result = await pool.query(updateSql, [name, description, category, image_url, req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Product not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

app.delete('/api/admin/products/:id', checkAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [req.params.id]);
    const deleteRes = await client.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
    if (deleteRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ msg: 'Product not found.' });
    }
    await client.query('COMMIT');
    res.json({ msg: 'Product and its variants deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting product:', err);
    res.status(500).json({ msg: 'Server Error' });
  } finally {
    client.release();
  }
});

app.post('/api/admin/variants', checkAdmin, async (req, res) => {
  const { product_id, label, price } = req.body;
  if (!product_id || !label || price == null) {
    return res.status(400).json({ msg: 'Product ID, label, and price are required.' });
  }
  try {
    const insertSql = `
      INSERT INTO product_variants (product_id, label, price)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(insertSql, [product_id, label, price]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating variant:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

app.put('/api/admin/variants/:id', checkAdmin, async (req, res) => {
  const { label, price } = req.body;
  if (label == null || price == null) {
    return res.status(400).json({ msg: 'Label and price are required.' });
  }
  try {
    const updateSql = `
      UPDATE product_variants
      SET label = $1, price = $2
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(updateSql, [label, price, req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Variant not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating variant:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

app.delete('/api/admin/variants/:id', checkAdmin, async (req, res) => {
  try {
    const delSql = `
      DELETE FROM product_variants
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(delSql, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Variant not found.' });
    }
    res.json({ msg: 'Variant deleted successfully.' });
  } catch (err) {
    console.error('Error deleting variant:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

app.get('/api/admin/users', checkAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, phone, created_at, is_admin, addresses
      FROM users
      ORDER BY id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

app.get('/api/admin/orders', checkAdmin, async (req, res) => {
  try {
    const query = `
      SELECT
        o.id, o.total_amount, o.status, o.created_at, o.items,
        o.shipping_address, o.delivery_status, o.assigned_to_id,
        u.name AS customer_name,
        dp.name AS partner_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN delivery_partners dp ON o.assigned_to_id = dp.id
      ORDER BY o.created_at DESC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ msg: 'Server Error fetching orders' });
  }
});

app.get('/api/admin/delivery-partners', checkAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name
      FROM delivery_partners
      ORDER BY name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching delivery partners:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

app.put('/api/admin/orders/:orderId/assign', checkAdmin, async (req, res) => {
  const { partnerId } = req.body;
  const { orderId } = req.params;
  try {
    const updateSql = `
      UPDATE orders
      SET assigned_to_id = $1,
          delivery_status = $2,
          status = $2
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(updateSql, [partnerId, 'Assigned', orderId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Order not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error assigning order:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// --- USER / PUBLIC ROUTES ---
app.post('/api/register', async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }
  try {
    const existingRes = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (existingRes.rows.length > 0) {
      return res.status(400).json({ msg: 'User with this phone number already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const insertSql = `
      INSERT INTO users (name, phone, password, created_at, is_admin)
      VALUES ($1, $2, $3, NOW(), false)
      RETURNING id, name, phone
    `;
    const newUser = await pool.query(insertSql, [name, phone, hashed]);
    res.status(201).json({ msg: 'User registered successfully!', user: newUser.rows[0] });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ msg: 'Please provide phone and password' });
  }
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (userRes.rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.is_admin ? 'admin' : 'user' },
      jwtSecret,
      { expiresIn: '3h' }
    );
    res.json({
      msg: `Welcome back, ${user.name}!`,
      token,
      user: { id: user.id, name: user.name, phone: user.phone }
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// OTP for forgot / reset
app.post('/api/forgot-password-twilio', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ msg: 'Phone is required' });
  }
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (userRes.rows.length === 0) {
      // still send same response so as not to leak user existence
      return res.json({ msg: 'If an account exists for this number, an OTP has been sent.' });
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() +  10 * 60 * 1000); // 10 min
    await pool.query(
      `UPDATE users
       SET reset_password_otp = $1, reset_password_expires = $2
       WHERE phone = $3`,
      [otp, expires, phone]
    );
    await twilioClient.messages.create({
      body: `Your password reset code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`
    });
    res.json({ msg: 'OTP has been sent to your mobile number.' });
  } catch (err) {
    console.error('Twilio send error:', err);
    res.status(500).json({ msg: 'Failed to send OTP. Please try again later.' });
  }
});

app.post('/api/reset-password-twilio', async (req, res) => {
  const { phone, otp, newPassword } = req.body;
  if (!phone || !otp || !newPassword) {
    return res.status(400).json({ msg: 'Phone, OTP, and new password are required.' });
  }
  try {
    const userRes = await pool.query(
      `SELECT * FROM users 
       WHERE phone = $1 AND reset_password_otp = $2 AND reset_password_expires > NOW()`,
      [phone, otp]
    );
    if (userRes.rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid or expired OTP.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    await pool.query(
      `UPDATE users
       SET password = $1, reset_password_otp = NULL, reset_password_expires = NULL
       WHERE phone = $2`,
      [hashed, phone]
    );
    res.json({ msg: 'Password reset successfully! You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ msg: 'Server error during password reset.' });
  }
});

// Products pagination endpoint
app.get('/api/products', async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let countSql = 'SELECT COUNT(*) FROM products';
    let dataSql = 'SELECT id FROM products';
    const params = [];
    if (category) {
      countSql += ` WHERE LOWER(REPLACE(category, ' ', '')) = $1`;
      dataSql += ` WHERE LOWER(REPLACE(category, ' ', '')) = $1`;
      params.push(category.toLowerCase().replace(/\s+/g, ''));
    }
    const countRes = await pool.query(countSql, params);
    const totalProducts = parseInt(countRes.rows[0].count, 10);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));
    dataSql += ` ORDER BY name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const idsRes = await pool.query(dataSql, [...params, limit, offset]);
    const productIds = idsRes.rows.map(r => r.id);
    if (productIds.length === 0) {
      return res.json({ products: [], currentPage: parseInt(page,10), totalPages, totalProducts });
    }
    const detailsSql = `
      SELECT p.id, p.name, p.description, p.category, p.image_url, v.id AS variant_id, v.label, v.price
      FROM products p
      LEFT JOIN product_variants v ON p.id = v.product_id
      WHERE p.id = ANY($1::int[])
      ORDER BY p.name ASC, v.price ASC
    `;
    const detailsRes = await pool.query(detailsSql, [productIds]);
    const map = new Map();
    detailsRes.rows.forEach(row => {
      if (!map.has(row.id)) {
        map.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          category: row.category,
          image_url: row.image_url,
          variants: []
        });
      }
      if (row.variant_id) {
        map.get(row.id).variants.push({
          id: row.variant_id,
          label: row.label,
          price: parseFloat(row.price)
        });
      }
    });
    const ordered = productIds.map(id => map.get(id));
    res.json({
      products: ordered,
      currentPage: parseInt(page,10),
      totalPages,
      totalProducts
    });
  } catch (err) {
    console.error('Error fetching paginated products:', err);
    res.status(500).json({ msg: 'Server Error while fetching products.' });
  }
});

// Addresses endpoints
app.get('/api/addresses', checkUser, async (req, res) => {
  try {
    const result = await pool.query('SELECT addresses FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0].addresses || []);
  } catch (err) {
    console.error('Error fetching addresses:', err);
    res.status(500).json({ msg: 'Server error fetching addresses' });
  }
});
app.post('/api/addresses', checkUser, async (req, res) => {
  const { newAddress } = req.body;
  if (!newAddress || !newAddress.label || !newAddress.value) {
    return res.status(400).json({ msg: 'Address label and value are required.' });
  }
  try {
    const updateSql = `
      UPDATE users
      SET addresses = addresses || $1::jsonb
      WHERE id = $2
      RETURNING addresses
    `;
    const result = await pool.query(updateSql, [ JSON.stringify(newAddress), req.user.id ]);
    res.status(201).json(result.rows[0].addresses);
  } catch (err) {
    console.error('Error adding address:', err);
    res.status(500).json({ msg: 'Server error adding address' });
  }
});

// Orders (COD or prepaid)
app.post('/api/orders', checkUser, async (req, res) => {
  const { userId, cartItems, shippingAddress, totalAmount, paymentMode = 'COD' } = req.body;
  if (req.user.id !== userId) {
    return res.status(403).json({ msg: 'User not authorized.' });
  }
  // calculate delivery type etc
  const addressString = shippingAddress.value.toLowerCase();
  let deliveryStatus = 'Pending';
  let deliveryType = 'manual';
  let expectedDate = null;
  let status = paymentMode === 'COD' ? 'Processing' : 'Processing (Paid)';
  if (addressString.includes('hyderabad')) {
    deliveryType = 'manual';
    deliveryStatus = 'Pending';
  } else if (addressString.includes('telangana') || addressString.includes('andhra pradesh') || addressString.includes('a.p')) {
    deliveryType = 'automated';
    deliveryStatus = 'Out for Delivery';
    status = paymentMode === 'COD' ? 'Out for Delivery' : 'Out for Delivery (Paid)';
    expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 2);
  } else {
    deliveryType = 'automated';
    deliveryStatus = 'Out for Delivery';
    status = paymentMode === 'COD' ? 'Out for Delivery' : 'Out for Delivery (Paid)';
    expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 4);
  }

  try {
    const insertSql = `
      INSERT INTO orders 
      (user_id, items, total_amount, shipping_address, status, delivery_status, delivery_type, expected_delivery_date, payment_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    const paymentId = paymentMode === 'COD' ? null : req.paymentId;
    const result = await pool.query(insertSql, [
      userId,
      JSON.stringify(cartItems),
      totalAmount,
      shippingAddress,
      status,
      deliveryStatus,
      deliveryType,
      expectedDate,
      paymentId
    ]);
    res.status(201).json({ success: true, orderId: result.rows[0].id, message: 'Order placed successfully!' });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ msg: 'Server Error while creating order' });
  }
});

// Mark delivered (only automated orders)
app.put('/api/orders/:orderId/mark-delivered', checkUser, async (req, res) => {
  const { orderId } = req.params;
  try {
    const updateSql = `
      UPDATE orders
      SET delivery_status = 'Delivered', status = 'Completed'
      WHERE id = $1 AND user_id = $2 AND delivery_type = 'automated'
      RETURNING *
    `;
    const result = await pool.query(updateSql, [orderId, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Order not found or cannot be updated at this time.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error marking order as delivered:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Get user orders
app.get('/api/orders', checkUser, async (req, res) => {
  try {
    const query = `
      SELECT o.*, dp.name AS partner_name, dp.phone AS partner_phone
      FROM orders o
      LEFT JOIN delivery_partners dp ON o.assigned_to_id = dp.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `;
    const result = await pool.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ msg: 'Server error fetching orders' });
  }
});

// Coupons / applying coupon
app.get('/api/coupons/public', async (req, res) => {
  try {
    const sql = `
      SELECT code, discount_type, discount_value, expiry_date, min_purchase_amount, applicable_category
      FROM coupons
      WHERE is_active = TRUE AND expiry_date >= CURRENT_DATE
      ORDER BY expiry_date ASC
    `;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching public coupons:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

app.post('/api/coupons/apply', checkUser, async (req, res) => {
  const { couponCode, cartItems } = req.body;
  if (!couponCode || !cartItems) {
    return res.status(400).json({ success: false, msg: 'Coupon code and cart items are required.' });
  }
  try {
    const couponRes = await pool.query('SELECT * FROM coupons WHERE code = $1', [couponCode.toUpperCase()]);
    if (couponRes.rows.length === 0) {
      return res.status(404).json({ success: false, msg: 'Invalid coupon code.' });
    }
    const coupon = couponRes.rows[0];
    if (!coupon.is_active) {
      return res.status(400).json({ success: false, msg: 'This coupon is no longer active.' });
    }
    if (new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ success: false, msg: 'This coupon has expired.' });
    }

    let applicableSubtotal = 0;
    if (coupon.applicable_category) {
      const catNormalized = coupon.applicable_category.toLowerCase().replace(/\s+/g, '');
      const productIdsRes = await pool.query(
        'SELECT id FROM products WHERE LOWER(REPLACE(category, \' \', \'\')) = $1',
        [catNormalized]
      );
      const prodIds = productIdsRes.rows.map(r => r.id);
      const variantIdsRes = await pool.query(
        'SELECT id FROM product_variants WHERE product_id = ANY($1::int[])',
        [prodIds]
      );
      const varIds = new Set(variantIdsRes.rows.map(r => r.id));
      cartItems.forEach(item => {
        if (varIds.has(item.id)) {
          applicableSubtotal += item.price * item.quantity;
        }
      });
    } else {
      cartItems.forEach(item => {
        applicableSubtotal += item.price * item.quantity;
      });
    }

    if (coupon.applicable_category && applicableSubtotal === 0) {
      return res.status(400).json({
        success: false,
        msg: `This coupon is only valid for the ${coupon.applicable_category} category.`
      });
    }
    if (applicableSubtotal < coupon.min_purchase_amount) {
      return res.status(400).json({
        success: false,
        msg: `A minimum purchase of ₹${coupon.min_purchase_amount} ${
          coupon.applicable_category ? `from the ${coupon.applicable_category} category` : 'of items'
        } is required.`
      });
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = applicableSubtotal * (coupon.discount_value / 100);
    } else {
      discountAmount = coupon.discount_value;
    }
    if (discountAmount > applicableSubtotal) discountAmount = applicableSubtotal;
    discountAmount = parseFloat(discountAmount.toFixed(2));

    res.json({ success: true, coupon, discountAmount });
  } catch (err) {
    console.error('Error applying coupon:', err);
    res.status(500).json({ success: false, msg: 'Server error. Please try again.' });
  }
});

// Payment / Razorpay
app.post('/api/payment/create-order', checkUser, async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    if (!amount || !receipt) {
      return res.status(400).json({ msg: 'Amount and receipt are required.' });
    }
    const options = {
      amount: Math.round(amount * 100), // in paise
      currency: "INR",
      receipt: receipt
    };
    const order = await razorpay.orders.create(options);
    if (!order) {
      return res.status(500).json({ msg: "Razorpay order creation failed" });
    }
    res.json({
      id: order.id,
      amount: order.amount,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ msg: 'Server Error', error: err });
  }
});

app.post('/api/payment/verify', checkUser, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartItems,
      shippingAddress,
      totalAmount
    } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, msg: 'Payment details missing.' });
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, msg: "Payment verification failed" });
    }

    // After verifying, create order
    const addressString = shippingAddress.value.toLowerCase();
    let deliveryStatus = 'Pending';
    let deliveryType = 'manual';
    let expectedDate = null;
    let status = 'Processing (Paid)';

    if (addressString.includes('hyderabad')) {
      deliveryType = 'manual';
      deliveryStatus = 'Pending';
    } else if (addressString.includes('telangana') || addressString.includes('andhra pradesh') || addressString.includes('a.p')) {
      deliveryType = 'automated';
      deliveryStatus = 'Out for Delivery';
      status = 'Out for Delivery (Paid)';
      expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 2);
    } else {
      deliveryType = 'automated';
      deliveryStatus = 'Out for Delivery';
      status = 'Out for Delivery (Paid)';
      expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 4);
    }

    const insertSql = `
      INSERT INTO orders
      (user_id, items, total_amount, shipping_address, status, delivery_status, delivery_type, expected_delivery_date, payment_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    const result = await pool.query(insertSql, [
      req.user.id,
      JSON.stringify(cartItems),
      totalAmount,
      shippingAddress,
      status,
      deliveryStatus,
      deliveryType,
      expectedDate,
      razorpay_payment_id
    ]);
    res.json({
      success: true,
      orderId: result.rows[0].id,
      paymentId: razorpay_payment_id
    });
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ success: false, msg: 'Server Error', error: err });
  }
});

// DELIVERY PARTNER endpoints
app.post('/api/delivery/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ success: false, msg: 'Please provide phone and password.' });
  }
  try {
    const partnerRes = await pool.query('SELECT * FROM delivery_partners WHERE phone = $1', [phone]);
    if (partnerRes.rows.length === 0) {
      return res.status(400).json({ success: false, msg: 'Invalid credentials.' });
    }
    const partner = partnerRes.rows[0];
    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: 'Invalid credentials.' });
    }
    const payload = { id: partner.id, name: partner.name, role: 'partner' };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '8h' });
    res.json({ success: true, token, partner: { id: partner.id, name: partner.name, phone: partner.phone } });
  } catch (err) {
    console.error('Delivery partner login error:', err);
    res.status(500).json({ success: false, msg: 'Server error during login.' });
  }
});

app.put('/api/delivery/location', checkPartner, async (req, res) => {
  const { latitude, longitude } = req.body;
  if (latitude == null || longitude == null) {
    return res.status(400).json({ msg: 'Latitude and longitude are required.' });
  }
  try {
    const locationJson = JSON.stringify({ latitude, longitude });
    const updateSql = `
      UPDATE delivery_partners
      SET last_known_location = $1, location_updated_at = NOW()
      WHERE id = $2
    `;
    await pool.query(updateSql, [locationJson, req.partner.id]);
    res.json({ success: true, msg: 'Location updated.' });
  } catch (err) {
    console.error('Error updating partner location:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

app.get('/api/delivery/orders', checkPartner, async (req, res) => {
  try {
    const sql = `
      SELECT o.id, o.total_amount, o.delivery_status, o.created_at, o.items, o.shipping_address,
             u.name AS customer_name, u.phone AS customer_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.assigned_to_id = $1 AND o.delivery_status NOT IN ('Delivered', 'Cancelled')
      ORDER BY o.created_at ASC
    `;
    const result = await pool.query(sql, [req.partner.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching assigned orders:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

app.put('/api/delivery/orders/:orderId/accept', checkPartner, async (req, res) => {
  const { orderId } = req.params;
  try {
    const sql = `
      UPDATE orders
      SET delivery_status = 'Out for Delivery', status = 'Out for Delivery'
      WHERE id = $1 AND assigned_to_id = $2 AND delivery_status = 'Assigned'
      RETURNING *
    `;
    const result = await pool.query(sql, [orderId, req.partner.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Order not found or cannot be accepted at this time.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error accepting order:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

app.put('/api/delivery/orders/:orderId/complete', checkPartner, async (req, res) => {
  const { orderId } = req.params;
  try {
    const sql = `
      UPDATE orders
      SET delivery_status = 'Delivered', status = 'Completed'
      WHERE id = $1 AND assigned_to_id = $2 AND delivery_status = 'Out for Delivery'
      RETURNING *
    `;
    const result = await pool.query(sql, [orderId, req.partner.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Order not found or cannot be completed at this time.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error completing order:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

app.get('/api/orders/:orderId/location', checkUser, async (req, res) => {
  const { orderId } = req.params;
  try {
    const sql = `
      SELECT dp.last_known_location
      FROM orders o
      JOIN delivery_partners dp ON o.assigned_to_id = dp.id
      WHERE o.id = $1 AND o.user_id = $2
    `;
    const result = await pool.query(sql, [orderId, req.user.id]);
    if (result.rows.length === 0 || !result.rows[0].last_known_location) {
      return res.status(404).json({ msg: 'Location not available for this order yet.' });
    }
    res.json(result.rows[0].last_known_location);
  } catch (err) {
    console.error('Error fetching partner location:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Inquiry / Email route
app.post('/api/inquiry', async (req, res) => {
  const { inquiryType, formData } = req.body;
  if (!inquiryType || !formData) {
    return res.status(400).json({ msg: 'Missing inquiry data.' });
  }
  const subject = inquiryType === 'Vendor'
    ? 'New Vendor Partnership Inquiry from Sresta Mart'
    : 'New Franchise Inquiry from Sresta Mart';
  const emailBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #c0392b;">New ${inquiryType} Inquiry Received</h2>
      <p>You have received a new inquiry from the Sresta Mart website. Details are below:</p>
      <table style="width: 100%; border-collapse: collapse;">
        ${Object.entries(formData).map(([key, value]) => `
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px; font-weight: bold; text-transform: capitalize; color: #333;">${key.replace(/_/g, ' ')}</td>
            <td style="padding: 8px; color: #555;">${value || 'N/A'}</td>
          </tr>
        `).join('')}
      </table>
      <p style="margin-top: 20px; font-size: 12px; color: #888;">This is an automated message from the Sresta Mart website.</p>
    </div>
  `;
  try {
    const { data, error } = await resend.emails.send({
      from: 'Sresta Mart Inquiries <noreply@srestamart.com>',
      to: ['srestamart@gmail.com'],
      subject,
      html: emailBody
    });
    if (error) {
      console.error('RESEND_ERROR:', error);
      return res.status(400).json({ success: false, msg: 'Failed to send inquiry.', error });
    }
    console.log('Email sent via Resend:', data);
    res.json({ success: true, msg: 'Inquiry sent successfully! We will get back to you soon.' });
  } catch (err) {
    console.error('SERVER_ERROR sending inquiry email:', err);
    res.status(500).json({ success: false, msg: 'Failed to send your inquiry due to a server error.' });
  }
});

// Serve frontend and start server
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} at Sresta Mart.`);
});
