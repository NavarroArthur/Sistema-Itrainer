import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import './Profissionais.css';

// Mock de profissionais para vitrine/busca
const mockProfessionals = [
  {
    id: 'prof-joana',
    nome: 'Joana Lima',
    email: 'admin@teste.com',
    cref: 'CREF 123456-G/RJ',
    especialidades: ['musculacao', 'funcional'],
    localizacao: 'Rio de Janeiro - RJ',
    online: true,
    precoHora: 120,
    objetivoFoco: ['emagrecimento', 'condicionamento'],
    foto: '/logo192.png',
    notaMedia: 4.8,
    pacotes: [
      { nome: 'Mensal', preco: 600, detalhes: '2x por semana' },
      { nome: 'Avulso', preco: 140, detalhes: 'Sessão única' }
    ],
  },
  {
    id: 'prof-carlos',
    nome: 'Carlos Mendes',
    email: 'carlos@teste.com',
    cref: 'CREF 654321-G/SP',
    especialidades: ['yoga', 'pilates'],
    localizacao: 'São Paulo - SP',
    online: false,
    precoHora: 90,
    objetivoFoco: ['saude', 'reabilitacao'],
    foto: '/logo192.png',
    notaMedia: 4.6,
    pacotes: [
      { nome: 'Mensal', preco: 400, detalhes: '1x por semana' },
      { nome: 'Avulso', preco: 110, detalhes: 'Sessão única' }
    ],
  },
  {
    id: 'prof-ana',
    nome: 'Ana Souza',
    email: 'ana@teste.com',
    cref: 'CREF 112233-G/MG',
    especialidades: ['crossfit', 'funcional'],
    localizacao: 'Belo Horizonte - MG',
    online: true,
    precoHora: 110,
    objetivoFoco: ['condicionamento', 'emagrecimento'],
    foto: '/logo192.png',
    notaMedia: 4.7,
    pacotes: [
      { nome: 'Mensal', preco: 520, detalhes: '2x por semana' },
      { nome: 'Avulso', preco: 130, detalhes: 'Sessão única' }
    ],
  },
  {
    id: 'prof-rodrigo',
    nome: 'Rodrigo Alves',
    email: 'rodrigo@teste.com',
    cref: 'CREF 998877-G/RS',
    especialidades: ['musculacao', 'funcional'],
    localizacao: 'Porto Alegre - RS',
    online: false,
    precoHora: 80,
    objetivoFoco: ['condicionamento', 'saude'],
    foto: '/logo192.png',
    notaMedia: 4.5,
    pacotes: [
      { nome: 'Mensal', preco: 360, detalhes: '1x por semana' },
      { nome: 'Avulso', preco: 95, detalhes: 'Sessão única' }
    ],
  },
  {
    id: 'prof-paula',
    nome: 'Paula Ribeiro',
    email: 'paula@teste.com',
    cref: 'CREF 445566-G/PR',
    especialidades: ['pilates', 'reabilitacao'],
    localizacao: 'Curitiba - PR',
    online: true,
    precoHora: 100,
    objetivoFoco: ['reabilitacao', 'saude'],
    foto: '/logo192.png',
    notaMedia: 4.9,
    pacotes: [
      { nome: 'Mensal', preco: 480, detalhes: '2x por semana' },
      { nome: 'Avulso', preco: 120, detalhes: 'Sessão única' }
    ],
  },
];

const especialidadesLista = ['musculacao', 'funcional', 'yoga', 'pilates', 'crossfit', 'reabilitacao'];

const Profissionais = () => {
  const [filtros, setFiltros] = useState({
    especialidade: '',
    localizacao: '',
    precoMax: '',
    objetivo: '',
    online: 'any',
    ordenacao: 'none',
  });

  const [apiProfissionais, setApiProfissionais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchList = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/profissionais');
        const rows = res.data?.profissionais || [];
        // Mapear dados mínimos do backend para o formato da vitrine
        const storedUsers = JSON.parse(localStorage.getItem('itrainer_users') || '[]');
        const mapped = rows.map((r) => {
          const base = {
            id: `db-${r.id}`,
            nome: r.nome,
            email: r.email,
            cref: 'CREF —',
            especialidades: [],
            localizacao: '—',
            online: true,
            precoHora: 100,
            objetivoFoco: [],
            foto: '/logo192.png',
            notaMedia: 4.5,
            pacotes: [],
          };
          const extra = storedUsers.find(u => u.email === r.email);
          if (extra) {
            return {
              ...base,
              especialidades: Array.isArray(extra.especialidades) ? extra.especialidades : base.especialidades,
              localizacao: extra.localizacao || base.localizacao,
              precoHora: typeof extra.precoHora === 'number' ? extra.precoHora : base.precoHora,
              foto: extra.foto || base.foto,
              pacotes: Array.isArray(extra.pacotes) ? extra.pacotes : base.pacotes,
            };
          }
          return base;
        });
        if (mounted) setApiProfissionais(mapped);
      } catch (err) {
        if (mounted) setError(err?.response?.data?.error || 'Falha ao carregar profissionais.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchList();
    return () => { mounted = false; };
  }, []);

  const resultados = useMemo(() => {
    const base = [...apiProfissionais, ...mockProfessionals];
    const filtrados = base.filter(p => {
      const byEsp = filtros.especialidade ? p.especialidades.includes(filtros.especialidade) : true;
      const byLoc = filtros.localizacao ? p.localizacao.toLowerCase().includes(filtros.localizacao.toLowerCase()) : true;
      const byPreco = filtros.precoMax ? p.precoHora <= Number(filtros.precoMax) : true;
      const byObj = filtros.objetivo ? p.objetivoFoco.includes(filtros.objetivo) : true;
      const byOnline = filtros.online === 'any' ? true : filtros.online === 'true' ? p.online : !p.online;
      return byEsp && byLoc && byPreco && byObj && byOnline;
    });

    // Ordenação por preço: mais barato / mais caro
    if (filtros.ordenacao === 'preco_asc') {
      filtrados.sort((a, b) => a.precoHora - b.precoHora);
    } else if (filtros.ordenacao === 'preco_desc') {
      filtrados.sort((a, b) => b.precoHora - a.precoHora);
    }

    return filtrados;
  }, [filtros, apiProfissionais]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main className="vitrine-container">
      <section className="vitrine-hero">
        <div className="hero-content">
          <h1>Encontre seu Personal Trainer</h1>
          <p>Use os filtros e ache o profissional ideal para seu objetivo.</p>
        </div>
      </section>

      <section className="vitrine-busca">
        <div className="container">
          <div className="busca-grid">
            <aside className="filtros">
              <h2>Filtros</h2>
              <label>Especialidade
                <select name="especialidade" value={filtros.especialidade} onChange={handleChange}>
                  <option value="">Todas</option>
                  {especialidadesLista.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </label>
              <label>Localização
                <input name="localizacao" value={filtros.localizacao} onChange={handleChange} placeholder="Cidade/Bairro" />
              </label>
              <label>Preço máximo (R$/hora)
                <input type="number" name="precoMax" value={filtros.precoMax} onChange={handleChange} />
              </label>
              <label>Objetivo
                <select name="objetivo" value={filtros.objetivo} onChange={handleChange}>
                  <option value="">Todos</option>
                  <option value="emagrecimento">Emagrecimento</option>
                  <option value="condicionamento">Condicionamento</option>
                  <option value="saude">Saúde</option>
                  <option value="reabilitacao">Reabilitação</option>
                </select>
              </label>
              <label>Formato
                <select name="online" value={filtros.online} onChange={handleChange}>
                  <option value="any">Todos</option>
                  <option value="true">Online</option>
                  <option value="false">Presencial</option>
                </select>
              </label>
              <label>Ordenar por preço
                <select name="ordenacao" value={filtros.ordenacao} onChange={handleChange}>
                  <option value="none">Sem ordenação</option>
                  <option value="preco_asc">Mais barato primeiro</option>
                  <option value="preco_desc">Mais caro primeiro</option>
                </select>
              </label>
            </aside>

              <div className="resultados">
                <h2>Profissionais</h2>
              {loading && <p>Carregando profissionais...</p>}
              {error && <p className="erro">{error}</p>}
              <div className="cards">
                {resultados.map(p => (
                  <div className="card" key={p.id}>
                    <div className="card-foto">
                      <img src={p.foto} alt={`Foto de ${p.nome}`} />
                    </div>
                    <div className="card-body">
                      <h3>{p.nome}</h3>
                      <p className="card-cref">{p.cref}</p>
                      <p className="card-meta">{p.especialidades.join(', ')} • {p.online ? 'Online' : 'Presencial'}</p>
                      <p className="card-preco">R$ {p.precoHora}/hora</p>
                      <p className="card-nota">Nota: {p.notaMedia.toFixed(1)}</p>
                      <Link className="btn btn-primary" to={`/profissional/${p.id}`}>
                        Ver perfil
                      </Link>
                    </div>
                  </div>
                ))}
                {resultados.length === 0 && (
                  <p>Nenhum profissional encontrado com os filtros selecionados.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Profissionais;