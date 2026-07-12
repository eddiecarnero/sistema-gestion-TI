const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'soportefisi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function executeQuery(req, sql, params = []) {
  const conn = await pool.getConnection();
  try {
    if (req && req.session && req.session.user && req.session.user.tabla === 'tecnico') {
      await conn.query("SET @current_tecnico_id = ?", [req.session.user.id]);
    } else {
      await conn.query("SET @current_tecnico_id = NULL");
    }
    const [results] = await conn.query(sql, params);
    return results;
  } finally {
    conn.release();
  }
}

module.exports = {
  pool,
  query: (sql, params) => pool.query(sql, params),
  execute: executeQuery
};
