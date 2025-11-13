const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/profissionais - lista profissionais básicos
router.get('/profissionais', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT profissional_id, nome, email, created_at
       FROM profissionais
       ORDER BY created_at DESC
       LIMIT 100`
    );
    const items = result.rows.map((row) => ({
      id: row.profissional_id,
      nome: row.nome,
      email: row.email,
      created_at: row.created_at,
    }));
    res.json({ profissionais: items });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar profissionais', details: err.message });
  }
});

// GET /api/profissionais/:id - detalhes básicos (placeholder)
router.get('/profissionais/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT profissional_id, nome, email, created_at
       FROM profissionais
       WHERE profissional_id = $1
       LIMIT 1`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Profissional não encontrado.' });
    }
    const row = result.rows[0];
    res.json({ profissional: {
      id: row.profissional_id,
      nome: row.nome,
      email: row.email,
      created_at: row.created_at,
    } });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar profissional', details: err.message });
  }
});

module.exports = router;