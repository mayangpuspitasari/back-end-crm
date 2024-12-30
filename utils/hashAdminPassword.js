const bcrypt = require('bcrypt');
const db = require('../config/database'); // Sesuaikan dengan file koneksi database Anda
const { QueryTypes } = require('sequelize');

const hashAdminPassword = async () => {
  try {
    const adminUsername = 'admin'; // Ganti dengan username admin Anda
    const plainPassword = 'admin123'; // Password lama admin

    // Hash password baru
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Perbarui password di database
    await db.query(
      'UPDATE users SET password = ? WHERE username = ?',
      {
        replacements: [hashedPassword, adminUsername],
        type: QueryTypes.UPDATE,
      }
    );

    console.log('Password admin berhasil di-hash');
  } catch (error) {
    console.error('Gagal meng-hash password admin:', error);
  }
};

// Jalankan fungsi
hashAdminPassword();
