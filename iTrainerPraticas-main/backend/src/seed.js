const { pool } = require('./db');

async function run() {
  try {
    console.log('Seeding: criando cliente de teste...');
    const clienteRes = await pool.query(
      `INSERT INTO clientes (nome, email, senha)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome
       RETURNING cliente_id`,
      ['Cliente Teste', 'cliente.teste@example.com', 'senha123']
    );
    const clienteId = clienteRes.rows[0].cliente_id;

    console.log('Seeding: inserindo depoimento de teste...');
    const depoRes = await pool.query(
      `INSERT INTO depoimentos (cliente_id, texto)
       VALUES ($1, $2)
       RETURNING depoimento_id`,
      [clienteId, 'Ótimo atendimento e resultados visíveis!']
    );

    console.log('Seed concluído com sucesso:', {
      cliente_id: clienteId,
      depoimento_id: depoRes.rows[0].depoimento_id,
    });
  } catch (err) {
    console.error('Erro ao executar seed:', err.message);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

run();