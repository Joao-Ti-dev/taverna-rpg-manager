import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { AuthContext } from './AuthContext.js'; // Importando a segurança

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const { validarLogin } = useContext(AuthContext);

  const handleLogin = () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Aviso', 'Preencha o e-mail e a senha.');
      return;
    }

    // Roda a checagem no contexto de autenticação
    const autorizado = validarLogin(email.trim(), senha);

    if (autorizado) {
      // Se estiver correto, entra no app de verdade
      navigation.replace('Home');
    } else {
      // Se errar, exibe o bloqueio na tela
      Alert.alert('Acesso Negado 🛑', 'E-mail ou senha incorretos! Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/icone.jpeg')} 
        style={styles.logoImage} 
      />
      
      <Text style={styles.subtitle}>Gerencie suas fichas na Taverna</Text>

      <TextInput 
        style={styles.input} 
        placeholder="E-mail do Jogador" 
        placeholderTextColor="#888" 
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address" 
        autoCapitalize="none"
      />
      <TextInput 
        style={styles.input} 
        placeholder="Senha" 
        placeholderTextColor="#888" 
        secureTextEntry 
        value={senha} 
        onChangeText={setSenha} 
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar na Taverna</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.linkText}>Criar nova conta de aventureiro</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', padding: 24 },
  logoImage: { width: 140, height: 140, alignSelf: 'center', marginBottom: 8, borderRadius: 20 },
  subtitle: { fontSize: 15, color: '#d29642', textAlign: 'center', marginBottom: 32, fontStyle: 'italic', fontWeight: '500' },
  input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#444' },
  button: { backgroundColor: '#d29642', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#d29642', textAlign: 'center', marginTop: 20, fontSize: 14, textDecorationLine: 'underline' }
});
