const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../config/database');

const SECRET_KEY = process.env.JWT_SECRET || 'secret_key';

// Mengambil semua user yang ada di database
router.get('/', (req, res) => {
  const query = "SELECT * FROM user WHERE role = 'user'";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).send(err); // Mengirimkan respons error dan menghentikan eksekusi
    }
    res.status(200).json(result); // Respons sukses
  });
});

// Registrasi User
router.post('/register', async (req, res) => {
  const { username, password, role, email } = req.body;

  // Validasi input
  if (!username || !password || !email) {
    return res
      .status(400)
      .send('Semua field (username, password, email) harus diisi');
  }

  // Validasi role "admin" tidak boleh digunakan
  if (role && role.toLowerCase() === 'admin') {
    return res
      .status(403)
      .send('Role "admin" tidak dapat digunakan untuk registrasi');
  }

  try {
    // Cek apakah username atau email sudah ada
    const checkUser = 'SELECT * FROM user WHERE username = ? OR email = ?';
    const [results] = await db.promise().query(checkUser, [username, email]);

    if (results.length > 0)
      return res.status(400).send('Username atau email sudah digunakan');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke database
    const sql =
      'INSERT INTO user (username, password, role, email) VALUES (?, ?, ?, ?)';
    await db
      .promise()
      .query(sql, [username, hashedPassword, role || 'user', email]);

    res.status(201).send('Registrasi berhasil');
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan server');
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username dan password harus diisi.' });
  }

  try {
    // Cek apakah user ada di database
    const sql = 'SELECT * FROM user WHERE username = ?';
    const [results] = await db.promise().query(sql, [username]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    const user = results[0];

    // Validasi password menggunakan bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password salah.' });
    }

    // Buat token JWT dengan payload dan secret key
    const token = jwt.sign({ id: user.id_user, role: user.role }, SECRET_KEY, {
      expiresIn: '1h',
    });

    // Kembalikan token, role, dan username kepada client
    res.status(200).json({
      token,
      role: user.role,
      username: user.username, // Tambahkan username di sini
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
});

//Hapus user
router.delete('/:id_user', (req, res) => {
  const { id_user } = req.params; // Ambil ID dari parameter URL
  const query = 'DELETE FROM user WHERE id_user = ?';

  db.query(query, [id_user], (err, result) => {
    if (err) {
      return res.status(500).send(err); // Jika terjadi error, kirim respons error
    }

    // Periksa apakah ada data yang dihapus
    if (result.affectedRows === 0) {
      return res.status(404).send('User tidak ditemukan');
    }

    res.status(200).send('User berhasil dihapus');
  });
});

// Edit User
router.put('/:id_user', async (req, res) => {
  const { id_user } = req.params;
  const { username, password, role, email } = req.body;

  try {
    // Cek apakah user ada di database
    const checkUser = 'SELECT * FROM user WHERE id_user = ?';
    const [results] = await db.promise().query(checkUser, [id_user]);

    if (results.length === 0) {
      return res.status(404).send('User tidak ditemukan');
    }

    // Siapkan query untuk update user
    const updateUser = `
      UPDATE user 
      SET username = ?, 
          ${password ? 'password = ?,' : ''} 
          role = ?, 
          email = ? 
      WHERE id_user = ?
    `;

    // Hash password jika disediakan
    let queryParams = [username, role, email, id_user];
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      queryParams = [username, hashedPassword, role, email, id_user];
    }

    await db.promise().query(updateUser, queryParams);

    res.status(200).send('User berhasil diupdate');
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan server');
  }
});

// Tambah User
router.post('/add', async (req, res) => {
  const { username, password, role, email } = req.body;

  // Validasi input
  if (!username || !password || !email) {
    return res
      .status(400)
      .send('Semua field (username, password, email) harus diisi');
  }

  try {
    // Cek apakah username atau email sudah ada
    const checkUser = 'SELECT * FROM user WHERE username = ? OR email = ?';
    const [results] = await db.promise().query(checkUser, [username, email]);

    if (results.length > 0) {
      return res.status(400).send('Username atau email sudah digunakan');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tambah user ke database
    const sql =
      'INSERT INTO user (username, password, role, email) VALUES (?, ?, ?, ?)';
    await db
      .promise()
      .query(sql, [username, hashedPassword, role || 'user', email]);

    res.status(201).send('User berhasil ditambahkan');
  } catch (err) {
    console.error(err);
    res.status(500).send('Terjadi kesalahan server');
  }
});

// Export router
module.exports = router;

