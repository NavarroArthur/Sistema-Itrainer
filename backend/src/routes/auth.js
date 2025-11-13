const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Cadastro de Clientes
router.post('/cadastro/clientes', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }
  try {
    // Verifica se já existe
    const exists = await pool.query('SELECT cliente_id FROM clientes WHERE email = $1 LIMIT 1', [email]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ error: 'Email já cadastrado.' });
    }
    // Hash da senha
    const hash = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      `INSERT INTO clientes (nome, email, senha)
       VALUES ($1, $2, $3)
       RETURNING cliente_id, nome, email`,
      [nome, email, hash]
    );
    const user = result.rows[0];
    // Opcional: já retorna token para login automático pós-cadastro
    const token = jwt.sign({ sub: user.cliente_id, tipo: 'cliente' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.status(201).json({
      user: {
        id: user.cliente_id,
        nome: user.nome,
        email: user.email,
        tipo: 'cliente',
      },
      token,
      message: 'Cadastro realizado com sucesso.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao cadastrar cliente', details: err.message });
  }
});

// Cadastro de Profissionais
router.post('/cadastro/profissionais', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }
  try {
    const exists = await pool.query('SELECT profissional_id FROM profissionais WHERE email = $1 LIMIT 1', [email]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ error: 'Email já cadastrado.' });
    }
    const hash = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      `INSERT INTO profissionais (nome, email, senha)
       VALUES ($1, $2, $3)
       RETURNING profissional_id, nome, email`,
      [nome, email, hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ sub: user.profissional_id, tipo: 'profissional' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.status(201).json({
      user: {
        id: user.profissional_id,
        nome: user.nome,
        email: user.email,
        tipo: 'profissional',
      },
      token,
      message: 'Cadastro realizado com sucesso.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao cadastrar profissional', details: err.message });
  }
});

// Login de Clientes
router.post('/login/clientes', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }
  try {
    const result = await pool.query(
      'SELECT cliente_id, nome, email, senha FROM clientes WHERE email = $1 LIMIT 1',
      [email]
    );
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    const user = result.rows[0];

    let isMatch = false;
    const stored = user.senha || '';
    const isBcrypt = typeof stored === 'string' && stored.startsWith('$2');
    if (isBcrypt) {
      isMatch = await bcrypt.compare(senha, stored);
    } else {
      // Transição: se senha plaintext combinar, rehash e atualizar
      isMatch = stored === senha;
      if (isMatch) {
        const newHash = await bcrypt.hash(senha, 10);
        await pool.query('UPDATE clientes SET senha = $1 WHERE cliente_id = $2', [newHash, user.cliente_id]);
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ sub: user.cliente_id, tipo: 'cliente' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      user: {
        id: user.cliente_id,
        nome: user.nome,
        email: user.email,
        tipo: 'cliente',
      },
      token,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro no servidor', details: err.message });
  }
});

// Login de Profissionais
router.post('/login/profissionais', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }
  try {
    const result = await pool.query(
      'SELECT profissional_id, nome, email, senha FROM profissionais WHERE email = $1 LIMIT 1',
      [email]
    );
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    const user = result.rows[0];

    let isMatch = false;
    const stored = user.senha || '';
    const isBcrypt = typeof stored === 'string' && stored.startsWith('$2');
    if (isBcrypt) {
      isMatch = await bcrypt.compare(senha, stored);
    } else {
      isMatch = stored === senha;
      if (isMatch) {
        const newHash = await bcrypt.hash(senha, 10);
        await pool.query('UPDATE profissionais SET senha = $1 WHERE profissional_id = $2', [newHash, user.profissional_id]);
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ sub: user.profissional_id, tipo: 'profissional' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      user: {
        id: user.profissional_id,
        nome: user.nome,
        email: user.email,
        tipo: 'profissional',
      },
      token,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro no servidor', details: err.message });
  }
});

// Lista de Profissionais (básico)
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

module.exports = router;