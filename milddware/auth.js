const jwt = require('jsonwebtoken');
const SECRET_KEY = 'rahasia_anda'; // Ganti dengan secret key Anda

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Token tidak ditemukan. Harap login.' });
  }

  const token = authHeader.split(' ')[1]; // Ambil token setelah "Bearer"
  try {
    const decoded = jwt.verify(token, SECRET_KEY); // Ganti dengan secret key Anda
    req.user = decoded; // Simpan data pengguna di req.user
    next(); // Lanjutkan ke route handler berikutnya
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
  }
};

module.exports = authenticateUser;

