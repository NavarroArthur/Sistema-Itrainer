const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const { checkConnection, pool } = require('./db');

const app = express();
const PORT = Number(process.env.PORT || 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Raiz: orientação rápida
app.get('/', (req, res) => {
  res.json({
    message: 'iTrainer API',
    status_url: '/api/status',
    docs: [
      { path: '/api/status', method: 'GET', desc: 'Saúde da API e conexão com DB' },
      { path: '/api/profissionais', method: 'GET', desc: 'Lista profissionais' },
      { path: '/api/horarios?profissional_id=<id>', method: 'GET', desc: 'Lista horários por profissional' },
      { path: '/api/agendamentos?profissional_id=<id>', method: 'GET', desc: 'Lista agendamentos por filtros' }
    ]
  });
});

// Health/status route: verifica API e DB
app.get('/api/status', async (req, res) => {
  const db = await checkConnection();
  res.json({
    api: 'ok',
    db,
    timestamp: new Date().toISOString(),
  });
});

// Listagem direta de profissionais (fallback confiável)
app.get('/api/profissionais', async (req, res) => {
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

// Removido fallback de depuração para /api/profissionais; usa rotas reais

// Auth routes (clientes)
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

// Domain routes
const depoimentosRoutes = require('./routes/depoimentos');
const agendamentosRoutes = require('./routes/agendamentos');
const avaliacoesRoutes = require('./routes/avaliacoes');
const chatRoutes = require('./routes/chat');
const profissionaisRoutes = require('./routes/profissionais');
const horariosRoutes = require('./routes/horarios');
app.use('/api', depoimentosRoutes);
app.use('/api', agendamentosRoutes);
app.use('/api', avaliacoesRoutes);
app.use('/api', chatRoutes);
app.use('/api', profissionaisRoutes);
app.use('/api', horariosRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`iTrainer API rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;