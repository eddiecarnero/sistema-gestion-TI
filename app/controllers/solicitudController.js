const Solicitud = require('../models/solicitudModel');

const solicitudController = {
  async index(req, res) {
    const user = req.session.user;
    try {
      let solicitudes;
      if (user.rol === 'jefe') {
        solicitudes = await Solicitud.getByUsuario(req, user.id);
      } else {
        // Staff see all
        solicitudes = await Solicitud.getAll(req);
      }
      res.render('solicitudes/index', { solicitudes });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al listar las solicitudes' });
    }
  },

  async show(req, res) {
    const { id } = req.params;
    try {
      const solicitud = await Solicitud.getById(req, id);
      if (!solicitud) {
        return res.status(404).render('error', { message: 'Solicitud no encontrada' });
      }
      res.render('solicitudes/show', { solicitud });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar los detalles de la solicitud' });
    }
  },

  getCreate(req, res) {
    res.render('solicitudes/create');
  },

  async postCreate(req, res) {
    const user = req.session.user;
    const { tipo, descripcion } = req.body;
    try {
      await Solicitud.create(req, {
        id_usuario_solicita: user.id,
        tipo,
        descripcion
      });
      res.redirect('/solicitudes');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al enviar la solicitud' });
    }
  },

  async postResponder(req, res) {
    const { id } = req.params;
    const { estado } = req.body; // 'aprobada', 'rechazada' o 'completada'
    try {
      await Solicitud.responder(req, id, estado);
      res.redirect(`/solicitudes/${id}`);
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al responder a la solicitud' });
    }
  }
};

module.exports = solicitudController;
