const Incidencia = require('../models/incidenciaModel');
const Equipo = require('../models/equipoModel');
const Tecnico = require('../models/tecnicoModel');
const Componente = require('../models/componenteModel');

const incidenciaController = {
  async index(req, res) {
    const user = req.session.user;
    const { estado, prioridad, id_tecnico_recibe } = req.query;
    try {
      const filters = { estado, prioridad, id_tecnico_recibe };
      
      // If user is employee or boss, filter by their reported incidents
      if (user.tabla === 'usuario') {
        filters.id_usuario_reporta = user.id;
      }
      
      const incidencias = await Incidencia.getAll(req, filters);
      const tecnicos = await Tecnico.getAll(req);
      res.render('incidencias/index', { 
        incidencias, 
        tecnicos,
        filters: { 
          estado: estado || 'todos', 
          prioridad: prioridad || 'todos',
          id_tecnico_recibe: id_tecnico_recibe || 'todos'
        } 
      });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al listar las incidencias' });
    }
  },

  async misTickets(req, res) {
    const user = req.session.user;
    try {
      const filters = { id_tecnico_recibe: user.id };
      const incidencias = await Incidencia.getAll(req, filters);
      res.render('incidencias/mis_tickets', { incidencias });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar tus tickets asignados' });
    }
  },

  async show(req, res) {
    const { id } = req.params;
    try {
      const incidencia = await Incidencia.getById(req, id);
      if (!incidencia) {
        return res.status(404).render('error', { message: 'Incidencia no encontrada' });
      }
      const seguimientos = await Incidencia.getSeguimientos(req, id);
      const tecnicos = await Tecnico.getAll(req); // for assignment select
      const componentes = await Componente.getByEquipo(req, incidencia.id_equipo); // for seguimiento component change select
      
      res.render('incidencias/show', { incidencia, seguimientos, tecnicos, componentes });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar los detalles de la incidencia' });
    }
  },

  async getCreate(req, res) {
    try {
      const equipos = await Equipo.getAll(req);
      res.render('incidencias/create', { equipos });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar el formulario de registro' });
    }
  },

  async postCreate(req, res) {
    const user = req.session.user;
    const { id_equipo, descripcion, prioridad } = req.body;
    try {
      const data = {
        id_equipo,
        descripcion,
        prioridad: prioridad || 'media',
        estado: 'pendiente'
      };
      if (user.tabla === 'tecnico') {
        data.id_tecnico_reporta = user.id;
      } else {
        data.id_usuario_reporta = user.id;
      }
      await Incidencia.create(req, data);
      res.redirect('/incidencias');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al reportar la incidencia' });
    }
  },

  async getEdit(req, res) {
    const { id } = req.params;
    try {
      const incidencia = await Incidencia.getById(req, id);
      const equipos = await Equipo.getAll(req);
      const tecnicos = await Tecnico.getAll(req);
      res.render('incidencias/edit', { incidencia, equipos, tecnicos });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar el formulario de edición' });
    }
  },

  async postEdit(req, res) {
    const { id } = req.params;
    const user = req.session.user;
    try {
      const inc = await Incidencia.getById(req, id);
      if (!inc) {
        return res.status(404).render('error', { message: 'Incidencia no encontrada' });
      }

      // Check permissions
      let assignedTechRank = null;
      if (inc.id_tecnico_recibe) {
        const pool = require('../config/database').pool;
        const [techRow] = await pool.query(`
          SELECT r.nombre as rango_nombre 
          FROM tecnico t 
          JOIN rango_tecnico r ON t.id_rango = r.id_rango 
          WHERE t.id_tecnico = ?
        `, [inc.id_tecnico_recibe]);
        assignedTechRank = techRow && techRow[0] ? techRow[0].rango_nombre : null;
      }

      let canModify = false;
      if (user.rol === 'administrador') {
        canModify = true;
      } else if (user.rol === 'tecnico') {
        if (inc.id_tecnico_recibe === user.id || assignedTechRank === 'practicante') {
          canModify = true;
        }
      } else if (user.rol === 'practicante') {
        if (inc.id_tecnico_recibe === user.id) {
          canModify = true;
        }
      }

      if (!canModify) {
        return res.status(403).render('error', { 
          message: 'No tiene permisos para modificar esta incidencia. Solo puede modificar incidencias asignadas a usted (o de practicantes en caso de técnicos).' 
        });
      }

      // If practicante resolves or closes, override to 'por_confirmar'
      const data = { ...req.body };
      if (user.rol === 'practicante' && ['resuelta', 'cerrada'].includes(data.estado)) {
        data.estado = 'por_confirmar';
      }

      await Incidencia.update(req, id, data);
      res.redirect(`/incidencias/${id}`);
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al actualizar la incidencia' });
    }
  },

  async postAsignar(req, res) {
    const { id } = req.params;
    const { id_tecnico_recibe } = req.body;
    const user = req.session.user;
    try {
      const db = require('../config/database');
      // Invocar procedimiento almacenado para asignar incidencia con validación de límites y roles
      await db.execute(req, `CALL sp_asignar_incidencia(?, ?, ?)`, [id, id_tecnico_recibe, user.id]);
      res.redirect(`/incidencias/${id}`);
    } catch (err) {
      console.error(err);
      res.status(400).render('error', { 
        message: err.sqlMessage || 'Error al asignar la incidencia. Verifique las reglas de asignación.' 
      });
    }
  },

  // Seguimiento creation
  async postCreateSeguimiento(req, res) {
    const { id } = req.params; // id_incidencia
    const user = req.session.user;
    const { diagnostico, trabajo_realizado, horas_invertidas, id_componente_cambiado, estado_incidencia } = req.body;
    try {
      const inc = await Incidencia.getById(req, id);
      if (!inc) {
        return res.status(404).render('error', { message: 'Incidencia no encontrada' });
      }

      // Check permissions
      let assignedTechRank = null;
      if (inc.id_tecnico_recibe) {
        const pool = require('../config/database').pool;
        const [techRow] = await pool.query(`
          SELECT r.nombre as rango_nombre 
          FROM tecnico t 
          JOIN rango_tecnico r ON t.id_rango = r.id_rango 
          WHERE t.id_tecnico = ?
        `, [inc.id_tecnico_recibe]);
        assignedTechRank = techRow && techRow[0] ? techRow[0].rango_nombre : null;
      }

      let canModify = false;
      if (user.rol === 'administrador') {
        canModify = true;
      } else if (user.rol === 'tecnico') {
        if (inc.id_tecnico_recibe === user.id || assignedTechRank === 'practicante') {
          canModify = true;
        }
      } else if (user.rol === 'practicante') {
        if (inc.id_tecnico_recibe === user.id) {
          canModify = true;
        }
      }

      if (!canModify) {
        return res.status(403).render('error', { 
          message: 'No tiene permisos para modificar o agregar información a esta incidencia. Solo puede interactuar con tickets que tiene asignados (o de un practicante, en caso de técnicos).' 
        });
      }

      // 1. Invocar al procedimiento almacenado para registrar el seguimiento y actualizar la incidencia
      const db = require('../config/database');
      await db.execute(req, `CALL sp_registrar_seguimiento(?, ?, ?, ?, ?, ?, ?)`, [
        id,
        user.id,
        diagnostico,
        trabajo_realizado,
        horas_invertidas,
        id_componente_cambiado || null,
        estado_incidencia
      ]);

      res.redirect(`/incidencias/${id}`);
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al registrar el seguimiento' });
    }
  }
};

module.exports = incidenciaController;
