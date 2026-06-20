// backend/generate-hash.js
import bcrypt from 'bcryptjs';

const password = "admin123";   // ← You can change this to anything you want

const hash = bcrypt.hashSync(password, 10);
console.log("=== NEW PASSWORD HASH ===");
console.log(hash);
console.log("\nUse this password to login:", password);