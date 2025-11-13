import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import FloatingLabelInput from './FloatingLabelInput';
import './Login.css';

const Login = () => {
    const [activeTab, setActiveTab] = useState('client');
    const [formData, setFormData] = useState({
        client: { email: '', password: '' },
        professional: { email: '', password: '' }
    });
    const [errors, setErrors] = useState({
        client: { email: '', password: '' },
        professional: { email: '', password: '' }
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const validateEmail = (email) => {
        if (!email) return 'Email é obrigatório';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Email inválido';
        return true;
    };

    const validatePassword = (password) => {
        if (!password) return 'Senha é obrigatória';
        if (password.length < 4) return 'Senha deve ter pelo menos 4 caracteres';
        return true;
    };

    const fillTestCredentials = (type) => {
        const creds = type === 'client'
            ? { email: 'aluno@teste.com', password: '12345' }
            : { email: 'admin@teste.com', password: '12345' };
        setFormData(prev => ({
            ...prev,
            [type]: { ...prev[type], ...creds }
        }));
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleInputChange = (userType, field, value) => {
        setFormData(prev => ({
            ...prev,
            [userType]: {
                ...prev[userType],
                [field]: value
            }
        }));
        
        // Limpar erro ao digitar
        setErrors(prev => ({
            ...prev,
            [userType]: {
                ...prev[userType],
                [field]: ''
            }
        }));
    };

    const handleSubmit = async (e, userType) => {
        e.preventDefault();
        setIsLoading(true);

        const { email, password } = formData[userType];

        // Validação
        const emailValidation = validateEmail(email);
        const passwordValidation = validatePassword(password);
        
        if (emailValidation !== true || passwordValidation !== true) {
            setErrors(prev => ({
                ...prev,
                [userType]: {
                    email: typeof emailValidation === 'string' ? emailValidation : '',
                    password: typeof passwordValidation === 'string' ? passwordValidation : ''
                }
            }));
            setIsLoading(false);
            showToast('Por favor, corrija os erros no formulário', 'error');
            return;
        }

        try {
            if (userType === 'client') {
                const resp = await api.post('/login/clientes', {
                    email,
                    senha: password,
                });
                const apiUser = resp.data?.user;
                const token = resp.data?.token;
                const userData = {
                    id: apiUser?.id,
                    name: apiUser?.nome,
                    email: apiUser?.email,
                    type: 'client',
                    tipo: 'cliente',
                };
                localStorage.setItem('itrainer_user', JSON.stringify(userData));
                if (token) {
                    localStorage.setItem('itrainer_token', token);
                }
                showToast('Login realizado com sucesso!', 'success');
                navigate('/perfil-cliente');
            } else if (userType === 'professional') {
                // Tenta autenticar via API
                try {
                    const resp = await api.post('/login/profissionais', {
                        email,
                        senha: password,
                    });
                    const apiUser = resp.data?.user;
                    const token = resp.data?.token;
                    const userData = {
                        id: apiUser?.id,
                        name: apiUser?.nome,
                        email: apiUser?.email,
                        type: 'professional',
                        tipo: 'profissional',
                    };
                    localStorage.setItem('itrainer_user', JSON.stringify(userData));
                    if (token) {
                        localStorage.setItem('itrainer_token', token);
                    }
                    showToast('Login realizado com sucesso!', 'success');
                    navigate('/painel-profissional');
                } catch (apiErr) {
                    // Fallback de desenvolvimento: credenciais de teste
                    if (email === 'admin@teste.com' && password === '12345') {
                        const userData = {
                            name: 'Profissional Teste',
                            email: email,
                            type: 'professional',
                            tipo: 'profissional',
                        };
                        localStorage.setItem('itrainer_user', JSON.stringify(userData));
                        showToast('Login realizado com sucesso!', 'success');
                        navigate('/painel-profissional');
                    } else {
                        const msg = apiErr?.response?.data?.error || 'Falha ao conectar à API.';
                        showToast(msg, 'error');
                    }
                }
            }
        } catch (err) {
            const msg = err?.response?.data?.error || 'Falha ao conectar à API.';
            showToast(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main>
            <section className="login-section">
                <div className="container">
                    <div className="login-container">
                        <div className="login-header">
                            <h2>Bem-vindo ao iTrainer!</h2>
                            <p>Escolha como deseja continuar</p>
                            <div className="test-hint">
                                <span><strong>Aluno (teste):</strong> aluno@teste.com / 12345</span>
                                <span><strong>Profissional (teste):</strong> admin@teste.com / 12345</span>
                            </div>
                        </div>
                        
                        <div className="login-tabs">
                            <button 
                                className={`tab-btn ${activeTab === 'client' ? 'active' : ''}`}
                                onClick={() => handleTabChange('client')}
                            >
                                Cliente
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'professional' ? 'active' : ''}`}
                                onClick={() => handleTabChange('professional')}
                            >
                                Profissional
                            </button>
                        </div>
                        
                        <div className="tab-content">
                            <div className={`tab-pane ${activeTab === 'client' ? 'active' : ''}`} id="client-login">
                                <form 
                                    className="login-form"
                                    onSubmit={(e) => handleSubmit(e, 'client')}
                                >
                                    <FloatingLabelInput
                                        type="email"
                                        label="Email"
                                        name="email"
                                        value={formData.client.email}
                                        onChange={(e) => handleInputChange('client', 'email', e.target.value)}
                                        error={errors.client.email}
                                        required
                                        validation={validateEmail}
                                    />
                                    <FloatingLabelInput
                                        type="password"
                                        label="Senha"
                                        name="password"
                                        value={formData.client.password}
                                        onChange={(e) => handleInputChange('client', 'password', e.target.value)}
                                        error={errors.client.password}
                                        required
                                        validation={validatePassword}
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Entrando...' : 'Entrar'}
                                    </button>
                                    <button 
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => fillTestCredentials('client')}
                                    >
                                        Usar login de teste
                                    </button>
                                    <p className="form-footer">
                                        Não tem uma conta? <Link to="/cadastro-cliente">Cadastre-se</Link>
                                    </p>
                                </form>
                            </div>
                            
                            <div className={`tab-pane ${activeTab === 'professional' ? 'active' : ''}`} id="professional-login">
                                <form 
                                    className="login-form"
                                    onSubmit={(e) => handleSubmit(e, 'professional')}
                                >
                                    <FloatingLabelInput
                                        type="email"
                                        label="Email"
                                        name="email"
                                        value={formData.professional.email}
                                        onChange={(e) => handleInputChange('professional', 'email', e.target.value)}
                                        error={errors.professional.email}
                                        required
                                        validation={validateEmail}
                                    />
                                    <FloatingLabelInput
                                        type="password"
                                        label="Senha"
                                        name="password"
                                        value={formData.professional.password}
                                        onChange={(e) => handleInputChange('professional', 'password', e.target.value)}
                                        error={errors.professional.password}
                                        required
                                        validation={validatePassword}
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Entrando...' : 'Entrar'}
                                    </button>
                                    <button 
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => fillTestCredentials('professional')}
                                    >
                                        Usar login de teste
                                    </button>
                                    <p className="form-footer">
                                        Não tem uma conta? <Link to="/cadastro-profissional">Cadastre-se</Link>
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Login;