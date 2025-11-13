import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import './PerfilProfissional.css';

// Mesmo mock da vitrine (em produção virá de API)
const mockProfessionals = {
  'prof-joana': {
    id: 'prof-joana',
    nome: 'Joana Lima',
    email: 'admin@teste.com',
    cref: 'CREF 123456-G/RJ',
    bio: 'Personal trainer com 8 anos de experiência focada em musculação e funcional.',
    especialidades: ['musculacao', 'funcional'],
    localizacao: 'Rio de Janeiro - RJ',
    online: true,
    precoHora: 120,
    foto: '/logo192.png',
    pacotes: [
      { nome: 'Mensal (2x/semana)', preco: 600 },
      { nome: 'Avulso', preco: 140 },
    ],
    depoimentos: [
      { autor: 'Maria S.', texto: 'Ótimo acompanhamento e treinos bem planejados.' },
    ],
  },
  'prof-carlos': {
    id: 'prof-carlos',
    nome: 'Carlos Mendes',
    email: 'carlos@teste.com',
    cref: 'CREF 654321-G/SP',
    bio: 'Instrutor de Yoga e Pilates com foco em saúde e reabilitação.',
    especialidades: ['yoga', 'pilates'],
    localizacao: 'São Paulo - SP',
    online: false,
    precoHora: 90,
    foto: '/logo192.png',
    pacotes: [
      { nome: 'Mensal (1x/semana)', preco: 400 },
      { nome: 'Avulso', preco: 110 },
    ],
    depoimentos: [
      { autor: 'João P.', texto: 'Aulas excelentes e atenção às limitações.' },
    ],
  }
  ,
  'prof-ana': {
    id: 'prof-ana',
    nome: 'Ana Souza',
    email: 'ana@teste.com',
    cref: 'CREF 112233-G/MG',
    bio: 'Treinadora de Crossfit e Funcional com foco em performance e saúde.',
    especialidades: ['crossfit', 'funcional'],
    localizacao: 'Belo Horizonte - MG',
    online: true,
    precoHora: 110,
    foto: '/logo192.png',
    pacotes: [
      { nome: 'Mensal (2x/semana)', preco: 520 },
      { nome: 'Avulso', preco: 130 },
    ],
    depoimentos: [
      { autor: 'Pedro A.', texto: 'Treinos intensos e motivadores, evolução real.' },
    ],
  },
  'prof-rodrigo': {
    id: 'prof-rodrigo',
    nome: 'Rodrigo Alves',
    email: 'rodrigo@teste.com',
    cref: 'CREF 998877-G/RS',
    bio: 'Especialista em musculação e condicionamento com foco em saúde geral.',
    especialidades: ['musculacao', 'funcional'],
    localizacao: 'Porto Alegre - RS',
    online: false,
    precoHora: 80,
    foto: '/logo192.png',
    pacotes: [
      { nome: 'Mensal (1x/semana)', preco: 360 },
      { nome: 'Avulso', preco: 95 },
    ],
    depoimentos: [
      { autor: 'Luiza M.', texto: 'Didático e atento ao progresso.' },
    ],
  },
  'prof-paula': {
    id: 'prof-paula',
    nome: 'Paula Ribeiro',
    email: 'paula@teste.com',
    cref: 'CREF 445566-G/PR',
    bio: 'Instrutora de Pilates e Reabilitação, foco em qualidade de vida.',
    especialidades: ['pilates', 'reabilitacao'],
    localizacao: 'Curitiba - PR',
    online: true,
    precoHora: 100,
    foto: '/logo192.png',
    pacotes: [
      { nome: 'Mensal (2x/semana)', preco: 480 },
      { nome: 'Avulso', preco: 120 },
    ],
    depoimentos: [
      { autor: 'Renato F.', texto: 'Recuperação excelente com atenção aos detalhes.' },
    ],
  }
};

const horariosPadrao = Array.from({ length: 11 }, (_, i) => `${i + 8}:00`);
const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const PerfilProfissional = () => {
  const { id } = useParams();
  const isDb = String(id).startsWith('db-');

  const [prof, setProf] = useState(isDb ? null : mockProfessionals[id]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchDb = async () => {
      if (!isDb) return;
      setLoading(true);
      setError('');
      try {
        const numericId = String(id).replace('db-', '');
        const res = await api.get(`/profissionais/${numericId}`);
        const r = res.data?.profissional;
        if (!r) throw new Error('Profissional não encontrado');
        const mapped = {
          id: `db-${r.id}`,
          nome: r.nome,
          email: r.email,
          cref: 'CREF —',
          bio: 'Perfil básico. Em breve mais informações.',
          especialidades: [],
          localizacao: '—',
          online: true,
          precoHora: 100,
          foto: '/logo192.png',
          pacotes: [
            { nome: 'Avulso', preco: 100 },
          ],
          depoimentos: [],
        };
        // Enriquecer com dados locais se existirem
        const users = JSON.parse(localStorage.getItem('itrainer_users') || '[]');
        const extra = users.find(u => u.email === r.email);
        const enriched = extra ? {
          ...mapped,
          especialidades: Array.isArray(extra.especialidades) ? extra.especialidades : mapped.especialidades,
          localizacao: extra.localizacao || mapped.localizacao,
          precoHora: typeof extra.precoHora === 'number' ? extra.precoHora : mapped.precoHora,
          foto: extra.foto || mapped.foto,
          bio: extra.descricao || mapped.bio,
          pacotes: Array.isArray(extra.pacotes) ? extra.pacotes : mapped.pacotes,
        } : mapped;
        // Preparar agenda padrão se não existir para este email (case-insensitive)
        const storageEmail = (enriched.email || '').toLowerCase();
        const keyHor = `horarios_${storageEmail}`;
        if (!localStorage.getItem(keyHor)) {
          const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
          const hrs = Array.from({ length: 11 }, (_, i) => `${i + 8}:00`);
          const agenda = {};
          dias.forEach(d => {
            agenda[d] = {};
            hrs.forEach(h => { agenda[d][h] = true; });
          });
          localStorage.setItem(keyHor, JSON.stringify(agenda));
        }
        if (mounted) setProf(enriched);
      } catch (err) {
        if (mounted) setError(err?.response?.data?.error || err.message || 'Falha ao carregar profissional.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDb();
    return () => { mounted = false; };
  }, [id, isDb]);

  const [agenda, setAgenda] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [selecionados, setSelecionados] = useState({ dia: diasSemana[0], horario: horariosPadrao[0] });

  // Utilitário: próximo Date para um dia da semana textual
  const nextDateForWeekday = (diaTexto, horarioStr) => {
    const map = { 'Domingo': 0, 'Segunda': 1, 'Terça': 2, 'Quarta': 3, 'Quinta': 4, 'Sexta': 5, 'Sábado': 6 };
    const targetDow = map[diaTexto] ?? 1;
    const now = new Date();
    const result = new Date(now);
    const diff = (targetDow - now.getDay() + 7) % 7;
    result.setDate(now.getDate() + diff);
    const [hh, mm] = (horarioStr || '08:00').split(':');
    result.setHours(Number(hh), Number(mm || 0), 0, 0);
    return result;
  };

  // Carregar agenda: via API para profissionais de DB, senão localStorage (painel do profissional)
  useEffect(() => {
    if (!prof) return;
    const isDbProf = String(prof.id).startsWith('db-');
    (async () => {
      if (isDbProf) {
        try {
          const numericId = Number(String(prof.id).replace('db-',''));
          const res = await api.get('/horarios', { params: { profissional_id: numericId } });
          const rows = res.data?.horarios || [];
          const grid = {};
          diasSemana.forEach(d => { grid[d] = {}; });
          rows.forEach((r) => {
            const diaIdx = Number(r.dia_semana);
            const diaTxt = diasSemana[diaIdx] ?? diasSemana[0];
            const hInicio = String(r.hora_inicio).slice(0,5);
            grid[diaTxt][`${hInicio}`] = !!r.ativo;
          });
          // preencher faltantes como disponíveis
          diasSemana.forEach((d) => {
            horariosPadrao.forEach((h) => {
              if (typeof grid[d][h] === 'undefined') grid[d][h] = true;
            });
          });
          setAgenda(grid);
          return;
        } catch {}
      }
      const data = localStorage.getItem(`horarios_${prof.email}`);
      if (data) {
        setAgenda(JSON.parse(data));
      } else {
        const iniciais = {};
        diasSemana.forEach(d => {
          iniciais[d] = {};
          horariosPadrao.forEach(h => { iniciais[d][h] = true; });
        });
        setAgenda(iniciais);
      }
    })();
  }, [prof]);

  const horariosDia = useMemo(() => {
    const d = selecionados.dia;
    return Object.keys(agenda[d] || {}).map(h => ({ h, disponivel: agenda[d][h] }));
  }, [agenda, selecionados]);

  const solicitarAgendamento = async () => {
    if (!prof) return;
    const userJson = localStorage.getItem('itrainer_user');
    if (!userJson) { alert('Faça login como cliente para agendar.'); return; }
    const user = JSON.parse(userJson);
    if (user.type !== 'client' && user.tipo !== 'cliente') { alert('Este agendamento é exclusivo para clientes.'); return; }

    const isDbProf = String(prof.id).startsWith('db-');
    if (isDbProf) {
      try {
        const cliente_id = user.id;
        const profissional_id = Number(String(prof.id).replace('db-',''));
        const dataHora = nextDateForWeekday(selecionados.dia, selecionados.horario).toISOString();
        await api.post('/agendamentos', { cliente_id, profissional_id, data_hora: dataHora, status: 'PENDENTE' });
        setModalAberto(false);
        alert('Solicitação enviada à API! O profissional verá no painel e poderá aceitar.');
        return;
      } catch (err) {
        const msg = err?.response?.data?.error || 'Falha ao criar solicitação na API. Fallback local.';
        console.warn(msg);
      }
    }

    // Fallback localStorage para profissionais mockados
    const solicitacao = {
      id: `${Date.now()}`,
      aluno: user.name || user.email,
      data: `${selecionados.dia}`,
      horario: selecionados.horario,
      tipo: 'Aula Avulsa',
      status: 'pendente',
    };
    const storageEmail = (prof.email || '').toLowerCase();
    const chave = `solicitacoes_${storageEmail}`;
    const existentes = JSON.parse(localStorage.getItem(chave) || '[]');
    existentes.push(solicitacao);
    localStorage.setItem(chave, JSON.stringify(existentes));
    setModalAberto(false);
    alert('Solicitação enviada! O profissional verá no painel e poderá aceitar.');
  };

  if (loading) {
    return <main className="perfil-prof-container"><p>Carregando perfil...</p></main>;
  }
  if (error) {
    return <main className="perfil-prof-container"><p className="erro">{error}</p></main>;
  }
  if (!prof) {
    return <main className="perfil-prof-container"><p>Profissional não encontrado.</p></main>;
  }

  return (
    <main className="perfil-prof-container">
      <section className="perfil-header">
        <img className="perfil-foto" src={prof.foto} alt={`Foto de ${prof.nome}`} />
        <div className="perfil-info">
          <h1>{prof.nome}</h1>
          <p className="perfil-cref">{prof.cref}</p>
          <p className="perfil-local">{prof.localizacao} • {prof.online ? 'Online' : 'Presencial'}</p>
          <p className="perfil-bio">{prof.bio}</p>
          <div className="perfil-pacotes">
            {prof.pacotes.map((p, idx) => (
              <div key={idx} className="pacote">
                <span>{p.nome}</span>
                <strong>R$ {p.preco}</strong>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setModalAberto(true)}>Agendar</button>
        </div>
      </section>

      <section className="perfil-galeria">
        <h2>Depoimentos</h2>
        <div className="depo-grid">
          {prof.depoimentos.map((d, i) => (
            <div key={i} className="depo-item">
              <p>“{d.texto}”</p>
              <span>— {d.autor}</span>
            </div>
          ))}
        </div>
      </section>

      {modalAberto && (
        <div className="modal">
          <div className="modal-content">
            <h3>Agendar com {prof.nome}</h3>
            <label>Dia
              <select value={selecionados.dia} onChange={(e) => setSelecionados(s => ({ ...s, dia: e.target.value }))}>
                {diasSemana.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label>Horário
              <select value={selecionados.horario} onChange={(e) => setSelecionados(s => ({ ...s, horario: e.target.value }))}>
                {horariosDia.filter(h => h.disponivel).map(h => <option key={h.h} value={h.h}>{h.h}</option>)}
              </select>
            </label>
            <div className="modal-actions">
              <button className="btn" onClick={() => setModalAberto(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={solicitarAgendamento}>Enviar solicitação</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PerfilProfissional;