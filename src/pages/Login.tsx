import React, { useState } from 'react';
import './Login.css';
import { loginUser } from '../services/LoginService';
import { useNavigate } from 'react-router-dom';
import { getAllItems, deleteItem, updateItem, moveItem, registerItem } from '../services/ItemsService';
import { saveUserRoleFromToken } from '../services/AuthService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try{
      const response = await loginUser({id, password: senha});
      console.log('token: ', response.token);
      localStorage.setItem("tokenUser",response.token);
      localStorage.setItem("idUser", id);
      saveUserRoleFromToken(response.token);
      console.log('token salvo: ', localStorage.getItem("tokenUser"));
      
      const itens = await getAllItems();
      console.log('Itens recebidos após login:', itens[0]);

      navigate('/items');
    }catch(error){
      console.log('deu erro aqui bicho', error);
      
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <label htmlFor="id">ID:</label>
        <input
          type="text"
          id="id"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="login-input"
          required
        />

        <label htmlFor="senha">Senha:</label>
        <input
          type="password"
          id="senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="login-input"
          required
        />

        <button type="submit" className="login-button">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
