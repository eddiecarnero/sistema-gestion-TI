const Componente = require('../models/componenteModel');
const Equipo = require('../models/equipoModel');

const componenteController = {
  async index(req, res) {
    const { equipoId } = req.params;
    try {
      const equipo = await Equipo.getById(req, equipoId);
      if (!equipo) {
        return res.status(404).render('error', { message: 'Equipo no encontrado' });
      }
      const componentes = await Componente.getByEquipo(req, equipoId);
      res.render('componentes/index', { equipo, componentes });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al listar componentes' });
    }
  },

  async getCreate(req, res) {
    const { equipoId } = req.params;
    const { tipo } = req.query; // 'procesador', 'memoria_ram', etc.
    try {
      const equipo = await Equipo.getById(req, equipoId);
      res.render('componentes/create', { equipo, tipo: tipo || 'procesador' });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar el formulario de registro' });
    }
  },

  async postCreate(req, res) {
    const { equipoId } = req.params;
    const { tipo } = req.body;
    try {
      // Check if restricted type already exists on this equipment
      if (['procesador', 'placa_madre', 'fuente_poder', 'tarjeta_grafica'].includes(tipo)) {
        const pool = require('../config/database').pool;
        const [existing] = await pool.query(
          `SELECT COUNT(*) as count FROM componente c JOIN \`${tipo}\` t ON c.id_componente = t.id_componente WHERE c.id_equipo = ? AND c.estado_componente != 'baja'`,
          [equipoId]
        );
        if (existing[0].count > 0) {
          const equipo = await Equipo.getById(req, equipoId);
          return res.render('componentes/create', { 
            equipo, 
            tipo, 
            error: `Este equipo ya cuenta con un componente de tipo ${tipo.replace('_', ' ')}. Solo se permite uno a la vez (excepto RAM y Almacenamiento).` 
          });
        }
      }
      await Componente.create(req, equipoId, tipo, req.body);
      res.redirect(`/componentes/equipo/${equipoId}`);
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al registrar el componente' });
    }
  },

  async getEdit(req, res) {
    const { id } = req.params;
    try {
      const componente = await Componente.getById(req, id);
      if (!componente) {
        return res.status(404).render('error', { message: 'Componente no encontrado' });
      }
      const equipo = await Equipo.getById(req, componente.id_equipo);
      res.render('componentes/edit', { componente, equipo });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar el formulario de edición' });
    }
  },

  async postEdit(req, res) {
    const { id } = req.params;
    const { tipo, id_equipo } = req.body;
    try {
      await Componente.update(req, id, tipo, req.body);
      res.redirect(`/componentes/equipo/${id_equipo}`);
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al actualizar el componente' });
    }
  },

  async postDelete(req, res) {
    const { id } = req.params;
    const { id_equipo } = req.body;
    try {
      await Componente.delete(req, id);
      res.redirect(`/componentes/equipo/${id_equipo}`);
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al eliminar el componente' });
    }
  }
};

module.exports = componenteController;
