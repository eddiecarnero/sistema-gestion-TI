const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isRole } = require('../middleware/auth');

// Apply admin protection to all routes in this router
router.use(isAuthenticated, isRole(['administrador']));

// User management
router.get('/usuarios', adminController.indexUsuarios);
router.get('/usuarios/crear', adminController.getCreateUsuario);
router.post('/usuarios/crear', adminController.postCreateUsuario);
router.get('/usuarios/:id/editar', adminController.getEditUsuario);
router.post('/usuarios/:id/editar', adminController.postEditUsuario);
router.post('/usuarios/:id/eliminar', adminController.postDeleteUsuario);

// Technician management
router.get('/tecnicos', adminController.indexTecnicos);
router.get('/tecnicos/crear', adminController.getCreateTecnico);
router.post('/tecnicos/crear', adminController.postCreateTecnico);
router.get('/tecnicos/:id/editar', adminController.getEditTecnico);
router.post('/tecnicos/:id/editar', adminController.postEditTecnico);
router.post('/tecnicos/:id/eliminar', adminController.postDeleteTecnico);

// Area management
router.get('/areas', adminController.indexAreas);
router.post('/areas/crear', adminController.postCreateArea);
router.post('/areas/:id/eliminar', adminController.postDeleteArea);

// Auditoría log view
router.get('/auditoria', adminController.indexAuditoria);

// SQL Views metrics
router.get('/metricas', adminController.indexMetricas);

// Warehouse Component management
router.get('/componentes', adminController.indexComponentes);
router.get('/componentes/crear', adminController.getCreateComponente);
router.post('/componentes/crear', adminController.postCreateComponente);

module.exports = router;
