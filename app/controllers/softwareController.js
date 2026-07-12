const Software = require('../models/softwareModel');
const Equipo = require('../models/equipoModel');

const softwareController = {
  // Catalog Software
  async indexCatalog(req, res) {
    try {
      const softwareList = await Software.getAll(req);
      res.render('software/catalog', { softwareList });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar el catálogo de software' });
    }
  },

  getCreateSoftware(req, res) {
    res.render('software/catalog_create');
  },

  async postCreateSoftware(req, res) {
    const { nombre } = req.body;
    try {
      await Software.create(req, { nombre });
      res.redirect('/software');
    } catch (err) {
      console.error(err);
      res.render('software/catalog_create', { error: 'Error al registrar el software. El nombre puede estar duplicado.' });
    }
  },

  async getEditSoftware(req, res) {
    const { id } = req.params;
    try {
      const sw = await Software.getById(req, id);
      res.render('software/catalog_edit', { sw });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar el formulario de edición' });
    }
  },

  async postEditSoftware(req, res) {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
      await Software.update(req, id, { nombre });
      res.redirect('/software');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al actualizar el software' });
    }
  },

  async postDeleteSoftware(req, res) {
    const { id } = req.params;
    try {
      await Software.delete(req, id);
      res.redirect('/software');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al eliminar el software. Puede estar instalado en algún equipo.' });
    }
  },

  // Installed Software
  async indexInstalado(req, res) {
    try {
      const instaladoList = await Software.getInstalado(req);
      res.render('software/instalado', { instaladoList });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar la lista de software instalado' });
    }
  },

  async getCreateInstalado(req, res) {
    try {
      const equipos = await Equipo.getAll(req);
      const catalog = await Software.getAll(req);
      res.render('software/instalado_create', { equipos, catalog });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar el formulario de instalación' });
    }
  },

  async postCreateInstalado(req, res) {
    try {
      await Software.createInstalado(req, req.body);
      res.redirect('/software/instalado');
    } catch (err) {
      console.error(err);
      const equipos = await Equipo.getAll(req);
      const catalog = await Software.getAll(req);
      res.render('software/instalado_create', { 
        equipos, 
        catalog, 
        error: 'Error al registrar la instalación. Revise las fechas y claves.' 
      });
    }
  },

  async getEditInstalado(req, res) {
    const { id } = req.params;
    try {
      const instalado = await Software.getInstaladoById(req, id);
      const equipos = await Equipo.getAll(req);
      const catalog = await Software.getAll(req);
      res.render('software/instalado_edit', { instalado, equipos, catalog });
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al cargar el formulario de edición de instalación' });
    }
  },

  async postEditInstalado(req, res) {
    const { id } = req.params;
    try {
      await Software.updateInstalado(req, id, req.body);
      res.redirect('/software/instalado');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al actualizar la instalación' });
    }
  },

  async postDeleteInstalado(req, res) {
    const { id } = req.params;
    try {
      await Software.deleteInstalado(req, id);
      res.redirect('/software/instalado');
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error al eliminar la instalación de software' });
    }
  }
};

module.exports = softwareController;
