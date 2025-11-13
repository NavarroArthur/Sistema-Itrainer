-- Horários de disponibilidade por profissional
CREATE TABLE IF NOT EXISTS horarios_profissionais (
  horario_id INTEGER PRIMARY KEY AUTOINCREMENT,
  profissional_id INTEGER NOT NULL,
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  hora_inicio TEXT NOT NULL,
  hora_fim TEXT NOT NULL,
  ativo INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (profissional_id, dia_semana, hora_inicio, hora_fim)
);
