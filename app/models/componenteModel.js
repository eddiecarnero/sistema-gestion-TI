const db = require('../config/database');

const Componente = {
  async getByEquipo(req, id_equipo) {
    const sql = `
      SELECT * FROM vista_componentes_equipo 
      WHERE id_equipo = ?
    `;
    return await db.execute(req, sql, [id_equipo]);
  },

  async getById(req, id) {
    // We need to fetch from the main table and identify the type
    const mainSql = `SELECT * FROM componente WHERE id_componente = ?`;
    const rows = await db.execute(req, mainSql, [id]);
    if (rows.length === 0) return null;
    const comp = rows[0];

    // Check specific tables
    const tables = ['procesador', 'memoria_ram', 'almacenamiento', 'tarjeta_grafica', 'placa_madre', 'fuente_poder'];
    for (const table of tables) {
      const detailSql = `SELECT * FROM \`${table}\` WHERE id_componente = ?`;
      const details = await db.execute(req, detailSql, [id]);
      if (details.length > 0) {
        return {
          ...comp,
          tipo: table,
          detalles: details[0]
        };
      }
    }
    return {
      ...comp,
      tipo: 'otro',
      detalles: {}
    };
  },

  async create(req, id_equipo, type, data) {
    // 1. Create main component record
    const compSql = `
      INSERT INTO componente (id_equipo, estado_componente)
      VALUES (?, ?)
    `;
    const result = await db.execute(req, compSql, [id_equipo, data.estado_componente || 'operativo']);
    const id_componente = result.insertId;

    // 2. Insert into the specific table
    let detailSql = '';
    let params = [];

    switch (type) {
      case 'procesador':
        detailSql = `INSERT INTO procesador (id_componente, marca, modelo) VALUES (?, ?, ?)`;
        params = [id_componente, data.marca, data.modelo];
        break;
      case 'memoria_ram':
        detailSql = `INSERT INTO memoria_ram (id_componente, marca, capacidad_gb, tipo_ddr) VALUES (?, ?, ?, ?)`;
        params = [id_componente, data.marca, parseInt(data.capacidad_gb), data.tipo_ddr];
        break;
      case 'almacenamiento':
        detailSql = `INSERT INTO almacenamiento (id_componente, marca, modelo, tipo, capacidad_gb) VALUES (?, ?, ?, ?, ?)`;
        params = [id_componente, data.marca, data.modelo, data.disco_tipo || data.tipo, parseInt(data.capacidad_gb)];
        break;
      case 'tarjeta_grafica':
        detailSql = `INSERT INTO tarjeta_grafica (id_componente, marca, modelo, vram_gb) VALUES (?, ?, ?, ?)`;
        params = [id_componente, data.marca, data.modelo, parseInt(data.vram_gb)];
        break;
      case 'placa_madre':
        detailSql = `INSERT INTO placa_madre (id_componente, marca, modelo, socket, factor_forma) VALUES (?, ?, ?, ?, ?)`;
        params = [id_componente, data.marca, data.modelo, data.socket, data.factor_forma];
        break;
      case 'fuente_poder':
        detailSql = `INSERT INTO fuente_poder (id_componente, marca, modelo, potencia_watts, certificacion) VALUES (?, ?, ?, ?, ?)`;
        params = [id_componente, data.marca, data.modelo, parseInt(data.potencia_watts), data.certificacion];
        break;
    }

    if (detailSql) {
      await db.execute(req, detailSql, params);
    }
    return id_componente;
  },

  async update(req, id, type, data) {
    // 1. Obtener el id_equipo original antes de la actualización
    const rows = await db.execute(req, `SELECT id_equipo FROM componente WHERE id_componente = ?`, [id]);
    const old_id_equipo = rows && rows.length > 0 ? rows[0].id_equipo : null;

    const nuevo_estado = data.estado_componente;
    const nuevo_id_equipo = (nuevo_estado === 'almacenado') ? null : (data.id_equipo || old_id_equipo);

    // Actualizar componente principal
    const compSql = `
      UPDATE componente 
      SET estado_componente = ?, id_equipo = ?
      WHERE id_componente = ?
    `;
    await db.execute(req, compSql, [nuevo_estado, nuevo_id_equipo, id]);

    // Si se almacena y tenía un equipo asociado, el equipo pasa automáticamente a mantenimiento
    if (nuevo_estado === 'almacenado' && old_id_equipo) {
      await db.execute(req, `UPDATE equipo SET estado = 'mantenimiento' WHERE id_equipo = ?`, [old_id_equipo]);
    }

    // 2. Update specific details
    let detailSql = '';
    let params = [];

    switch (type) {
      case 'procesador':
        detailSql = `UPDATE procesador SET marca = ?, modelo = ? WHERE id_componente = ?`;
        params = [data.marca, data.modelo, id];
        break;
      case 'memoria_ram':
        detailSql = `UPDATE memoria_ram SET marca = ?, capacidad_gb = ?, tipo_ddr = ? WHERE id_componente = ?`;
        params = [data.marca, parseInt(data.capacidad_gb), data.tipo_ddr, id];
        break;
      case 'almacenamiento':
        detailSql = `UPDATE almacenamiento SET marca = ?, modelo = ?, tipo = ?, capacidad_gb = ? WHERE id_componente = ?`;
        params = [data.marca, data.modelo, data.disco_tipo || data.tipo, parseInt(data.capacidad_gb), id];
        break;
      case 'tarjeta_grafica':
        detailSql = `UPDATE tarjeta_grafica SET marca = ?, modelo = ?, vram_gb = ? WHERE id_componente = ?`;
        params = [data.marca, data.modelo, parseInt(data.vram_gb), id];
        break;
      case 'placa_madre':
        detailSql = `UPDATE placa_madre SET marca = ?, modelo = ?, socket = ?, factor_forma = ? WHERE id_componente = ?`;
        params = [data.marca, data.modelo, data.socket, data.factor_forma, id];
        break;
      case 'fuente_poder':
        detailSql = `UPDATE fuente_poder SET marca = ?, modelo = ?, potencia_watts = ?, certificacion = ? WHERE id_componente = ?`;
        params = [data.marca, data.modelo, parseInt(data.potencia_watts), data.certificacion, id];
        break;
    }

    if (detailSql) {
      return await db.execute(req, detailSql, params);
    }
  },

  async delete(req, id) {
    // Soft delete component by setting status to baja
    const sql = `UPDATE componente SET estado_componente = 'baja' WHERE id_componente = ?`;
    return await db.execute(req, sql, [id]);
  },

  async getDisponiblesEnAlmacen(req) {
    const sql = `
      SELECT c.id_componente,
        CASE 
          WHEN p.id_componente IS NOT NULL THEN 'procesador'
          WHEN ram.id_componente IS NOT NULL THEN 'memoria_ram'
          WHEN alm.id_componente IS NOT NULL THEN 'almacenamiento'
          WHEN gpu.id_componente IS NOT NULL THEN 'tarjeta_grafica'
          WHEN mb.id_componente IS NOT NULL THEN 'placa_madre'
          WHEN fp.id_componente IS NOT NULL THEN 'fuente_poder'
        END AS tipo,
        CASE 
          WHEN p.id_componente IS NOT NULL THEN CONCAT(p.marca, ' ', p.modelo)
          WHEN ram.id_componente IS NOT NULL THEN CONCAT(ram.marca, ' ', ram.capacidad_gb, 'GB ', ram.tipo_ddr)
          WHEN alm.id_componente IS NOT NULL THEN CONCAT(alm.marca, ' ', alm.modelo, ' (', alm.capacidad_gb, 'GB ', alm.tipo, ')')
          WHEN gpu.id_componente IS NOT NULL THEN CONCAT(gpu.marca, ' ', gpu.modelo, ' ', gpu.vram_gb, 'GB')
          WHEN mb.id_componente IS NOT NULL THEN CONCAT(mb.marca, ' ', mb.modelo, ' Socket ', mb.socket, ' ', mb.factor_forma)
          WHEN fp.id_componente IS NOT NULL THEN CONCAT(fp.marca, ' ', fp.modelo, ' ', fp.potencia_watts, 'W ', IFNULL(fp.certificacion, ''))
        END AS especificaciones
      FROM componente c
      LEFT JOIN procesador p ON c.id_componente = p.id_componente
      LEFT JOIN memoria_ram ram ON c.id_componente = ram.id_componente
      LEFT JOIN almacenamiento alm ON c.id_componente = alm.id_componente
      LEFT JOIN tarjeta_grafica gpu ON c.id_componente = gpu.id_componente
      LEFT JOIN placa_madre mb ON c.id_componente = mb.id_componente
      LEFT JOIN fuente_poder fp ON c.id_componente = fp.id_componente
      WHERE c.id_equipo IS NULL AND c.estado_componente = 'almacenado'
    `;
    const rows = await db.execute(req, sql);
    // Group by tipo
    const grouped = {
      procesador: [],
      memoria_ram: [],
      almacenamiento: [],
      tarjeta_grafica: [],
      placa_madre: [],
      fuente_poder: []
    };
    rows.forEach(r => {
      if (r.tipo && grouped[r.tipo]) {
        grouped[r.tipo].push(r);
      }
    });
    return grouped;
  },

  async duplicarComponente(req, id_componente_origen, nuevo_id_equipo) {
    // 1. Fetch original component details
    const orig = await this.getById(req, id_componente_origen);
    if (!orig) return;

    // 2. Create new component for nuevo_id_equipo
    const compSql = `INSERT INTO componente (id_equipo, estado_componente) VALUES (?, ?)`;
    const result = await db.execute(req, compSql, [nuevo_id_equipo, orig.estado_componente]);
    const nuevo_id_componente = result.insertId;

    // 3. Insert specific details
    let sql = '';
    let params = [];
    const d = orig.detalles;

    switch (orig.tipo) {
      case 'procesador':
        sql = `INSERT INTO procesador (id_componente, marca, modelo) VALUES (?, ?, ?)`;
        params = [nuevo_id_componente, d.marca, d.modelo];
        break;
      case 'memoria_ram':
        sql = `INSERT INTO memoria_ram (id_componente, marca, capacidad_gb, tipo_ddr) VALUES (?, ?, ?, ?)`;
        params = [nuevo_id_componente, d.marca, d.capacidad_gb, d.tipo_ddr];
        break;
      case 'almacenamiento':
        sql = `INSERT INTO almacenamiento (id_componente, marca, modelo, tipo, capacidad_gb) VALUES (?, ?, ?, ?, ?)`;
        params = [nuevo_id_componente, d.marca, d.modelo, d.tipo, d.capacidad_gb];
        break;
      case 'tarjeta_grafica':
        sql = `INSERT INTO tarjeta_grafica (id_componente, marca, modelo, vram_gb) VALUES (?, ?, ?, ?)`;
        params = [nuevo_id_componente, d.marca, d.modelo, d.vram_gb];
        break;
      case 'placa_madre':
        sql = `INSERT INTO placa_madre (id_componente, marca, modelo, socket, factor_forma) VALUES (?, ?, ?, ?, ?)`;
        params = [nuevo_id_componente, d.marca, d.modelo, d.socket, d.factor_forma];
        break;
      case 'fuente_poder':
        sql = `INSERT INTO fuente_poder (id_componente, marca, modelo, potencia_watts, certificacion) VALUES (?, ?, ?, ?, ?)`;
        params = [nuevo_id_componente, d.marca, d.modelo, d.potencia_watts, d.certificacion];
        break;
    }

    if (sql) {
      await db.execute(req, sql, params);
    }
    return nuevo_id_componente;
  }
};

module.exports = Componente;
