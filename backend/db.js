// import mysql from 'mysql2';
// import dotenv from 'dotenv';
// import process from 'process';
// dotenv.config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// pool.getConnection((err, connection) => {
//   if (err) {
//     console.error('❌ DB connection failed:', err.message);
//     process.exit(1);
//   }
//   if (connection) connection.release();
//   console.log('✅ Connected to Cloud SQL (pool)');
// });

// export default pool.promise();








import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'inventory_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default db;