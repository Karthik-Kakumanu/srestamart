require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path'); // Required for serving static files

const app = express();
const PORT = 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'srestamart_super_secret_key';

app.use(cors());
app.use(bodyParser.json());

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:YBBAgHVEtZnLKHujeCnGRcKZwUXZBszo@yamanote.proxy.rlwy.net:23771/railway",
});

// --- MIDDLEWARE ---
const checkAdminToken = (req, res, next) => {
  const token = req.header('x-admin-token');
  if (!token) return res.status(401).json({ msg: 'No admin token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.user.isAdmin) {
      req.user = decoded.user;
      next();
    } else { throw new Error('Invalid token type'); }
  } catch (e) {
    res.status(401).json({ msg: 'Admin token is not valid' });
  }
};

const checkUserToken = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// --- API ROUTES ---

// --- ADMIN ROUTES ---
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const payload = { user: { username: username, isAdmin: true } };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
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
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.get('/api/admin/orders', checkAdminToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                o.id,
                o.total_amount,
                o.status,
                o.created_at,
                o.items,
                o.shipping_address,
                u.name as customer_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC;
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching all orders');
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
        console.error(err.message);
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
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.delete('/api/admin/products/:id', checkAdminToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
        res.json({ msg: 'Product and its variants deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/admin/variants', checkAdminToken, async (req, res) => {
    const { product_id, label, price } = req.body;
    try {
        const newVariant = await pool.query(
            'INSERT INTO product_variants (product_id, label, price) VALUES ($1, $2, $3) RETURNING *',
            [product_id, label, price]
        );
        res.status(201).json(newVariant.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.put('/api/admin/variants/:id', checkAdminToken, async (req, res) => {
    const { label, price } = req.body;
    try {
        const updatedVariant = await pool.query(
            'UPDATE product_variants SET label = $1, price = $2 WHERE id = $3 RETURNING *',
            [label, price, req.params.id]
        );
        res.json(updatedVariant.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.delete('/api/admin/variants/:id', checkAdminToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM product_variants WHERE id = $1', [req.params.id]);
        res.json({ msg: 'Variant deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- USER AUTH ROUTES ---
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
        console.error(err.message); res.status(500).send('Server error'); 
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
        const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '3h' }); 
        res.json({ msg: `Welcome back, ${user.name}!`, token, user: { id: user.id, name: user.name, phone: user.phone, is_admin: user.is_admin } }); 
    } catch (err) { 
        console.error(err.message); res.status(500).send('Server error'); 
    }
});

// --- PUBLIC PRODUCTS ROUTE ---
app.get('/api/products', async (req, res) => {
    try {
        const query = `
          SELECT p.id, p.name, p.description, p.category, p.image_url, v.id as variant_id, v.label, v.price
          FROM products p LEFT JOIN product_variants v ON p.id = v.product_id ORDER BY p.id, v.price;`;
        const { rows } = await pool.query(query);
        const productsMap = new Map();
        rows.forEach(row => {
            if (!productsMap.has(row.id)) {
                productsMap.set(row.id, { id: row.id, name: row.name, description: row.description, category: row.category, image_url: row.image_url, variants: [] });
            }
            if (row.variant_id) {
                productsMap.get(row.id).variants.push({ id: row.variant_id, label: row.label, price: parseFloat(row.price) });
            }
        });
        res.json(Array.from(productsMap.values()));
    } catch (err) {
        console.error("Error fetching products:", err.message);
        res.status(500).send('Server Error');
    }
});

// --- USER ADDRESS ROUTES ---
app.get('/api/addresses', checkUserToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT addresses FROM users WHERE id = $1', [req.user.id]);
        res.json(result.rows[0].addresses || []);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error fetching addresses');
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
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error adding address');
    }
});

// --- USER ORDER ROUTES ---
app.post('/api/orders', checkUserToken, async (req, res) => {
    const { userId, cartItems, shippingAddress, totalAmount } = req.body;
    if (req.user.id !== userId) return res.status(403).json({ msg: 'User not authorized.' });

    try {
        const orderQuery = `
            INSERT INTO orders (user_id, items, total_amount, shipping_address, status)
            VALUES ($1, $2, $3, $4, $5) RETURNING id;
        `;
        const orderResult = await pool.query(orderQuery, [userId, JSON.stringify(cartItems), totalAmount, shippingAddress, 'Processing']);
        res.status(201).json({ success: true, orderId: orderResult.rows[0].id, message: 'Order placed successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error while creating order');
    }
});

app.get('/api/orders', checkUserToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const query = `SELECT id, total_amount, status, created_at, items, shipping_address FROM orders WHERE user_id = $1 ORDER BY created_at DESC;`;
        const { rows } = await pool.query(query, [userId]);
        res.json(rows);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error fetching orders');
    }
});


// --- SERVE REACT FRONTEND ---
// This line must come AFTER all your API routes
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// This is the catch-all route that sends the React app's index.html
// for any request that doesn't match an API route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} at Sresta Mart, Ponnur.`);
});