const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Mengambil semua produk yang ada di database
router.get('/', (req, res) => {
  const query = 'SELECT * FROM pelanggan';
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).send(err); // Mengirimkan respons error dan menghentikan eksekusi
    }
    res.status(200).json(result); // Respons sukses
  });
});

// Tambah Produk
router.post('/', (req, res) => {
  const { nama_pelanggan, email, alamat, telepon } = req.body;
  const query =
    'INSERT INTO pelanggan (nama_pelanggan,email, alamat, telepon) VALUES (?, ?, ?, ?)';
  db.query(query, [nama_pelanggan, email, alamat, telepon], (err) => {
    if (err) {
      return res.status(500).send(err); // Mengirimkan respons error dan menghentikan eksekusi
    }
    res.status(201).send('Pelanggan berhasil ditambahkan'); // Respons sukses
  });
});

// Hapus Produk
router.delete('/:id_pelanggan', (req, res) => {
  const { id_pelanggan } = req.params; // Ambil ID dari parameter URL
  const query = 'DELETE FROM pelanggan WHERE id_pelanggan = ?';

  db.query(query, [id_pelanggan], (err, result) => {
    if (err) {
      return res.status(500).send(err); // Jika terjadi error, kirim respons error
    }

    // Periksa apakah ada data yang dihapus
    if (result.affectedRows === 0) {
      return res.status(404).send('Pelanggan tidak ditemukan');
    }

    res.status(200).send('Pelanggan berhasil dihapus');
  });
});

// Update Produk
router.put('/:id_pelanggan', (req, res) => {
  const { id_pelanggan } = req.params; // Ambil ID dari parameter URL
  const { nama_pelanggan, email, alamat, telepon } = req.body; // Ambil data dari body request
  const query = `
      UPDATE pelanggan 
      SET nama_pelanggan = ?, email = ?, alamat = ?, telepon = ? 
      WHERE id_pelanggan = ?
    `;

  db.query(
    query,
    [nama_pelanggan, email, alamat, telepon, id_pelanggan],
    (err, result) => {
      if (err) {
        return res.status(500).send(err); // Jika terjadi error, kirim respons error
      }

      // Periksa apakah ada data yang diperbarui
      if (result.affectedRows === 0) {
        return res.status(404).send('Pelanggan tidak ditemukan');
      }

      res.status(200).send('Pelanggan berhasil diperbarui');
    },
  );
});

// Export router
module.exports = router;

