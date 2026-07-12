const db = require('../config/database');

const Equipo = {
  async getAll(req, filters = {}) {
    let sql = `
      SELECT e.*, ld.modelo as laptop_modelo, ld.serie as laptop_serie
      FROM equipo e
      LEFT JOIN laptop_detalle ld ON e.id_equipo = ld.id_equipo
      WHERE 1=1
    `;
    const params = [];

    if (filters.search) {
      sql += ` AND (e.codigo_inventario LIKE ? OR e.marca LIKE ? OR ld.modelo LIKE ?)`;
      const searchWild = `%${filters.search}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    if (filters.tipo && filters.tipo !== 'todos') {
      sql += ` AND e.tipo = ?`;
      params.push(filters.tipo);
    }

    if (filters.estado && filters.estado !== 'todos') {
      sql += ` AND e.estado = ?`;
      params.push(filters.estado);
    }

    sql += ` ORDER BY e.id_equipo DESC`;
    return await db.execute(req, sql, params);
  },

  async getById(req, id) {
    const sql = `
      SELECT e.*, ld.modelo as laptop_modelo, ld.serie as laptop_serie,
             ld.tipo_procesador, ld.detalle_procesador, ld.tipo_ram, ld.cantidad_ram,
             ld.almacenamiento, ld.cantidad_almacenamiento, ld.tipo_grafica, ld.nombre_grafica
      FROM equipo e
      LEFT JOIN laptop_detalle ld ON e.id_equipo = ld.id_equipo
      WHERE e.id_equipo = ?
    `;
    const rows = await db.execute(req, sql, [id]);
    return rows[0] || null;
  },

  async create(req, data) {
    const sql = `
      INSERT INTO equipo (codigo_inventario, tipo, tipo_origen, marca, estado)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      data.codigo_inventario,
      data.tipo,
      data.tipo_origen,
      data.marca || null,
      data.estado || 'operativo'
    ];
    const result = await db.execute(req, sql, params);
    return result.insertId;
  },

  async update(req, id, data) {
    const sql = `
      UPDATE equipo 
      SET codigo_inventario = ?, tipo = ?, tipo_origen = ?, marca = ?, estado = ?
      WHERE id_equipo = ?
    `;
    const params = [
      data.codigo_inventario,
      data.tipo,
      data.tipo_origen,
      data.marca || null,
      data.estado,
      id
    ];
    return await db.execute(req, sql, params);
  },

  async delete(req, id) {
    // Soft delete: change status to baja
    const sql = `UPDATE equipo SET estado = 'baja' WHERE id_equipo = ?`;
    return await db.execute(req, sql, [id]);
  },

  // Laptop Details
  async getLaptopDetalle(req, id) {
    const sql = `SELECT * FROM laptop_detalle WHERE id_equipo = ?`;
    const rows = await db.execute(req, sql, [id]);
    return rows[0] || null;
  },

  async createLaptopDetalle(req, id, data) {
    const sql = `
      INSERT INTO laptop_detalle (
        id_equipo, modelo, serie, tipo_procesador, detalle_procesador, 
        tipo_ram, cantidad_ram, almacenamiento, cantidad_almacenamiento, 
        tipo_grafica, nombre_grafica
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id,
      data.modelo || null,
      data.serie,
      data.tipo_procesador || null,
      data.detalle_procesador || null,
      data.tipo_ram || null,
      data.cantidad_ram ? parseInt(data.cantidad_ram) : null,
      data.almacenamiento || null,
      data.cantidad_almacenamiento ? parseInt(data.cantidad_almacenamiento) : null,
      data.tipo_grafica || null,
      data.nombre_grafica || null
    ];
    return await db.execute(req, sql, params);
  },

  async updateLaptopDetalle(req, id, data) {
    const sql = `
      UPDATE laptop_detalle 
      SET modelo = ?, serie = ?, tipo_procesador = ?, detalle_procesador = ?, 
          tipo_ram = ?, cantidad_ram = ?, almacenamiento = ?, cantidad_almacenamiento = ?, 
          tipo_grafica = ?, nombre_grafica = ?
      WHERE id_equipo = ?
    `;
    const params = [
      data.modelo || null,
      data.serie,
      data.tipo_procesador || null,
      data.detalle_procesador || null,
      data.tipo_ram || null,
      data.cantidad_ram ? parseInt(data.cantidad_ram) : null,
      data.almacenamiento || null,
      data.cantidad_almacenamiento ? parseInt(data.cantidad_almacenamiento) : null,
      data.tipo_grafica || null,
      data.nombre_grafica || null,
      id
    ];
    return await db.execute(req, sql, params);
  },

  // Ambientes
  async getAmbientes(req) {
    const sql = `SELECT * FROM ambiente ORDER BY pabellon, numero`;
    return await db.execute(req, sql);
  },

  async createAmbiente(req, data) {
    const sql = `INSERT INTO ambiente (numero, pabellon, piso) VALUES (?, ?, ?)`;
    const result = await db.execute(req, sql, [data.numero, data.pabellon, data.piso]);
    return result.insertId;
  },

  // Assignment history
  async getAsignaciones(req, id_equipo) {
    const sql = `
      SELECT ah.*, u.nombres as usuario_nombres, u.apellidos as usuario_apellidos,
             a.numero as ambiente_numero, a.pabellon as ambiente_pabellon
      FROM asignacion_historial ah
      LEFT JOIN usuario u ON ah.id_usuario = u.id_usuario
      LEFT JOIN ambiente a ON ah.id_ambiente = a.id_ambiente
      WHERE ah.id_equipo = ?
      ORDER BY ah.fecha_inicio DESC
    `;
    return await db.execute(req, sql, [id_equipo]);
  },

  async createAsignacion(req, data) {
    const sql = `CALL sp_asignar_equipo(?, ?, ?)`;
    return await db.execute(req, sql, [
      data.id_equipo,
      data.id_usuario || null,
      data.id_ambiente || null
    ]);
  },

  async terminarAsignacion(req, id_asignacion) {
    const sql = `
      UPDATE asignacion_historial 
      SET fecha_fin = NOW() 
      WHERE id_asignacion = ? AND fecha_fin IS NULL
    `;
    return await db.execute(req, sql, [id_asignacion]);
  }
};

module.exports = Equipo;
