import React, { useMemo, useState } from 'react';
import './Planos.css';
import { useNavigate } from 'react-router-dom';

const Planos = () => {
  const navigate = useNavigate();
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('itrainer_user'));
    } catch (e) {
      return null;
    }
  }, []);

  const email = user?.email || null;
  const isProfissional = user?.tipo === 'profissional';

  const planoAtual = useMemo(() => {
    if (!email) return null;
    return localStorage.getItem(`plano_${email}`) || null;
  }, [email]);

  const [checkout, setCheckout] = useState({ aberto: false, plano: null });
  const [form, setForm] = useState({ nome: user?.name || '', email: email || '', numero: '', validade: '', cvv: '' });

  const startAssinar = (plano) => {
    if (!isProfissional || !email) {
      alert('Para assinar um plano, faça login como Profissional.');
      navigate('/login');
      return;
    }
    setCheckout({ aberto: true, plano });
  };

  const confirmAssinar = () => {
    const plano = checkout.plano;
    const precoMensal = plano === 'premium' ? 149 : 49;
    if (!plano) return;
    // Validação simples
    if (!form.numero || !form.validade || !form.cvv) {
      alert('Preencha os dados de pagamento.');
      return;
    }
    localStorage.setItem(`plano_${email}`, plano);
    const assinaturaInfo = { plano, precoMensal, inicio: new Date().toISOString() };
    localStorage.setItem(`assinatura_${email}`, JSON.stringify(assinaturaInfo));
    setCheckout({ aberto: false, plano: null });
    alert(`Plano ${plano === 'premium' ? 'Premium' : 'Basic'} ativado com sucesso!`);
    navigate('/painel-profissional');
  };

  return (
    <div className="planos-container">
      <div className="planos-header">
        <h2>Planos para Profissionais</h2>
        <p>Escolha o plano que melhor se adapta ao seu momento.</p>
        {isProfissional && (
          <p className="plano-atual">Plano atual: {planoAtual ? (planoAtual === 'premium' ? 'Premium' : 'Basic') : 'Nenhum'}</p>
        )}
      </div>

      <div className="planos-grid">
        <div className="plano-card">
          <div className="plano-title">Basic</div>
          <div className="plano-price">R$ 49/mês</div>
          <ul className="plano-features">
            <li>Gestão de alunos</li>
            <li>Chat integrado</li>
            <li>Comissão sobre transações: 15%</li>
          </ul>
          <div className="plano-action">
            <button className="plano-btn assinar" onClick={() => startAssinar('basic')}>Assinar Basic</button>
            <button className="plano-btn gerenciar" onClick={() => navigate('/painel-profissional')}>Ver meu painel</button>
          </div>
        </div>

        <div className="plano-card recommended">
          <span className="badge-recommended">Recomendado</span>
          <div className="plano-title">Premium</div>
          <div className="plano-price">R$ 149/mês</div>
          <ul className="plano-features">
            <li>Prescrição de treinos e periodização</li>
            <li>Banco de exercícios/vídeos</li>
            <li>Relatórios financeiros e progresso</li>
            <li>Comissão sobre transações: 5%</li>
          </ul>
          <div className="plano-action">
            <button className="plano-btn assinar" onClick={() => startAssinar('premium')}>Assinar Premium</button>
            <button className="plano-btn gerenciar" onClick={() => navigate('/painel-profissional')}>Ver meu painel</button>
          </div>
        </div>
      </div>

      <div className="feature-compare">
        <h3>Comparativo de funcionalidades</h3>
        <div className="compare-table">
          <div className="compare-head">
            <div className="compare-cell head">Recurso</div>
            <div className="compare-cell head center">Basic</div>
            <div className="compare-cell head center">Premium</div>
          </div>

          <div className="compare-row">
            <div className="compare-cell">Gestão de alunos</div>
            <div className="compare-cell center"><span className="check">✔</span></div>
            <div className="compare-cell center"><span className="check">✔</span></div>
          </div>
          <div className="compare-row">
            <div className="compare-cell">Chat integrado</div>
            <div className="compare-cell center"><span className="check">✔</span></div>
            <div className="compare-cell center"><span className="check">✔</span></div>
          </div>
          <div className="compare-row">
            <div className="compare-cell">Prescrição de treinos e periodização</div>
            <div className="compare-cell center"><span className="minus">—</span></div>
            <div className="compare-cell center"><span className="check">✔</span></div>
          </div>
          <div className="compare-row">
            <div className="compare-cell">Banco de exercícios/vídeos</div>
            <div className="compare-cell center"><span className="minus">—</span></div>
            <div className="compare-cell center"><span className="check">✔</span></div>
          </div>
          <div className="compare-row">
            <div className="compare-cell">Relatórios financeiros e progresso</div>
            <div className="compare-cell center"><span className="minus">—</span></div>
            <div className="compare-cell center"><span className="check">✔</span></div>
          </div>
          <div className="compare-row">
            <div className="compare-cell">Comissão sobre transações</div>
            <div className="compare-cell center"><span className="commission basic">15%</span></div>
            <div className="compare-cell center"><span className="commission premium">5%</span></div>
          </div>
        </div>
      </div>

      {checkout.aberto && (
        <div className="modal">
          <div className="modal-content">
            <h4 className="modal-title">Finalizar assinatura — {checkout.plano === 'premium' ? 'Premium' : 'Basic'}</h4>
            <div className="modal-field">
              <label>Nome
                <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </label>
            </div>
            <div className="modal-field">
              <label>Email
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
            </div>
            <div className="modal-field">
              <label>Número do cartão
                <input type="text" placeholder="0000 0000 0000 0000" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
              </label>
            </div>
            <div className="modal-field" style={{ display: 'flex', gap: 10 }}>
              <label style={{ flex: 1 }}>Validade
                <input type="text" placeholder="MM/AA" value={form.validade} onChange={(e) => setForm({ ...form, validade: e.target.value })} />
              </label>
              <label style={{ flex: 1 }}>CVV
                <input type="text" placeholder="123" value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value })} />
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setCheckout({ aberto: false, plano: null })}>Cancelar</button>
              <button className="btn btn-primary" onClick={confirmAssinar}>Confirmar assinatura</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planos;