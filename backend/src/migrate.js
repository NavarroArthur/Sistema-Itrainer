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
      // SQLite precisa executar statements uma por vez
      // Remove comentários e divide por ponto e vírgula
      const cleanSql = sql
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n');
      
      const statements = cleanSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.match(/^\s*$/));
      
      // Executa cada statement separadamente
      for (const statement of statements) {
        if (statement) {
          db.exec(statement);
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
