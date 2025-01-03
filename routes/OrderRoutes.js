const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bukti = require('../milddware/bukti');


// Mengambil semua order yang ada di database
router.get('/', (req, res) => {
  const query = 'SELECT * FROM orders';
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).send(err); // Mengirimkan respons error dan menghentikan eksekusi
    }
    res.status(200).json(result); // Respons sukses
  });
});

// Tambah order
router.post('/', bukti.single('bukti_pembayaran'), (req, res) => {
  const {
    user_id,
    produk_id,
    jumlah,
    nama_pemesan,
    alamat,
    metode_pembayaran,
    total,
  } = req.body;

  const buktiPembayaranPath = req.file ? `/bukti_pembayaran/${req.file.filename}` : null;

  // Validasi data
  if (!user_id || !produk_id || !jumlah || !nama_pemesan || !alamat || !metode_pembayaran || !total || !buktiPembayaranPath) {
    return res.status(400).send('Semua data wajib diisi, termasuk bukti pembayaran');
  }

  const query = `
    INSERT INTO orders 
    (user_id, produk_id, jumlah, nama_pemesan, alamat, metode_pembayaran, total, bukti_pembayaran)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [user_id, produk_id, jumlah, nama_pemesan, alamat, metode_pembayaran, total, buktiPembayaranPath],
    (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).send('Terjadi kesalahan saat menambahkan pesanan');
      }

      res.status(201).send({
        message: 'Pesanan berhasil ditambahkan',
        orderId: result.insertId, // Mengembalikan ID pesanan yang baru dibuat
      });
    }
  );
});


// Update pesanan
router.put('/:id', bukti.single('bukti_pembayaran'), (req, res) => {
  const {
    user_id,
    produk_id,
    jumlah,
    nama_pemesan,
    alamat,
    metode_pembayaran,
    total,
  } = req.body;

  const buktiPembayaranPath = req.file ? `/bukti_pembayaran/${req.file.filename}` : null;
  const { id } = req.params; // Mengambil id dari parameter URL

  // Validasi data
  if (!user_id || !produk_id || !jumlah || !nama_pemesan || !alamat || !metode_pembayaran || !total) {
    return res.status(400).send('Semua data wajib diisi');
  }

  // Query untuk update data pesanan
  const query = `
    UPDATE orders
    SET user_id = ?, produk_id = ?, jumlah = ?, nama_pemesan = ?, alamat = ?, metode_pembayaran = ?, total = ?, bukti_pembayaran = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [user_id, produk_id, jumlah, nama_pemesan, alamat, metode_pembayaran, total, buktiPembayaranPath, id],
    (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).send('Terjadi kesalahan saat memperbarui pesanan');
      }

      // Periksa apakah data berhasil diupdate
      if (result.affectedRows === 0) {
        return res.status(404).send('Pesanan tidak ditemukan');
      }

      res.status(200).send({
        message: 'Pesanan berhasil diperbarui',
      });
    }
  );
});


// Hapus pesanan
router.delete('/:id', (req, res) => {
  const { id } = req.params; // Mengambil id dari parameter URL

  const query = 'DELETE FROM orders WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Database Error:', err);
      return res.status(500).send('Terjadi kesalahan saat menghapus pesanan');
    }

    // Periksa apakah data berhasil dihapus
    if (result.affectedRows === 0) {
      return res.status(404).send('Pesanan tidak ditemukan');
    }

    res.status(200).send('Pesanan berhasil dihapus');
  });
});



// Export router
module.exports = router;
