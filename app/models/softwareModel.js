const db = require('../config/database');

const Software = {
  // Catalog Methods
  async getAll(req) {
    const sql = `SELECT * FROM software ORDER BY nombre ASC`;
    return await db.execute(req, sql);
  },

  async getById(req, id) {
    const sql = `SELECT * FROM software WHERE id_software = ?`;
    const rows = await db.execute(req, sql, [id]);
    return rows[0] || null;
  },

  async create(req, data) {
    const sql = `INSERT INTO software (nombre) VALUES (?)`;
    const result = await db.execute(req, sql, [data.nombre]);
    return result.insertId;
  },

  async update(req, id, data) {
    const sql = `UPDATE software SET nombre = ? WHERE id_software = ?`;
    return await db.execute(req, sql, [data.nombre, id]);
  },

  async delete(req, id) {
    const sql = `DELETE FROM software WHERE id_software = ?`;
    return await db.execute(req, sql, [id]);
  },

  // Installed Software Methods
  async getInstalado(req) {
    const sql = `
      SELECT si.*, s.nombre as software_nombre, e.codigo_inventario, e.tipo as equipo_tipo, e.marca as equipo_marca
      FROM software_instalado si
      JOIN software s ON si.id_software = s.id_software
      JOIN equipo e ON si.id_equipo = e.id_equipo
      ORDER BY si.fecha_instalacion DESC
    `;
    return await db.execute(req, sql);
  },

  async getInstaladoByEquipo(req, id_equipo) {
    const sql = `
      SELECT si.*, s.nombre as software_nombre
      FROM software_instalado si
      JOIN software s ON si.id_software = s.id_software
      WHERE si.id_equipo = ?
      ORDER BY si.fecha_instalacion DESC
    `;
    return await db.execute(req, sql, [id_equipo]);
  },

  async getInstaladoById(req, id) {
    const sql = `
      SELECT si.*, s.nombre as software_nombre, e.codigo_inventario 
      FROM software_instalado si
      JOIN software s ON si.id_software = s.id_software
      JOIN equipo e ON si.id_equipo = e.id_equipo
      WHERE si.id_software_instalado = ?
    `;
    const rows = await db.execute(req, sql, [id]);
    return rows[0] || null;
  },

  async createInstalado(req, data) {
    const sql = `
      INSERT INTO software_instalado (id_equipo, id_software, tipo_licencia, clave_licencia, fecha_instalacion, fecha_expiracion)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.id_equipo,
      data.id_software,
      data.tipo_licencia,
      data.clave_licencia || null,
      data.fecha_instalacion,
      data.fecha_expiracion || null
    ];
    const result = await db.execute(req, sql, params);
    return result.insertId;
  },

  async updateInstalado(req, id, data) {
    const sql = `
      UPDATE software_instalado 
      SET id_equipo = ?, id_software = ?, tipo_licencia = ?, clave_licencia = ?, fecha_instalacion = ?, fecha_expiracion = ?
      WHERE id_software_instalado = ?
    `;
    const params = [
      data.id_equipo,
      data.id_software,
      data.tipo_licencia,
      data.clave_licencia || null,
      data.fecha_instalacion,
      data.fecha_expiracion || null,
      id
    ];
    return await db.execute(req, sql, params);
  },

  async deleteInstalado(req, id) {
    const sql = `DELETE FROM software_instalado WHERE id_software_instalado = ?`;
    return await db.execute(req, sql, [id]);
  }
};

module.exports = Software;
