import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from './AuthContext';
import { obterConexaoBanco } from '../database/database.js';

export default function EsqueciSenhaScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleEnviar = () => {
    const emailLimpo = email.toLowerCase().trim();

    if (!emailLimpo) {
      Alert.alert('Atenção', 'Por favor, digite o seu e-mail.');
      return;
    }

    try {
      const db = obterConexaoBanco();
      const resultado = db.execute(
        'SELECT id FROM usuarios WHERE email = ?',
        [emailLimpo]
      );

      const usuarios = resultado?.rows?._array || [];

      if (usuarios.length === 0) {
        Alert.alert('E-mail não encontrado', 'Este e-mail não está cadastrado no sistema.');
        return;
      }

      // Se o e-mail existe, navega para a tela de nova senha levando o e-mail adiante
      navigation.navigate('NovaSenha', { email: emailLimpo });

    } catch (error) {
      console.error('❌ Erro ao verificar e-mail:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao verificar o e-mail. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>RPG MOBILE</Text>
      
      <Text style={styles.subtitulo}>Recuperar senha</Text>
      <Text style={styles.descricao}>Digite o e-mail cadastrado:</Text>

      <TextInput
        style={styles.input}
        placeholder="Seu e-mail"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.botao} onPress={handleEnviar}>
        <Text style={styles.textoBotao}>ENVIAR</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.botaoVoltar} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.textoVoltar}>Voltar para o Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    letterSpacing: 2,
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  descricao: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#fff',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  botao: {
    width: '100%',
    height: 50,
    backgroundColor: '#4e6ef2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoVoltar: {
    marginTop: 10,
  },
  textoVoltar: {
    color: '#888',
    fontSize: 14,
  },
});