import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import './PerfilCliente.css';

function safeParseUser() {
  try {
    const raw = localStorage.getItem('itrainer_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const PerfilCliente = () => {
  const [user] = useState(safeParseUser);
  const [perfil, setPerfil] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }

    const fetchData = async () => {
      try {
        // Busca perfil completo do cliente via API
        const [perfilRes, agendRes] = await Promise.all([
          api.get(`/clientes/${user.id}`),
          api.get('/agendamentos', { params: { cliente_id: user.id } }),
        ]);

        setPerfil(perfilRes.data?.cliente || null);

        const agendamentos = agendRes.data?.agendamentos || [];
        const mapped = agendamentos.map((a) => ({
          id: a.agendamento_id,
          tipo: 'Aula',
          data: new Date(a.data_hora).toLocaleDateString('pt-BR'),
          horario: new Date(a.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status: a.status,
          profissional_id: a.profissional_id,
        }));
        setAulas(mapped);
      } catch (err) {
        console.error('Erro ao carregar perfil do cliente:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calcula idade a partir da data de nascimento
  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const idade = perfil ? calcularIdade(perfil.data_nascimento) : null;

  const statusLabel = (status) => {
    const map = { PENDENTE: '🕐 Pendente', CONFIRMADO: '✅ Confirmado', CANCELADO: '❌ Cancelado', CONCLUIDO: '🏁 Concluído' };
    return map[status] || status;
  };

  if (loading) {
    return (
      <main className="perfil-container">
        <div className="perfil-header">
          <p>Carregando perfil...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="perfil-container">
      <div className="perfil-header">
        <div className="perfil-foto-container">
          <div className="perfil-foto">
            <div className="perfil-foto-placeholder">👤</div>
          </div>
        </div>
        <div className="perfil-info">
          <h1 className="perfil-nome">{user?.name}</h1>
          <div className="perfil-detalhes">
            {idade && <p>{idade} anos</p>}
            {(perfil?.localizacao) && <p>{perfil.localizacao}</p>}
            <p>{user?.email}</p>
            {perfil?.nivel && <p>Nível: {perfil.nivel.charAt(0).toUpperCase() + perfil.nivel.slice(1)}</p>}
            {perfil?.objetivos?.length > 0 && (
              <p>Objetivos: {perfil.objetivos.join(', ')}</p>
            )}
          </div>
        </div>
      </div>

      <div className="perfil-aulas">
        <h2>Minhas Aulas</h2>
        {aulas.length > 0 ? (
          aulas.map((aula) => (
            <div key={aula.id} className="aula-item">
              <div className="aula-info">
                <h3>{aula.tipo}</h3>
                <p className="aula-data">{aula.data} às {aula.horario}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>{statusLabel(aula.status)}</span>
                <Link className="btn" to={`/profissional/${aula.profissional_id}`}>
                  Ver Prof.
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="sem-aulas">
            <p>Você ainda não tem aulas registradas.</p>
            <Link className="btn btn-primary" to="/profissionais">
              Encontrar um personal trainer
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default PerfilCliente;
