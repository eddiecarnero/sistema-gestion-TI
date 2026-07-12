const db = require('../config/database');

const Incidencia = {
  async getAll(req, filters = {}) {
    let sql = `
      SELECT i.*, e.codigo_inventario, e.tipo as equipo_tipo,
             u.nombres as usuario_nombres, u.apellidos as usuario_apellidos,
             t.nombres as tecnico_nombres, t.apellidos as tecnico_apellidos
      FROM incidencia i
      JOIN equipo e ON i.id_equipo = e.id_equipo
      JOIN usuario u ON i.id_usuario_reporta = u.id_usuario
      LEFT JOIN tecnico t ON i.id_tecnico_recibe = t.id_tecnico
      WHERE 1=1
    `;
    const params = [];

    if (filters.estado && filters.estado !== 'todos') {
      sql += ` AND i.estado = ?`;
      params.push(filters.estado);
    }

    if (filters.prioridad && filters.prioridad !== 'todos') {
      sql += ` AND i.prioridad = ?`;
      params.push(filters.prioridad);
    }

    if (filters.id_usuario_reporta) {
      sql += ` AND i.id_usuario_reporta = ?`;
      params.push(filters.id_usuario_reporta);
    }

    if (filters.id_tecnico_recibe) {
      sql += ` AND i.id_tecnico_recibe = ?`;
      params.push(filters.id_tecnico_recibe);
    }

    sql += ` ORDER BY i.fecha_creacion DESC`;
    return await db.execute(req, sql, params);
  },

  async getById(req, id) {
    const sql = `
      SELECT i.*, e.codigo_inventario, e.tipo as equipo_tipo, e.marca as equipo_marca,
             u.nombres as usuario_nombres, u.apellidos as usuario_apellidos, u.correo as usuario_correo,
             t.nombres as tecnico_nombres, t.apellidos as tecnico_apellidos
      FROM incidencia i
      JOIN equipo e ON i.id_equipo = e.id_equipo
      JOIN usuario u ON i.id_usuario_reporta = u.id_usuario
      LEFT JOIN tecnico t ON i.id_tecnico_recibe = t.id_tecnico
      WHERE i.id_incidencia = ?
    `;
    const rows = await db.execute(req, sql, [id]);
    return rows[0] || null;
  },

  async create(req, data) {
    const sql = `
      INSERT INTO incidencia (id_equipo, id_usuario_reporta, descripcion, prioridad, estado, fecha_creacion)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    const params = [
      data.id_equipo,
      data.id_usuario_reporta,
      data.descripcion,
      data.prioridad || 'media',
      data.estado || 'pendiente'
    ];
    const result = await db.execute(req, sql, params);
    return result.insertId;
  },

  async update(req, id, data) {
    const sql = `
      UPDATE incidencia 
      SET id_equipo = ?, descripcion = ?, prioridad = ?, estado = ?, id_tecnico_recibe = ?,
          fecha_resolucion = CASE WHEN ? IN ('resuelta', 'cerrada') THEN NOW() ELSE NULL END
      WHERE id_incidencia = ?
    `;
    const params = [
      data.id_equipo,
      data.descripcion,
      data.prioridad,
      data.estado,
      data.id_tecnico_recibe || null,
      data.estado,
      id
    ];
    return await db.execute(req, sql, params);
  },

  async asignar(req, id, id_tecnico) {
    const sql = `
      UPDATE incidencia 
      SET id_tecnico_recibe = ?, estado = 'en_proceso' 
      WHERE id_incidencia = ?
    `;
    return await db.execute(req, sql, [id_tecnico, id]);
  },

  // Seguimientos (Follow-up)
  async getSeguimientos(req, id_incidencia) {
    const sql = `
      SELECT s.*, t.nombres as tecnico_nombres, t.apellidos as tecnico_apellidos,
             c.id_componente, c.estado_componente
      FROM seguimiento_incidencia s
      JOIN tecnico t ON s.id_tecnico = t.id_tecnico
      LEFT JOIN componente c ON s.id_componente_cambiado = c.id_componente
      WHERE s.id_incidencia = ?
      ORDER BY s.fecha DESC
    `;
    return await db.execute(req, sql, [id_incidencia]);
  },

  async getSeguimientoById(req, id_seguimiento) {
    const sql = `SELECT * FROM seguimiento_incidencia WHERE id_seguimiento = ?`;
    const rows = await db.execute(req, sql, [id_seguimiento]);
    return rows[0] || null;
  },

  async createSeguimiento(req, data) {
    const sql = `
      INSERT INTO seguimiento_incidencia (id_incidencia, id_tecnico, diagnostico, trabajo_realizado, horas_invertidas, id_componente_cambiado, fecha)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    const params = [
      data.id_incidencia,
      data.id_tecnico,
      data.diagnostico || null,
      data.trabajo_realizado || null,
      parseFloat(data.horas_invertidas),
      data.id_componente_cambiado || null
    ];
    return await db.execute(req, sql, params);
  },

  async updateSeguimiento(req, id_seguimiento, data) {
    const sql = `
      UPDATE seguimiento_incidencia
      SET diagnostico = ?, trabajo_realizado = ?, horas_invertidas = ?, id_componente_cambiado = ?
      WHERE id_seguimiento = ?
    `;
    const params = [
      data.diagnostico || null,
      data.trabajo_realizado || null,
      parseFloat(data.horas_invertidas),
      data.id_componente_cambiado || null,
      id_seguimiento
    ];
    return await db.execute(req, sql, params);
  },

  async deleteSeguimiento(req, id_seguimiento) {
    const sql = `DELETE FROM seguimiento_incidencia WHERE id_seguimiento = ?`;
    return await db.execute(req, sql, [id_seguimiento]);
  }
};

module.exports = Incidencia;
