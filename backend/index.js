// backend/index.js (Modified & Corrected)

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
const PORT = process.env.PORT || 5000; // Added a fallback port
const JWT_SECRET = process.env.JWT_SECRET || 'srestamart_super_secret_key';

// --- DATABASE CONNECTION ---
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- CORE MIDDLEWARE ---
const allowedOrigins = [
  'https://www.srestamart.com', 
  'https://srestamart.com',
  'https://srestamart.onrender.com',
  'http://localhost:5173'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(bodyParser.json());

// --- STATIC ASSETS & FILE UPLOAD SETUP ---
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

// --- TWILIO CLIENT ---
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// --- AUTHENTICATION MIDDLEWARE ---
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

// ===================================
// --- 👑 ADMIN API ROUTES ---
// ===================================

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const payload = { id: 'admin', username: username, role: 'admin' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, msg: 'Invalid Admin Credentials' });
  }
});

app.post('/api/admin/upload', checkAdminToken, upload.single('productImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded.' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/images/products/${req.file.filename}`;
    res.json({ success: true, imageUrl: imageUrl });
});

// --- Product Management (Admin) ---

// ✅ **NEW**: GET ALL PRODUCTS FOR ADMIN DASHBOARD
app.get('/api/admin/products', checkAdminToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id, p.name, p.description, p.category, p.image_url,
                v.id as variant_id, v.label, v.price
            FROM products p
            LEFT JOIN product_variants v ON p.id = v.product_id
            ORDER BY p.name ASC, v.price ASC;
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
        console.error('Error fetching all products for admin:', err.message);
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
    if (updatedProduct.rows.length === 0) {
        return res.status(404).json({ msg: 'Product not found.' });
    }
    res.json(updatedProduct.rows[0]);
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).send('Server Error');
  }
});

// ✅ **MODIFIED**: SAFER PRODUCT DELETION WITH TRANSACTIONS
app.delete('/api/admin/products/:id', checkAdminToken, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM product_variants WHERE product_id = $1', [req.params.id]);
        const deleteProductResult = await client.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
        
        if (deleteProductResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ msg: 'Product not found.' });
        }
        
        await client.query('COMMIT');
        res.json({ msg: 'Product and its variants deleted successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error deleting product:', err.message);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
});


// --- Variant Management (Admin) ---
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

// --- User Management (Admin) ---
app.get('/api/admin/users', checkAdminToken, async (req, res) => {
  try {
    const usersResult = await pool.query('SELECT id, name, phone, created_at, is_admin, addresses FROM users ORDER BY id ASC');
    res.json(usersResult.rows);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).send('Server Error');
  }
});

// --- Order Management (Admin) ---
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
  const { orderId } = req.params;
  try {
    const result = await pool.query(
      'UPDATE orders SET assigned_to_id = $1, delivery_status = $2, status = $2 WHERE id = $3 RETURNING *',
      [partnerId, 'Assigned', orderId]
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


// --- NEW: COUPON MANAGEMENT (ADMIN) ---

// Create a new coupon
app.post('/api/admin/coupons', checkAdminToken, async (req, res) => {
    const { code, discount_type, discount_value, expiry_date, min_purchase_amount } = req.body;
    if (!code || !discount_type || !discount_value || !expiry_date) {
        return res.status(400).json({ msg: 'Please provide all required coupon fields.' });
    }
    try {
        const newCoupon = await pool.query(
            `INSERT INTO coupons (code, discount_type, discount_value, expiry_date, min_purchase_amount)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [code.toUpperCase(), discount_type, discount_value, expiry_date, min_purchase_amount || 0]
        );
        res.status(201).json(newCoupon.rows[0]);
    } catch (err) {
        console.error('Error creating coupon:', err.message);
        if (err.code === '23505') { // Unique constraint violation
            return res.status(400).json({ msg: 'This coupon code already exists.' });
        }
        res.status(500).send('Server Error');
    }
});

// Get all coupons for the admin dashboard
app.get('/api/admin/coupons', checkAdminToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching coupons for admin:', err.message);
        res.status(500).send('Server Error');
    }
});

// Update a coupon (e.g., toggle active status)
app.put('/api/admin/coupons/:id', checkAdminToken, async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body; // Example: only updating active status for now
    try {
        const updatedCoupon = await pool.query(
            'UPDATE coupons SET is_active = $1 WHERE id = $2 RETURNING *',
            [is_active, id]
        );
        if (updatedCoupon.rowCount === 0) {
            return res.status(404).json({ msg: 'Coupon not found.' });
        }
        res.json(updatedCoupon.rows[0]);
    } catch (err) {
        console.error('Error updating coupon:', err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a coupon
app.delete('/api/admin/coupons/:id', checkAdminToken, async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM coupons WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Coupon not found.' });
        }
        res.json({ msg: 'Coupon deleted successfully.' });
    } catch (err) {
        console.error('Error deleting coupon:', err.message);
        res.status(500).send('Server Error');
    }
});


// ===================================
// --- 👤 USER & PUBLIC API ROUTES ---
// ===================================

// --- Auth (User) ---
app.post('/api/register', async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) return res.status(400).json({ msg: 'Please enter all fields' });
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (userExists.rows.length > 0) return res.status(400).json({ msg: 'User with this phone number already exists' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = await pool.query(
      'INSERT INTO users (name, phone, password, created_at, is_admin) VALUES ($1, $2, $3, NOW(), $4) RETURNING id, name, phone',
      [name, phone, hashedPassword, false]
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
    res.json({ msg: `Welcome back, ${user.name}!`, token, user: { id: user.id, name: user.name, phone: user.phone } });
  } catch (err) {
    console.error('Error logging in:', err.message); res.status(500).send('Server error');
  }
});

app.post('/api/forgot-password-twilio', async (req, res) => {
    const { phone } = req.body;
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
        if (userResult.rows.length === 0) {
            // Security: Don't reveal if a user exists or not.
            return res.json({ msg: 'If an account exists for this number, an OTP has been sent.' });
        }
        
        const otp = crypto.randomInt(100000, 999999).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
        
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

// --- Public Products (Paginated) ---
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

    productsQuery += ` ORDER BY name ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    const productIdsResult = await pool.query(productsQuery, [...queryParams, limit, offset]);
    const productIds = productIdsResult.rows.map(row => row.id);

    if (productIds.length === 0) {
      return res.status(200).json({ products: [], currentPage: page, totalPages, totalProducts });
    }

    const productsAndVariantsQuery = `
      SELECT p.id, p.name, p.description, p.category, p.image_url, v.id as variant_id, v.label, v.price
      FROM products p
      LEFT JOIN product_variants v ON p.id = v.product_id
      WHERE p.id = ANY($1::int[])
      ORDER BY p.name ASC, v.price ASC;
    `;
    const { rows } = await pool.query(productsAndVariantsQuery, [productIds]);
    
    const productsMap = new Map();
    rows.forEach(row => {
      if (!productsMap.has(row.id)) {
        productsMap.set(row.id, {
          id: row.id, name: row.name, description: row.description, category: row.category,
          image_url: row.image_url, variants: []
        });
      }
      if (row.variant_id) {
        productsMap.get(row.id).variants.push({
          id: row.variant_id, label: row.label, price: parseFloat(row.price)
        });
      }
    });

    // ✅ **MODIFIED**: Ensure original paginated order is respected
    const orderedProducts = productIds.map(id => productsMap.get(id));

    res.status(200).json({ products: orderedProducts, currentPage: page, totalPages, totalProducts });
  } catch (err) {
    console.error("Error fetching paginated products:", err.message);
    res.status(500).json({ msg: 'Server Error while fetching products.' });
  }
});


// --- Addresses (User) ---
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


// --- MODIFIED: Order Creation now has location-based logic ---

app.post('/api/orders', checkUserToken, async (req, res) => {
  const { userId, cartItems, shippingAddress, totalAmount } = req.body;
  if (req.user.id !== userId) return res.status(403).json({ msg: 'User not authorized.' });

  const addressString = shippingAddress.value.toLowerCase();
  let deliveryStatus = 'Pending';
  let deliveryType = 'manual';
  let expectedDate = null;
  let status = 'Processing';

  if (addressString.includes('hyderabad')) {
      // Rule A: Manual delivery for Hyderabad
      deliveryType = 'manual';
      deliveryStatus = 'Pending';
  } else if (addressString.includes('telangana') || addressString.includes('andhra pradesh') || addressString.includes('a.p')) {
      // Rule B: Automated 2-day delivery for Telangana (non-Hyd) and AP
      deliveryType = 'automated';
      deliveryStatus = 'Out for Delivery';
      status = 'Out for Delivery';
      expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 2);
  } else {
      // Rule C: Automated 4-day delivery for Rest of India
      deliveryType = 'automated';
      deliveryStatus = 'Out for Delivery';
      status = 'Out for Delivery';
      expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 4);
  }

  try {
    const orderQuery = `
      INSERT INTO orders (user_id, items, total_amount, shipping_address, status, delivery_status, delivery_type, expected_delivery_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;
    `;
    const orderResult = await pool.query(orderQuery, [userId, JSON.stringify(cartItems), totalAmount, shippingAddress, status, deliveryStatus, deliveryType, expectedDate]);
    res.status(201).json({ success: true, orderId: orderResult.rows[0].id, message: 'Order placed successfully!' });
  } catch (err) {
    console.error('Error creating order:', err.message);
    res.status(500).json({ msg: 'Server Error while creating order' });
  }
});

// --- NEW: Endpoint for user to mark their order as delivered ---
app.put('/api/orders/:orderId/mark-delivered', checkUserToken, async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `UPDATE orders 
             SET delivery_status = 'Delivered', status = 'Completed'
             WHERE id = $1 AND user_id = $2 AND delivery_type = 'automated'
             RETURNING *`,
            [orderId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Order not found or cannot be updated at this time.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error marking order as delivered:', err.message);
        res.status(500).send('Server Error');
    }
});


app.get('/api/orders', checkUserToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // We already fetch all necessary columns, no change needed here.
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
    console.error('Error fetching user orders:', err.message);
    res.status(500).send('Server error fetching orders');
  }
});

// --- NEW: PUBLIC COUPON ROUTES ---

// Get all active, non-expired coupons for the public coupons page
app.get('/api/coupons/public', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT code, discount_type, discount_value, expiry_date, min_purchase_amount FROM coupons WHERE is_active = TRUE AND expiry_date >= CURRENT_DATE ORDER BY expiry_date ASC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching public coupons:', err.message);
        res.status(500).send('Server Error');
    }
});

// Apply a coupon code
app.post('/api/coupons/apply', checkUserToken, async (req, res) => {
    const { couponCode, cartTotal } = req.body;
    if (!couponCode) return res.status(400).json({ success: false, msg: 'Coupon code is required.' });

    try {
        const result = await pool.query('SELECT * FROM coupons WHERE code = $1', [couponCode.toUpperCase()]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, msg: 'Invalid coupon code.' });
        }
        
        const coupon = result.rows[0];

        if (!coupon.is_active) {
            return res.status(400).json({ success: false, msg: 'This coupon is no longer active.' });
        }

        if (new Date(coupon.expiry_date) < new Date()) {
            return res.status(400).json({ success: false, msg: 'This coupon has expired.' });
        }

        if (Number(cartTotal) < Number(coupon.min_purchase_amount)) {
            return res.status(400).json({ success: false, msg: `Minimum purchase of ₹${coupon.min_purchase_amount} is required.` });
        }

        // All checks passed
        res.json({ success: true, coupon });

    } catch (err) {
        console.error('Error applying coupon:', err.message);
        res.status(500).json({ success: false, msg: 'Server error. Please try again.' });
    }
});


// ===========================================
// --- 🚚 DELIVERY PARTNER API ROUTES ---
// ===========================================

// Partner Login
app.post('/api/delivery/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ success: false, msg: 'Please provide phone and password.' });
  }
  try {
    const partnerResult = await pool.query('SELECT * FROM delivery_partners WHERE phone = $1', [phone]);
    if (partnerResult.rows.length === 0) {
      return res.status(400).json({ success: false, msg: 'Invalid credentials.' });
    }
    const partner = partnerResult.rows[0];
    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: 'Invalid credentials.' });
    }
    const payload = { id: partner.id, name: partner.name, role: 'partner' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    res.json({
      success: true,
      token,
      partner: { id: partner.id, name: partner.name, phone: partner.phone }
    });
  } catch (err) {
    console.error('Delivery partner login error:', err.message);
    res.status(500).json({ success: false, msg: 'Server error during login.' });
  }
});

// ✅ --- NEW ROUTE --- Update Partner's Location
app.put('/api/delivery/location', checkPartnerToken, async (req, res) => {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ msg: 'Latitude and longitude are required.' });
    }
    try {
        // NOTE: Assumes your `delivery_partners` table has a `last_known_location` column (jsonb type recommended)
        // and `location_updated_at` (timestamptz type recommended).
        const locationJson = JSON.stringify({ latitude, longitude });
        await pool.query(
            'UPDATE delivery_partners SET last_known_location = $1, location_updated_at = NOW() WHERE id = $2',
            [locationJson, req.partner.id]
        );
        res.json({ success: true, msg: 'Location updated.' });
    } catch (err) {
        console.error('Error updating partner location:', err.message);
        res.status(500).send('Server Error');
    }
});


// Get Assigned Orders for a Partner
app.get('/api/delivery/orders', checkPartnerToken, async (req, res) => {
  try {
    const partnerId = req.partner.id;
    const query = `
      SELECT 
        o.id, o.total_amount, o.delivery_status, o.created_at, o.items,
        o.shipping_address,
        u.name as customer_name, u.phone as customer_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.assigned_to_id = $1 AND o.delivery_status NOT IN ('Delivered', 'Cancelled')
      ORDER BY o.created_at ASC;
    `;
    const { rows } = await pool.query(query, [partnerId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching assigned orders:', err.message);
    res.status(500).send('Server Error');
  }
});

// ✅ --- NEW ROUTE --- Accept an Assigned Order
// CORRECTED CODE
app.put('/api/delivery/orders/:orderId/accept', checkPartnerToken, async (req, res) => {
    const { orderId } = req.params;
    try {
        const result = await pool.query(
            // ✅ This now updates BOTH status fields for consistency
            `UPDATE orders 
             SET delivery_status = 'Out for Delivery', status = 'Out for Delivery' 
             WHERE id = $1 AND assigned_to_id = $2 AND delivery_status = 'Assigned'
             RETURNING *`,
            [orderId, req.partner.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Order not found or cannot be accepted at this time.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error accepting order:', err.message);
        res.status(500).send('Server Error');
    }
});

// ✅ --- MODIFIED --- Complete a Delivery
app.put('/api/delivery/orders/:orderId/complete', checkPartnerToken, async (req, res) => {
    const { orderId } = req.params;
    try {
        const result = await pool.query(
            // This now updates BOTH the delivery status and the main order status
            `UPDATE orders 
             SET delivery_status = 'Delivered', status = 'Completed'
             WHERE id = $1 AND assigned_to_id = $2 AND delivery_status = 'Out for Delivery'
             RETURNING *`,
            [orderId, req.partner.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Order not found or cannot be completed at this time.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error completing order:', err.message);
        res.status(500).send('Server Error');
    }
});

// ===================================
// --- 🖥️ SERVE FRONTEND & START SERVER ---
// ===================================
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} at Sresta Mart.`);
});