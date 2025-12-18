const express = require('express');
const ClienteController = require('../controllers/ClienteController');
const { authenticateToken, requestLogger } = require('../middlewares/auth');

const router = express.Router();

// Aplicar middlewares
router.use(requestLogger);
router.use(authenticateToken);

// Rotas de clientes
router.post('/', ClienteController.criar);
router.get('/', ClienteController.listar);
router.get('/buscar', ClienteController.buscar);
router.get('/:id', ClienteController.buscarPorId);
router.put('/:id', ClienteController.atualizar);
router.delete('/:id', ClienteController.deletar);
router.get('/:id/agendamentos', ClienteController.buscarAgendamentos);

module.exports = router;