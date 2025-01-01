const express = require('express');
const router = express.Router();
const db = require('../config/database');
const upload = require('../milddware/upload'); // Middleware untuk upload file

// Membuat transaksi baru
router.post('/', (req, res) => {
  const { user_id, total_harga, metode_pembayaran } = req.body;

  const query = `
    INSERT INTO transaksi (user_id, total_harga, metode_pembayaran)
    VALUES (?, ?, ?)
  `;
  db.query(query, [user_id, total_harga, metode_pembayaran], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Gagal membuat transaksi', error: err });
    }
    res
      .status(201)
      .json({
        message: 'Transaksi berhasil dibuat',
        transaksiId: result.insertId,
      });
  });
});

// Mendapatkan semua transaksi
router.get('/', (req, res) => {
  const query = `
    SELECT t.id, t.user_id, t.total_harga, t.metode_pembayaran, t.bukti_pembayaran, 
           t.status, t.created_at, u.username 
    FROM transaksi t
    JOIN user u ON t.user_id = u.id_user
    ORDER BY t.created_at DESC
  `;
  db.query(query, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Gagal mengambil data transaksi', error: err });
    }
    res.status(200).json(result);
  });
});

// Mendapatkan detail transaksi berdasarkan ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT t.id, t.user_id, t.total_harga, t.metode_pembayaran, t.bukti_pembayaran,
           t.status, t.created_at, u.username 
    FROM transaksi t
    JOIN user u ON t.user_id = u.id_user
    WHERE t.id = ?
  `;
  db.query(query, [id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Gagal mengambil data transaksi', error: err });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    res.status(200).json(result[0]);
  });
});

// Mengunggah bukti pembayaran
router.put('/:id/upload', upload.single('bukti_pembayaran'), (req, res) => {
  const { id } = req.params;
  const buktiPembayaranPath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!buktiPembayaranPath) {
    return res.status(400).json({ message: 'Bukti pembayaran harus diunggah' });
  }

  const query = `
    UPDATE transaksi
    SET bukti_pembayaran = ?
    WHERE id = ?
  `;
  db.query(query, [buktiPembayaranPath, id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Gagal mengunggah bukti pembayaran', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    res.status(200).json({ message: 'Bukti pembayaran berhasil diunggah' });
  });
});

// Memperbarui status transaksi
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'selesai', 'batal'].includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid' });
  }

  const query = `
    UPDATE transaksi
    SET status = ?
    WHERE id = ?
  `;
  db.query(query, [status, id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Gagal memperbarui status transaksi', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    res.status(200).json({ message: 'Status transaksi berhasil diperbarui' });
  });
});

// Menghapus transaksi (opsional)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    DELETE FROM transaksi
    WHERE id = ?
  `;
  db.query(query, [id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Gagal menghapus transaksi', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    res.status(200).json({ message: 'Transaksi berhasil dihapus' });
  });
});

module.exports = router;

