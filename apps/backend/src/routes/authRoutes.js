const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authenticateToken, requestLogger } = require('../middlewares/auth');

const router = express.Router();

// Aplicar middleware de log
router.use(requestLogger);

// Rotas públicas (não requerem autenticação)
router.post('/login', AuthController.login);

// Rotas protegidas (requerem autenticação)
router.use(authenticateToken);

router.get('/verify', AuthController.verificarToken);
router.post('/refresh', AuthController.renovarToken);
router.post('/logout', AuthController.logout);
router.put('/alterar-senha', AuthController.alterarSenha);

module.exports = router;