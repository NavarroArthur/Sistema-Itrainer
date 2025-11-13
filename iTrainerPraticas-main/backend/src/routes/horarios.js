const express = require('express');
const router = express.Router();
const { pool, db } = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Map dias semana: 0=Segunda ... 5=Sábado (mantém compatibilidade visual)
const DIA_INDEX = {
  'Segunda': 0,
  'Terça': 1,
  'Quarta': 2,
  'Quinta': 3,
  'Sexta': 4,
  'Sábado': 5,
  'Domingo': 6,
};

// GET /api/horarios?profissional_id=&dia_semana=
router.get('/horarios', async (req, res) => {
  const { profissional_id, dia_semana } = req.query;
  if (!profissional_id) {
    return res.status(400).json({ error: 'profissional_id é obrigatório.' });
  }
  const where = ['profissional_id = $1'];
  const params = [profissional_id];
  if (dia_semana !== undefined) {
    params.push(Number(dia_semana));
    where.push(`dia_semana = $${params.length}`);
  }
  try {
    const result = await pool.query(
      `SELECT horario_id, profissional_id, dia_semana, hora_inicio, hora_fim, ativo
       FROM horarios_profissionais
       WHERE ${where.join(' AND ')}
       ORDER BY dia_semana ASC, hora_inicio ASC`
      , params
    );
    res.json({ horarios: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar horários', details: err.message });
  }
});

// POST /api/horarios - upsert de um slot
// body: { dia_semana|dia_texto, hora_inicio, hora_fim, ativo }
router.post('/horarios', authMiddleware, async (req, res) => {
  if (req.user?.tipo !== 'profissional') {
    return res.status(403).json({ error: 'Apenas profissionais podem gerenciar horários.' });
  }
  const profissional_id = req.user.id;
  let { dia_semana, dia_texto, hora_inicio, hora_fim, ativo } = req.body;
  if (dia_semana == null && dia_texto) {
    dia_semana = DIA_INDEX[dia_texto];
  }
  if (dia_semana == null || !hora_inicio || !hora_fim) {
    return res.status(400).json({ error: 'dia_semana (0-6), hora_inicio e hora_fim são obrigatórios.' });
  }
  const isActive = typeof ativo === 'boolean' ? ativo : true;
  try {
    // SQLite ON CONFLICT usa sintaxe ligeiramente diferente
    const result = await pool.query(
      `INSERT INTO horarios_profissionais (profissional_id, dia_semana, hora_inicio, hora_fim, ativo)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (profissional_id, dia_semana, hora_inicio, hora_fim)
       DO UPDATE SET ativo = EXCLUDED.ativo, updated_at = CURRENT_TIMESTAMP
       RETURNING horario_id, profissional_id, dia_semana, hora_inicio, hora_fim, ativo`,
      [profissional_id, Number(dia_semana), hora_inicio, hora_fim, isActive]
    );
    res.status(201).json({ horario: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar horário', details: err.message });
  }
});

// POST /api/horarios/bulk - upsert em lote de slots
// body: { slots: [{ dia_semana|dia_texto, hora_inicio, hora_fim, ativo }] }
router.post('/horarios/bulk', authMiddleware, async (req, res) => {
  if (req.user?.tipo !== 'profissional') {
    return res.status(403).json({ error: 'Apenas profissionais podem gerenciar horários.' });
  }
  const profissional_id = req.user.id;
  const { slots } = req.body;
  if (!Array.isArray(slots) || slots.length === 0) {
    return res.status(400).json({ error: 'slots deve ser um array não-vazio.' });
  }
  try {
    // Usa transação do SQLite
    const transaction = db.transaction((slots) => {
      const results = [];
      const stmt = db.prepare(`
        INSERT INTO horarios_profissionais (profissional_id, dia_semana, hora_inicio, hora_fim, ativo)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT (profissional_id, dia_semana, hora_inicio, hora_fim)
        DO UPDATE SET ativo = EXCLUDED.ativo, updated_at = CURRENT_TIMESTAMP
      `);
      
      for (const s of slots) {
        let ds = s.dia_semana;
        if (ds == null && s.dia_texto) ds = DIA_INDEX[s.dia_texto];
        const isActive = typeof s.ativo === 'boolean' ? s.ativo : true;
        stmt.run(profissional_id, Number(ds), s.hora_inicio, s.hora_fim, isActive ? 1 : 0);
        
        // Busca o registro inserido/atualizado
        const selectStmt = db.prepare(`
          SELECT horario_id, profissional_id, dia_semana, hora_inicio, hora_fim, ativo
          FROM horarios_profissionais
          WHERE profissional_id = ? AND dia_semana = ? AND hora_inicio = ? AND hora_fim = ?
        `);
        const row = selectStmt.get(profissional_id, Number(ds), s.hora_inicio, s.hora_fim);
        if (row) {
          results.push(row);
        }
      }
      return results;
    });
    
    const results = transaction(slots);
    res.status(201).json({ horarios: results });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar horários em lote', details: err.message });
  }
});

// DELETE /api/horarios/:id - remove slot (do profissional logado)
router.delete('/horarios/:id', authMiddleware, async (req, res) => {
  if (req.user?.tipo !== 'profissional') {
    return res.status(403).json({ error: 'Apenas profissionais podem gerenciar horários.' });
  }
  const profissional_id = req.user.id;
  const { id } = req.params;
  try {
    const r = await pool.query(
      `DELETE FROM horarios_profissionais WHERE horario_id = $1 AND profissional_id = $2`,
      [id, profissional_id]
    );
    if (r.rowCount === 0) {
      return res.status(404).json({ error: 'Horário não encontrado.' });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover horário', details: err.message });
  }
});

module.exports = router;