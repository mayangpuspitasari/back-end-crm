const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Mengambil semua produk
router.get('/', (req, res) => {
  const query = 'SELECT * FROM produk';
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).send(err); // Mengirimkan respons error dan menghentikan eksekusi
    }
    res.status(200).json(result); // Respons sukses
  });
});

// Tambah Produk
router.post('/', (req, res) => {
  const { gambar, judul, harga, description, rating } = req.body;
  const query =
    'INSERT INTO produk (gambar, judul, harga, description, rating) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [gambar, judul, harga, description, rating], (err) => {
    if (err) {
      return res.status(500).send(err); // Mengirimkan respons error dan menghentikan eksekusi
    }
    res.status(201).send('Produk berhasil ditambahkan'); // Respons sukses
  });
});

// Hapus Produk
router.delete('/:id', (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL
  const query = 'DELETE FROM produk WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).send(err); // Jika terjadi error, kirim respons error
    }

    // Periksa apakah ada data yang dihapus
    if (result.affectedRows === 0) {
      return res.status(404).send('Produk tidak ditemukan');
    }

    res.status(200).send('Produk berhasil dihapus');
  });
});

// Update Produk
router.put('/:id', (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL
  const { gambar, judul, harga, description, rating } = req.body; // Ambil data dari body request
  const query = `
      UPDATE produk 
      SET gambar = ?, judul = ?, harga = ?, description = ?, rating = ? 
      WHERE id = ?
    `;

  db.query(
    query,
    [gambar, judul, harga, description, rating, id],
    (err, result) => {
      if (err) {
        return res.status(500).send(err); // Jika terjadi error, kirim respons error
      }

      // Periksa apakah ada data yang diperbarui
      if (result.affectedRows === 0) {
        return res.status(404).send('Produk tidak ditemukan');
      }

      res.status(200).send('Produk berhasil diperbarui');
    },
  );
});

// Melihat Detail Produk
router.get('/:id', (req, res) => {
    const { id } = req.params; // Ambil ID dari parameter URL
    const query = 'SELECT * FROM produk WHERE id = ?';
  
    db.query(query, [id], (err, result) => {
      if (err) {
        return res.status(500).send(err); // Jika terjadi error, kirimkan respons error
      }
  
      // Jika produk tidak ditemukan
      if (result.length === 0) {
        return res.status(404).send('Produk tidak ditemukan');
      }
  
      res.status(200).json(result[0]); // Kirimkan detail produk
    });
  });
  

// Export router
module.exports = router;

