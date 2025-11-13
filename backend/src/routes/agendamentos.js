const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');

// POST /api/agendamentos - cria agendamento
router.post('/agendamentos', authMiddleware, async (req, res) => {
  const { cliente_id, profissional_id, data_hora, status } = req.body;
  if (!cliente_id || !profissional_id || !data_hora) {
    return res.status(400).json({ error: 'cliente_id, profissional_id e data_hora são obrigatórios.' });
  }
  try {
    const st = status && ['PENDENTE','CONFIRMADO','CANCELADO','CONCLUIDO'].includes(status) ? status : 'PENDENTE';
    const result = await pool.query(
      `INSERT INTO agendamentos (data_hora, status, cliente_id, profissional_id)
       VALUES ($1, $2, $3, $4)
       RETURNING agendamento_id, data_hora, status, cliente_id, profissional_id`,
      [data_hora, st, cliente_id, profissional_id]
    );
    res.status(201).json({ agendamento: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar agendamento', details: err.message });
  }
});

// GET /api/agendamentos?cliente_id=&profissional_id=&status= - lista agendamentos
router.get('/agendamentos', async (req, res) => {
  const { cliente_id, profissional_id, status } = req.query;
  let where = [];
  let params = [];
  if (cliente_id) { params.push(cliente_id); where.push(`cliente_id = $${params.length}`); }
  if (profissional_id) { params.push(profissional_id); where.push(`profissional_id = $${params.length}`); }
  if (status) {
    const statuses = String(status).split(',').map((s) => s.trim().toUpperCase());
    const allowed = ['PENDENTE','CONFIRMADO','CANCELADO','CONCLUIDO'];
    const filtered = statuses.filter((s) => allowed.includes(s));
    if (filtered.length > 0) {
      // SQLite não tem ANY(), usa IN() ao invés
      const placeholders = filtered.map((_, i) => `$${params.length + i + 1}`).join(',');
      params.push(...filtered);
      where.push(`status IN (${placeholders})`);
    }
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  try {
    const result = await pool.query(
      `SELECT agendamento_id, data_hora, status, cliente_id, profissional_id
       FROM agendamentos ${whereSql}
       ORDER BY data_hora DESC
       LIMIT 100`,
      params
    );
    res.json({ agendamentos: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos', details: err.message });
  }
});

// PATCH /api/agendamentos/:id/status - atualiza status (pendente->confirmado/cancelado/concluido)
router.patch('/agendamentos/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['PENDENTE','CONFIRMADO','CANCELADO','CONCLUIDO'];
  if (!allowed.includes(String(status).toUpperCase())) {
    return res.status(400).json({ error: 'Status inválido.' });
  }
  try {
    // Permitir atualização por cliente ou profissional envolvido
    const existing = await pool.query(
      `SELECT cliente_id, profissional_id FROM agendamentos WHERE agendamento_id = $1 LIMIT 1`,
      [id]
    );
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }
    const row = existing.rows[0];
    const isCliente = req.user?.tipo === 'cliente' && row.cliente_id === req.user.id;
    const isProf = req.user?.tipo === 'profissional' && row.profissional_id === req.user.id;
    if (!isCliente && !isProf) {
      return res.status(403).json({ error: 'Sem permissão para atualizar este agendamento.' });
    }
    const result = await pool.query(
      `UPDATE agendamentos SET status = $1 WHERE agendamento_id = $2
       RETURNING agendamento_id, data_hora, status, cliente_id, profissional_id`,
      [String(status).toUpperCase(), id]
    );
    res.json({ agendamento: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status', details: err.message });
  }
});

module.exports = router;