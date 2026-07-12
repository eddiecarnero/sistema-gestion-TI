const db = require('../config/database');

const Tecnico = {
  async getAll(req) {
    const sql = `
      SELECT t.*, r.nombre as rango_nombre 
      FROM tecnico t 
      JOIN rango_tecnico r ON t.id_rango = r.id_rango
      ORDER BY t.id_tecnico DESC
    `;
    return await db.execute(req, sql);
  },

  async getById(req, id) {
    const sql = `
      SELECT t.*, r.nombre as rango_nombre 
      FROM tecnico t 
      JOIN rango_tecnico r ON t.id_rango = r.id_rango
      WHERE t.id_tecnico = ?
    `;
    const rows = await db.execute(req, sql, [id]);
    return rows[0] || null;
  },

  async getByCorreo(req, correo) {
    const sql = `
      SELECT t.*, r.nombre as rango_nombre 
      FROM tecnico t 
      JOIN rango_tecnico r ON t.id_rango = r.id_rango
      WHERE t.correo = ? AND t.estado = true
    `;
    const rows = await db.execute(req, sql, [correo]);
    return rows[0] || null;
  },

  async create(req, data) {
    const sql = `
      INSERT INTO tecnico (id_rango, nombres, apellidos, correo, telefono, contrasena, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.id_rango,
      data.nombres,
      data.apellidos,
      data.correo,
      data.telefono || null,
      data.contrasena,
      data.estado !== undefined ? data.estado : true
    ];
    const result = await db.execute(req, sql, params);
    return result.insertId;
  },

  async update(req, id, data) {
    let sql = `
      UPDATE tecnico 
      SET id_rango = ?, nombres = ?, apellidos = ?, correo = ?, telefono = ?, estado = ?
    `;
    const params = [
      data.id_rango,
      data.nombres,
      data.apellidos,
      data.correo,
      data.telefono || null,
      data.estado !== undefined ? data.estado : true
    ];

    if (data.contrasena) {
      sql += `, contrasena = ?`;
      params.push(data.contrasena);
    }

    sql += ` WHERE id_tecnico = ?`;
    params.push(id);

    return await db.execute(req, sql, params);
  },

  async delete(req, id) {
    // Soft delete
    const sql = `UPDATE tecnico SET estado = false WHERE id_tecnico = ?`;
    return await db.execute(req, sql, [id]);
  },

  async getRangos(req) {
    const sql = `SELECT * FROM rango_tecnico ORDER BY id_rango ASC`;
    return await db.execute(req, sql);
  }
};

module.exports = Tecnico;
