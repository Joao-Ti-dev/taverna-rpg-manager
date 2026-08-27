import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  obterConexaoBanco,
  inicializarBancoDeDados,
  verificarUsuarios
} from '../database/database.js';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [carregando, setCarregando] = useState(true);

 useEffect(() => {
  const iniciar = async () => {
    try {
      inicializarBancoDeDados();
      verificarUsuarios();

      const sessaoAtiva = await AsyncStorage.getItem(
        '@TavernaRPG:sessao'
      );

      if (sessaoAtiva) {
        const sessao = JSON.parse(sessaoAtiva);

        console.log('📦 Sessão recuperada:', sessao);
        console.log('📧 E-mail recuperado:', sessao?.email);

        setUsuarioLogado(sessao);
      } else {
        console.log('ℹ️ Nenhuma sessão encontrada.');
      }

    } catch (error) {
      console.error('❌ Erro ao inicializar auth:', error);
    } finally {
      setCarregando(false);
    }
  };

  iniciar();
}, []);

const cadastrarUsuario = (email, senha) => {
  const emailLimpo = email.toLowerCase().trim();

  try {
    const db = obterConexaoBanco();

    const resultado = db.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [emailLimpo]
    );

    console.log('📧 E-mail pesquisado:', emailLimpo);
    console.log('🔎 Resultado:', resultado);

    // Verifica se realmente existe algum registro
    const existeUsuario =
      resultado &&
      resultado.rows &&
      resultado.rows.length > 0;

    if (existeUsuario) {
      console.log('⚠️ E-mail já cadastrado:', emailLimpo);
      return false;
    }

    db.execute(
      'INSERT INTO usuarios (email, senha) VALUES (?, ?)',
      [emailLimpo, senha]
    );

    console.log('✅ Usuário cadastrado:', emailLimpo);

    return true;

  } catch (error) {
    console.error('❌ Erro ao cadastrar usuário:', error);
    return false;
  }
};

 const validarLogin = (email, senha) => {
  const emailLimpo = String(email || '').toLowerCase().trim();
  const senhaLimpa = String(senha || '');

  try {
    const db = obterConexaoBanco();

    const resultado = db.execute(
      'SELECT * FROM usuarios WHERE email = ? AND senha = ?',
      [emailLimpo, senhaLimpa]
    );

    console.log('🔐 Tentativa de login:', emailLimpo);
    console.log('🔎 Resultado do login:', resultado);

    if (!resultado || !resultado.rows) {
      console.error('❌ O banco não retornou as linhas.');
      return false;
    }

    // react-native-quick-sqlite normalmente disponibiliza os dados em _array
    const usuarios = resultado.rows._array || [];

    console.log('👤 Usuários encontrados:', usuarios);

    if (usuarios.length === 0) {
      console.log('❌ E-mail ou senha incorretos.');
      return false;
    }

    const usuario = usuarios[0];

    console.log('✅ Usuário encontrado:', usuario);
    console.log('📧 E-mail do usuário:', usuario.email);

    // Garante que o objeto da sessão tenha o e-mail
    const sessao = {
      id: usuario.id,
      email: usuario.email,
    };

    setUsuarioLogado(sessao);

    AsyncStorage.setItem(
      '@TavernaRPG:sessao',
      JSON.stringify(sessao)
    );

    console.log('💾 Sessão salva:', sessao);

    return true;

  } catch (error) {
    console.error('❌ Erro ao validar login:', error);
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
