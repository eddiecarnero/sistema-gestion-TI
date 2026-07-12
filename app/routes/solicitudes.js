const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');
const { isAuthenticated, isRole } = require('../middleware/auth');

router.get('/', isAuthenticated, isRole(['jefe', 'tecnico', 'administrador']), solicitudController.index);
router.get('/crear', isAuthenticated, isRole(['jefe']), solicitudController.getCreate);
router.post('/crear', isAuthenticated, isRole(['jefe']), solicitudController.postCreate);

router.get('/:id', isAuthenticated, isRole(['jefe', 'tecnico', 'administrador']), solicitudController.show);
router.post('/:id/responder', isAuthenticated, isRole(['administrador']), solicitudController.postResponder);

module.exports = router;
