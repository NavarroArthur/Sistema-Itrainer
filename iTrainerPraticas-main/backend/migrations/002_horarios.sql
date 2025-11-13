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

-- Trigger para updated_at (SQLite usa triggers diferentes)
CREATE TRIGGER IF NOT EXISTS trg_set_updated_at_horarios
AFTER UPDATE ON horarios_profissionais
FOR EACH ROW
BEGIN
  UPDATE horarios_profissionais 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE horario_id = NEW.horario_id;
END;
