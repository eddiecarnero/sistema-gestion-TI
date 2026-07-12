const db = require('../config/database');

const Usuario = {
  async getAll(req) {
    const sql = `
      SELECT u.*, a.nombre as area_nombre 
      FROM usuario u 
      JOIN area a ON u.id_area = a.id_area
      ORDER BY u.id_usuario DESC
    `;
    return await db.execute(req, sql);
  },

  async getById(req, id) {
    const sql = `
      SELECT u.*, a.nombre as area_nombre 
      FROM usuario u 
      JOIN area a ON u.id_area = a.id_area
      WHERE u.id_usuario = ?
    `;
    const rows = await db.execute(req, sql, [id]);
    return rows[0] || null;
  },

  async getByCorreo(req, correo) {
    const sql = `
      SELECT u.*, a.nombre as area_nombre 
      FROM usuario u 
      JOIN area a ON u.id_area = a.id_area
      WHERE u.correo = ? AND u.estado = true
    `;
    const rows = await db.execute(req, sql, [correo]);
    return rows[0] || null;
  },

  async create(req, data) {
    const sql = `
      INSERT INTO usuario (id_area, cargo, nombres, apellidos, correo, telefono, contrasena, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.id_area,
      data.cargo,
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
      UPDATE usuario 
      SET id_area = ?, cargo = ?, nombres = ?, apellidos = ?, correo = ?, telefono = ?, estado = ?
    `;
    const params = [
      data.id_area,
      data.cargo,
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

    sql += ` WHERE id_usuario = ?`;
    params.push(id);

    return await db.execute(req, sql, params);
  },

  async delete(req, id) {
    // Soft delete by setting estado = false
    const sql = `UPDATE usuario SET estado = false WHERE id_usuario = ?`;
    return await db.execute(req, sql, [id]);
  },

  async getAreas(req) {
    const sql = `SELECT * FROM area ORDER BY nombre ASC`;
    return await db.execute(req, sql);
  },

  async createArea(req, nombre) {
    const sql = `INSERT INTO area (nombre) VALUES (?)`;
    const result = await db.execute(req, sql, [nombre]);
    return result.insertId;
  },

  async deleteArea(req, id) {
    const sql = `DELETE FROM area WHERE id_area = ?`;
    return await db.execute(req, sql, [id]);
  }
};

module.exports = Usuario;
