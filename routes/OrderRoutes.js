const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bukti = require('../milddware/bukti');
const authenticateUser = require('../milddware/auth');

// Mengambil semua order yang ada di database
router.get('/', (req, res) => {
  const query = `
    SELECT orders.*, user.username AS nama_pemesan, produk.judul AS produk_nama
    FROM orders
    JOIN user ON orders.user_id = user.id_user
    JOIN produk ON orders.produk_id = produk.id
  `;
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).send(err); // Mengirimkan respons error dan menghentikan eksekusi
    }
    res.status(200).json(result); // Respons sukses
  });
});

// Tambah order
router.post(
  '/',
  authenticateUser,
  bukti.single('bukti_pembayaran'),
  (req, res) => {
    const {
      produk_id,
      jumlah,
      nama_pemesan,
      alamat,
      metode_pembayaran,
      total,
    } = req.body;

    const user_id = req.user.id; // Ambil user_id dari token JWT
    const buktiPembayaranPath = req.file
      ? `/bukti_pembayaran/${req.file.filename}`
      : null;

    // Validasi data
   if (
    !produk_id ||
    !jumlah ||
    !nama_pemesan ||
    !alamat ||
    !metode_pembayaran ||
    !total ||
    (metode_pembayaran !== 'COD' && !buktiPembayaranPath)
  ) {
    return res
      .status(400)
      .send('Semua data wajib diisi, termasuk bukti pembayaran jika bukan COD');
  }

    // Validasi apakah produk_id ada di tabel produk
    const produkQuery = 'SELECT * FROM produk WHERE id = ?';
    db.query(produkQuery, [produk_id], (err, produkResult) => {
      if (err || produkResult.length === 0) {
        return res.status(404).send('Produk tidak ditemukan');
      }

      // Jika semuanya valid, masukkan pesanan ke tabel orders
      const query = `
      INSERT INTO orders 
      (user_id, produk_id, jumlah, nama_pemesan, alamat, metode_pembayaran, total, bukti_pembayaran)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

      db.query(
        query,
        [
          user_id,
          produk_id,
          jumlah,
          nama_pemesan,
          alamat,
          metode_pembayaran,
          total,
          buktiPembayaranPath,
        ],
        (err, result) => {
          if (err) {
            console.error('Database Error:', err);
            return res
              .status(500)
              .send('Terjadi kesalahan saat menambahkan pesanan');
          }

          res.status(201).send({
            message: 'Pesanan berhasil ditambahkan',
            orderId: result.insertId, // Mengembalikan ID pesanan yang baru dibuat
          });
        },
      );
    });
  },
);

// Update pesanan
router.put('/:id', bukti.single('bukti_pembayaran'), async (req, res) => {
  try {
    const {
      user_id,
      produk_id,
      jumlah,
      nama_pemesan,
      alamat,
      metode_pembayaran,
    } = req.body;

    const { id } = req.params;

    // Validasi data
    if (
      !produk_id ||
      !jumlah ||
      !nama_pemesan ||
      !alamat ||
      !metode_pembayaran
    ) {
      return res.status(400).send('Semua data wajib diisi');
    }

    // Validasi user_id
    const [userResult] = await db
      .promise()
      .query('SELECT * FROM users WHERE id = ?', [user_id]);
    if (userResult.length === 0) {
      return res.status(404).send('User tidak ditemukan');
    }

    // Validasi produk_id dan ambil harga produk
    const [produkResult] = await db
      .promise()
      .query('SELECT * FROM produk WHERE id = ?', [produk_id]);
    if (produkResult.length === 0) {
      return res.status(404).send('Produk tidak ditemukan');
    }
    const hargaProduk = produkResult[0].harga;

    // Hitung total harga berdasarkan jumlah
    const total = jumlah * hargaProduk;

    // Ambil bukti pembayaran lama jika tidak ada file baru
    const [currentOrder] = await db
      .promise()
      .query('SELECT * FROM orders WHERE id = ?', [id]);
    if (currentOrder.length === 0) {
      return res.status(404).send('Pesanan tidak ditemukan');
    }
    const buktiPembayaranPath = req.file
      ? `/bukti_pembayaran/${req.file.filename}`
      : currentOrder[0].bukti_pembayaran;

    // Perbarui data pesanan
    const [updateResult] = await db.promise().query(
      `
      UPDATE orders
      SET user_id = ?, produk_id = ?, jumlah = ?, nama_pemesan = ?, alamat = ?, metode_pembayaran = ?, total = ?, bukti_pembayaran = ?
      WHERE id = ?
      `,
      [
        user_id,
        produk_id,
        jumlah,
        nama_pemesan,
        alamat,
        metode_pembayaran,
        total,
        buktiPembayaranPath,
        id,
      ]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).send('Pesanan tidak ditemukan');
    }

    res.status(200).send({ message: 'Pesanan berhasil diperbarui', total });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).send('Terjadi kesalahan saat memperbarui pesanan');
  }
});



// Hapus pesanan
router.delete('/:id', (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL
  const query = 'DELETE FROM orders WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Database Error:', err); // Log kesalahan untuk debugging
      return res.status(500).send('Terjadi kesalahan pada server');
    }

    // Periksa apakah ada data yang dihapus
    if (result.affectedRows === 0) {
      return res.status(404).send('Pesanan tidak ditemukan');
    }

    res.status(200).send({ message: 'Pesanan berhasil dihapus' });
  });
});




// Export router
module.exports = router;

