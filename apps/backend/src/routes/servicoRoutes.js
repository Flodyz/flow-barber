const express = require('express');
const ServicoController = require('../controllers/ServicoController');
const { authenticateToken, requireAdmin, requestLogger } = require('../middlewares/auth');

const router = express.Router();

// Aplicar middlewares
router.use(requestLogger);
router.use(authenticateToken);

// Rotas de consulta (todos podem ver)
router.get('/', ServicoController.listar);
router.get('/ativos', ServicoController.listarAtivos);
router.get('/:id', ServicoController.buscarPorId);
router.get('/:id/estatisticas', ServicoController.buscarEstatisticas);

// Rotas de modificação (apenas admin)
router.post('/', requireAdmin, ServicoController.criar);
router.put('/:id', requireAdmin, ServicoController.atualizar);
router.delete('/:id', requireAdmin, ServicoController.deletar);

module.exports = router;