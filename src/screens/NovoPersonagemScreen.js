import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { PersonagemContext } from './PersonagemContext.js';
import { AuthContext } from './AuthContext.js';


export default function NovoPersonagemScreen({ navigation }) {
   // Puxa a função de criar do banco de dados de fichas
  const { adicionarPersonagem } = useContext(PersonagemContext);
  
  // REGRA DE SEGURANÇA: Puxa o usuário que acabou de fazer login de verdade
  const { usuarioLogado } = useContext(AuthContext); 

  


  // Estados básicos e atributos brutos do Tormenta20
  const [nome, setNome] = useState('');
  const [classe, setClasse] = useState('');
  const [raca, setRaca] = useState('');
  const [origem, setOrigem] = useState('');
  const [divindade, setDivindade] = useState('');
  const [hp, setHp] = useState('');
  const [forca, setForca] = useState('');
  const [destreza, setDestreza] = useState('');
  const [constituicao, setConstituicao] = useState('');
  const [inteligencia, setInteligencia] = useState('');
  const [sabedoria, setSabedoria] = useState('');
  const [carisma, setCarisma] = useState('');
  
  // Estado para armazenar quais perícias foram marcadas como treinadas
  const [periciasEscolhidas, setPericiasEscolhidas] = useState([]);

  // Estados exclusivos para montar as Magias e Habilidades com seus respectivos Buffs
  const [magiasLista, setMagiasLista] = useState([]);
  const [magiaNome, setMagiaNome] = useState('');
  const [magiaTipo, setMagiaTipo] = useState('Magia');
  const [magiaQtdDados, setMagiaQtdDados] = useState('1');
  const [magiaDadoFaces, setMagiaDadoFaces] = useState(6); // Faces do dado (4, 6, 8, 10, 12, 20)
  const [magiaBonaFixo, setMagiaBonaFixo] = useState('0');
  const [magiaCusto, setMagiaCusto] = useState('1 PM');
  const [magiaDescricao, setMagiaDescricao] = useState(''); // O BUFF / EFEITO DA MAGIA

  const listaPericiasDisponiveis = [
    'Acrobacia', 'Adestramento', 'Atletismo', 'Atuação', 'Cavalgar', 'Conhecimento',
    'Cura', 'Diplomacia', 'Enganação', 'Fortitude', 'Furtividade', 'Guerra',
    'Iniciativa', 'Intimidação', 'Intuição', 'Investigação', 'Jogatina', 'Ladinagem',
    'Luta', 'Misticismo', 'Nobreza', 'Percepção', 'Pilotagem', 'Pontaria',
    'Reflexos', 'Religião', 'Sobrevivência', 'Vontade'
  ];

  const alternarPericia = (p) => {
    setPericiasEscolhidas(periciasEscolhidas.includes(p) ? periciasEscolhidas.filter(item => item !== p) : [...periciasEscolhidas, p]);
  };

  const preAdicionarMagia = () => {
    if (!magiaNome.trim()) {
      Alert.alert('Erro', 'Por favor, digite o nome da sua habilidade ou magia.');
      return;
    }

    const qtd = parseInt(magiaQtdDados) || 1;
    const fixo = parseInt(magiaBonaFixo) || 0;
    const stringDado = fixo > 0 ? `${qtd}d${magiaDadoFaces}+${fixo}` : `${qtd}d${magiaDadoFaces}`;

    const novaMagia = {
      nome: magiaNome.trim(),
      tipo: magiaTipo,
      dado: stringDado,
      faces: magiaDadoFaces,
      qtd: qtd,
      fixo: fixo,
      custo: magiaCusto.trim() || '0 PM',
      descricao: magiaDescricao.trim() || 'Nenhum efeito registrado.'
    };

    setMagiasLista([...magiasLista, novaMagia]);
    setMagiaNome('');
    setMagiaDescricao('');
    setMagiaBonaFixo('0');
    setMagiaQtdDados('1');
  };

const salvarPersonagem = () => {
  if (!nome || !classe) {
    Alert.alert(
      'Erro',
      'Por favor, preencha pelo menos o Nome e a Classe do herói.'
    );
    return;
  }

  const emailDono = usuarioLogado?.email
    ? usuarioLogado.email.toLowerCase().trim()
    : '';

  if (!emailDono) {
    Alert.alert(
      'Erro',
      'Não foi possível identificar o usuário logado.'
    );
    return;
  }

  const sucesso = adicionarPersonagem(
    emailDono,
    nome,
    classe,
    raca,
    origem,
    divindade,
    hp,
    forca,
    destreza,
    constituicao,
    inteligencia,
    sabedoria,
    carisma,
    periciasEscolhidas,
    magiasLista
  );

  if (!sucesso) {
    Alert.alert(
      'Erro',
      'Não foi possível salvar o personagem.'
    );
    return;
  }

  Alert.alert(
    'Sucesso',
    `${nome} foi registrado na guilda!`,
    [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]
  );
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>⬅ Voltar para a Lista</Text>
      </TouchableOpacity>

      <Text style={styles.tituloSecao}>Informações de Tormenta20</Text>
      <TextInput style={styles.input} placeholder="Nome do Personagem" placeholderTextColor="#aaa" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Classe (Ex: Arcanista)" placeholderTextColor="#aaa" value={classe} onChangeText={setClasse} />
      <TextInput style={styles.input} placeholder="Raça (Ex: Osteon)" placeholderTextColor="#aaa" value={raca} onChangeText={setRaca} />
      <TextInput style={styles.input} placeholder="Origem (Ex: Estudioso)" placeholderTextColor="#aaa" value={origem} onChangeText={setOrigem} />
      <TextInput style={styles.input} placeholder="Divindade (Ex: Wynna)" placeholderTextColor="#aaa" value={divindade} onChangeText={setDivindade} />

      <Text style={styles.tituloSecao}>Atributos Brutos</Text>
      <View style={styles.gridAtributos}>
        {[
          { label: 'HP Max', state: hp, setter: setHp }, { label: 'FOR', state: forca, setter: setForca },
          { label: 'DES', state: destreza, setter: setDestreza }, { label: 'CON', state: constituicao, setter: setConstituicao },
          { label: 'INT', state: inteligencia, setter: setInteligencia }, { label: 'SAB', state: sabedoria, setter: setSabedoria },
          { label: 'CAR', state: carisma, setter: setCarisma },
        ].map((item, idx) => (
          <View key={idx} style={styles.boxInputPequeno}>
            <Text style={styles.labelAtributo}>{item.label}</Text>
            <TextInput style={styles.inputPequeno} placeholder="10" placeholderTextColor="#555" keyboardType="numeric" value={item.state} onChangeText={item.setter} />
          </View>
        ))}
      </View>

      <Text style={styles.tituloSecao}>Escolha suas Perícias Treinadas</Text>
      <View style={styles.gridPericiasSelecao}>
        {listaPericiasDisponiveis.map((pericia) => {
          const selecionada = periciasEscolhidas.includes(pericia);
          return (
            <TouchableOpacity key={pericia} style={[styles.checkboxBtn, selecionada && styles.checkboxBtnAtivo]} onPress={() => alternarPericia(pericia)}>
              <Text style={[styles.checkboxTexto, selecionada && styles.checkboxTextoAtivo]}>
                {selecionada ? '✅ ' : '⬜ '} {pericia}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {/* --- CONSTRUTOR DE PODERES E MAGIAS COM ESCOLHA DE DADOS E BUFFS --- */}
      <Text style={styles.tituloSecao}>Adicionar Poderes & Magias 🔮</Text>
      <View style={styles.secaoFormMagia}>
        <TextInput 
          style={styles.input} 
          placeholder="Nome do Poder/Magia" 
          placeholderTextColor="#aaa" 
          value={magiaNome} 
          onChangeText={setMagiaNome} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Buff / Efeito (Ex: Dá +2 Defesa, causa cegueira)" 
          placeholderTextColor="#aaa" 
          value={magiaDescricao} 
          onChangeText={setMagiaDescricao} 
        />
        
        <View style={styles.rowDadosMagia}>
          <TextInput style={[styles.input, { flex: 1, textAlign: 'center' }]} placeholder="Qtd Dados" placeholderTextColor="#aaa" keyboardType="numeric" value={magiaQtdDados} onChangeText={setMagiaQtdDados} />
          <TextInput style={[styles.input, { flex: 1, textAlign: 'center' }]} placeholder="Bônus Fixo" placeholderTextColor="#aaa" keyboardType="numeric" value={magiaBonaFixo} onChangeText={setMagiaBonaFixo} />
          <TextInput style={[styles.input, { flex: 1, textAlign: 'center' }]} placeholder="Custo (PM)" placeholderTextColor="#aaa" value={magiaCusto} onChangeText={setMagiaCusto} />
        </View>

        {/* Seleção Manual das Faces do Dado de Efeito */}
        <Text style={styles.labelSub}>Escolha o Dado de Efeito (faces):</Text>
        <View style={styles.rowDadosSelecao}>
          {[4, 6, 8, 10, 12, 20].map((faces) => (
            <TouchableOpacity 
              key={faces} 
              style={[styles.dadoBtn, magiaDadoFaces === faces && styles.dadoBtnAtivo]} 
              onPress={() => setMagiaDadoFaces(faces)}
            >
              <Text style={[styles.dadoBtnTexto, magiaDadoFaces === faces && styles.dadoBtnTextoAtivo]}>D{faces}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.btnAdicionarMagiaLista} onPress={preAdicionarMagia}>
          <Text style={styles.btnAdicionarMagiaListaTexto}>+ Incluir Habilidade na Ficha</Text>
        </TouchableOpacity>

        {/* Listagem das magias que estão sendo construídas para esta ficha */}
        {magiasLista.map((m, i) => (
          <Text key={i} style={styles.magiaCriadaItem}>✨ {m.nome} ({m.dado}) - Buff: {m.descricao}</Text>
        ))}
      </View>

      {/* Botão Principal de Conclusão */}
      <TouchableOpacity style={styles.button} onPress={salvarPersonagem}>
        <Text style={styles.buttonText}>Salvar e Criar Personagem ⚔️</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- TODAS AS REGRAS DE LAYOUT E IDENTIDADE VISUAL DA TAUNA ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 24 },
  content: { paddingTop: 20, paddingBottom: 60 },
  backButton: { marginBottom: 20 },
  backText: { color: '#d29642', fontSize: 16 },
  tituloSecao: { color: '#d29642', fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 14, borderBottomWidth: 1, borderColor: '#333', paddingBottom: 6 },
  input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 14, borderRadius: 8, marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: '#333' },
  gridAtributos: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginBottom: 16 },
  boxInputPequeno: { width: '31%', marginBottom: 6 },
  labelAtributo: { color: '#ccc', fontSize: 13, marginBottom: 4, textAlign: 'center' },
  inputPequeno: { backgroundColor: '#1e1e1e', color: '#fff', padding: 10, borderRadius: 8, fontSize: 15, borderWidth: 1, borderColor: '#333', textAlign: 'center' },
  gridPericiasSelecao: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, marginBottom: 16 },
  checkboxBtn: { width: '48%', backgroundColor: '#1e1e1e', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#333', marginBottom: 4 },
  checkboxBtnAtivo: { borderColor: '#d29642', backgroundColor: '#2a2215' },
  checkboxTexto: { color: '#aaa', fontSize: 13 },
  checkboxTextoAtivo: { color: '#fff', fontWeight: 'bold' },
  
  // Painel Construtor de Magias
  secaoFormMagia: { backgroundColor: '#1a1a1a', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#222', marginBottom: 16 },
  rowDadosMagia: { flexDirection: 'row', gap: 8 },
  labelSub: { color: '#aaa', fontSize: 13, marginBottom: 8, marginTop: 4 },
  rowDadosSelecao: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  dadoBtn: { backgroundColor: '#222', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#333', flex: 1, alignItems: 'center', marginHorizontal: 2 },
  dadoBtnAtivo: { backgroundColor: '#d29642', borderColor: '#d29642' },
  dadoBtnTexto: { color: '#aaa', fontWeight: 'bold', fontSize: 12 },
  dadoBtnTextoAtivo: { color: '#000' },
  btnAdicionarMagiaLista: { backgroundColor: '#222', borderWidth: 1, borderColor: '#3399ff', padding: 12, borderRadius: 6, alignItems: 'center', marginBottom: 12 },
  btnAdicionarMagiaListaTexto: { color: '#3399ff', fontWeight: 'bold', fontSize: 14 },
  magiaCriadaItem: { color: '#ccc', fontSize: 13, fontStyle: 'italic', marginBottom: 4, paddingLeft: 4 },

  button: { backgroundColor: '#d29642', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold' }
});
