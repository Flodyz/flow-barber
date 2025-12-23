const express = require('express');
const AgendamentoController = require('../controllers/AgendamentoController');
const { authenticateToken, requireAdmin, requestLogger } = require('../middlewares/auth');

const router = express.Router();

// Aplicar middlewares
router.use(requestLogger);
router.use(authenticateToken);

// Rotas de consulta
router.get('/', AgendamentoController.listar);
router.get('/proximos', AgendamentoController.buscarProximos);
router.get('/disponibilidade', AgendamentoController.verificarDisponibilidade);
router.get('/data/:data', AgendamentoController.buscarPorData);
router.get('/barbeiro/:barbeiro_id', AgendamentoController.buscarPorBarbeiro);
router.get('/:id', AgendamentoController.buscarPorId);

// Rotas de modificação
router.post('/', AgendamentoController.criar);
router.put('/:id', AgendamentoController.atualizar);
router.patch('/:id/cancelar', AgendamentoController.cancelar);
router.delete('/:id', AgendamentoController.deletar);

module.exports = router;