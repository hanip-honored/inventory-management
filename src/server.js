import app from './app.js';
import pool from './config/database.js';

const port = Number(process.env.PORT ?? 3000);

try {
  await pool.query('SELECT 1');

  app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
  });
} catch (error) {
  console.error('Gagal menjalankan aplikasi:', error.message);

  await pool.end();
  process.exitCode = 1;
}