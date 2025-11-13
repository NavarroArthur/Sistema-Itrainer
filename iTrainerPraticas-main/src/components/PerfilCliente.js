import React, { useEffect, useState, useRef } from 'react';
import './PerfilCliente.css';

const PerfilCliente = () => {
  const [user, setUser] = useState(null);
  const [aluno, setAluno] = useState(undefined);
  const [aulas, setAulas] = useState([]);  // Será implementado posteriormente
  const [fotoPreview, setFotoPreview] = useState(null);
  const inputFotoRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('itrainer_user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      // Buscar dados completos do aluno
      const allUsers = JSON.parse(localStorage.getItem('itrainer_users') || '[]');
      const alunoData = allUsers.find(u => u.email === userObj.email && u.tipo === 'client');
      if (alunoData) {
        setAluno(alunoData);
        if (alunoData.foto) {
          setFotoPreview(alunoData.foto);
        }
      }
    }
  }, []);

  const handleFotoClick = () => {
    inputFotoRef.current?.click();
  };

  const handleFotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
        salvarFoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const salvarFoto = (fotoBase64) => {
    const allUsers = JSON.parse(localStorage.getItem('itrainer_users') || '[]');
    const userIndex = allUsers.findIndex(u => u.email === user.email && u.tipo === 'client');
    
    if (userIndex !== -1) {
      allUsers[userIndex] = {
        ...allUsers[userIndex],
        foto: fotoBase64
      };
      localStorage.setItem('itrainer_users', JSON.stringify(allUsers));
      setAluno(allUsers[userIndex]);
    }
  };

  // Calcular idade a partir da data de nascimento
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

  const idade = aluno ? calcularIdade(aluno.data_nascimento) : null;

  if (!user) {
    return (
      <main className="perfil-container">
        <div className="perfil-header">
          <h1>Perfil do Cliente</h1>
          <p>Usuário não encontrado. Faça login novamente.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="perfil-container">
      <div className="perfil-header">
        <div className="perfil-foto-container" onClick={handleFotoClick}>
          <div className="perfil-foto">
            {fotoPreview ? (
              <img src={fotoPreview} alt={`Foto de ${user.name}`} />
            ) : (
              <div className="perfil-foto-placeholder">👤</div>
            )}
            <div className="foto-overlay">
              <span>Clique para alterar a foto</span>
            </div>
          </div>
          <input
            type="file"
            ref={inputFotoRef}
            className="foto-input"
            accept="image/*"
            onChange={handleFotoChange}
          />
        </div>
        <div className="perfil-info">
          <h1 className="perfil-nome">{user.name}</h1>
          <div className="perfil-detalhes">
            {idade && <p>{idade} anos</p>}
            {aluno?.localizacao && <p>{aluno.localizacao}</p>}
            <p>{user.email}</p>
          </div>
        </div>
      </div>

      <div className="perfil-aulas">
        <h2>Minhas Aulas</h2>
        {aulas.length > 0 ? (
          aulas.map((aula, index) => (
            <div key={index} className="aula-item">
              <div className="aula-info">
                <h3>{aula.tipo}</h3>
                <p className="aula-data">{aula.data}</p>
              </div>
              <p className="aula-professor">Prof. {aula.professor}</p>
            </div>
          ))
        ) : (
          <div className="sem-aulas">
            <p>Você ainda não tem aulas registradas.</p>
            <p>Em breve você poderá agendar aulas com nossos profissionais!</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default PerfilCliente; 