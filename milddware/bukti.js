const multer = require('multer');

// Set storage untuk menyimpan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './bukti'); // Folder tempat menyimpan bukti pembayaran
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nama file unik
  }
});

// Filter file berdasarkan tipe
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File format not supported'), false);
  }
};

// Middleware multer
const bukti = multer({
  storage,
  fileFilter
});

module.exports = bukti;
