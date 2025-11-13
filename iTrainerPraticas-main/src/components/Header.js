import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './Header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const { darkMode, toggleDarkMode } = useTheme();

    useEffect(() => {
        // Header Scroll Effect
        const handleScroll = () => {
            const currentScroll = window.pageYOffset;
            setIsScrolled(currentScroll > 0);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Atualiza usuário sempre que a rota mudar
    useEffect(() => {
        const userData = localStorage.getItem('itrainer_user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            setUser(null);
        }
    }, [location]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('itrainer_user');
        localStorage.removeItem('itrainer_token');
        setUser(null);
        window.location.href = '/';
    };

    return (
        <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                <div className="logo">
                    <Link to="/">
                        <div className="logo-container">
                            <i className="fas fa-dumbbell"></i>
                        </div>
                        <span className="logo-text">iTrainer</span>
                    </Link>
                </div>
                
                <button 
                    className="mobile-nav-toggle" 
                    aria-controls="primary-navigation" 
                    aria-expanded={isMenuOpen}
                    onClick={toggleMenu}
                >
                    <span className="sr-only">Menu</span>
                    <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>
                
                <nav 
                    className={`primary-navigation ${isMenuOpen ? 'active' : ''}`} 
                    id="primary-navigation"
                    data-visible={isMenuOpen}
                >
                    <ul className="nav-list">
                        <li className="nav-item">
                            <Link to="/" className="nav-link" onClick={closeMenu}>Inicio</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/profissionais" className="nav-link" onClick={closeMenu}>Profissionais</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/planos" className="nav-link" onClick={closeMenu}>Planos</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/contato" className="nav-link" onClick={closeMenu}>Contato</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/sobre" className="nav-link" onClick={closeMenu}>Sobre</Link>
                        </li>
                        <li className="nav-item">
                            <button 
                                className="theme-toggle" 
                                onClick={toggleDarkMode}
                                aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
                                title={darkMode ? 'Modo claro' : 'Modo escuro'}
                            >
                                <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                            </button>
                        </li>
                        <li className="nav-item">
                            {user ? (
                                <>
                                    <Link 
                                        to={user.type === 'client' ? '/perfil-cliente' : '/painel-profissional'} 
                                        className="btn-login"
                                        onClick={closeMenu}
                                    >
                                        {user.type === 'client' ? 'Meu Perfil' : 'Área do Profissional'}
                                    </Link>
                                    <a href="#" className="btn-logout" onClick={handleLogout}>
                                        Sair
                                    </a>
                                </>
                            ) : (
                                <Link to="/login" className="btn-login" onClick={closeMenu}>
                                    Login
                                </Link>
                            )}
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;