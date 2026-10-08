import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // 👈 Importante!

import AuthProvider, { AuthContext } from './src/screens/AuthContext.js';
import PersonagemProvider from './src/screens/PersonagemContext.js';

// Telas
import LoginScreen from './src/screens/LoginScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import HomeScreen from './src/screens/HomeScreen';
import NovoPersonagemScreen from './src/screens/NovoPersonagemScreen';
import VisualizarFichaScreen from './src/screens/VisualizarFichaScreen';
import EsqueciSenhaScreen from './src/screens/EsqueciSenhaScreen';
import NovaSenhaScreen from './src/screens/NovaSenhaScreen';

const Stack = createNativeStackNavigator();

function NavegadorPrincipal() {
  const { carregando } = useContext(AuthContext);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d29642" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#121212' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
      <Stack.Screen name="EsqueciSenha" component={EsqueciSenhaScreen} />
      <Stack.Screen name="NovaSenha" component={NovaSenhaScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="NovoPersonagem" component={NovoPersonagemScreen} />
      <Stack.Screen name="VisualizarFicha" component={VisualizarFichaScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PersonagemProvider>
          <NavigationContainer>
            <NavegadorPrincipal />
          </NavigationContainer>
        </PersonagemProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
});