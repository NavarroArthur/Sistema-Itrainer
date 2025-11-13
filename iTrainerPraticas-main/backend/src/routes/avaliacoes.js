const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');

// POST /api/avaliacoes - cria/atualiza avaliação única por cliente/profissional
router.post('/avaliacoes', authMiddleware, async (req, res) => {
  const { cliente_id, profissional_id, nota, comentario } = req.body;
  if (!cliente_id || !profissional_id || !nota) {
    return res.status(400).json({ error: 'cliente_id, profissional_id e nota são obrigatórios.' });
  }
  if (nota < 1 || nota > 5) {
    return res.status(400).json({ error: 'nota deve estar entre 1 e 5.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO avaliacoes (cliente_id, profissional_id, nota, comentario)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (cliente_id, profissional_id)
       DO UPDATE SET nota = EXCLUDED.nota, comentario = EXCLUDED.comentario
       RETURNING avaliacao_id, cliente_id, profissional_id, nota, comentario`,
      [cliente_id, profissional_id, nota, comentario || null]
    );
    res.status(201).json({ avaliacao: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar avaliação', details: err.message });
  }
});

module.exports = router;