import React, { useContext, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { PersonagemContext } from './PersonagemContext.js';
import { AuthContext } from './AuthContext.js';

export default function HomeScreen({ navigation }) {
  // =====================================================
  // CONTEXTOS
  // =====================================================
  const { todosPersonagens, carregarFichasDoBanco } = useContext(PersonagemContext);
  const { usuarioLogado, deslogarUsuario } = useContext(AuthContext);

  // =====================================================
  // E-MAIL DO USUÁRIO LOGADO
  // =====================================================
  const emailUsuarioAtual =
    typeof usuarioLogado?.email === 'string'
      ? usuarioLogado.email.toLowerCase().trim()
      : '';

  // =====================================================
  // CARREGAR AS FICHAS AO FOCAR NA TELA (useFocusEffect)
  // =====================================================
  useFocusEffect(
    useCallback(() => {
      if (!emailUsuarioAtual) {
        console.log('⚠️ Home: nenhum e-mail encontrado no usuário logado.');
        return;
      }

      console.log('👤 Home carregando fichas de:', emailUsuarioAtual);
      carregarFichasDoBanco(emailUsuarioAtual);
    }, [emailUsuarioAtual, carregarFichasDoBanco])
  );

  // =====================================================
  // FILTRAR FICHAS
  // =====================================================
  const fichasDoUsuario = todosPersonagens.filter((p) => {
    const dono =
      typeof p.donoDoPersonagem === 'string'
        ? p.donoDoPersonagem.toLowerCase().trim()
        : '';

    return dono === emailUsuarioAtual;
  });

  // =====================================================
  // LOGOUT
  // =====================================================
  const handleSair = () => {
    deslogarUsuario();
    navigation.replace('Login');
  };

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <View style={styles.container}>
      {/* BARRA SUPERIOR */}
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Aventureiro</Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {emailUsuarioAtual || 'E-mail não identificado'}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleSair}>
          <Text style={styles.logoutBtnText}>Sair 🚪</Text>
        </TouchableOpacity>
      </View>

      {/* TÍTULO */}
      <Text style={styles.headerTitle}>Seus Personagens</Text>

      {/* LISTA DE PERSONAGENS */}
      <FlatList
        data={fichasDoUsuario}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('VisualizarFicha', { personajeInicial: item, id: item.id })}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNome}>{item.nome}</Text>
              <Text style={styles.cardSub}>
                {item.classe || 'Sem classe'}
                {' • '}
                Nível {item.nivel || 1}
              </Text>
              <Text style={styles.cardEmail}>{item.donoDoPersonagem}</Text>
            </View>

            <Text style={styles.seta}>➔</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nenhum personagem encontrado</Text>
            <Text style={styles.emptyText}>
              As fichas criadas nesta conta aparecerão aqui.
            </Text>

            {emailUsuarioAtual ? (
              <Text style={styles.debugEmail}>
                Conta:{'\n'}
                {emailUsuarioAtual}
              </Text>
            ) : (
              <Text style={styles.errorEmail}>
                ⚠️ Não foi possível identificar o e-mail da conta.
              </Text>
            )}
          </View>
        }
      />

      {/* BOTÃO NOVO PERSONAGEM */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NovoPersonagem')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// =====================================================
// ESTILOS
// =====================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
    paddingTop: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
  },
  welcomeText: {
    color: '#888',
    fontSize: 12,
  },
  userEmail: {
    color: '#d29642',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#ff5555',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutBtnText: {
    color: '#ff5555',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 18,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  cardInfo: {
    flex: 1,
  },
  cardNome: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  cardSub: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
  cardEmail: {
    color: '#777',
    fontSize: 11,
    marginTop: 5,
  },
  seta: {
    color: '#d29642',
    fontSize: 16,
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 25,
  },
  emptyTitle: {
    color: '#aaa',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyText: {
    color: '#555',
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 20,
  },
  debugEmail: {
    color: '#d29642',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
  },
  errorEmail: {
    color: '#ff5555',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#d29642',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: {
    color: '#000',
    fontSize: 28,
    fontWeight: 'bold',
  },
});