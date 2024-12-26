const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Mengambil semua produk yang ada di database
router.get('/', (req, res) => {
  const query = 'SELECT * FROM user';
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).send(err); // Mengirimkan respons error dan menghentikan eksekusi
    }
    res.status(200).json(result); // Respons sukses
  });
});

// Tambah Produk
router.post('/', (req, res) => {
  const { username, password, role } = req.body;
  const query = 'INSERT INTO user (username,password, role) VALUES (?, ?, ?)';
  db.query(query, [username, password, role], (err) => {
    if (err) {
      return res.status(500).send(err); // Mengirimkan respons error dan menghentikan eksekusi
    }
    res.status(201).send('User berhasil ditambahkan'); // Respons sukses
  });
});

// Hapus Produk
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

// Update Produk
router.put('/:id_user', (req, res) => {
  const { id_user } = req.params; // Ambil ID dari parameter URL
  const { username, password, role } = req.body; // Ambil data dari body request
  const query = `
      UPDATE pelanggan 
      SET username = ?, password = ?, role = ? = ? 
      WHERE id_user = ?
    `;

  db.query(query, [username, password, role, id_user], (err, result) => {
    if (err) {
      return res.status(500).send(err); // Jika terjadi error, kirim respons error
    }

    // Periksa apakah ada data yang diperbarui
    if (result.affectedRows === 0) {
      return res.status(404).send('User tidak ditemukan');
    }

    res.status(200).send('User berhasil diperbarui');
  });
});

// Export router
module.exports = router;

