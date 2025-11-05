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

// --- NEW IMPORTS FOR CLOUDINARY ---
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const Razorpay = require('razorpay');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'srestamart_super_secret_key';

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// --- DATABASE CONNECTION ---
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- CORE MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());

// --- CLOUDINARY CONFIGURATION (NEW) ---
// This tells Cloudinary who you are, using the keys from your Render Environment
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- MULTER/STORAGE CONFIGURATION (REPLACED) ---
// This tells multer to upload files to Cloudinary instead of your local disk
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sresta-mart-products', // A folder to keep your images organized
    format: async (req, file) => 'webp', // Auto-converts to a fast, modern format
    public_id: (req, file) => Date.now() + '-' + file.originalname.split('.').slice(0, -1).join('.'), // Creates a unique filename
  },
});

// This initializes multer with your new Cloudinary storage
const upload = multer({ storage: storage });

// --- (OLD) STATIC ASSETS & FILE UPLOAD SETUP ---
// We no longer need this line, as images are not served from the backend disk
// app.use('/images/products', express.static(path.join(__dirname, 'public/products')));

// --- TWILIO CLIENT ---
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// --- AUTHENTICATION MIDDLEWARE ---
// (All your auth middleware remains exactly the same)
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
  // (This route remains exactly the same)
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const payload = { id: 'admin', username: username, role: 'admin' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, msg: 'Invalid Admin Credentials' });
  }
});

// --- ADMIN UPLOAD ROUTE (MODIFIED) ---
// This is now much simpler. 'upload.single' does all the work.
app.post('/api/admin/upload', checkAdminToken, upload.single('productImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded.' });
    }
    // req.file.path is the new, permanent, https://... Cloudinary URL
    // Your frontend (AddProductModal) already expects this `imageUrl` response
    res.json({ success: true, imageUrl: req.file.path });
});

// --- Product Management (Admin) ---
// (All your other admin routes: get products, create products, edit, delete, etc.)
// (remain 100% the same. Your frontend already sends the `image_url` as text,)
// (so this route doesn't even know or care where the image came from.)
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
    // product.image_url is the Cloudinary URL from the frontend
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
// (All these routes remain exactly the same)
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
// (All these routes remain exactly the same)
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
// (All these routes remain exactly the same)
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


// --- COUPON MANAGEMENT (ADMIN) ---
// (All these routes remain exactly the same)
app.post('/api/admin/coupons', checkAdminToken, async (req, res) => {
    const { code, discount_type, discount_value, expiry_date, min_purchase_amount, applicable_category, poster_url, description } = req.body;
    if (!code || !discount_type || !discount_value || !expiry_date) {
        return res.status(400).json({ msg: 'Please provide all required coupon fields.' });
    }
    try {
        const newCoupon = await pool.query(
    `INSERT INTO coupons (code, discount_type, discount_value, expiry_date, min_purchase_amount, applicable_category, poster_url, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [code.toUpperCase(), discount_type, discount_value, expiry_date, min_purchase_amount || 0, applicable_category || null, poster_url || null, description || null]
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

app.get('/api/admin/coupons', checkAdminToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching coupons for admin:', err.message);
        res.status(500).send('Server Error');
    }
});

app.put('/api/admin/coupons/:id', checkAdminToken, async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body; 
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
// (All these routes remain exactly the same)

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


// --- Order Creation ---
app.post('/api/orders', checkUserToken, async (req, res) => {
  const { userId, cartItems, shippingAddress, totalAmount } = req.body;
  if (req.user.id !== userId) return res.status(403).json({ msg: 'User not authorized.' });

  const addressString = shippingAddress.value.toLowerCase();
  let deliveryStatus = 'Pending';
  let deliveryType = 'manual';
  let expectedDate = null;
  let status = 'Processing';

  if (addressString.includes('hyderabad')) {
      deliveryType = 'manual';
      deliveryStatus = 'Pending';
  } else if (addressString.includes('telangana') || addressString.includes('andhra pradesh') || addressString.includes('a.p')) {
      deliveryType = 'automated';
      deliveryStatus = 'Out for Delivery';
      status = 'Out for Delivery';
      expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 2);
  } else {
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
    const query = `
  SELECT
    o.*,
    dp.name as partner_name,
    dp.phone as partner_phone
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

// --- PUBLIC COUPON ROUTES ---
app.get('/api/coupons/public', async (req, res) => {
    try {
        const result = await pool.query(
          "SELECT code, discount_type, discount_value, expiry_date, min_purchase_amount, applicable_category, poster_url, description FROM coupons WHERE is_active = TRUE AND expiry_date >= CURRENT_DATE ORDER BY expiry_date ASC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching public coupons:', err.message);
        res.status(500).send('Server Error');
    }
});

// --- MODIFIED: This is now a powerful endpoint that calculates the discount ---
app.post('/api/coupons/apply', checkUserToken, async (req, res) => {
    // It now expects `cartItems` instead of `cartTotal`
    const { couponCode, cartItems } = req.body;
    if (!couponCode || !cartItems) return res.status(400).json({ success: false, msg: 'Coupon code and cart items are required.' });

    try {
        // 1. Fetch the coupon
        const result = await pool.query('SELECT * FROM coupons WHERE code = $1', [couponCode.toUpperCase()]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, msg: 'Invalid coupon code.' });
        }
        const coupon = result.rows[0];

        // 2. Check basic validity
        if (!coupon.is_active) {
            return res.status(400).json({ success: false, msg: 'This coupon is no longer active.' });
        }
        if (new Date(coupon.expiry_date) < new Date()) {
            return res.status(400).json({ success: false, msg: 'This coupon has expired.' });
        }

        // 3. Determine the "applicable subtotal"
        let applicableSubtotal = 0;
        if (coupon.applicable_category) {
            // Find all product IDs for the given category
            const productIdsResult = await pool.query(
                'SELECT id FROM products WHERE LOWER(REPLACE(category, \' \', \'\')) = $1',
                [coupon.applicable_category.toLowerCase().replace(/\s+/g, '')]
            );
            const applicableProductIds = new Set(productIdsResult.rows.map(p => p.id));
            
            // Find all variant IDs for those products
            const variantIdsResult = await pool.query(
                'SELECT id FROM product_variants WHERE product_id = ANY($1::int[])',
                [Array.from(applicableProductIds)]
            );
            const applicableVariantIds = new Set(variantIdsResult.rows.map(v => v.id));

            // Calculate subtotal *only* for items in that category
            cartItems.forEach(item => {
                if (applicableVariantIds.has(item.id)) { // item.id is the variant_id
                    applicableSubtotal += item.price * item.quantity;
                }
            });
        } else {
            // Coupon applies to the whole cart
            cartItems.forEach(item => {
                applicableSubtotal += item.price * item.quantity;
            });
        }
        
        // 4. Check minimum purchase against the *applicable* subtotal
        if (applicableSubtotal === 0 && coupon.applicable_category) {
             return res.status(400).json({ success: false, msg: `This coupon is only valid for the ${coupon.applicable_category} category.` });
        }
        if (applicableSubtotal < coupon.min_purchase_amount) {
            const categoryName = coupon.applicable_category ? `from the ${coupon.applicable_category} category` : "of items";
            return res.status(400).json({ success: false, msg: `A minimum purchase of ₹${coupon.min_purchase_amount} ${categoryName} is required.` });
        }

        // 5. Calculate the discount
        let discountAmount = 0;
        if (coupon.discount_type === 'percentage') {
            discountAmount = applicableSubtotal * (coupon.discount_value / 100);
        } else { // 'fixed'
            discountAmount = coupon.discount_value;
        }

        // Ensure fixed discount doesn't exceed the subtotal
        discountAmount = Math.min(discountAmount, applicableSubtotal);

        // 6. Return the success, the coupon object, and the calculated amount
        res.json({ success: true, coupon, discountAmount: parseFloat(discountAmount.toFixed(2)) });

    } catch (err) {
        console.error('Error applying coupon:', err.message);
        res.status(500).json({ success: false, msg: 'Server error. Please try again.' });
    }
});


// ===========================================
// --- 💳 NEW: RAZORPAY PAYMENT ROUTES ---
// ===========================================

// --- 1. CREATE RAZORPAY ORDER ID ---
app.post('/api/payment/create-order', checkUserToken, async (req, res) => {
    try {
        const { amount, receipt } = req.body;

        const options = {
            amount: Math.round(amount * 100), // Amount in paise
            currency: "INR",
            receipt: receipt, // e.g., "order_rcptid_11"
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({ msg: "Razorpay order creation failed" });
        }

        res.json({
            id: order.id,
            amount: order.amount,
            key_id: process.env.RAZORPAY_KEY_ID,
        });

    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ msg: "Server Error", error });
    }
});

// --- 2. VERIFY PAYMENT AND CREATE DB ORDER ---
app.post('/api/payment/verify', checkUserToken, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            // These are passed from the frontend handler
            cartItems,
            shippingAddress,
            totalAmount 
        } = req.body;
        
        const userId = req.user.id;

        // --- 1. Verify Signature ---
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ success: false, msg: "Payment verification failed" });
        }

        // --- 2. Signature is VERIFIED. Create the order in *our* database ---
        const addressString = shippingAddress.value.toLowerCase();
        let deliveryStatus = 'Pending';
        let deliveryType = 'manual';
        let expectedDate = null;
        let status = 'Processing (Paid)'; // Mark as Paid
        
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

        // This query now uses the new `payment_id` column
        const orderQuery = `
          INSERT INTO orders (user_id, items, total_amount, shipping_address, status, delivery_status, delivery_type, expected_delivery_date, payment_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;
        `;
        const orderResult = await pool.query(orderQuery, [
            userId, 
            JSON.stringify(cartItems), 
            totalAmount, 
            shippingAddress, 
            status, 
            deliveryStatus, 
            deliveryType, 
            expectedDate,
            razorpay_payment_id // Save the payment ID
        ]);

        res.json({
            success: true,
            orderId: orderResult.rows[0].id,
            paymentId: razorpay_payment_id,
        });

    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, msg: "Server Error", error });
    }
});



// ===========================================
// --- 🚚 DELIVERY PARTNER API ROUTES ---
// ===========================================
// (All these routes remain exactly the same)

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

app.put('/api/delivery/location', checkPartnerToken, async (req, res) => {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ msg: 'Latitude and longitude are required.' });
    }
    try {
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

app.put('/api/delivery/orders/:orderId/accept', checkPartnerToken, async (req, res) => {
    const { orderId } = req.params;
    try {
        const result = await pool.query(
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

app.put('/api/delivery/orders/:orderId/complete', checkPartnerToken, async (req, res) => {
    const { orderId } = req.params;
    try {
        const result = await pool.query(
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


app.get('/api/orders/:orderId/location', checkUserToken, async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  try {
    const query = `
      SELECT dp.last_known_location
      FROM orders o
      JOIN delivery_partners dp ON o.assigned_to_id = dp.id
      WHERE o.id = $1 AND o.user_id = $2;
    `;
    const result = await pool.query(query, [orderId, userId]);

    if (result.rowCount === 0 || !result.rows[0].last_known_location) {
      return res.status(404).json({ msg: 'Location not available for this order yet.' });
    }
    
    res.json(result.rows[0].last_known_location);

  } catch (err) {
    console.error('Error fetching partner location:', err.message);
    res.status(500).send('Server Error');
  }
});


// ===================================
// --- 📧 INQUIRY & EMAIL API ROUTE ---
// ===================================
// (This route remains exactly the same)

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
        console.log('Attempting to send email via Resend...');

        const { data, error } = await resend.emails.send({
            from: 'Sresta Mart Inquiries <noreply@srestamart.com>', // Replace with your verified domain email
            to: ['srestamart@gmail.com'],
            subject: subject,
            html: emailBody,
        });

        if (error) {
            console.error('RESEND_ERROR:', error);
            return res.status(400).json({ success: false, msg: 'Failed to send inquiry.', error });
        }

        console.log('Email sent successfully via Resend!', data);
        res.status(200).json({ success: true, msg: 'Inquiry sent successfully! We will get back to you soon.' });

    } catch (error) {
        console.error('SERVER_ERROR sending email:', error);
        res.status(500).json({ success: false, msg: 'Failed to send your inquiry due to a server error.' });
    }
});


// ===================================
// --- 🖥️ SERVE FRONTEND & START SERVER ---
// ===================================
// (This section remains exactly the same)
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} at Sresta Mart.`);
});