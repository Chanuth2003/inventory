import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import process from 'process';


import bcrypt from "bcrypt";
import session from "express-session";
import { ADMIN_PASSWORD_HASH } from "../config/auth.js";
import authRoutes from './routes/auth.js';




dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use('/auth', authRoutes);
app.use('/auth', authRoutes);

// server.js (CORS)
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"], // allow both React ports
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: "inventory-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 60 * 60 * 1000 // 1 hour
  }
}));


// ====================== ROUTES ======================
app.use('/api', authRoutes);           // ← Add this

// Protect your inventory route
import { isAuthenticated } from './middleware/auth.js';

app.use('/inventory', isAuthenticated);







// ====================== LOGIN ROUTE ======================
app.post("/api/login", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Password required" });
    }

    const match = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (match) {
      req.session.authenticated = true;
      req.session.isAdmin = true;
      console.log("✅ Login successful");
      return res.json({ success: true, message: "Login successful" });
    } else {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ====================== CHECK SESSION ======================
app.get('/api/check-session', (req, res) => {
  if (req.session && req.session.authenticated) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});


app.post("/logout", (req, res) => {

  req.session.destroy(() => {
    res.json({ success: true });
  });

});


function requireAuth(req, res, next) {

  if (!req.session.authenticated) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }

  next();

}





// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// PRODUCTS
app.get('/products', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT product_id, type, unit, price FROM products');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/add-product', async (req, res) => {
  const { type, product_id, unit, price } = req.body;
  try {
    await db.query('INSERT INTO products (type, product_id, unit, price) VALUES (?, ?, ?, ?)', 
      [type, product_id, unit, price]);
    res.status(201).json({ message: 'Product added' });
  } catch (err) {
    console.error('Error adding product:', err.message);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.post('/products/add', async (req, res) => {
  req.url = '/add-product';
  app.handle(req, res);
});

// INVENTORY
app.post('/add-inventory', async (req, res) => {
  const { date, product_id, quantity, unit } = req.body;
  try {
    await db.query('INSERT INTO inventory (date, product_id, quantity, unit) VALUES (?, ?, ?, ?)', 
      [date, product_id, quantity, unit]);
    res.status(201).json({ message: 'Inventory added' });
  } catch (err) {
    console.error('Error adding inventory:', err.message);
    res.status(500).json({ error: 'Failed to add inventory' });
  }
});

app.get('/inventory', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT i.id, i.date, i.product_id, p.type AS product_type, i.quantity, i.unit
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error in /inventory:', err.message);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

app.put('/inventory/:id', async (req, res) => {
  const { id } = req.params;
  const { date, product_id, add_quantity, unit } = req.body;

  if (!date || !product_id || !unit || add_quantity === undefined) {
    return res.status(400).json({ error: 'Date, product ID, additional quantity, and unit are required' });
  }

  if (!Number.isInteger(Number(add_quantity)) || Number(add_quantity) < 0) {
    return res.status(400).json({ error: 'Additional quantity must be a non-negative integer' });
  }

  try {
    const [product] = await db.query('SELECT 1 FROM products WHERE product_id = ?', [product_id]);
    if (product.length === 0) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const [current] = await db.query('SELECT quantity FROM inventory WHERE id = ?', [id]);
    if (current.length === 0) {
      return res.status(404).json({ error: 'Inventory record not found' });
    }

    const newQuantity = Math.floor(current[0].quantity) + Number(add_quantity);

    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Total quantity cannot be negative' });
    }

    const [result] = await db.query(
      'UPDATE inventory SET date = ?, product_id = ?, quantity = ?, unit = ? WHERE id = ?',
      [date, product_id, newQuantity, unit, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Inventory record not found' });
    }

    res.json({ message: 'Inventory updated successfully', newQuantity });
  } catch (err) {
    console.error('Error in /inventory/:id:', err.message);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

app.get('/inventory/count', requireAuth, async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }
  const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
  const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
  try {
    const [rows] = await db.query(
      'SELECT COALESCE(COUNT(*), 0) AS count FROM inventory WHERE date BETWEEN ? AND ?',
      [formattedStartDate, formattedEndDate]
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error('Error in /inventory/count:', err.message);
    res.status(500).json({ error: 'Failed to fetch inventory count' });
  }
});

app.get('/inventory/summary', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        i.product_id,
        p.type AS product_name,
        COALESCE(SUM(i.quantity), 0) AS total_quantity,
        p.unit
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      GROUP BY i.product_id, p.type, p.unit
      ORDER BY i.product_id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error in /inventory/summary:', err.message);
    res.status(500).json({ error: 'Failed to fetch inventory summary' });
  }
});

app.get('/inventory/low-stock', requireAuth, async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold);
    if (isNaN(threshold) || threshold < 0) {
      return res.status(400).json({ error: 'Threshold must be a non-negative integer' });
    }
    const [rows] = await db.query(
      'SELECT p.product_id AS id, p.type AS product, COALESCE(i.quantity, 0) AS total_quantity, ? AS threshold ' +
      'FROM products p ' +
      'LEFT JOIN inventory i ON p.product_id = i.product_id ' +
      'WHERE COALESCE(i.quantity, 0) <= ?', // Ensures all products are considered with 0 if no inventory
      [threshold, threshold]
    );
    res.json({ data: { lowStockItems: rows } }); // Standardized response
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

// CUSTOMERS
app.post('/add-customer', async (req, res) => {
  const { name, phone, email, address } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Customer name is required' });
  }

  try {
    await db.query(
      'INSERT INTO customers (name, phone, email, address, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, phone || null, email || null, address || null]
    );
    res.status(201).json({ message: 'Customer added successfully' });
  } catch (err) {
    console.error('Error in /add-customer:', err.message);
    res.status(500).json({ error: 'Failed to add customer' });
  }
});

app.post('/customers/add', async (req, res) => {
  req.url = '/add-customer';
  app.handle(req, res);
});

app.get('/customers', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, phone, email, address, created_at FROM customers');
    res.json(rows);
  } catch (err) {
    console.error('Error in /customers:', err.message);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.put('/customers/:id', async (req, res) => {
  const { name, phone, email, address } = req.body;
  const { id } = req.params;

  if (!name) {
    return res.status(400).json({ error: 'Customer name is required' });
  }

  try {
    const [result] = await db.query(
      'UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?',
      [name, phone || null, email || null, address || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer updated successfully' });
  } catch (err) {
    console.error('Error in /customers/:id:', err.message);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

app.delete('/customers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM customers WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Error in /customers/:id DELETE:', err.message);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

app.get('/customers/count', requireAuth, async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }
  const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
  const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
  try {
    const [rows] = await db.query(
      `SELECT COALESCE(COUNT(*), 0) AS customer_growth
       FROM customers
       WHERE DATE(created_at) BETWEEN ? AND ?`,
      [formattedStartDate, formattedEndDate]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Error in /customers/count:', err.message);
    res.status(500).json({ error: 'Failed to fetch customer count' });
  }
});

// SALES
app.post('/add-sale', async (req, res) => {
  const {
    date,
    billNo,
    customerId,
    paymentMethod,
    paidAmount,
    chequeNo,
    chequeBank,
    chequeDate,
    chequeAmount,
    items,
    deliveryCharges,
    credit
  } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Parse numbers safely
    const delivery = Number(deliveryCharges) || 0;
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    const grandTotal = subtotal + delivery;

    // Insert sale with delivery charges
    const [saleResult] = await conn.query(
      'INSERT INTO sales (date, bill_no, customer_id, total_amount, delivery_charges) VALUES (?, ?, ?, ?, ?)',
      [date, billNo, customerId, grandTotal, delivery]
    );
    const saleId = saleResult.insertId;

    // Insert sale_items
    for (const item of items) {
      await conn.query(
        `INSERT INTO sale_items (sale_id, product_id, price, quantity, unit, total_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [saleId, item.productId, parseFloat(item.price), parseFloat(item.quantity), item.unit, parseFloat(item.total)]
      );
    }

    // Insert payments
    let paymentInserted = false;

    if (paymentMethod === 'cash' && paidAmount > 0) {
      await conn.query(
        'INSERT INTO payments (sale_id, method, amount) VALUES (?, ?, ?)',
        [saleId, 'cash', paidAmount]
      );
      paymentInserted = true;
    }

    if (paymentMethod === 'cheque' && chequeAmount > 0) {
      await conn.query(
        `INSERT INTO payments
         (sale_id, method, amount, cheque_number, bank_name, cheque_date, cheque_status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [saleId, 'cheque', chequeAmount, chequeNo, chequeBank, chequeDate]
      );
      paymentInserted = true;
    }

    if (credit > 0) {
      await conn.query(
        'INSERT INTO payments (sale_id, method, amount) VALUES (?, ?, ?)',
        [saleId, 'credit', credit]
      );
      paymentInserted = true;
    }

    if (!paymentInserted) {
      await conn.query(
        'INSERT INTO payments (sale_id, method, amount) VALUES (?, ?, ?)',
        [saleId, 'credit', 0]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Sale recorded successfully', saleId });
  } catch (err) {
    await conn.rollback();
    console.error('Error in /add-sale:', err.message);
    res.status(500).json({ error: 'Failed to add sale' });
  } finally {
    conn.release();
  }
});


app.post('/sales/add', async (req, res) => {
  req.url = '/add-sale';
  app.handle(req, res);
});

app.get('/sales', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.id AS sale_id,
        s.date,
        s.bill_no,
        s.total_amount,
        c.name AS customer_name,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', p.id,
            'method', p.method,
            'amount', p.amount,
            'cheque_number', p.cheque_number,
            'bank_name', p.bank_name,
            'cheque_date', DATE_FORMAT(p.cheque_date, '%Y-%m-%d'),
            'cheque_status', p.cheque_status,
            'is_returned', p.is_returned
          )
        ) AS payments
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      LEFT JOIN payments p ON p.sale_id = s.id
      GROUP BY s.id, s.date, s.bill_no, s.total_amount, c.name
      ORDER BY s.date DESC
    `);
    const salesWithStatus = rows.map(sale => {
      let payments = Array.isArray(sale.payments) ? sale.payments : [];
      if (typeof sale.payments === 'string') {
        try {
          payments = JSON.parse(sale.payments);
        } catch (e) {
          console.error('Error parsing payments for sale_id', sale.sale_id, e.message);
        }
      }
      payments = payments.filter(p => p && p.method);

      const totalPaid = payments
        .filter(p => p.method === 'cash' || (p.method === 'cheque' && p.cheque_status === 'processed'))
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      const remainingCredit = sale.total_amount - totalPaid;

      const chequePayments = payments.filter(p => p.method === 'cheque');
      const chequeProcessed = chequePayments.some(p => p.cheque_status === 'processed');
      const chequeReturned = chequePayments.some(p => p.cheque_status === 'returned');

      const uniqueMethods = [
        ...new Set(payments.map(p => p.method?.trim().toLowerCase()).filter(Boolean))
      ].map(m => m.charAt(0).toUpperCase() + m.slice(1));

      const method = uniqueMethods.length > 0 ? uniqueMethods.join(', ') : 'Credit';

      let status = 'Pending';
      if (remainingCredit <= 0) {
        status = 'Complete';
      } else if (chequePayments.length > 0) {
        if (chequeReturned || chequePayments.some(p => p.cheque_status === 'pending')) {
          status = 'Pending';
        } else if (chequeProcessed) {
          status = 'Complete';
        }
      } else if (uniqueMethods.includes('Cash')) {
        status = totalPaid >= sale.total_amount ? 'Complete' : 'Pending';
      }

      return {
        sale_id: sale.sale_id,
        date: sale.date,
        bill_no: sale.bill_no,
        customer_name: sale.customer_name,
        total_amount: sale.total_amount,
        payments,
        total_paid: totalPaid,
        remaining_credit: remainingCredit,
        cheque_processed: chequeProcessed,
        cheque_returned: chequeReturned,
        method,
        status
      };
    });

    res.json(salesWithStatus);
  } catch (err) {
    console.error('Error in /sales:', err.message);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
});

app.get('/sales/summary', requireAuth, async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }
  const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
  const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
  try {
    const [rows] = await db.query(`
      SELECT 
        COALESCE(COUNT(*), 0) AS total_sales,
        COALESCE(SUM(CASE WHEN s.total_amount <= (
          SELECT COALESCE(SUM(p.amount), 0)
          FROM payments p
          WHERE p.sale_id = s.id
          AND (p.method = 'cash' OR (p.method = 'cheque' AND p.cheque_status = 'processed'))
        ) THEN 1 ELSE 0 END), 0) AS completed_sales
      FROM sales s
      WHERE s.date BETWEEN ? AND ?
    `, [formattedStartDate, formattedEndDate]);
    const total = Number(rows[0].total_sales) || 0;
    const completed = Number(rows[0].completed_sales) || 0;
    const pending = total - completed;
    res.json({
      total_sales: total,
      completed_sales: completed,
      pending_sales: pending
    });
  } catch (err) {
    console.error('Error in /sales/summary:', err.message);
    res.status(500).json({ error: 'Failed to fetch sales summary' });
  }
});

app.get('/sales/top-products',  requireAuth, async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }
  const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
  const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
  try {
    const [rows] = await db.query(`
      SELECT 
        si.product_id,
        p.type AS product_name,
        COALESCE(SUM(si.quantity), 0) AS total_quantity
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN products p ON si.product_id = p.product_id
      WHERE s.date BETWEEN ? AND ?
      GROUP BY si.product_id, p.type
      ORDER BY total_quantity DESC
      LIMIT 5
    `, [formattedStartDate, formattedEndDate]);
    res.json(rows);
  } catch (err) {
    console.error('Error in /sales/top-products:', err.message);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

app.get('/sales/revenue', requireAuth, async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }
  const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
  const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
  try {
    const [rows] = await db.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        MONTHNAME(date) AS month,
        COALESCE(SUM(total_amount), 0) AS monthly_total,
        MONTH(date) AS month_number
      FROM sales
      WHERE date BETWEEN ? AND ?
      GROUP BY MONTHNAME(date), MONTH(date)
      ORDER BY month_number
    `, [formattedStartDate, formattedEndDate]);
    res.json({
      total_revenue: rows.reduce((sum, r) => sum + Number(r.monthly_total), 0) || 0,
      monthly_revenue: rows.reduce((acc, r) => {
        acc[0] = acc[0] || {};
        acc[0][r.month] = Number(r.monthly_total) || 0;
        return acc;
      }, []) || []
    });
  } catch (err) {
    console.error('Error in /sales/revenue:', err.message);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

app.get('/sales/payment-methods',  requireAuth, async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }
  const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
  const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
  try {
    const [rows] = await db.query(`
      SELECT method, COALESCE(SUM(amount), 0) AS amount
      FROM payments
      WHERE sale_id IN (
        SELECT id FROM sales WHERE date BETWEEN ? AND ?
      )
      GROUP BY method
    `, [formattedStartDate, formattedEndDate]);
    res.json(rows);
  } catch (err) {
    console.error('Error in /sales/payment-methods:', err.message);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});


// Ensure reduce-inventory endpoint exists
app.post('/reduce-inventory', async (req, res) => {
  const { inventoryId, reduceBy } = req.body;

  if (!inventoryId || !reduceBy || reduceBy <= 0) {
    return res.status(400).json({ error: 'Invalid inventory ID or quantity' });
  }

  try {
    const [result] = await db.query(
      'UPDATE inventory SET quantity = quantity - ? WHERE id = ? AND quantity >= ?',
      [parseFloat(reduceBy), inventoryId, parseFloat(reduceBy)]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'Insufficient inventory or invalid ID' });
    }

    res.json({ message: 'Inventory updated successfully' });
  } catch (error) {
    console.error('Error reducing inventory:', error);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

app.get('/analytics', requireAuth, async (req, res) => {
  const { startDate, endDate, threshold } = req.query;
  let formattedStartDate, formattedEndDate;

  if (startDate && endDate) {
    formattedStartDate = new Date(startDate).toISOString().split('T')[0];
    formattedEndDate = new Date(endDate).toISOString().split('T')[0];
  } else {
    const today = new Date();
    formattedStartDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
    formattedEndDate = new Date().toISOString().split('T')[0];
  }

  try {
    const thresholdValue = parseInt(threshold);
    if (threshold && (isNaN(thresholdValue) || thresholdValue < 0)) {
      return res.status(400).json({ error: 'Threshold must be a non-negative integer' });
    }

    const [[{ totalSales }]] = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS totalSales 
       FROM sales 
       WHERE date BETWEEN ? AND ?`,
      [formattedStartDate, formattedEndDate]
    );

    const [[{ totalOrders }]] = await db.query(
      `SELECT COALESCE(COUNT(*), 0) AS totalOrders 
       FROM sales 
       WHERE date BETWEEN ? AND ?`,
      [formattedStartDate, formattedEndDate]
    );

    const [topProducts] = await db.query(
      `SELECT p.type AS product, COALESCE(SUM(si.quantity), 0) AS qty
      FROM sale_items si
      JOIN products p ON si.product_id = p.product_id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.date BETWEEN ? AND ?
      GROUP BY si.product_id, p.type
      ORDER BY qty DESC`, // Removed LIMIT 5
      [formattedStartDate, formattedEndDate]
    );

    const [salesByDate] = await db.query(
      `SELECT DATE(date) AS saleDate, COALESCE(SUM(total_amount), 0) AS dailyTotal
       FROM sales
       WHERE date BETWEEN ? AND ?
       GROUP BY DATE(date)
       ORDER BY saleDate ASC`,
      [formattedStartDate, formattedEndDate]
    );

    const [paymentBreakdown] = await db.query(
      `SELECT method AS payment_method, COALESCE(SUM(amount), 0) AS total
       FROM payments
       WHERE sale_id IN (
         SELECT id FROM sales WHERE date BETWEEN ? AND ?
       )
       GROUP BY method`,
      [formattedStartDate, formattedEndDate]
    );

    const [[{ customerGrowth }]] = await db.query(
      `SELECT COALESCE(COUNT(*), 0) AS customerGrowth 
       FROM customers 
       WHERE DATE(created_at) BETWEEN ? AND ?`,
      [formattedStartDate, formattedEndDate]
    );

    const [topCustomers] = await db.query(
      `SELECT c.name AS customer, COALESCE(SUM(s.total_amount), 0) AS total_spent
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id
      WHERE s.date BETWEEN ? AND ?
      GROUP BY c.id, c.name
      ORDER BY total_spent DESC`, // Removed LIMIT 5
      [formattedStartDate, formattedEndDate]
    );

    const [inventorySummary] = await db.query(
      `SELECT 
        i.product_id AS id,
        p.type AS product,
        COALESCE(SUM(i.quantity), 0) AS total_quantity
       FROM inventory i
       JOIN products p ON i.product_id = p.product_id
       GROUP BY i.product_id, p.type
       ORDER BY p.type`
    );

    const [lowStockItems] = await db.query(
      `SELECT 
        i.id AS id,
        i.product_id,
        p.type AS product,
        i.quantity AS total_quantity,
        ? AS threshold
       FROM inventory i
       JOIN products p ON i.product_id = p.product_id
       WHERE i.quantity <= ?`, // Filter based on inventory quantity
      [thresholdValue || 50, thresholdValue || 50]
    );

    res.json({
      totalSales: totalSales || 0,
      totalOrders: totalOrders || 0,
      topProducts: topProducts || [],
      salesByDate: salesByDate || [],
      paymentBreakdown: paymentBreakdown || [],
      customerGrowth: customerGrowth || 0,
      topCustomers: topCustomers || [],
      inventorySummary: inventorySummary || [],
      lowStockItems: lowStockItems || []
    });
  } catch (err) {
    console.error('Error in /analytics:', err.message);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

app.get('/sales/count', requireAuth, async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }
  const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
  const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
  try {
    const [rows] = await db.query(
      'SELECT COALESCE(COUNT(*), 0) AS count FROM sales WHERE date BETWEEN ? AND ?',
      [formattedStartDate, formattedEndDate]
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error('Error in /sales/count:', err.message);
    res.status(500).json({ error: 'Failed to fetch sales count' });
  }
});

app.get('/sales/:id',  requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const [saleRows] = await db.query(`
      SELECT 
        s.id AS sale_id,
        s.date,
        s.bill_no,
        s.total_amount, 
        c.name AS customer_name
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `, [id]);

    if (saleRows.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const [itemsRows] = await db.query(`
      SELECT 
        si.id,
        si.product_id,
        p.type AS product_name,
        si.price,
        si.quantity,
        si.unit,
        si.total_price
      FROM sale_items si
      JOIN products p ON si.product_id = p.product_id
      WHERE si.sale_id = ?
    `, [id]);

    const [paymentsRows] = await db.query(`
      SELECT 
        p.id,
        p.method,
        p.amount,
        p.cheque_number,
        p.bank_name,
        DATE_FORMAT(p.cheque_date, '%Y-%m-%d') AS cheque_date,
        p.cheque_status,
        p.is_returned
      FROM payments p
      WHERE p.sale_id = ?
    `, [id]);

    const totalPaid = paymentsRows
      .filter(p => p.method === 'cash' || (p.method === 'cheque' && p.cheque_status === 'processed'))
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const remainingCredit = saleRows[0].total_amount - totalPaid;
    const chequeProcessed = paymentsRows.some(p => p.method === 'cheque' && p.cheque_status === 'processed');
    const chequeReturned = paymentsRows.some(p => p.method === 'cheque' && p.cheque_status === 'returned');

    const uniqueMethods = [
      ...new Set(
        paymentsRows
          .map(p => (typeof p.method === 'string' ? p.method.trim().toLowerCase() : null))
          .filter(Boolean)
      )
    ].map(m => m.charAt(0).toUpperCase() + m.slice(1));

    const method = uniqueMethods.length > 0 ? uniqueMethods.join(', ') : 'Credit';

    let status = 'Pending';
    if (remainingCredit <= 0) {
      status = 'Complete';
    } else if (paymentsRows.some(p => p.method === 'cheque')) {
      if (chequeReturned || paymentsRows.some(p => p.method === 'cheque' && p.cheque_status === 'pending')) {
        status = 'Pending';
      } else if (chequeProcessed) {
        status = 'Complete';
      }
    } else if (uniqueMethods.includes('Cash')) {
      status = totalPaid >= saleRows[0].total_amount ? 'Complete' : 'Pending';
    }

    const saleDetails = {
      ...saleRows[0],
      items: itemsRows,
      payments: paymentsRows,
      total_paid: totalPaid,
      remaining_credit: remainingCredit,
      method,
      status
    };

    res.json(saleDetails);
  } catch (err) {
    console.error('Error in /sales/:id:', err.message);
    res.status(500).json({ error: 'Failed to fetch sale details' });
  }
});

app.post('/pay-sale', async (req, res) => {
  const { sale_id, method, amount, cheque_number, bank_name, cheque_date } = req.body;

  if (!sale_id || !method || !amount || amount <= 0) {
    console.error('Validation failed in /pay-sale: Missing or invalid fields');
    return res.status(400).json({ error: 'Sale ID, method, and valid amount are required' });
  }

  if (method === 'cheque' && (!cheque_number || !bank_name || !cheque_date)) {
    console.error('Validation failed in /pay-sale: Missing cheque details');
    return res.status(400).json({ error: 'Cheque number, bank name, and cheque date are required for cheque payments' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[sale]] = await conn.query('SELECT total_amount FROM sales WHERE id = ?', [sale_id]);
    if (!sale) {
      await conn.rollback();
      return res.status(404).json({ error: 'Sale not found' });
    }

    if (method === 'cash') {
      await conn.query(
        'INSERT INTO payments (sale_id, method, amount) VALUES (?, ?, ?)',
        [sale_id, 'cash', amount]
      );
    } else if (method === 'cheque') {
      await conn.query(
        `INSERT INTO payments
         (sale_id, method, amount, cheque_number, bank_name, cheque_date, cheque_status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [sale_id, 'cheque', amount, cheque_number, bank_name, cheque_date]
      );
    }

    const currentPaid = (await conn.query(
      'SELECT SUM(amount) as total FROM payments WHERE sale_id = ? AND (method = "cash" OR (method = "cheque" AND cheque_status = "processed"))',
      [sale_id]
    ))[0][0].total || 0;
    const newCreditAmount = sale.total_amount - currentPaid;

    const [[creditPayment]] = await conn.query(
      'SELECT id, amount FROM payments WHERE sale_id = ? AND method = "credit"',
      [sale_id]
    );

    if (creditPayment) {
      await conn.query(
        'UPDATE payments SET amount = ? WHERE id = ?',
        [Math.max(0, newCreditAmount), creditPayment.id]
      );
    } else if (newCreditAmount > 0) {
      await conn.query(
        'INSERT INTO payments (sale_id, method, amount) VALUES (?, ?, ?)',
        [sale_id, 'credit', newCreditAmount]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Payment recorded successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('Error in /pay-sale:', err.message);
    res.status(500).json({ error: 'Failed to add payment' });
  } finally {
    conn.release();
  }
});

app.put('/payments/:id/update-cheque-status', async (req, res) => {
  const { id } = req.params;
  const { cheque_status } = req.body;

  if (!['processed', 'returned'].includes(cheque_status)) {
    return res.status(400).json({ error: 'Invalid cheque status' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[cheque]] = await conn.query(
      'SELECT sale_id, amount FROM payments WHERE id = ? AND method = "cheque"',
      [id]
    );

    if (!cheque) {
      await conn.rollback();
      return res.status(404).json({ error: 'Cheque payment not found' });
    }

    await conn.query(
      'UPDATE payments SET cheque_status = ? WHERE id = ? AND method = "cheque"',
      [cheque_status, id]
    );

    const [[sale]] = await conn.query('SELECT total_amount FROM sales WHERE id = ?', [cheque.sale_id]);
    const currentPaid = (await conn.query(
      'SELECT SUM(amount) as total FROM payments WHERE sale_id = ? AND (method = "cash" OR (method = "cheque" AND cheque_status = "processed"))',
      [cheque.sale_id]
    ))[0][0].total || 0;
    const newCreditAmount = sale.total_amount - currentPaid;

    const [[creditPayment]] = await conn.query(
      'SELECT id, amount FROM payments WHERE sale_id = ? AND method = "credit"',
      [cheque.sale_id]
    );

    if (creditPayment) {
      await conn.query(
        'UPDATE payments SET amount = ? WHERE id = ?',
        [Math.max(0, newCreditAmount), creditPayment.id]
      );
    } else if (newCreditAmount > 0) {
      await conn.query(
        'INSERT INTO payments (sale_id, method, amount) VALUES (?, ?, ?)',
        [cheque.sale_id, 'credit', newCreditAmount]
      );
    }

    await conn.commit();
    res.json({ message: 'Cheque status updated' });
  } catch (err) {
    await conn.rollback();
    console.error('Error in /payments/:id/update-cheque-status:', err.message);
    res.status(500).json({ error: 'Failed to update cheque status' });
  } finally {
    conn.release();
  }
});

app.put('/payments/:id/pay-credit', async (req, res) => {
  const { id } = req.params;
  const { amount_paid } = req.body;

  if (!amount_paid || amount_paid <= 0) {
    return res.status(400).json({ error: 'Invalid payment amount' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[payment]] = await conn.query('SELECT * FROM payments WHERE id = ?', [id]);

    if (!payment) {
      await conn.rollback();
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.method !== 'credit') {
      await conn.rollback();
      return res.status(400).json({ error: 'Payment is not a credit payment' });
    }

    let newAmount = payment.amount - amount_paid;
    if (newAmount < 0) newAmount = 0;

    await conn.query(
      'UPDATE payments SET amount = ? WHERE id = ?',
      [newAmount, id]
    );

    await conn.commit();
    res.json({ message: 'Credit payment updated successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('Error in /payments/:id/pay-credit:', err.message);
    res.status(500).json({ error: 'Failed to update credit payment' });
  } finally {
    conn.release();
  }
});

app.post('/reduce-inventory', async (req, res) => {
  const { inventoryId, reduceBy } = req.body;
  try {
    const [result] = await db.query('UPDATE inventory SET quantity = quantity - ? WHERE id = ?', [reduceBy, inventoryId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Inventory record not found' });
    }
    res.json({ message: 'Inventory updated' });
  } catch (err) {
    console.error('Error in /reduce-inventory:', err.message);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

app.get('/sales/:id/invoice', requireAuth, async (req, res) => {
  const { id } = req.params;

  const connection = await db.getConnection();
  try {
    const [saleResult] = await connection.query(`
      SELECT s.*, c.name AS customer_name, c.phone, c.email, c.address
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `, [id]);

    if (saleResult.length === 0) {
      return res.status(404).json({ error: 'No invoice found' });
    }

    const sale = {
      id: saleResult[0].id,
      date: saleResult[0].date,
      bill_no: saleResult[0].bill_no,
      customer_id: saleResult[0].customer_id,
      total_amount: parseFloat(saleResult[0].total_amount) || 0,
      delivery_charges: parseFloat(saleResult[0].delivery_charges) || 0 // Ensure included
    };

    const customer = {
      name: saleResult[0].customer_name,
      phone: saleResult[0].phone,
      email: saleResult[0].email,
      address: saleResult[0].address,
    };

    const [itemsResult] = await connection.query(`
      SELECT si.*, p.type AS product_name
      FROM sale_items si
      JOIN products p ON si.product_id = p.product_id
      WHERE si.sale_id = ?
    `, [id]);

    const [paymentsResult] = await connection.query(`
      SELECT * FROM payments WHERE sale_id = ?
    `, [id]);

    res.json({
      sale,
      customer,
      saleItems: itemsResult,
      payments: paymentsResult,
    });
  } catch (err) {
    console.error('Error fetching invoice:', err.message);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

app.delete('/inventory/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM inventory WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Inventory record not found' });
    }
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    console.error('Error in /inventory/:id DELETE:', err.message);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});















// GET joined data from rawmaterials and raw_material_inventory
app.get('/api/raw-material-inventory-joined', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ri.id, ri.date, ri.raw_material_id, ri.quantity, ri.unit,
             COALESCE(rm.name, 'Unknown') AS name,
             COALESCE(rm.unit_price, 0) AS unit_price
      FROM raw_material_inventory ri
      LEFT JOIN rawmaterials rm ON ri.raw_material_id = rm.raw_material_id
      ORDER BY ri.date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching inventory:', err.message);
    res.status(500).json({ error: 'Failed to fetch inventory', details: err.message });
  }
});

// POST new raw material
app.post('/api/raw-materials', async (req, res) => {
  const { raw_material_id, name, unit, unit_price } = req.body;
  try {
    await db.query(
      'INSERT INTO rawmaterials (raw_material_id, name, unit, unit_price) VALUES (?, ?, ?, ?)',
      [raw_material_id, name, unit, unit_price]
    );
    console.log('Inserted raw material:', { raw_material_id, name, unit, unit_price });
    res.status(201).json({ message: 'Raw material added' });
  } catch (err) {
    console.error('Error inserting raw material:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST new raw material inventory
app.post('/api/raw-material-inventory', async (req, res) => {
  const { date, raw_material_id, quantity, unit } = req.body;
  try {
    await db.query(
      'INSERT INTO raw_material_inventory (date, raw_material_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [date, raw_material_id, quantity, unit]
    );
    console.log('Inserted inventory:', { date, raw_material_id, quantity, unit });
    res.status(201).json({ message: 'Inventory entry added' });
  } catch (err) {
    console.error('Error inserting inventory:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT update raw material inventory and raw material details
app.put('/api/raw-material-inventory/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity, date, name, unit_price, raw_material_id } = req.body;

  if (quantity < 0) {
    return res.status(400).json({ error: 'Quantity cannot be negative' });
  }
  if (!raw_material_id) {
    return res.status(400).json({ error: 'Raw material ID is required' });
  }

  try {
    // Start a transaction to ensure atomic updates
    await db.query('START TRANSACTION');

    // Update raw_material_inventory
    const [inventoryResult] = await db.query(
      'UPDATE raw_material_inventory SET quantity = ?, date = ? WHERE id = ?',
      [quantity, date, id]
    );

    if (inventoryResult.affectedRows === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Inventory record not found' });
    }

    // Update rawmaterials
    const [materialResult] = await db.query(
      'UPDATE rawmaterials SET name = ?, unit_price = ? WHERE raw_material_id = ?',
      [name, unit_price, raw_material_id]
    );

    if (materialResult.affectedRows === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Raw material not found' });
    }

    await db.query('COMMIT');
    res.json({ message: 'Inventory and raw material updated successfully' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Error updating inventory and raw material:', err.message);
    res.status(500).json({ error: 'Failed to update inventory and raw material', details: err.message });
  }
});

// GET all raw materials
app.get('/api/raw-materials', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT raw_material_id, name, unit_price FROM rawmaterials');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching raw materials:', err.message);
    res.status(500).json({ error: 'Failed to fetch raw materials' });
  }
});

// POST new production
app.post('/api/production', async (req, res) => {
  const { code, total_weight, total_price, raw_materials } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Check current inventory levels
    await Promise.all(
      raw_materials.map(async (material) => {
        const [inventoryRows] = await conn.query(
          'SELECT quantity FROM raw_material_inventory WHERE raw_material_id = ? ORDER BY date DESC LIMIT 1',
          [material.raw_material_id]
        );
        const currentQuantity = inventoryRows.length > 0 ? inventoryRows[0].quantity : 0;
        if (currentQuantity < material.weight) {
          throw new Error(`Insufficient stock for ${material.raw_material_id}. Available: ${currentQuantity} kg, Required: ${material.weight} kg`);
        }
        return { raw_material_id: material.raw_material_id, currentQuantity };
      })
    );

    // Insert production record
    const [productionResult] = await conn.query(
      'INSERT INTO production (code, total_weight, total_price) VALUES (?, ?, ?)',
      [code, total_weight, total_price]
    );
    const productionId = productionResult.insertId;

    // Insert production_raw_materials records
    for (const material of raw_materials) {
      await conn.query(
        'INSERT INTO production_raw_materials (production_id, raw_material_id, weight, price) VALUES (?, ?, ?, ?)',
        [productionId, material.raw_material_id, material.weight, material.price]
      );

      // Update or insert new inventory entry (deduct quantity)
      const [existingInventory] = await conn.query(
        'SELECT id, quantity FROM raw_material_inventory WHERE raw_material_id = ? ORDER BY date DESC LIMIT 1',
        [material.raw_material_id]
      );
      const newQuantity = existingInventory[0]?.quantity - material.weight || -material.weight;

      if (newQuantity < 0) {
        throw new Error(`Negative inventory not allowed for ${material.raw_material_id}`);
      }

      if (existingInventory.length > 0) {
        await conn.query(
          'UPDATE raw_material_inventory SET quantity = ? WHERE id = ?',
          [newQuantity, existingInventory[0].id]
        );
      } else {
        await conn.query(
          'INSERT INTO raw_material_inventory (date, raw_material_id, quantity, unit) VALUES (?, ?, ?, ?)',
          [new Date().toISOString().split('T')[0], material.raw_material_id, newQuantity, 'kg']
        );
      }
    }

    await conn.commit();
    res.status(201).json({ message: 'Production saved and inventory updated successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('Error saving production:', err.message);
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});



// GET joined data from production and production_raw_materials
app.get('/api/production-joined', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id, p.code, p.total_weight, p.total_price, p.created_at
      FROM production p
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching productions:', err.message);
    res.status(500).json({ error: 'Failed to fetch productions' });
  }
});


// PUT update production details
app.put('/api/production/:id', async (req, res) => {
  const { id } = req.params;
  const { total_weight, total_price } = req.body;

  console.log('Update request received:', { id, total_weight, total_price }); // Debug log

  // Validate input
  const updates = {};
  if (total_weight !== undefined) {
    if (total_weight < 0) {
      return res.status(400).json({ error: 'Weight cannot be negative' });
    }
    updates.total_weight = total_weight;
  }
  if (total_price !== undefined) {
    if (total_price < 0) {
      return res.status(400).json({ error: 'Price cannot be negative' });
    }
    updates.total_price = total_price;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  try {
    const setClause = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];
    const [result] = await db.query(
      `UPDATE production SET ${setClause} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Production record not found' });
    }
    res.json({ message: 'Production updated successfully' });
  } catch (err) {
    console.error('Error updating production:', err.message, err.stack); // Enhanced error logging
    res.status(500).json({ error: 'Failed to update production', details: err.message });
  }
});

// DELETE production record
app.delete('/api/production/:id', async (req, res) => {
  const { id } = req.params;

  console.log('Delete request received for id:', id); // Debug log

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Delete related production_raw_materials records first due to foreign key constraint
    await conn.query(
      'DELETE FROM production_raw_materials WHERE production_id = ?',
      [id]
    );

    // Delete the production record
    const [result] = await conn.query(
      'DELETE FROM production WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Production record not found' });
    }

    await conn.commit();
    res.json({ message: 'Production deleted successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('Error deleting production:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete production', details: err.message });
  } finally {
    conn.release();
  }
});

// GET unique production codes
app.get('/api/production-codes', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT code FROM production');
    res.json(rows.map(row => row.code));
  } catch (err) {
    console.error('Error fetching production codes:', err.message);
    res.status(500).json({ error: 'Failed to fetch production codes' });
  }
});

// POST production output and update inventory
app.post('/api/production-out', async (req, res) => {
  const { date, batchCode, quantity } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Find the production record
    const [productionRows] = await conn.query(
      'SELECT id, total_weight FROM production WHERE code = ?',
      [batchCode]
    );
    if (productionRows.length === 0) {
      throw new Error('Production batch not found');
    }
    const production = productionRows[0];
    if (quantity > production.total_weight) {
      throw new Error('Requested quantity exceeds available production inventory');
    }

    // Update production total_weight
    const newTotalWeight = production.total_weight - quantity;
    await conn.query(
      'UPDATE production SET total_weight = ? WHERE id = ?',
      [newTotalWeight, production.id]
    );

    // Log the output (optional table creation needed)
    await conn.query(
      'INSERT INTO production_output (date, production_id, quantity) VALUES (?, ?, ?)',
      [date, production.id, quantity]
    );

    await conn.commit();
    res.status(201).json({ message: 'Production output recorded and inventory updated' });
  } catch (err) {
    await conn.rollback();
    console.error('Error recording production out:', err.message);
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});















// Get all PVC raw materials
app.get('/api/pvc-rawmaterials', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pvc_rawmaterials');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching PVC raw materials:', error);
    res.status(500).json({ error: 'Failed to fetch PVC raw materials' });
  }
});

// Add new PVC raw material
app.post('/api/pvc-rawmaterials', async (req, res) => {
  const { raw_material_id, name, unit, unit_price } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO pvc_rawmaterials (raw_material_id, name, unit, unit_price) VALUES (?, ?, ?, ?)',
      [raw_material_id, name, unit, unit_price]
    );
    
    res.status(201).json({ 
      message: 'PVC raw material added successfully',
      id: result.insertId,
      raw_material_id 
    });
  } catch (error) {
    console.error('Error adding PVC raw material:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'PVC raw material ID already exists' });
    } else {
      res.status(500).json({ error: 'Failed to add PVC raw material' });
    }
  }
});

// Add PVC raw material inventory entry
app.post('/api/pvc-raw-material-inventory', async (req, res) => {
  const { date, raw_material_id, quantity, unit } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO pvc_raw_material_inventory (date, raw_material_id, quantity, unit) VALUES (?, ?, ?, ?)',
      [date, raw_material_id, quantity, unit]
    );
    
    res.status(201).json({ 
      message: 'PVC raw material inventory entry added successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error adding PVC raw material inventory:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW') {
      res.status(400).json({ error: 'Invalid raw material ID' });
    } else {
      res.status(500).json({ error: 'Failed to add inventory entry' });
    }
  }
});

// Get all PVC raw material inventory with joined raw materials data
app.get('/api/pvc-raw-material-inventory-joined', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        i.id,
        i.date,
        i.raw_material_id,
        i.quantity,
        i.unit,
        r.name,
        r.unit_price
      FROM pvc_raw_material_inventory i
      JOIN pvc_rawmaterials r ON i.raw_material_id = r.raw_material_id
      ORDER BY i.date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching PVC inventory:', error);
    res.status(500).json({ error: 'Failed to fetch PVC inventory' });
  }
});

// Update PVC raw material inventory and raw material details
app.put('/api/pvc-raw-material-inventory/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity, date, name, unit_price, raw_material_id } = req.body;

  if (quantity < 0) {
    return res.status(400).json({ error: 'Quantity cannot be negative' });
  }
  if (!raw_material_id) {
    return res.status(400).json({ error: 'Raw material ID is required' });
  }

  try {
    // Start a transaction to ensure atomic updates
    await db.query('START TRANSACTION');

    // Update pvc_raw_material_inventory
    const [inventoryResult] = await db.query(
      'UPDATE pvc_raw_material_inventory SET quantity = ?, date = ? WHERE id = ?',
      [quantity, date, id]
    );

    if (inventoryResult.affectedRows === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Inventory record not found' });
    }

    // Update pvc_rawmaterials
    const [materialResult] = await db.query(
      'UPDATE pvc_rawmaterials SET name = ?, unit_price = ? WHERE raw_material_id = ?',
      [name, unit_price, raw_material_id]
    );

    if (materialResult.affectedRows === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'PVC raw material not found' });
    }

    await db.query('COMMIT');
    res.json({ message: 'PVC inventory and raw material updated successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error updating PVC inventory and raw material:', error);
    res.status(500).json({ error: 'Failed to update PVC inventory and raw material', details: error.message });
  }
});


// In your main server file (e.g., server.js)
app.post('/api/pvc-production', async (req, res) => {
  const { code, total_weight, total_price, raw_materials } = req.body;

  if (!code || !total_weight || !raw_materials || raw_materials.length === 0) {
    return res.status(400).json({ error: 'Missing required fields or raw materials' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Insert into pvc_production
    const [productionResult] = await connection.query(
      'INSERT INTO pvc_production (code, total_weight, total_price) VALUES (?, ?, ?)',
      [code, parseFloat(total_weight), parseFloat(total_price)]
    );

    const productionId = productionResult.insertId;

    // Insert into pvc_production_raw_materials
    for (const material of raw_materials) {
      await connection.query(
        'INSERT INTO pvc_production_raw_materials (production_id, raw_material_id, weight, price) VALUES (?, ?, ?, ?)',
        [productionId, material.raw_material_id, parseFloat(material.weight), parseFloat(material.price)]
      );

      // Update inventory (subtract used quantity)
      await connection.query(
        'UPDATE pvc_raw_material_inventory SET quantity = quantity - ? WHERE raw_material_id = ? AND quantity >= ?',
        [parseFloat(material.weight), material.raw_material_id, parseFloat(material.weight)]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'PVC production saved successfully', productionId });
  } catch (error) {
    await connection.rollback();
    console.error('Error saving PVC production:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Production code already exists' });
    } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      res.status(400).json({ error: 'Invalid raw material ID' });
    } else {
      res.status(500).json({ error: 'Failed to save PVC production' });
    }
  } finally {
    connection.release();
  }
});

// In your server.js
app.get('/api/pvc-production', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, code, total_weight, total_price
      FROM pvc_production
      ORDER BY code
    `);
    console.log(`✅ Fetched ${rows.length} PVC production records`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching PVC production:', error);
    res.status(500).json({ error: 'Failed to fetch PVC production' });
  }
});

// In your server.js
app.put('/api/pvc-production/:id', async (req, res) => {
  const { id } = req.params;
  const { total_weight, total_price } = req.body;

  if (total_weight === undefined || total_price === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (total_weight < 0 || total_price < 0) {
    return res.status(400).json({ error: 'Total weight and price cannot be negative' });
  }

  try {
    const [result] = await db.query(
      'UPDATE pvc_production SET total_weight = ?, total_price = ? WHERE id = ?',
      [parseFloat(total_weight), parseFloat(total_price), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Production record not found' });
    }

    console.log(`✅ Updated PVC production record ID: ${id}`);
    res.json({ message: 'PVC production updated successfully' });
  } catch (error) {
    console.error('Error updating PVC production:', error);
    res.status(500).json({ error: 'Failed to update PVC production' });
  }
});


// In your server.js
app.delete('/api/pvc-production/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Delete from pvc_production_raw_materials first (due to foreign key constraints)
    await connection.query('DELETE FROM pvc_production_raw_materials WHERE production_id = ?', [id]);

    // Delete from pvc_production
    const [result] = await connection.query('DELETE FROM pvc_production WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Production record not found' });
    }

    await connection.commit();
    console.log(`✅ Deleted PVC production record ID: ${id}`);
    res.json({ message: 'PVC production deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting PVC production:', error);
    res.status(500).json({ error: 'Failed to delete PVC production' });
  } finally {
    connection.release();
  }
});


app.get('/api/pvc-production-codes', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT code FROM pvc_production ORDER BY code');
    console.log(`✅ Fetched ${rows.length} PVC production codes`);
    res.json(rows.map(row => row.code));
  } catch (error) {
    console.error('Error fetching PVC production codes:', error);
    res.status(500).json({ error: 'Failed to fetch PVC production codes' });
  }
});

app.post('/api/pvc-production-out', async (req, res) => {
  const { date, batchCode, quantity } = req.body;

  if (!date || !batchCode || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (quantity <= 0) {
    return res.status(400).json({ error: 'Quantity must be greater than 0' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Insert into pvc_production_out
    const [result] = await connection.query(
      'INSERT INTO pvc_production_out (date, batch_code, quantity) VALUES (?, ?, ?)',
      [date, batchCode, parseFloat(quantity)]
    );

    await connection.commit();
    console.log(`✅ Recorded PVC production output for batch ${batchCode}`);
    res.status(201).json({ message: 'PVC production output recorded successfully', id: result.insertId });
  } catch (error) {
    await connection.rollback();
    console.error('Error recording PVC production output:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      res.status(400).json({ error: 'Invalid batch code - production batch does not exist' });
    } else if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Duplicate entry for batch code on this date' });
    } else {
      res.status(500).json({ error: 'Failed to record PVC production output' });
    }
  } finally {
    connection.release();
  }
});

















































// POST /api/period-expenses
app.post('/api/period-expenses', async (req, res) => {
  const {
    start_date, end_date, prev_raw_material_rubber, prev_raw_material_pvc, current_raw_material_rubber, current_raw_material_pvc,
    postage, accountant_fees, rubber_development_fee, licence, env_licence, pradeshiya_saba_fee, polythene,
    casual_wages, salary, epf, etf, telephone_charges, electricity, water, travelling_expense, rent, transport, other_expenses,
  } = req.body;

  console.log('Received POST /api/period-expenses:', {
    start_date,
    end_date,
    prev_raw_material_rubber,
    prev_raw_material_pvc,
    current_raw_material_rubber,
    current_raw_material_pvc,
    electricity,
    otherFields: { postage, accountant_fees, transport, other_expenses },
  });

  if (!start_date || !end_date) {
    console.error('Validation failed: Missing start_date or end_date');
    return res.status(400).json({ error: 'Start date and end date are required' });
  }

  const start = new Date(start_date);
  const end = new Date(end_date);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error('Validation failed: Invalid date format', { start_date, end_date });
    return res.status(400).json({ error: 'Invalid date format' });
  }
  if (start > end) {
    console.error('Validation failed: Start date after end date', { start_date, end_date });
    return res.status(400).json({ error: 'Start date must be before end date' });
  }

  const expenseFields = [
    { name: 'prev_raw_material_rubber', value: prev_raw_material_rubber },
    { name: 'prev_raw_material_pvc', value: prev_raw_material_pvc },
    { name: 'current_raw_material_rubber', value: current_raw_material_rubber },
    { name: 'current_raw_material_pvc', value: current_raw_material_pvc },
    { name: 'postage', value: postage },
    { name: 'accountant_fees', value: accountant_fees },
    { name: 'rubber_development_fee', value: rubber_development_fee },
    { name: 'licence', value: licence },
    { name: 'env_licence', value: env_licence },
    { name: 'pradeshiya_saba_fee', value: pradeshiya_saba_fee },
    { name: 'polythene', value: polythene },
    { name: 'casual_wages', value: casual_wages },
    { name: 'salary', value: salary },
    { name: 'epf', value: epf },
    { name: 'etf', value: etf },
    { name: 'telephone_charges', value: telephone_charges },
    { name: 'electricity', value: electricity },
    { name: 'water', value: water },
    { name: 'travelling_expense', value: travelling_expense },
    { name: 'rent', value: rent },
    { name: 'transport', value: transport },
    { name: 'other_expenses', value: other_expenses },
  ];

  for (const field of expenseFields) {
    if (field.value !== undefined && field.value !== null && field.value !== '' && (isNaN(field.value) || parseFloat(field.value) < 0)) {
      console.error(`Validation failed: Invalid value for ${field.name}`, { value: field.value });
      return res.status(400).json({ error: `${field.name.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()} must be a non-negative number` });
    }
  }

  const hasExpenses = expenseFields.some(field => {
    const num = parseFloat(field.value);
    return !isNaN(num) && num > 0;
  });

  if (!hasExpenses) {
    console.error('Validation failed: No valid expenses provided');
    return res.status(400).json({ error: 'At least one valid expense (greater than 0) is required' });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const [existing] = await conn.query(
      'SELECT id FROM period_expenses WHERE start_date = ? AND end_date = ?',
      [start_date, end_date]
    );
    if (existing.length > 0) {
      console.error('Duplicate period detected:', { start_date, end_date, existingId: existing[0].id });
      throw new Error('Expenses for this date range already exist');
    }

    const values = [
      start_date,
      end_date,
      parseFloat(prev_raw_material_rubber) || null,
      parseFloat(prev_raw_material_pvc) || null,
      parseFloat(current_raw_material_rubber) || null,
      parseFloat(current_raw_material_pvc) || null,
      parseFloat(postage) || null,
      parseFloat(accountant_fees) || null,
      parseFloat(rubber_development_fee) || null,
      parseFloat(licence) || null,
      parseFloat(env_licence) || null,
      parseFloat(pradeshiya_saba_fee) || null,
      parseFloat(polythene) || null,
      parseFloat(casual_wages) || null,
      parseFloat(salary) || null,
      parseFloat(epf) || null,
      parseFloat(etf) || null,
      parseFloat(telephone_charges) || null,
      parseFloat(electricity) || null,
      parseFloat(water) || null,
      parseFloat(travelling_expense) || null,
      parseFloat(rent) || null,
      parseFloat(transport) || null,
      parseFloat(other_expenses) || null,
    ];

    const [result] = await conn.query(
      `
      INSERT INTO period_expenses (
        start_date, end_date, prev_raw_material_rubber, prev_raw_material_pvc,
        current_raw_material_rubber, current_raw_material_pvc, postage, accountant_fees,
        rubber_development_fee, licence, env_licence, pradeshiya_saba_fee, polythene,
        casual_wages, salary, epf, etf, telephone_charges, electricity, water,
        travelling_expense, rent, transport, other_expenses
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      values
    );

    await conn.commit();
    console.log('Inserted period expenses:', { periodId: result.insertId, start_date, end_date });
    return res.status(201).json({ message: 'Period expenses saved successfully', periodId: result.insertId });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Error saving period expenses:', err.message, {
      reqBody: req.body,
      stack: err.stack,
      sqlError: err.sqlMessage || 'N/A',
    });
    if (err.message === 'Expenses for this date range already exist' || err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Expenses for this date range already exist' });
    }
    return res.status(500).json({ error: 'Failed to save period expenses', details: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/expenses
app.get('/api/expenses', requireAuth, async (req, res) => {
  const { startDate, endDate, id } = req.query;
  console.log('Received GET /api/expenses:', { startDate, endDate, id });

  if (id) {
    // Fetch by ID as a fallback
    let conn;
    try {
      conn = await db.getConnection();
      const [rows] = await conn.query('SELECT * FROM period_expenses WHERE id = ?', [id]);
      console.log('Fetched expenses by ID:', rows);
      if (rows.length === 0) {
        console.warn('No expenses found for ID:', { id });
        return res.status(404).json({ error: 'No expenses found for the specified ID' });
      }
      return res.json(rows[0]);
    } catch (err) {
      console.error('Error fetching expenses by ID:', err.message, {
        stack: err.stack,
        sqlError: err.sqlMessage || 'N/A',
        id,
      });
      return res.status(500).json({ error: 'Failed to fetch expenses', details: err.message });
    } finally {
      if (conn) conn.release();
    }
  }

  if (!startDate || !endDate) {
    console.error('Validation failed: Missing startDate or endDate');
    return res.status(400).json({ error: 'Start date and end date are required' });
  }

  let conn;
  try {
    conn = await db.getConnection();
    // Debug: Log all date ranges in the database
    const [allDates] = await conn.query('SELECT id, start_date, end_date FROM period_expenses');
    console.log('All database date ranges:', allDates);

    // Ensure exact match for dates
    const [rows] = await conn.query(
      'SELECT * FROM period_expenses WHERE start_date = ? AND end_date = ?',
      [startDate, endDate]
    );
    console.log('Fetched expenses:', rows, { queryStartDate: startDate, queryEndDate: endDate });

    if (rows.length === 0) {
      console.warn('No expenses found for:', { startDate, endDate });
      return res.status(404).json({ error: 'No expenses found for the specified period' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching expenses:', err.message, {
      stack: err.stack,
      sqlError: err.sqlMessage || 'N/A',
      startDate,
      endDate,
    });
    return res.status(500).json({ error: 'Failed to fetch expenses', details: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/expense-dates
app.get('/api/expense-dates', requireAuth, async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const [rows] = await conn.query('SELECT id, start_date, end_date FROM period_expenses ORDER BY start_date DESC');
    console.log('Fetched date ranges:', rows);
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching date ranges:', err.message, { stack: err.stack, sqlError: err.sqlMessage || 'N/A' });
    return res.status(500).json({ error: 'Failed to fetch date ranges', details: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// PUT /api/expenses/:id
app.put('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  const {
    start_date, end_date, prev_raw_material_rubber, prev_raw_material_pvc,
    current_raw_material_rubber, current_raw_material_pvc, postage, accountant_fees,
    rubber_development_fee, licence, env_licence, pradeshiya_saba_fee, polythene,
    casual_wages, salary, epf, etf, telephone_charges, electricity, water,
    travelling_expense, rent, transport, other_expenses,
  } = req.body;

  console.log('Received PUT /api/expenses/:id:', {
    id,
    start_date,
    end_date,
    prev_raw_material_rubber,
    prev_raw_material_pvc,
    current_raw_material_rubber,
    current_raw_material_pvc,
    electricity,
    otherFields: { postage, accountant_fees, transport, other_expenses },
  });

  if (!start_date || !end_date) {
    console.error('Validation failed: Missing start_date or end_date');
    return res.status(400).json({ error: 'Start date and end date are required' });
  }

  const start = new Date(start_date);
  const end = new Date(end_date);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error('Validation failed: Invalid date format', { start_date, end_date });
    return res.status(400).json({ error: 'Invalid date format' });
  }
  if (start > end) {
    console.error('Validation failed: Start date after end date', { start_date, end_date });
    return res.status(400).json({ error: 'Start date must be before end date' });
  }

  const expenseFields = [
    { name: 'prev_raw_material_rubber', value: prev_raw_material_rubber },
    { name: 'prev_raw_material_pvc', value: prev_raw_material_pvc },
    { name: 'current_raw_material_rubber', value: current_raw_material_rubber },
    { name: 'current_raw_material_pvc', value: current_raw_material_pvc },
    { name: 'postage', value: postage },
    { name: 'accountant_fees', value: accountant_fees },
    { name: 'rubber_development_fee', value: rubber_development_fee },
    { name: 'licence', value: licence },
    { name: 'env_licence', value: env_licence },
    { name: 'pradeshiya_saba_fee', value: pradeshiya_saba_fee },
    { name: 'polythene', value: polythene },
    { name: 'casual_wages', value: casual_wages },
    { name: 'salary', value: salary },
    { name: 'epf', value: epf },
    { name: 'etf', value: etf },
    { name: 'telephone_charges', value: telephone_charges },
    { name: 'electricity', value: electricity },
    { name: 'water', value: water },
    { name: 'travelling_expense', value: travelling_expense },
    { name: 'rent', value: rent },
    { name: 'transport', value: transport },
    { name: 'other_expenses', value: other_expenses },
  ];

  for (const field of expenseFields) {
    if (field.value !== undefined && field.value !== null && field.value !== '' && (isNaN(field.value) || parseFloat(field.value) < 0)) {
      console.error(`Validation failed: Invalid value for ${field.name}`, { value: field.value });
      return res.status(400).json({ error: `${field.name.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()} must be a non-negative number` });
    }
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const [existing] = await conn.query('SELECT id FROM period_expenses WHERE id = ?', [id]);
    if (existing.length === 0) {
      console.error('Record not found:', { id });
      throw new Error('Expense record not found');
    }

    const [duplicate] = await conn.query(
      'SELECT id FROM period_expenses WHERE start_date = ? AND end_date = ? AND id != ?',
      [start_date, end_date, id]
    );
    if (duplicate.length > 0) {
      console.error('Duplicate period detected:', { start_date, end_date, existingId: duplicate[0].id });
      throw new Error('Expenses for this date range already exist');
    }

    const values = [
      start_date,
      end_date,
      parseFloat(prev_raw_material_rubber) || null,
      parseFloat(prev_raw_material_pvc) || null,
      parseFloat(current_raw_material_rubber) || null,
      parseFloat(current_raw_material_pvc) || null,
      parseFloat(postage) || null,
      parseFloat(accountant_fees) || null,
      parseFloat(rubber_development_fee) || null,
      parseFloat(licence) || null,
      parseFloat(env_licence) || null,
      parseFloat(pradeshiya_saba_fee) || null,
      parseFloat(polythene) || null,
      parseFloat(casual_wages) || null,
      parseFloat(salary) || null,
      parseFloat(epf) || null,
      parseFloat(etf) || null,
      parseFloat(telephone_charges) || null,
      parseFloat(electricity) || null,
      parseFloat(water) || null,
      parseFloat(travelling_expense) || null,
      parseFloat(rent) || null,
      parseFloat(transport) || null,
      parseFloat(other_expenses) || null,
      id,
    ];

    const [result] = await conn.query(
      `
      UPDATE period_expenses SET
        start_date = ?, end_date = ?, prev_raw_material_rubber = ?, prev_raw_material_pvc = ?,
        current_raw_material_rubber = ?, current_raw_material_pvc = ?, postage = ?, accountant_fees = ?,
        rubber_development_fee = ?, licence = ?, env_licence = ?, pradeshiya_saba_fee = ?, polythene = ?,
        casual_wages = ?, salary = ?, epf = ?, etf = ?, telephone_charges = ?, electricity = ?,
        water = ?, travelling_expense = ?, rent = ?, transport = ?, other_expenses = ?
      WHERE id = ?
      `,
      values
    );

    if (result.affectedRows === 0) {
      throw new Error('No rows updated');
    }

    await conn.commit();
    console.log('Updated period expenses:', { id, start_date, end_date });
    return res.json({ message: 'Expenses updated successfully' });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Error updating expenses:', err.message, {
      reqBody: req.body,
      id,
      stack: err.stack,
      sqlError: err.sqlMessage || 'N/A',
    });
    if (err.message === 'Expense record not found') {
      return res.status(404).json({ error: 'Expense record not found' });
    }
    if (err.message === 'Expenses for this date range already exist' || err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Expenses for this date range already exist' });
    }
    return res.status(500).json({ error: 'Failed to update expenses', details: err.message });
  } finally {
    if (conn) conn.release();
  }
});



// DELETE /api/expenses/:id
app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Received DELETE /api/expenses/:id:', { id });

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const [existing] = await conn.query('SELECT id FROM period_expenses WHERE id = ?', [id]);
    if (existing.length === 0) {
      console.error('Record not found:', { id });
      return res.status(404).json({ error: 'Expense record not found' });
    }

    const [result] = await conn.query('DELETE FROM period_expenses WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      throw new Error('No rows deleted');
    }

    await conn.commit();
    console.log('Deleted period expenses:', { id });
    return res.json({ message: 'Expenses deleted successfully' });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Error deleting expenses:', err.message, {
      id,
      stack: err.stack,
      sqlError: err.sqlMessage || 'N/A',
    });
    return res.status(500).json({ error: 'Failed to delete expenses', details: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/profit-summary
app.get('/api/profit-summary', requireAuth, async (req, res) => {
  const { startDate, endDate } = req.query;

  console.log('Received GET /api/profit-summary:', { startDate, endDate });

  if (!startDate || !endDate) {
    console.error('Validation failed: Missing startDate or endDate');
    return res.status(400).json({ error: 'Start date and end date are required' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error('Validation failed: Invalid date format', { startDate, endDate });
    return res.status(400).json({ error: 'Invalid date format' });
  }
  if (start > end) {
    console.error('Validation failed: Start date after end date', { startDate, endDate });
    return res.status(400).json({ error: 'Start date must be before end date' });
  }

  let conn;
  try {
    conn = await db.getConnection();

    // Fetch total expenses aggregated over the date range
    const [expensesRows] = await conn.query(
      'SELECT COALESCE(SUM(total_expenses), 0) AS total_expenses FROM period_expenses WHERE start_date <= ? AND end_date >= ?',
      [endDate, startDate] // Order ensures range inclusion
    );

    // Fetch all sales within the date range
    const [salesRows] = await conn.query(
      'SELECT COALESCE(SUM(total_amount + delivery_charges), 0) AS total_sales FROM sales WHERE date BETWEEN ? AND ?',
      [startDate, endDate]
    );

    const totalExpenses = parseFloat(expensesRows[0].total_expenses) || 0;
    const totalSales = parseFloat(salesRows[0].total_sales) || 0;
    const profit = totalSales - totalExpenses;

    console.log('Fetched profit summary:', { startDate, endDate, totalSales, totalExpenses, profit });
    return res.json({
      startDate,
      endDate,
      totalSales: totalSales.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      profit: profit.toFixed(2),
    });
  } catch (err) {
    console.error('Error fetching profit summary:', err.message, {
      query: { startDate, endDate },
      stack: err.stack,
      sqlError: err.sqlMessage || 'N/A',
    });
    return res.status(500).json({ error: 'Failed to fetch profit summary', details: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/sales
app.get('/api/sales', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.id AS sale_id,
        DATE_FORMAT(s.date, '%Y-%m-%d') AS date,
        s.bill_no,
        s.total_amount,
        s.delivery_charges,
        c.name AS customer_name,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', p.id,
            'method', p.method,
            'amount', p.amount,
            'cheque_number', p.cheque_number,
            'bank_name', p.bank_name,
            'cheque_date', DATE_FORMAT(p.cheque_date, '%Y-%m-%d'),
            'cheque_status', p.cheque_status,
            'is_returned', p.is_returned
          )
        ) AS payments
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      LEFT JOIN payments p ON p.sale_id = s.id
      GROUP BY s.id, s.date, s.bill_no, s.total_amount, s.delivery_charges, c.name
      ORDER BY s.date DESC
    `);

    const salesWithStatus = rows.map(sale => {
      let payments = [];
      if (typeof sale.payments === 'string') {
        try {
          payments = JSON.parse(sale.payments);
        } catch {
          payments = [];
        }
      } else if (Array.isArray(sale.payments)) {
        payments = sale.payments;
      }

      payments = payments.filter(p => p && p.method);

      const totalPaid = payments
        .filter(p => p.method === 'cash' || (p.method === 'cheque' && p.cheque_status === 'processed'))
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      const remainingCredit =
        (Number(sale.total_amount) || 0) + (Number(sale.delivery_charges) || 0) - totalPaid;

      const chequePayments = payments.filter(p => p.method === 'cheque');
      const chequeProcessed = chequePayments.some(p => p.cheque_status === 'processed');
      const chequeReturned = chequePayments.some(p => p.cheque_status === 'returned');

      const uniqueMethods = [
        ...new Set(payments.map(p => p.method?.trim().toLowerCase()).filter(Boolean)),
      ].map(m => m.charAt(0).toUpperCase() + m.slice(1));

      const method = uniqueMethods.length > 0 ? uniqueMethods.join(', ') : 'Credit';

      let status = 'Pending';
      if (remainingCredit <= 0) {
        status = 'Complete';
      } else if (chequePayments.length > 0) {
        if (chequeReturned || chequePayments.some(p => p.cheque_status === 'pending')) {
          status = 'Pending';
        } else if (chequeProcessed) {
          status = 'Complete';
        }
      } else if (uniqueMethods.includes('Cash')) {
        status =
          totalPaid >= (Number(sale.total_amount) || 0) + (Number(sale.delivery_charges) || 0)
            ? 'Complete'
            : 'Pending';
      }

      return {
        sale_id: sale.sale_id,
        date: sale.date,
        bill_no: sale.bill_no,
        customer_name: sale.customer_name,
        total_amount: Number(sale.total_amount) || 0,
        delivery_charges: Number(sale.delivery_charges) || 0,
        payments,
        total_paid: totalPaid,
        remaining_credit: remainingCredit,
        cheque_processed: chequeProcessed,
        cheque_returned: chequeReturned,
        method,
        status,
      };
    });

    res.json(salesWithStatus);
  } catch (err) {
    console.error('Error in /api/sales:', err.message);
    res.status(500).json({ error: 'Failed to fetch sales data', details: err.message });
  }
});






















































// Get monthly expenses by year and month
app.get('/api/monthly-expenses/:year/:month', requireAuth, async (req, res) => {
  const { year, month } = req.params;

  try {
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    const [rows] = await db.query(
      `
      SELECT 
        id,
        year,
        month,
        casual_wages,
        salary,
        epf,
        etf,
        telephone_charges,
        electricity,
        water,
        travelling_expense,
        rent,
        transport,
        other_expenses,
        other_description
      FROM monthly_expenses
      WHERE year = ? AND month = ?
      `,
      [yearNum, monthNum]
    );

    if (rows.length === 0) {
      return res.json({ year: yearNum, month: monthNum });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching monthly expenses:', err.message);
    res.status(500).json({ error: 'Failed to fetch monthly expenses', details: err.message });
  }
});

// Save or update monthly expenses
app.post('/api/monthly-expenses', async (req, res) => {
  const {
    year,
    month,
    casual_wages,
    salary,
    epf,
    etf,
    telephone_charges,
    electricity,
    water,
    travelling_expense,
    rent,
    transport,
    other_expenses,
    other_description,
  } = req.body;

  if (!year || !month) {
    return res.status(400).json({ error: 'Year and month are required' });
  }
  if (month < 1 || month > 12) {
    return res.status(400).json({ error: 'Month must be between 1 and 12' });
  }

  const conn = await db.getConnection().catch(err => {
    throw new Error('Failed to get database connection: ' + err.message);
  });

  try {
    await conn.beginTransaction();

    const [existingRows] = await conn.query(
      'SELECT id FROM monthly_expenses WHERE year = ? AND month = ?',
      [parseInt(year), parseInt(month)]
    );

    if (existingRows.length > 0) {
      const [result] = await conn.query(
        `
        UPDATE monthly_expenses
        SET
          casual_wages = ?,
          salary = ?,
          epf = ?,
          etf = ?,
          telephone_charges = ?,
          electricity = ?,
          water = ?,
          travelling_expense = ?,
          rent = ?,
          transport = ?,
          other_expenses = ?,
          other_description = ?
        WHERE year = ? AND month = ?
        `,
        [
          parseFloat(casual_wages) || 0,
          parseFloat(salary) || 0,
          parseFloat(epf) || 0,
          parseFloat(etf) || 0,
          parseFloat(telephone_charges) || 0,
          parseFloat(electricity) || 0,
          parseFloat(water) || 0,
          parseFloat(travelling_expense) || 0,
          parseFloat(rent) || 0,
          parseFloat(transport) || 0,
          parseFloat(other_expenses) || 0,
          other_description || '',
          parseInt(year),
          parseInt(month),
        ]
      );

      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({ error: 'Monthly expenses not found' });
      }

      await conn.commit();
      res.json({ message: 'Monthly expenses updated successfully' });
    } else {
      const [result] = await conn.query(
        `
        INSERT INTO monthly_expenses (
          year, month, casual_wages, salary, epf, etf,
          telephone_charges, electricity, water, travelling_expense,
          rent, transport, other_expenses, other_description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          parseInt(year),
          parseInt(month),
          parseFloat(casual_wages) || 0,
          parseFloat(salary) || 0,
          parseFloat(epf) || 0,
          parseFloat(etf) || 0,
          parseFloat(telephone_charges) || 0,
          parseFloat(electricity) || 0,
          parseFloat(water) || 0,
          parseFloat(travelling_expense) || 0,
          parseFloat(rent) || 0,
          parseFloat(transport) || 0,
          parseFloat(other_expenses) || 0,
          other_description || '',
        ]
      );

      await conn.commit();
      res.json({ message: 'Monthly expenses saved successfully', id: result.insertId });
    }
  } catch (err) {
    await conn.rollback();
    console.error('Error saving monthly expenses:', err.message);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Expenses for this year and month already exist' });
    } else {
      res.status(500).json({ error: 'Failed to save monthly expenses', details: err.message });
    }
  } finally {
    conn.release();
  }
});



















// ═══════════════════════════════════════════════════════════════════════
//  PASTE THESE ROUTES INTO YOUR server.js
//  Add them BEFORE the 404 handler at the bottom:
//    app.use('*', (req, res) => { ... })
//
//  These routes are written to match YOUR exact schema:
//    Tables  : sales, payments, customers, inventory, products,
//              production, pvc_production
//    Auth    : uses your existing requireAuth middleware
// ═══════════════════════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────────────────────
//  1.  GET /dashboard/inventory/summary
//      Final product inventory (left panel)
//      Uses: inventory + products  (same query as your existing
//            /inventory/summary but exposed under a cleaner path so it
//            doesn't clash with the one already in your file)
// ─────────────────────────────────────────────────────────────────────
app.get('/dashboard/inventory/summary', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        i.product_id,
        p.type        AS product_name,
        p.unit,
        COALESCE(SUM(i.quantity), 0) AS total_quantity
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      GROUP BY i.product_id, p.type, p.unit
      ORDER BY p.type ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /dashboard/inventory/summary:', err.message);
    res.status(500).json({ error: 'Failed to fetch inventory summary' });
  }
});


// ─────────────────────────────────────────────────────────────────────
//  2.  GET /dashboard/production/summary?type=normal|pvc
//      Production inventory — Normal (production table)
//                           — PVC   (pvc_production table)
//      Uses: production  OR  pvc_production
// ─────────────────────────────────────────────────────────────────────
app.get('/dashboard/production/summary', requireAuth, async (req, res) => {
  const { type } = req.query;

  try {
    if (type === 'pvc') {
      // pvc_production table: id, code, total_weight, total_price
      const [rows] = await db.query(`
        SELECT
          id          AS product_id,
          code        AS product_name,
          'Kg'        AS unit,
          COALESCE(SUM(total_weight), 0) AS total_quantity
        FROM pvc_production
        GROUP BY id, code
        ORDER BY code ASC
      `);
      return res.json(rows);
    }

    // default: normal rubber production table: id, code, total_weight, total_price
    const [rows] = await db.query(`
      SELECT
        id          AS product_id,
        code        AS product_name,
        'Kg'        AS unit,
        COALESCE(SUM(total_weight), 0) AS total_quantity
      FROM production
      GROUP BY id, code
      ORDER BY code ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /dashboard/production/summary:', err.message);
    res.status(500).json({ error: 'Failed to fetch production summary' });
  }
});


// ─────────────────────────────────────────────────────────────────────
//  3.  GET /dashboard/sales?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
//      All bills for the date range with payment breakdown
//      Uses: sales + customers + payments
//
//      Returns per bill:
//        bill_no, date, customer_name, method (Cash / Cheque / Credit),
//        total_amount, status (Complete | Pending),
//        cheque_number, cheque_date, cheque_status  ← for cheque panel
// ─────────────────────────────────────────────────────────────────────
app.get('/dashboard/sales', requireAuth, async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate)
    return res.status(400).json({ error: 'startDate and endDate are required' });

  const start = new Date(startDate).toISOString().split('T')[0];
  const end   = new Date(endDate).toISOString().split('T')[0];

  try {
    // Fetch all sales in range with their payments
    const [rows] = await db.query(`
      SELECT
        s.id                                          AS sale_id,
        s.bill_no,
        DATE_FORMAT(s.date, '%Y-%m-%d')               AS date,
        s.total_amount,
        c.name                                        AS customer_name,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id',             p.id,
            'method',         p.method,
            'amount',         p.amount,
            'cheque_number',  p.cheque_number,
            'bank_name',      p.bank_name,
            'cheque_date',    DATE_FORMAT(p.cheque_date, '%Y-%m-%d'),
            'cheque_status',  p.cheque_status
          )
        ) AS payments
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      LEFT JOIN payments p ON p.sale_id = s.id
      WHERE s.date BETWEEN ? AND ?
      GROUP BY s.id, s.bill_no, s.date, s.total_amount, c.name
      ORDER BY s.date DESC, s.id DESC
    `, [start, end]);

    const result = rows.map(sale => {
      // Parse payments JSON safely
      let payments = [];
      try {
        payments = (typeof sale.payments === 'string'
          ? JSON.parse(sale.payments)
          : sale.payments || []
        ).filter(p => p && p.method);
      } catch { payments = []; }

      // Totals
      const totalPaid = payments
        .filter(p => p.method === 'cash' || (p.method === 'cheque' && p.cheque_status === 'processed'))
        .reduce((s, p) => s + (Number(p.amount) || 0), 0);

      const remainingCredit = Number(sale.total_amount) - totalPaid;

      // Payment method label (Cash, Cheque, Credit or combinations)
      const uniqueMethods = [...new Set(
        payments.map(p => (p.method || '').trim().toLowerCase()).filter(Boolean)
      )].map(m => m.charAt(0).toUpperCase() + m.slice(1));
      const method = uniqueMethods.length > 0 ? uniqueMethods.join(', ') : 'Credit';

      // Status
      const chequePayments = payments.filter(p => p.method === 'cheque');
      const chequeProcessed = chequePayments.some(p => p.cheque_status === 'processed');
      const chequeReturned  = chequePayments.some(p => p.cheque_status === 'returned');

      let status = 'Pending';
      if (remainingCredit <= 0) {
        status = 'Complete';
      } else if (chequePayments.length > 0) {
        status = (chequeReturned || chequePayments.some(p => p.cheque_status === 'pending'))
          ? 'Pending' : chequeProcessed ? 'Complete' : 'Pending';
      } else if (uniqueMethods.includes('Cash')) {
        status = totalPaid >= Number(sale.total_amount) ? 'Complete' : 'Pending';
      }

      return {
        sale_id:    sale.sale_id,
        bill_no:    sale.bill_no,
        date:       sale.date,
        customer_name: sale.customer_name,
        total_amount:  Number(sale.total_amount),
        method,
        status,
        payments,       // full array — frontend uses this for cheque panel
        total_paid:     totalPaid,
        remaining_credit: remainingCredit,
      };
    });

    res.json(result);
  } catch (err) {
    console.error('GET /dashboard/sales:', err.message);
    res.status(500).json({ error: 'Failed to fetch dashboard sales' });
  }
});


// ─────────────────────────────────────────────────────────────────────
//  4.  GET /dashboard/sales/due?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
//      Bills that still have outstanding credit OR pending/returned cheques
//      Uses: sales + customers + payments
// ─────────────────────────────────────────────────────────────────────
app.get('/dashboard/sales/due', requireAuth, async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate)
    return res.status(400).json({ error: 'startDate and endDate are required' });

  const start = new Date(startDate).toISOString().split('T')[0];
  const end   = new Date(endDate).toISOString().split('T')[0];

  try {
    const [rows] = await db.query(`
      SELECT
        s.id                                        AS sale_id,
        s.bill_no,
        DATE_FORMAT(s.date, '%Y-%m-%d')             AS date,
        s.total_amount,
        c.name                                      AS customer_name,
        -- Total paid (cash + processed cheques only)
        COALESCE((
          SELECT SUM(p2.amount)
          FROM payments p2
          WHERE p2.sale_id = s.id
            AND (
              p2.method = 'cash'
              OR (p2.method = 'cheque' AND p2.cheque_status = 'processed')
            )
        ), 0)                                       AS total_paid,
        -- Primary payment method on this sale
        (
          SELECT GROUP_CONCAT(DISTINCT CONCAT(UPPER(LEFT(p3.method,1)), SUBSTRING(p3.method,2)) SEPARATOR ', ')
          FROM payments p3
          WHERE p3.sale_id = s.id AND p3.method IS NOT NULL
        )                                           AS method
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      WHERE s.date BETWEEN ? AND ?
        AND (
          -- Still has an unpaid credit balance
          s.total_amount > COALESCE((
            SELECT SUM(p4.amount)
            FROM payments p4
            WHERE p4.sale_id = s.id
              AND (
                p4.method = 'cash'
                OR (p4.method = 'cheque' AND p4.cheque_status = 'processed')
              )
          ), 0)
          OR
          -- Has a pending or returned cheque
          EXISTS (
            SELECT 1 FROM payments p5
            WHERE p5.sale_id = s.id
              AND p5.method = 'cheque'
              AND p5.cheque_status IN ('pending', 'returned')
          )
        )
      ORDER BY s.date ASC, s.id ASC
    `, [start, end]);

    const result = rows.map(r => ({
      sale_id:       r.sale_id,
      bill_no:       r.bill_no,
      date:          r.date,
      customer_name: r.customer_name,
      total_amount:  Number(r.total_amount),
      total_paid:    Number(r.total_paid),
      due_amount:    Number(r.total_amount) - Number(r.total_paid),
      method:        r.method || 'Credit',
      status:        'Pending',
    }));

    res.json(result);
  } catch (err) {
    console.error('GET /dashboard/sales/due:', err.message);
    res.status(500).json({ error: 'Failed to fetch due bills' });
  }
});


// ─────────────────────────────────────────────────────────────────────
//  5.  GET /dashboard/totals?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
//      Cash / Credit / Cheque totals for the right-panel summary cards
//      Uses: payments + sales (to filter by sale date)
// ─────────────────────────────────────────────────────────────────────
app.get('/dashboard/totals', requireAuth, async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate)
    return res.status(400).json({ error: 'startDate and endDate are required' });

  const start = new Date(startDate).toISOString().split('T')[0];
  const end   = new Date(endDate).toISOString().split('T')[0];

  try {
    const [rows] = await db.query(`
      SELECT
        p.method,
        COALESCE(SUM(p.amount), 0) AS total
      FROM payments p
      JOIN sales s ON p.sale_id = s.id
      WHERE s.date BETWEEN ? AND ?
        AND p.method IN ('cash', 'credit', 'cheque')
      GROUP BY p.method
    `, [start, end]);

    const totals = { cash: 0, credit: 0, cheque: 0 };
    rows.forEach(r => { totals[r.method] = Number(r.total); });

    res.json(totals);
  } catch (err) {
    console.error('GET /dashboard/totals:', err.message);
    res.status(500).json({ error: 'Failed to fetch totals' });
  }
});















app.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// ================= 404 HANDLER =================
app.use('*', (req, res) => {
  console.log(`404 for ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});






































































