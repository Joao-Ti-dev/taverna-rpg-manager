import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import AuthProvider, { AuthContext } from './src/screens/AuthContext.js';
import PersonagemProvider from './src/screens/PersonagemContext.js';

// Importando as suas telas normalmente
import LoginScreen from './src/screens/LoginScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import HomeScreen from './src/screens/HomeScreen';
import NovoPersonagemScreen from './src/screens/NovoPersonagemScreen';
import VisualizarFichaScreen from './src/screens/VisualizarFichaScreen';

function NavegadorPrincipal() {
  const { carregando } = useContext(AuthContext);
  
  // Força o aplicativo a sempre começar obrigatoriamente na tela de Login
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [personagemSelecionado, setPersonagemSelecionado] = useState(null);

  const navigationMock = {
    navigate: (screenName, params) => {
      if (params && params.personagem) {
        setPersonagemSelecionado(params.personagem);
      }
      setCurrentScreen(screenName);
    },
    replace: (screenName) => setCurrentScreen(screenName),
    goBack: () => setCurrentScreen('Home')
  };

  // Mostra o carregamento enquanto o celular lê as contas salvas no disco
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
