const express = require('express');
const router = express.Router();
const db = require('../config/database');
const upload = require('../milddware/upload');


// Mengambil semua produk yang ada di database
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
router.post('/', upload.single ('gambar'),(req,res) => {
  const {judul, harga, description, rating } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  const query =
    'INSERT INTO produk (gambar, judul, harga, description, rating) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [imagePath, judul, harga, description, rating], (err) => {
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
  const { id } = req.params;
  const { judul, harga, description, rating } = req.body; // Data utama
  const gambar = req.body.gambar || null; // Gambar opsional

  // Jika gambar tidak dikirim, ambil gambar lama dari database
  const checkQuery = 'SELECT gambar FROM produk WHERE id = ?';
  db.query(checkQuery, [id], (checkErr, checkResult) => {
    if (checkErr) {
      return res.status(500).send('Error memeriksa data produk');
    }
    if (checkResult.length === 0) {
      return res.status(404).send('Produk tidak ditemukan');
    }

    const gambarLama = checkResult[0].gambar;

    // Gunakan gambar lama jika gambar baru tidak dikirim
    const gambarBaru = gambar || gambarLama;

    const updateQuery = `
      UPDATE produk 
      SET gambar = ?, judul = ?, harga = ?, description = ?, rating = ? 
      WHERE id = ?
    `;
    db.query(
      updateQuery,
      [gambarBaru, judul, harga, description, rating, id],
      (updateErr, updateResult) => {
        if (updateErr) {
          return res.status(500).send(updateErr);
        }

        if (updateResult.affectedRows === 0) {
          return res.status(404).send('Produk tidak ditemukan');
        }

        res.status(200).send('Produk berhasil diperbarui');
      },
    );
  });
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

