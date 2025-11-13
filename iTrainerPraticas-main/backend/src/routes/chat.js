const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /api/chat/:agendamentoId/mensagens - lista mensagens
router.get('/chat/:agendamentoId/mensagens', async (req, res) => {
  const { agendamentoId } = req.params;
  try {
    const result = await pool.query(
      `SELECT mensagem_id, agendamento_id, remetente_id, tipo_remetente, conteudo, data_hora
       FROM chat_mensagens
       WHERE agendamento_id = $1
       ORDER BY data_hora ASC`,
      [agendamentoId]
    );
    res.json({ mensagens: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar mensagens', details: err.message });
  }
});

// POST /api/chat/:agendamentoId/mensagens - adiciona mensagem
router.post('/chat/:agendamentoId/mensagens', authMiddleware, async (req, res) => {
  const { agendamentoId } = req.params;
  const { remetente_id, tipo_remetente, conteudo } = req.body;
  if (!remetente_id || !tipo_remetente || !conteudo) {
    return res.status(400).json({ error: 'remetente_id, tipo_remetente e conteudo são obrigatórios.' });
  }
  if (!['CLIENTE','PROFISSIONAL'].includes(tipo_remetente)) {
    return res.status(400).json({ error: 'tipo_remetente deve ser CLIENTE ou PROFISSIONAL.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO chat_mensagens (agendamento_id, remetente_id, tipo_remetente, conteudo)
       VALUES ($1, $2, $3, $4)
       RETURNING mensagem_id, agendamento_id, remetente_id, tipo_remetente, conteudo, data_hora`,
      [agendamentoId, remetente_id, tipo_remetente, conteudo]
    );
    res.status(201).json({ mensagem: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar mensagem', details: err.message });
  }
});

module.exports = router;