// backend/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import { ADMIN_PASSWORD_HASH } from '../../config/auth.js';   // ← Changed to ../../

const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  const isValid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);

  if (isValid) {
    req.session.authenticated = true;
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

export default router;