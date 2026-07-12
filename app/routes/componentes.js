const express = require('express');
const router = express.Router();
const componenteController = require('../controllers/componenteController');
const { isAuthenticated, isRole } = require('../middleware/auth');

router.get('/equipo/:equipoId', isAuthenticated, isRole(['practicante', 'tecnico', 'administrador']), componenteController.index);
router.get('/equipo/:equipoId/crear', isAuthenticated, isRole(['tecnico', 'administrador']), componenteController.getCreate);
router.post('/equipo/:equipoId/crear', isAuthenticated, isRole(['tecnico', 'administrador']), componenteController.postCreate);

router.get('/:id/editar', isAuthenticated, isRole(['tecnico', 'administrador']), componenteController.getEdit);
router.post('/:id/editar', isAuthenticated, isRole(['tecnico', 'administrador']), componenteController.postEdit);
router.post('/:id/eliminar', isAuthenticated, isRole(['administrador']), componenteController.postDelete);

module.exports = router;
