import React, { useState, useContext } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import AuthProvider, { AuthContext } from './src/screens/AuthContext.js';
import PersonagemProvider from './src/screens/PersonagemContext.js';

// Importando as telas existentes
import LoginScreen from './src/screens/LoginScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import HomeScreen from './src/screens/HomeScreen';
import NovoPersonagemScreen from './src/screens/NovoPersonagemScreen';
import VisualizarFichaScreen from './src/screens/VisualizarFichaScreen';

// 1️⃣ Importe as novas telas de recuperação de senha
import EsqueciSenhaScreen from './src/screens/EsqueciSenhaScreen';
import NovaSenhaScreen from './src/screens/NovaSenhaScreen';

function NavegadorPrincipal() {
  const { carregando } = useContext(AuthContext);
  
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [personagemSelecionado, setPersonagemSelecionado] = useState(null);
  
  // 2️⃣ Estado temporário para guardar o e-mail que vai passar de uma tela para a outra
  const [emailRecuperacao, setEmailRecuperacao] = useState('');

  const navigationMock = {
    navigate: (screenName, params) => {
      // Se houver parâmetros sendo passados (como o e-mail ou o personagem)
      if (params) {
        if (params.personagem) {
          setPersonagemSelecionado(params.personagem);
        }
        if (params.email) {
          setEmailRecuperacao(params.email);
        }
      }
      setCurrentScreen(screenName);
    },
    replace: (screenName) => setCurrentScreen(screenName),
    goBack: () => setCurrentScreen('Login') // Ajustado para voltar para o Login de forma segura
  };

  if (carregando) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#d29642" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentScreen === 'Login' && <LoginScreen navigation={navigationMock} />}
      {currentScreen === 'Cadastro' && <CadastroScreen navigation={navigationMock} />}
      
      {/* 3️⃣ Adicione as rotas das novas telas aqui */}
      {currentScreen === 'EsqueciSenha' && <EsqueciSenhaScreen navigation={navigationMock} />}
      {currentScreen === 'NovaSenha' && (
        <NovaSenhaScreen 
          navigation={navigationMock} 
          route={{ params: { email: emailRecuperacao } }} 
        />
      )}

      {currentScreen === 'Home' && <HomeScreen navigation={navigationMock} />}
      {currentScreen === 'NovoPersonagem' && <NovoPersonagemScreen navigation={navigationMock} />}
      {currentScreen === 'VisualizarFicha' && (
        <VisualizarFichaScreen navigation={navigationMock} personajeInicial={personagemSelecionado} />
      )}
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PersonagemProvider>
        <NavegadorPrincipal />
      </PersonagemProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
});