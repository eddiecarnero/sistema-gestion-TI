const express = require('express');
const router = express.Router();
const softwareController = require('../controllers/softwareController');
const { isAuthenticated, isRole } = require('../middleware/auth');

// Catalog
router.get('/', isAuthenticated, isRole(['practicante', 'tecnico', 'administrador']), softwareController.indexCatalog);
router.get('/crear', isAuthenticated, isRole(['tecnico', 'administrador']), softwareController.getCreateSoftware);
router.post('/crear', isAuthenticated, isRole(['tecnico', 'administrador']), softwareController.postCreateSoftware);
router.get('/:id/editar', isAuthenticated, isRole(['tecnico', 'administrador']), softwareController.getEditSoftware);
router.post('/:id/editar', isAuthenticated, isRole(['tecnico', 'administrador']), softwareController.postEditSoftware);
router.post('/:id/eliminar', isAuthenticated, isRole(['administrador']), softwareController.postDeleteSoftware);

// Installed instances
router.get('/instalado', isAuthenticated, isRole(['practicante', 'tecnico', 'administrador']), softwareController.indexInstalado);
router.get('/instalado/crear', isAuthenticated, isRole(['tecnico', 'administrador']), softwareController.getCreateInstalado);
router.post('/instalado/crear', isAuthenticated, isRole(['tecnico', 'administrador']), softwareController.postCreateInstalado);
router.get('/instalado/:id/editar', isAuthenticated, isRole(['tecnico', 'administrador']), softwareController.getEditInstalado);
router.post('/instalado/:id/editar', isAuthenticated, isRole(['tecnico', 'administrador']), softwareController.postEditInstalado);
router.post('/instalado/:id/eliminar', isAuthenticated, isRole(['administrador']), softwareController.postDeleteInstalado);

module.exports = router;
