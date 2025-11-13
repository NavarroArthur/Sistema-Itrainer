import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import CadastroCliente from './components/CadastroCliente';
import CadastroProfissional from './components/CadastroProfissional';
import Contato from './components/Contato';
import Sobre from './components/Sobre';
import PerfilCliente from './components/PerfilCliente';
import PainelProfissional from './components/PainelProfissional';
import Profissionais from './components/Profissionais';
import PerfilProfissional from './components/PerfilProfissional';
import Planos from './components/Planos';
import ScrollToTop from './components/ScrollToTop';
import Breadcrumbs from './components/Breadcrumbs';
import PageTransition from './components/PageTransition';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import './App.css';

const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <PageTransition>
      <Breadcrumbs />
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro-cliente" element={<CadastroCliente />} />
        <Route path="/cadastro-profissional" element={<CadastroProfissional />} />
        <Route path="/planos" element={<Planos />} />
        <Route path="/profissionais" element={<Profissionais />} />
        <Route path="/profissional/:id" element={<PerfilProfissional />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/perfil-cliente" element={<PerfilCliente />} />
        <Route path="/painel-profissional" element={<PainelProfissional />} />
      </Routes>
    </PageTransition>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <div className="App">
            <Header />
            <AppRoutes />
            <Footer />
            <ScrollToTop />
          </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
