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

        const sessaoAtiva = await AsyncStorage.getItem('@TavernaRPG:sessao');

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

      // getFirstSync retorna diretamente o objeto do usuário se encontrado, ou null
      const usuarioExistente = db.getFirstSync(
        'SELECT id FROM usuarios WHERE email = ?',
        [emailLimpo]
      );

      console.log('📧 E-mail pesquisado:', emailLimpo);

      if (usuarioExistente) {
        console.log('⚠️ E-mail já cadastrado:', emailLimpo);
        return false;
      }

      // runSync executa comandos de alteração/inserção no banco
      db.runSync(
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

      const usuario = db.getFirstSync(
        'SELECT * FROM usuarios WHERE email = ? AND senha = ?',
        [emailLimpo, senhaLimpa]
      );

      console.log('🔐 Tentativa de login:', emailLimpo);

      if (!usuario) {
        console.log('❌ E-mail ou senha incorretos.');
        return false;
      }

      console.log('✅ Usuário encontrado:', usuario);

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

  const alterarSenha = (email, novaSenha) => {
    const emailLimpo = String(email || '').toLowerCase().trim();
    const senhaLimpa = String(novaSenha || '');

    if (!emailLimpo || !senhaLimpa) {
      console.log('⚠️ E-mail ou nova senha inválidos.');
      return false;
    }

    try {
      const db = obterConexaoBanco();

      // 1. Verifica se o usuário existe
      const usuario = db.getFirstSync(
        'SELECT id FROM usuarios WHERE email = ?',
        [emailLimpo]
      );

      if (!usuario) {
        console.log('❌ E-mail não encontrado no banco.');
        return false;
      }

      // 2. Atualiza a senha no SQLite
      const resultado = db.runSync(
        'UPDATE usuarios SET senha = ? WHERE email = ?',
        [senhaLimpa, emailLimpo]
      );

      console.log('✅ Senha alterada com sucesso para:', emailLimpo);
      return resultado.changes > 0;

    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error);
      return false;
    }
  };

  const deslogarUsuario = () => {
    setUsuarioLogado(null);
    AsyncStorage.removeItem('@TavernaRPG:sessao');
  };

  return (
    <AuthContext.Provider
      value={{
        usuarioLogado,
        carregando,
        cadastrarUsuario,
        validarLogin,
        deslogarUsuario,
        alterarSenha
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;