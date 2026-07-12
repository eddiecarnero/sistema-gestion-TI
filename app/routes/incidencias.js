const express = require('express');
const router = express.Router();
const incidenciaController = require('../controllers/incidenciaController');
const { isAuthenticated, isRole } = require('../middleware/auth');

router.get('/', isAuthenticated, incidenciaController.index);
router.get('/mis-tickets', isAuthenticated, isRole(['practicante', 'tecnico', 'administrador']), incidenciaController.misTickets);
router.get('/crear', isAuthenticated, incidenciaController.getCreate);
router.post('/crear', isAuthenticated, incidenciaController.postCreate);

router.get('/:id', isAuthenticated, incidenciaController.show);
router.get('/:id/editar', isAuthenticated, isRole(['tecnico', 'administrador']), incidenciaController.getEdit);
router.post('/:id/editar', isAuthenticated, isRole(['tecnico', 'administrador']), incidenciaController.postEdit);

router.post('/:id/asignar', isAuthenticated, isRole(['administrador']), incidenciaController.postAsignar);
router.post('/:id/seguimiento', isAuthenticated, isRole(['practicante', 'tecnico', 'administrador']), incidenciaController.postCreateSeguimiento);

module.exports = router;
