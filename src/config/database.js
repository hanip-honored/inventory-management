import pg from 'pg';

const pool = new pg.Pool({
  connectionTimeoutMillis: 5000,
});

pool.on('error', (error) => {
  console.error('Koneksi database bermasalah:', error.message);
});

export default pool;