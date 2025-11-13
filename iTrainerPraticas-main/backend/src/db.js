const dotenv = require('dotenv');
dotenv.config();

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Cria diretório de dados se não existir
const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dbDir, 'itrainer.db');
const db = new Database(dbPath);

// Habilita foreign keys
db.pragma('foreign_keys = ON');

// Função auxiliar para converter placeholders PostgreSQL ($1, $2) para SQLite (?)
function convertPlaceholders(sql) {
  const params = [];
  let paramIndex = 1;
  
  // Substitui $1, $2, etc por ? e coleta os índices
  const converted = sql.replace(/\$(\d+)/g, (match, num) => {
    const index = parseInt(num, 10);
    params.push(index - 1); // Converte para índice baseado em 0
    return '?';
  });
  
  return { sql: converted, paramMap: params };
}

// Wrapper para manter compatibilidade com código async/await
const pool = {
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      try {
        const { sql: sqliteSql, paramMap } = convertPlaceholders(sql);
        
        // Reordena os parâmetros conforme os índices
        const reorderedParams = paramMap.length > 0 
          ? paramMap.map(idx => params[idx])
          : params;
        
        const sqlUpper = sqliteSql.trim().toUpperCase();
        
        if (sqlUpper.startsWith('SELECT')) {
          const stmt = db.prepare(sqliteSql);
          const rows = stmt.all(reorderedParams);
          resolve({ rows, rowCount: rows.length });
        } else if (sqlUpper.includes('RETURNING')) {
          // Para INSERT/UPDATE com RETURNING, precisamos fazer em duas etapas
          const returningMatch = sqliteSql.match(/RETURNING\s+(.+)$/i);
          const returningCols = returningMatch ? returningMatch[1] : '*';
          
          // Remove RETURNING da query
          const baseSql = sqliteSql.replace(/\s+RETURNING[\s\S]*$/i, '');
          const stmt = db.prepare(baseSql);
          const info = stmt.run(reorderedParams);
          
          if (info.changes === 0) {
            resolve({ rows: [], rowCount: 0 });
            return;
          }
          
          // Para INSERT, usa lastInsertRowid
          if (sqlUpper.startsWith('INSERT')) {
            const tableMatch = sqliteSql.match(/INSERT\s+INTO\s+(\w+)/i);
            if (tableMatch) {
              const tableName = tableMatch[1];
              const idColumn = `${tableName.slice(0, -1)}_id`; // Remove 's' e adiciona '_id'
              const selectStmt = db.prepare(`SELECT ${returningCols} FROM ${tableName} WHERE ${idColumn} = ?`);
              const row = selectStmt.get(info.lastInsertRowid);
              resolve({ rows: row ? [row] : [], rowCount: 1 });
            } else {
              resolve({ rows: [], rowCount: 1 });
            }
          } else if (sqlUpper.startsWith('UPDATE')) {
            // Para UPDATE, tenta extrair o WHERE para buscar o registro
            const whereMatch = sqliteSql.match(/WHERE\s+(.+?)(?:\s+RETURNING|$)/i);
            if (whereMatch && info.changes > 0) {
              const whereClause = whereMatch[1];
              const tableMatch = sqliteSql.match(/UPDATE\s+(\w+)/i);
              if (tableMatch) {
                const tableName = tableMatch[1];
                // Extrai os parâmetros do WHERE (últimos parâmetros após o SET)
                // Isso é uma aproximação - pode não funcionar em todos os casos
                const setMatch = sqliteSql.match(/SET\s+(.+?)\s+WHERE/i);
                if (setMatch) {
                  // Conta quantos parâmetros são usados no SET
                  const setClause = setMatch[1];
                  const setParamCount = (setClause.match(/\?/g) || []).length;
                  // Os parâmetros do WHERE são os que vêm depois dos do SET
                  const whereParams = reorderedParams.slice(setParamCount);
                  const selectStmt = db.prepare(`SELECT ${returningCols} FROM ${tableName} WHERE ${whereClause}`);
                  const row = selectStmt.get(...whereParams);
                  resolve({ rows: row ? [row] : [], rowCount: info.changes });
                } else {
                  // Se não conseguir extrair, tenta com todos os parâmetros
                  const selectStmt = db.prepare(`SELECT ${returningCols} FROM ${tableName} WHERE ${whereClause}`);
                  const row = selectStmt.get(...reorderedParams);
                  resolve({ rows: row ? [row] : [], rowCount: info.changes });
                }
              } else {
                resolve({ rows: [], rowCount: info.changes });
              }
            } else {
              resolve({ rows: [], rowCount: info.changes });
            }
          } else {
            resolve({ rows: [], rowCount: info.changes });
          }
        } else {
          // UPDATE, DELETE, INSERT sem RETURNING
          const stmt = db.prepare(sqliteSql);
          const info = stmt.run(reorderedParams);
          resolve({ rows: [], rowCount: info.changes });
        }
      } catch (err) {
        reject(err);
      }
    });
  },
  connect: () => {
    // Para transações, retornamos um objeto com query e release
    let transactionActive = false;
    return Promise.resolve({
      query: (sql, params = []) => {
        if (!transactionActive) {
          db.exec('BEGIN');
          transactionActive = true;
        }
        return pool.query(sql, params);
      },
      release: () => {
        if (transactionActive) {
          // Não fazemos commit aqui, o código chama COMMIT explicitamente
        }
      },
    });
  },
};

// Helper para executar transações
pool.transaction = (callback) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction((...args) => {
      return callback(...args);
    });
    try {
      const result = transaction();
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
};

async function checkConnection() {
  try {
    await pool.query('SELECT 1');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { pool, checkConnection, db };
