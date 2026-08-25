import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { AuthContext } from './AuthContext.js'; // Importando a segurança

export default function CadastroScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  const { cadastrarUsuario } = useContext(AuthContext);

  const handleCadastro = () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    // Tenta registrar a conta no banco de dados temporário
    const sucesso = cadastrarUsuario(email.trim(), senha);

    if (sucesso) {
      Alert.alert('Sucesso 🎉', 'Sua conta de aventureiro foi criada!', [
        { text: 'Ir para o Login', onPress: () => navigation.navigate('Login') }
      ]);
    } else {
      Alert.alert('Erro ❌', 'Este e-mail já está cadastrado na guilda.');
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/background.jpeg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
          <Text style={styles.backText}>⬅ Voltar para o Login</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Novo Aventureiro</Text>
        
        <TextInput 
          style={styles.input} 
          placeholder="E-mail" 
          placeholderTextColor="#888" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
          autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Senha Secreta" 
          placeholderTextColor="#888" 
          secureTextEntry 
          value={senha} 
          onChangeText={setSenha} 
        />

        <TouchableOpacity style={styles.button} onPress={handleCadastro}>
          <Text style={styles.buttonText}>Registrar na Guilda</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: 24, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 50, left: 24 },
  backText: { color: '#d29642', fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: 'rgba(30, 30, 30, 0.9)', color: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#444' },
  button: { backgroundColor: '#d29642', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold' }
});
