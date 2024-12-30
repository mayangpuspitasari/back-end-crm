const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../config/database');

// Registrasi User
router.post('/register', async (req, res) => {
  const { username, password, role, email } = req.body;

  // Validasi input
  if (!username || !password || !email) {
      return res.status(400).send('Semua field (username, password, email) harus diisi');
  }

  // Validasi role "admin" tidak boleh digunakan
  if (role && role.toLowerCase() === 'admin') {
      return res.status(403).send('Role "admin" tidak dapat digunakan untuk registrasi');
  }

  try {
      // Cek apakah username atau email sudah ada
      const checkUser = 'SELECT * FROM user WHERE username = ? OR email = ?';
      const [results] = await db.promise().query(checkUser, [username, email]);

      if (results.length > 0) return res.status(400).send('Username atau email sudah digunakan');

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Simpan ke database
      const sql = 'INSERT INTO user (username, password, role, email) VALUES (?, ?, ?, ?)';
      await db.promise().query(sql, [username, hashedPassword, role || 'user', email]);

      res.status(201).send('Registrasi berhasil');
  } catch (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan server');
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Cek user di database
    const sql = 'SELECT * FROM user WHERE username = ?';
    const [results] = await db.promise().query(sql, [username]);

    if (results.length === 0) return res.status(404).send('User tidak ditemukan');

    const user = results[0];

    // Validasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('Password salah');

    // Buat token JWT
    const token = jwt.sign({ id: user.id_user, role: user.role }, 'secret_key', { expiresIn: '1h' });

    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan server');
  }
});

// Export router
module.exports = router;
