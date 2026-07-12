const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController');
const { isAuthenticated, isRole } = require('../middleware/auth');

// All staff can list and view details
router.get('/', isAuthenticated, isRole(['practicante', 'tecnico', 'administrador']), equipoController.index);
router.get('/crear', isAuthenticated, isRole(['tecnico', 'administrador']), equipoController.getCreate);
router.post('/crear', isAuthenticated, isRole(['tecnico', 'administrador']), equipoController.postCreate);

// Multi-equipment creation step routes
router.get('/crear/detalle-laptop', isAuthenticated, isRole(['tecnico', 'administrador']), equipoController.getCreateLaptopDetalleStep);
router.post('/crear/detalle-laptop', isAuthenticated, isRole(['tecnico', 'administrador']), equipoController.postCreateLaptopDetalleStep);
router.get('/crear/detalle-pc-comprada', isAuthenticated, isRole(['tecnico', 'administrador']), equipoController.getCreatePCCompradaStep);
router.post('/crear/detalle-pc-comprada', isAuthenticated, isRole(['tecnico', 'administrador']), equipoController.postCreatePCCompradaStep);
router.get('/crear/detalle-pc-ensamblada', isAuthenticated, isRole(['tecnico', 'administrador']), equipoController.getCreatePCEnsambladaStep);
router.post('/crear/detalle-pc-ensamblada', isAuthenticated, isRole(['tecnico', 'administrador']), equipoController.postCreatePCEnsambladaStep);

router.get('/:id', isAuthenticated, isRole(['practicante', 'tecnico', 'administrador']), equipoController.show);
router.get('/:id/editar', isAuthenticated, isRole(['tecnico', 'administrador']), equipoController.getEdit);
router.post('/:id/editar', isAuthenticated, isRole(['tecnico', 'administrador']), equipoController.postEdit);
router.post('/:id/eliminar', isAuthenticated, isRole(['administrador']), equipoController.postDelete);

// Laptop detail routes (singular)
router.get('/:id/laptop-detalle/crear', isAuthenticated, isRole(['tecnico', 'administrador']), equipoController.getCreateLaptopDetalle);
router.post('/:id/laptop-detalle/crear', isAuthenticated, isRole(['tecnico', 'administrador']), equipoController.postCreateLaptopDetalle);
router.get('/:id/laptop-detalle/editar', isAuthenticated, isRole(['tecnico', 'administrador']), equipoController.getEditLaptopDetalle);
router.post('/:id/laptop-detalle/editar', isAuthenticated, isRole(['tecnico', 'administrador']), equipoController.postEditLaptopDetalle);

// Assignment routes
router.get('/:id/asignar', isAuthenticated, isRole(['administrador']), equipoController.getAsignar);
router.post('/:id/asignar', isAuthenticated, isRole(['administrador']), equipoController.postAsignar);
router.post('/:id/asignacion/:id_asignacion/terminar', isAuthenticated, isRole(['administrador']), equipoController.postTerminarAsignacion);

module.exports = router;
