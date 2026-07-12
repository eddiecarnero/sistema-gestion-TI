const bcrypt = require('bcrypt');
const Usuario = require('../models/usuarioModel');
const Tecnico = require('../models/tecnicoModel');
const db = require('../config/database');

const adminController = {
  // ---------------------------------------------------------
  // USER MANAGEMENT
  // ---------------------------------------------------------
  async indexUsuarios(req, res) {
    try {
      const usuarios = await Usuario.getAll(req);
      res.render('usuarios/index', { usuarios });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar usuarios' });
    }
  },

  async getCreateUsuario(req, res) {
    try {
      const areas = await Usuario.getAreas(req);
      res.render('usuarios/create', { areas });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar áreas' });
    }
  },

  async postCreateUsuario(req, res) {
    const { id_area, cargo, nombres, apellidos, correo, telefono, contrasena } = req.body;
    try {
      const hashedPass = await bcrypt.hash(contrasena, 10);
      await Usuario.create(req, {
        id_area,
        cargo,
        nombres,
        apellidos,
        correo,
        telefono,
        contrasena: hashedPass
      });
      res.redirect('/admin/usuarios');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al registrar el usuario' });
    }
  },

  async getEditUsuario(req, res) {
    const { id } = req.params;
    try {
      const user = await Usuario.getById(req, id);
      const areas = await Usuario.getAreas(req);
      res.render('usuarios/edit', { user, areas });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar el usuario' });
    }
  },

  async postEditUsuario(req, res) {
    const { id } = req.params;
    const { id_area, cargo, nombres, apellidos, correo, telefono, contrasena, estado } = req.body;
    try {
      const data = {
        id_area,
        cargo,
        nombres,
        apellidos,
        correo,
        telefono,
        estado: estado === '1'
      };
      if (contrasena && contrasena.trim() !== '') {
        data.contrasena = await bcrypt.hash(contrasena, 10);
      }
      await Usuario.update(req, id, data);
      res.redirect('/admin/usuarios');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al actualizar el usuario' });
    }
  },

  async postDeleteUsuario(req, res) {
    const { id } = req.params;
    try {
      await Usuario.delete(req, id);
      res.redirect('/admin/usuarios');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al inhabilitar el usuario' });
    }
  },

  // ---------------------------------------------------------
  // TECHNICIAN MANAGEMENT
  // ---------------------------------------------------------
  async indexTecnicos(req, res) {
    try {
      const tecnicos = await Tecnico.getAll(req);
      res.render('tecnicos/index', { tecnicos });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar técnicos' });
    }
  },

  async getCreateTecnico(req, res) {
    try {
      const rangos = await Tecnico.getRangos(req);
      // Filter out admin rank so admin cannot create another admin
      const filteredRangos = rangos.filter(r => r.nombre !== 'administrador');
      res.render('tecnicos/create', { rangos: filteredRangos });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar rangos' });
    }
  },

  async postCreateTecnico(req, res) {
    const { id_rango, nombres, apellidos, correo, telefono, contrasena } = req.body;
    try {
      // Security check: ensure they aren't trying to set id_rango of administrator (id 3)
      const rangos = await Tecnico.getRangos(req);
      const adminRango = rangos.find(r => r.nombre === 'administrador');
      if (adminRango && parseInt(id_rango) === adminRango.id_rango) {
        return res.status(403).render('error', { message: 'No está permitido crear otro administrador.' });
      }

      const hashedPass = await bcrypt.hash(contrasena, 10);
      await Tecnico.create(req, {
        id_rango,
        nombres,
        apellidos,
        correo,
        telefono,
        contrasena: hashedPass
      });
      res.redirect('/admin/tecnicos');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al registrar el técnico' });
    }
  },

  async getEditTecnico(req, res) {
    const { id } = req.params;
    try {
      const tecnico = await Tecnico.getById(req, id);
      const rangos = await Tecnico.getRangos(req);
      res.render('tecnicos/edit', { tecnico, rangos });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar el técnico' });
    }
  },

  async postEditTecnico(req, res) {
    const { id } = req.params;
    const { id_rango, nombres, apellidos, correo, telefono, contrasena, estado } = req.body;
    try {
      // Security check: If they are editing another user, prevent escalating them to administrator
      const targetTecnico = await Tecnico.getById(req, id);
      if (targetTecnico.rango_nombre !== 'administrador') {
        const rangos = await Tecnico.getRangos(req);
        const adminRango = rangos.find(r => r.nombre === 'administrador');
        if (adminRango && parseInt(id_rango) === adminRango.id_rango) {
          return res.status(403).render('error', { message: 'No está permitido ascender a administrador.' });
        }
      }

      const data = {
        id_rango,
        nombres,
        apellidos,
        correo,
        telefono,
        estado: estado === '1'
      };
      if (contrasena && contrasena.trim() !== '') {
        data.contrasena = await bcrypt.hash(contrasena, 10);
      }
      await Tecnico.update(req, id, data);
      res.redirect('/admin/tecnicos');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al actualizar el técnico' });
    }
  },

  async postDeleteTecnico(req, res) {
    const { id } = req.params;
    try {
      // Security check: cannot delete administrator
      const target = await Tecnico.getById(req, id);
      if (target.rango_nombre === 'administrador') {
        return res.status(403).render('error', { message: 'No se puede inhabilitar al administrador principal.' });
      }

      await Tecnico.delete(req, id);
      res.redirect('/admin/tecnicos');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al inhabilitar el técnico' });
    }
  },

  // ---------------------------------------------------------
  // AUDIT LOGS
  // ---------------------------------------------------------
  async indexAuditoria(req, res) {
    try {
      const sql = `
        SELECT a.*, t.nombres as tecnico_nombres, t.apellidos as tecnico_apellidos
        FROM auditoria_tecnico a
        JOIN tecnico t ON a.id_tecnico = t.id_tecnico
        ORDER BY a.fecha_realizado DESC
      `;
      const logs = await db.execute(req, sql);
      res.render('auditoria/index', { logs });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar registros de auditoría' });
    }
  },

  // ---------------------------------------------------------
  // METRICS & REPORTS (vista_metricas_personal)
  // ---------------------------------------------------------
  async indexMetricas(req, res) {
    try {
      const sql = `SELECT * FROM vista_metricas_personal`;
      const metricas = await db.execute(req, sql);
      res.render('metricas/index', { metricas });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar las métricas de personal' });
    }
  },

  // ---------------------------------------------------------
  // AREA MANAGEMENT
  // ---------------------------------------------------------
  async indexAreas(req, res) {
    try {
      const areas = await Usuario.getAreas(req);
      res.render('admin/areas', { areas });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar áreas' });
    }
  },

  async postCreateArea(req, res) {
    const { nombre } = req.body;
    try {
      await Usuario.createArea(req, nombre);
      res.redirect('/admin/areas');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al crear el área' });
    }
  },

  async postDeleteArea(req, res) {
    const { id } = req.params;
    try {
      await Usuario.deleteArea(req, id);
      res.redirect('/admin/areas');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al eliminar el área. Verifique si tiene usuarios asignados.' });
    }
  },

  // ---------------------------------------------------------
  // WAREHOUSE COMPONENT MANAGEMENT
  // ---------------------------------------------------------
  async indexComponentes(req, res) {
    try {
      const sql = `
        SELECT c.*, e.codigo_inventario,
        CASE 
          WHEN p.id_componente IS NOT NULL THEN 'procesador'
          WHEN ram.id_componente IS NOT NULL THEN 'memoria_ram'
          WHEN alm.id_componente IS NOT NULL THEN 'almacenamiento'
          WHEN gpu.id_componente IS NOT NULL THEN 'tarjeta_grafica'
          WHEN mb.id_componente IS NOT NULL THEN 'placa_madre'
          WHEN fp.id_componente IS NOT NULL THEN 'fuente_poder'
          ELSE 'otro'
        END AS tipo_componente,
        CASE 
          WHEN p.id_componente IS NOT NULL THEN CONCAT(p.marca, ' ', p.modelo)
          WHEN ram.id_componente IS NOT NULL THEN CONCAT(ram.marca, ' ', ram.capacidad_gb, 'GB ', ram.tipo_ddr)
          WHEN alm.id_componente IS NOT NULL THEN CONCAT(alm.marca, ' ', alm.modelo, ' (', alm.capacidad_gb, 'GB ', alm.tipo, ')')
          WHEN gpu.id_componente IS NOT NULL THEN CONCAT(gpu.marca, ' ', gpu.modelo, ' ', gpu.vram_gb, 'GB')
          WHEN mb.id_componente IS NOT NULL THEN CONCAT(mb.marca, ' ', mb.modelo, ' Socket ', mb.socket, ' ', mb.factor_forma)
          WHEN fp.id_componente IS NOT NULL THEN CONCAT(fp.marca, ' ', fp.modelo, ' ', fp.potencia_watts, 'W ', IFNULL(fp.certificacion, ''))
          ELSE 'Detalles no especificados'
        END AS especificaciones
        FROM componente c
        LEFT JOIN equipo e ON c.id_equipo = e.id_equipo
        LEFT JOIN procesador p ON c.id_componente = p.id_componente
        LEFT JOIN memoria_ram ram ON c.id_componente = ram.id_componente
        LEFT JOIN almacenamiento alm ON c.id_componente = alm.id_componente
        LEFT JOIN tarjeta_grafica gpu ON c.id_componente = gpu.id_componente
        LEFT JOIN placa_madre mb ON c.id_componente = mb.id_componente
        LEFT JOIN fuente_poder fp ON c.id_componente = fp.id_componente
        ORDER BY c.id_componente DESC
      `;
      const componentes = await db.execute(req, sql);
      res.render('admin/componentes/index', { componentes });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar los componentes' });
    }
  },

  getCreateComponente(req, res) {
    const { tipo } = req.query;
    res.render('admin/componentes/create', { tipo: tipo || 'procesador' });
  },

  async postCreateComponente(req, res) {
    const { tipo } = req.body;
    const Componente = require('../models/componenteModel');
    try {
      await Componente.create(req, null, tipo, {
        ...req.body,
        estado_componente: 'almacenado'
      });
      res.redirect('/admin/componentes');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al registrar el componente en almacén' });
    }
  }
};

module.exports = adminController;
