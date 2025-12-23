const express = require('express');
const BarbeiroController = require('../controllers/BarbeiroController');
const { authenticateToken, requireAdminOrOwnBarbeiro, requestLogger } = require('../middlewares/auth');

const router = express.Router();

// Aplicar middlewares
router.use(requestLogger);
router.use(authenticateToken);

// Rotas de consulta (todos podem ver)
router.get('/', BarbeiroController.listar);
router.get('/disponiveis', BarbeiroController.buscarDisponiveis);
router.get('/:id', BarbeiroController.buscarPorId);
router.get('/:id/horarios-disponiveis', BarbeiroController.buscarHorariosDisponiveis);

// Rotas de modificação (apenas admin ou próprio barbeiro)
const { requireAdmin } = require('../middlewares/auth');
router.post('/', requireAdmin, BarbeiroController.criar);
router.put('/:id', requireAdminOrOwnBarbeiro, BarbeiroController.atualizar);
router.delete('/:id', requireAdmin, BarbeiroController.deletar);
router.get('/:id/estatisticas', requireAdminOrOwnBarbeiro, BarbeiroController.buscarEstatisticas);

module.exports = router;