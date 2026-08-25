import React, { useContext } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { PersonagemContext } from './PersonagemContext.js';
import { AuthContext } from './AuthContext.js'; // Importando o contexto de autenticação

export default function HomeScreen({ navigation }) {
  // Lendo todas as fichas globais e a sessão ativa do usuário logado
  const { todosPersonagens } = useContext(PersonagemContext);
  const { usuarioLogado, deslogarUsuario } = useContext(AuthContext);

  const emailUsuarioAtual = usuarioLogado?.email || '';

  // Filtro cirúrgico: mostra apenas as fichas criadas por este e-mail específico
    // Filtro atualizado: força ambos os lados a ficarem em minúsculas
  const fichasDoUsuario = todosPersonagens.filter(
    (p) => p.donoDoPersonagem?.toLowerCase().trim() === emailUsuarioAtual.toLowerCase().trim()
  );


  const handleSair = () => {
    deslogarUsuario();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      {/* Barra superior com botão de Logout temática */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.welcomeText}>Aventureiro</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{emailUsuarioAtual}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSair}>
          <Text style={styles.logoutBtnText}>Sair 🚪</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.headerTitle}>Seus Personagens</Text>
      
      <FlatList
        data={fichasDoUsuario} // Carrega apenas a lista filtrada
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('VisualizarFicha', { personagem: item })}
          >
            <View>
              <Text style={styles.cardNome}>{item.nome}</Text>
              <Text style={styles.cardSub}>{item.classe} • Nível {item.nivel}</Text>
            </View>
            <Text style={styles.seta}>➔</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Sua guilda está vazia. Toque no botão flutuante para iniciar sua primeira jornada.</Text>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NovoPersonagem')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16, paddingTop: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1a1a', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#222' },
  welcomeText: { color: '#888', fontSize: 12 },
  userEmail: { color: '#d29642', fontSize: 14, fontWeight: 'bold', maxWidth: 180 },
  logoutBtn: { backgroundColor: '#222', borderWidth: 1, borderColor: '#ff5555', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  logoutBtnText: { color: '#ff5555', fontSize: 12, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', letterSpacing: 0.5 },
  card: { backgroundColor: '#1e1e1e', padding: 18, borderRadius: 8, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  cardNome: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  cardSub: { color: '#aaa', fontSize: 13, marginTop: 2 },
  seta: { color: '#d29642', fontSize: 16 },
  emptyText: { color: '#555', textAlign: 'center', marginTop: 40, paddingHorizontal: 20, fontStyle: 'italic', fontSize: 14, lineHeight: 20 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#d29642', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  fabText: { color: '#000', fontSize: 28, fontWeight: 'bold' }
});
