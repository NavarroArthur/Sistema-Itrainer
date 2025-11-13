const fs = require('fs');
const path = require('path');
const { db } = require('./db');

function run() {
  const dir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const full = path.join(dir, file);
    const sql = fs.readFileSync(full, 'utf8');
    console.log(`Executing migration: ${file}`);
    try {
      // SQLite pode executar múltiplas statements se separadas por ;
      // Mas vamos executar uma por vez para melhor controle
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const statement of statements) {
        if (statement) {
          db.exec(statement + ';');
        }
      }
      console.log(`Applied: ${file}`);
    } catch (err) {
      console.error(`Failed migration ${file}:`, err.message);
      process.exitCode = 1;
      break;
    }
  }
  process.exit();
}

run();
