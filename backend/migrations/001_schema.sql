-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  cliente_id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Profissionais
CREATE TABLE IF NOT EXISTS profissionais (
  profissional_id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Depoimentos
CREATE TABLE IF NOT EXISTS depoimentos (
  depoimento_id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL REFERENCES clientes(cliente_id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  agendamento_id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_hora DATETIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE','CONFIRMADO','CANCELADO','CONCLUIDO')),
  cliente_id INTEGER NOT NULL REFERENCES clientes(cliente_id) ON DELETE CASCADE,
  profissional_id INTEGER NOT NULL REFERENCES profissionais(profissional_id) ON DELETE CASCADE
);

-- Avaliações (únicas por cliente/profissional)
CREATE TABLE IF NOT EXISTS avaliacoes (
  avaliacao_id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL REFERENCES clientes(cliente_id) ON DELETE CASCADE,
  profissional_id INTEGER NOT NULL REFERENCES profissionais(profissional_id) ON DELETE CASCADE,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (cliente_id, profissional_id)
);

-- Chat mensagens
CREATE TABLE IF NOT EXISTS chat_mensagens (
  mensagem_id INTEGER PRIMARY KEY AUTOINCREMENT,
  agendamento_id INTEGER NOT NULL REFERENCES agendamentos(agendamento_id) ON DELETE CASCADE,
  remetente_id INTEGER NOT NULL,
  tipo_remetente TEXT NOT NULL CHECK (tipo_remetente IN ('CLIENTE','PROFISSIONAL')),
  conteudo TEXT NOT NULL,
  data_hora DATETIME DEFAULT CURRENT_TIMESTAMP
);
