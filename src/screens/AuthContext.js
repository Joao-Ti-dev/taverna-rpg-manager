import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { obterConexaoBanco, inicializarBancoDeDados } from '../database/database.js';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    function prepararAutenticacao() {
      try {
        inicializarBancoDeDados();
        AsyncStorage.getItem('@TavernaRPG:sessao').then((sessaoAtiva) => {
          if (sessaoAtiva) setUsuarioLogado(JSON.parse(sessaoAtiva));
          setCarregando(false);
        });
      } catch (error) {
        console.log('Erro ao inicializar auth:', error);
        setCarregando(false);
      }
    }
    prepararAutenticacao();
  }, []);

  const cadastrarUsuario = (email, senha) => {
    const emailLimpo = email.toLowerCase().trim();
    try {
      const db = obterConexaoBanco();
      const resultado = db.execute('SELECT * FROM usuarios WHERE email = ?', [emailLimpo]);
      
      if (resultado.rows && resultado.rows.length > 0) return false;

      db.execute('INSERT INTO usuarios (email, senha) VALUES (?, ?)', [emailLimpo, senha]);
      return true;
    } catch (error) {
      console.log('Erro ao cadastrar usuário:', error);
      return false;
    }
  };

  const validarLogin = (email, senha) => {
    const emailLimpo = email.toLowerCase().trim();
    try {
      const db = obterConexaoBanco();
      const resultado = db.execute('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [emailLimpo, senha]);

      if (resultado.rows && resultado.rows.length > 0) {
        const usuario = resultado.rows[0];
        setUsuarioLogado(usuario);
        AsyncStorage.setItem('@TavernaRPG:sessao', JSON.stringify(usuario));
        return true;
      }
      return false;
    } catch (error) {
      console.log('Erro ao validar login:', error);
      return false;
    }
  };

  const deslogarUsuario = () => {
    setUsuarioLogado(null);
    AsyncStorage.removeItem('@TavernaRPG:sessao');
  };

  return (
    <AuthContext.Provider value={{ usuarioLogado, carregando, cadastrarUsuario, validarLogin, deslogarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
