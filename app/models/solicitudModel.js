const db = require('../config/database');

const Solicitud = {
  async getAll(req) {
    const sql = `
      SELECT s.*, u.nombres as usuario_nombres, u.apellidos as usuario_apellidos, u.correo as usuario_correo,
             a.nombre as area_nombre
      FROM solicitud s
      JOIN usuario u ON s.id_usuario_solicita = u.id_usuario
      JOIN area a ON u.id_area = a.id_area
      ORDER BY s.fecha_solicitud DESC
    `;
    return await db.execute(req, sql);
  },

  async getById(req, id) {
    const sql = `
      SELECT s.*, u.nombres as usuario_nombres, u.apellidos as usuario_apellidos, u.correo as usuario_correo,
             a.nombre as area_nombre
      FROM solicitud s
      JOIN usuario u ON s.id_usuario_solicita = u.id_usuario
      JOIN area a ON u.id_area = a.id_area
      WHERE s.id_solicitud = ?
    `;
    const rows = await db.execute(req, sql, [id]);
    return rows[0] || null;
  },

  async getByUsuario(req, id_usuario) {
    const sql = `
      SELECT s.*, u.nombres as usuario_nombres, u.apellidos as usuario_apellidos
      FROM solicitud s
      JOIN usuario u ON s.id_usuario_solicita = u.id_usuario
      WHERE s.id_usuario_solicita = ?
      ORDER BY s.fecha_solicitud DESC
    `;
    return await db.execute(req, sql, [id_usuario]);
  },

  async create(req, data) {
    const sql = `
      INSERT INTO solicitud (id_usuario_solicita, tipo, descripcion, estado, fecha_solicitud)
      VALUES (?, ?, ?, 'pendiente', NOW())
    `;
    const params = [
      data.id_usuario_solicita,
      data.tipo,
      data.descripcion
    ];
    const result = await db.execute(req, sql, params);
    return result.insertId;
  },

  async responder(req, id, estado) {
    const sql = `
      UPDATE solicitud 
      SET estado = ?, fecha_respuesta = NOW() 
      WHERE id_solicitud = ?
    `;
    return await db.execute(req, sql, [estado, id]);
  }
};

module.exports = Solicitud;
