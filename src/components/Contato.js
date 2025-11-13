import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Contato.css';

const Contato = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

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

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validação básica
        if (!formData.name || !formData.email || !formData.message) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Simular envio
        console.log('Dados do contato:', formData);
        
        // Simular sucesso
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        });
    };

    return (
        <main>
            <section 
                className="hero"
                style={{
                    backgroundImage: `linear-gradient(135deg, rgba(102,126,234,0.4), rgba(118,75,162,0.4)), url(https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <div className="hero-content" data-aos="fade-up">
                    <h1>Entre em Contato</h1>
                    <p>Estamos aqui para ajudar você a alcançar seus objetivos</p>
                </div>
                <div className="hero-overlay"></div>
            </section>

            <section className="contact-section">
                <div className="container">
                    <div className="contact-grid">
                        <div className="contact-info" data-aos="fade-right">
                            <h2>Informações de Contato</h2>
                            <div className="info-item">
                                <i className="fas fa-map-marker-alt"></i>
                                <div>
                                    <h3>Endereço</h3>
                                    <p>Av. Principal, 123 - Centro</p>
                                    <p>Rio de Janeiro - RJ</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <i className="fas fa-phone"></i>
                                <div>
                                    <h3>Telefone</h3>
                                    <p>(21) 1234-5678</p>
                                    <p>(21) 98765-4321</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <i className="fas fa-envelope"></i>
                                <div>
                                    <h3>Email</h3>
                                    <p>contato@iTrainer.com</p>
                                    <p>suporte@iTrainer.com</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <i className="fas fa-clock"></i>
                                <div>
                                    <h3>Horário de Atendimento</h3>
                                    <p>Segunda a Sexta: 8h às 20h</p>
                                    <p>Sábado: 8h às 14h</p>
                                    <p>Domingo: Fechado</p>
                                </div>
                            </div>
                        </div>

                        <div className="contact-form" data-aos="fade-left">
                            <h2>Envie sua Mensagem</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Nome Completo</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        name="name" 
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
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
                                    <label htmlFor="phone">Telefone</label>
                                    <input 
                                        type="tel" 
                                        id="phone" 
                                        name="phone" 
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="subject">Assunto</label>
                                    <select 
                                        id="subject" 
                                        name="subject" 
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Selecione um assunto</option>
                                        <option value="agendamento">Agendamento de Treino</option>
                                        <option value="duvidas">Dúvidas</option>
                                        <option value="orcamento">Orçamento</option>
                                        <option value="outros">Outros</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="message">Mensagem</label>
                                    <textarea 
                                        id="message" 
                                        name="message" 
                                        rows="5" 
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary">Enviar Mensagem</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <section className="map-section">
                <div className="container">
                    <div className="map-container" data-aos="fade-up">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3673.121794492808!2d-43.18094768452811!3d-22.9064191!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x997f58a6a00a9d%3A0x3f251d85272f76f7!2sAv.%20Rio%20Branco%2C%201%20-%20Centro%2C%20Rio%20de%20Janeiro%20-%20RJ%2C%2020090-003!5e0!3m2!1spt-BR!2sbr!4v1648123456789!5m2!1spt-BR!2sbr" 
                            width="100%" 
                            height="450" 
                            style={{border: 0}} 
                            allowFullScreen="" 
                            loading="lazy"
                            title="Localização iTrainer"
                        ></iframe>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Contato;