import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from './AuthContext';

export default function NovaSenhaScreen({ route, navigation }) {
  const { email } = route.params;
  const { alterarSenha } = useContext(AuthContext);

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const handleAlterarSenha = async () => {
    if (!novaSenha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    if (novaSenha.length < 6) {
      Alert.alert('Atenção', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    // Usamos await para aguardar a resposta real da função
    const sucesso = await alterarSenha(email, novaSenha);

    if (sucesso) {
      Alert.alert(
        'Sucesso!', 
        'Senha alterada com sucesso!', 
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } else {
      Alert.alert('Erro', 'Não foi possível alterar a senha. Verifique se o e-mail existe.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>RPG MOBILE</Text>

      <Text style={styles.subtitulo}>Nova senha</Text>

      <TextInput
        style={styles.input}
        placeholder="Nova senha"
        placeholderTextColor="#888"
        secureTextEntry
        value={novaSenha}
        onChangeText={setNovaSenha}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar nova senha"
        placeholderTextColor="#888"
        secureTextEntry
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
      />

      <TouchableOpacity style={styles.botao} onPress={handleAlterarSenha}>
        <Text style={styles.textoBotao}>ALTERAR SENHA</Text>
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
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  botao: {
    width: '100%',
    height: 50,
    backgroundColor: '#28a745',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});