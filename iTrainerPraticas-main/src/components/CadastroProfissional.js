import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Cadastro.css';

const CadastroProfissional = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        telefone: '',
        foto: null,
        fotoBase64: '',
        especialidades: [],
        experiencia: '',
        descricao: '',
        preco: '',
        horarios: '',
        localizacao: ''
    });
    const [searchEspecialidade, setSearchEspecialidade] = useState('');

    const especialidades = [
        'musculacao',
        'funcional',
        'yoga',
        'pilates',
        'crossfit',
        'boxe',
        'jiu-jitsu',
        'natacao',
        'danca',
        'meditacao',
        'reabilitacao',
        'nutricao'
    ];

    useEffect(() => {
        AOS.init({
            duration: 800,
            offset: 100,
            once: true
        });
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setFormData(prev => ({ ...prev, foto: null, fotoBase64: '' }));
            return;
        }
        setFormData(prev => ({ ...prev, foto: file }));
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                fotoBase64: reader.result || ''
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            especialidades: checked 
                ? [...prev.especialidades, value]
                : prev.especialidades.filter(item => item !== value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validação básica
        if (!formData.nome || !formData.email || !formData.senha) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        try {
            const resp = await api.post('/cadastro/profissionais', {
                nome: formData.nome,
                email: formData.email,
                senha: formData.senha,
            });
            const apiUser = resp.data?.user;
            const token = resp.data?.token;
            if (apiUser) {
                const userData = {
                    id: apiUser.id,
                    name: apiUser.nome,
                    email: apiUser.email,
                    type: 'professional',
                    tipo: 'profissional',
                };
                localStorage.setItem('itrainer_user', JSON.stringify(userData));

                // Persistir perfil completo para enriquecer vitrine e perfil
                const usersJson = localStorage.getItem('itrainer_users');
                const users = usersJson ? JSON.parse(usersJson) : [];
                const perfilCompleto = {
                    id: `db-${apiUser.id}`,
                    nome: formData.nome,
                    email: formData.email,
                    type: 'professional',
                    telefone: formData.telefone,
                    foto: formData.fotoBase64 || '/logo192.png',
                    especialidades: formData.especialidades,
                    experiencia: Number(formData.experiencia) || 0,
                    descricao: formData.descricao,
                    precoHora: Number(formData.preco) || 100,
                    horariosTexto: formData.horarios,
                    localizacao: formData.localizacao,
                    online: true,
                    pacotes: [
                        { nome: 'Avulso', preco: Number(formData.preco) || 100, detalhes: 'Sessão única' },
                        { nome: 'Mensal', preco: (Number(formData.preco) || 100) * 4, detalhes: '1x por semana' }
                    ],
                };
                const idx = users.findIndex(u => u.email === perfilCompleto.email);
                if (idx >= 0) {
                    users[idx] = { ...users[idx], ...perfilCompleto };
                } else {
                    users.push(perfilCompleto);
                }
                localStorage.setItem('itrainer_users', JSON.stringify(users));

                // Inicializar estrutura de horários padrão se não houver
                const emailLower = (perfilCompleto.email || '').toLowerCase();
                const chaveHorarios = `horarios_${emailLower}`;
                if (!localStorage.getItem(chaveHorarios)) {
                    const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                    const hrs = Array.from({ length: 11 }, (_, i) => `${i + 8}:00`);
                    const agenda = {};
                    dias.forEach(d => {
                        agenda[d] = {};
                        hrs.forEach(h => { agenda[d][h] = true; });
                    });
                    localStorage.setItem(chaveHorarios, JSON.stringify(agenda));
                }

                // Garantir lista de solicitações inicial
                const chaveSolic = `solicitacoes_${emailLower}`;
                if (!localStorage.getItem(chaveSolic)) {
                    localStorage.setItem(chaveSolic, JSON.stringify([]));
                }
            }
            if (token) {
                localStorage.setItem('itrainer_token', token);
            }
            alert('Cadastro realizado com sucesso! Você já está autenticado.');
            navigate('/painel-profissional');
        } catch (err) {
            const msg = err?.response?.data?.error || 'Falha ao cadastrar profissional.';
            alert(msg);
        }
    };

    const filteredEspecialidades = especialidades.filter(especialidade => 
        especialidade.toLowerCase().includes(searchEspecialidade.toLowerCase())
    );

    return (
        <main className="cadastro-container">
            <div className="cadastro-form" data-aos="fade-up">
                <h1>Cadastro de Profissional</h1>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="form-group">
                        <label htmlFor="nome">Nome Completo</label>
                        <input 
                            type="text" 
                            id="nome" 
                            name="nome" 
                            value={formData.nome}
                            onChange={handleInputChange}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleInputChange}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="senha">Senha</label>
                        <input 
                            type="password" 
                            id="senha" 
                            name="senha" 
                            value={formData.senha}
                            onChange={handleInputChange}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="telefone">Telefone</label>
                        <input 
                            type="tel" 
                            id="telefone" 
                            name="telefone" 
                            value={formData.telefone}
                            onChange={handleInputChange}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="foto">Foto de Perfil</label>
                        <input 
                            type="file" 
                            id="foto" 
                            name="foto" 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="especialidades">Especialidades</label>
                        <div className="search-container">
                            <input 
                                type="text" 
                                id="searchEspecialidade" 
                                placeholder="Buscar especialidade..."
                                value={searchEspecialidade}
                                onChange={(e) => setSearchEspecialidade(e.target.value)}
                            />
                            <i className="fas fa-search"></i>
                        </div>
                        <div className="especialidades-container">
                            <div className="especialidades-grid">
                                {filteredEspecialidades.map(especialidade => (
                                    <label key={especialidade} className="especialidade-item">
                                        <input 
                                            type="checkbox" 
                                            name="especialidades" 
                                            value={especialidade}
                                            checked={formData.especialidades.includes(especialidade)}
                                            onChange={handleCheckboxChange}
                                        />
                                        <span>{especialidade.charAt(0).toUpperCase() + especialidade.slice(1)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="experiencia">Anos de Experiência</label>
                        <input 
                            type="number" 
                            id="experiencia" 
                            name="experiencia" 
                            min="0" 
                            value={formData.experiencia}
                            onChange={handleInputChange}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="descricao">Descrição Pessoal</label>
                        <textarea 
                            id="descricao" 
                            name="descricao" 
                            rows="4" 
                            value={formData.descricao}
                            onChange={handleInputChange}
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="preco">Preço por Sessão (R$)</label>
                        <input 
                            type="number" 
                            id="preco" 
                            name="preco" 
                            min="0" 
                            step="0.01" 
                            value={formData.preco}
                            onChange={handleInputChange}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="horarios">Horários Disponíveis</label>
                        <input 
                            type="text" 
                            id="horarios" 
                            name="horarios" 
                            placeholder="Ex: Seg-Sex, 8h-18h"
                            value={formData.horarios}
                            onChange={handleInputChange}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="localizacao">Localização (Cidade/Estado)</label>
                        <input 
                            type="text" 
                            id="localizacao" 
                            name="localizacao" 
                            value={formData.localizacao}
                            onChange={handleInputChange}
                            required 
                        />
                    </div>

                    <button type="submit" className="btn-cadastro">Cadastrar</button>
                </form>
            </div>
        </main>
    );
};

export default CadastroProfissional;