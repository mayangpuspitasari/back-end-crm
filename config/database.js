const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'crm',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Koneksi ke database berhasil');
});

module.exports = db;

