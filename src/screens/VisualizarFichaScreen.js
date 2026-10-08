import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { PersonagemContext } from './PersonagemContext.js';

export default function VisualizarFichaScreen({ navigation, route, personajeInicial: propsPersonajeInicial }) {
  const { excluirPersonagem, editarPersonagem } = useContext(PersonagemContext);

  // Captura os dados vindos da navegação (route.params) ou das props diretas
  const dadosIniciais = route?.params?.personajeInicial 
    || route?.params?.personagem 
    || route?.params 
    || propsPersonajeInicial 
    || {};

  // Resolve o ID (suporta 'id' ou 'id_personagem')
  const idPersonagem = dadosIniciais.id || dadosIniciais.id_personagem;

  const [personagem, setPersonagem] = useState({
    forca: 1, destreza: 1, constituicao: 1, inteligencia: 1, sabedoria: 1, carisma: 1,
    hpMax: 1, hpAtual: 1, pmMax: 11, pmAtual: 11, nivel: 1,
    raca: 'a', origem: 'a', divindade: 'a', classe: 'Tormenta 20',
    inventario: [],
    periciasTreinadas: [],
    magias: [],
    ...dadosIniciais,
    id: idPersonagem // Garante que o ID nunca se perca na montagem inicial
  });

  const [abaAtiva, setAbaAtiva] = useState('Ficha');
  
  // Estados separados para formulários específicos
  const [novoItemMochila, setNovoItemMochila] = useState('');
  const [nomeNovaMagia, setNomeNovaMagia] = useState('');
  const [dadoNovaMagia, setDadoNovaMagia] = useState('');

  useEffect(() => {
    const dadosAtualizados = route?.params?.personajeInicial 
      || route?.params?.personagem 
      || route?.params 
      || propsPersonajeInicial;

    if (dadosAtualizados) {
      setPersonagem(prev => ({
        ...prev,
        ...dadosAtualizados,
        id: dadosAtualizados.id || dadosAtualizados.id_personagem || prev.id
      }));
    }
  }, [route?.params, propsPersonajeInicial]);

  // Função auxiliar para atualizar o estado e o banco de forma segura
  const salvarEAtualizar = (novoEstado) => {
    setPersonagem(novoEstado);
    if (novoEstado.id) {
      editarPersonagem(novoEstado);
    } else {
      console.warn("⚠️ Não foi possível salvar: ID do personagem é indefinido.", novoEstado);
    }
  };

  const calcularModificador = (valorAtributo) => {
    const valor = parseInt(valorAtributo, 10) || 1;
    const mod = Math.floor((valor - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const obterNumModificador = (valorAtributo) => {
    return Math.floor(((parseInt(valorAtributo, 10) || 1) - 10) / 2);
  };

  const alterarValor = (campo, valor) => {
    const valorAtualNum = parseInt(personagem[campo], 10) || 1;
    const atualizado = { ...personagem, [campo]: Math.max(1, valorAtualNum + valor) };
    salvarEAtualizar(atualizado);
  };

  const adicionarEquipamento = () => {
    if (!novoItemMochila.trim()) return;
    const listaAtualizada = [...(personagem.inventario || []), novoItemMochila.trim()];
    const atualizado = { ...personagem, inventario: listaAtualizada };
    salvarEAtualizar(atualizado);
    setNovoItemMochila('');
  };

  const removerEquipamento = (indexParaRemover) => {
    const listaAtualizada = (personagem.inventario || []).filter((_, index) => index !== indexParaRemover);
    const atualizado = { ...personagem, inventario: listaAtualizada };
    salvarEAtualizar(atualizado);
  };

  const adicionarMagia = () => {
    if (!nomeNovaMagia.trim()) {
      Alert.alert('Erro', 'Digite o nome da habilidade ou magia.');
      return;
    }

    const textoDado = dadoNovaMagia.trim().toLowerCase() || '1d20';
    let qtd = 1;
    let faces = 20;
    let fixo = 0;

    if (textoDado.includes('d')) {
      const partes = textoDado.split('d');
      qtd = parseInt(partes[0], 10) || 1;
      const resto = partes[1] || '20';
      
      if (resto.includes('+')) {
        const subPartes = resto.split('+');
        faces = parseInt(subPartes[0], 10) || 20;
        fixo = parseInt(subPartes[1], 10) || 0;
      } else {
        faces = parseInt(resto, 10) || 20;
      }
    }

    const novaMagia = {
      nome: nomeNovaMagia.trim(),
      tipo: 'Magia',
      dado: dadoNovaMagia.trim() || '1d20',
      faces,
      qtd,
      fixo,
      custo: '1 PM',
      descricao: 'Habilidade aprendida durante a jornada.'
    };

    const listaMagiasAtualizada = [...(personagem.magias || []), novaMagia];
    const atualizado = { ...personagem, magias: listaMagiasAtualizada };
    
    salvarEAtualizar(atualizado);
    setNomeNovaMagia('');
    setDadoNovaMagia('');
    Alert.alert('Sucesso', `Habilidade "${novaMagia.nome}" gravada no grimório!`);
  };

  const handleExcluir = () => {
    const idParaExcluir = personagem.id || idPersonagem;
    if (!idParaExcluir) {
      Alert.alert('Erro', 'Não foi possível identificar o ID do personagem para exclusão.');
      return;
    }

    Alert.alert('Apagar', 'Deseja excluir permanentemente esta ficha?', [
      { text: 'Cancelar' }, 
      { 
        text: 'Sim', 
        onPress: () => { 
          excluirPersonagem(idParaExcluir); 
          navigation.goBack(); 
        } 
      }
    ]);
  };

  const modFOR = calcularModificador(personagem.forca);
  const modDES = calcularModificador(personagem.destreza);
  const modCON = calcularModificador(personagem.constituicao);
  const modINT = calcularModificador(personagem.inteligencia);
  const modSAB = calcularModificador(personagem.sabedoria);
  const modCAR = calcularModificador(personagem.carisma);

  const numModDES = obterNumModificador(personagem.destreza);
  const defesaTotal = 10 + numModDES;

  const listaPericias = [
    { nome: 'Acrobacia', mod: obterNumModificador(personagem.destreza), label: 'DES' },
    { nome: 'Adestramento', mod: obterNumModificador(personagem.carisma), label: 'CAR' },
    { nome: 'Atletismo', mod: obterNumModificador(personagem.forca), label: 'FOR' },
    { nome: 'Atuação', mod: obterNumModificador(personagem.carisma), label: 'CAR' },
    { nome: 'Cavalgar', mod: obterNumModificador(personagem.destreza), label: 'DES' },
    { nome: 'Conhecimento', mod: obterNumModificador(personagem.inteligencia), label: 'INT' },
    { nome: 'Cura', mod: obterNumModificador(personagem.sabedoria), label: 'SAB' },
    { nome: 'Diplomacia', mod: obterNumModificador(personagem.carisma), label: 'CAR' },
    { nome: 'Enganação', mod: obterNumModificador(personagem.carisma), label: 'CAR' },
    { nome: 'Fortitude', mod: obterNumModificador(personagem.constituicao), label: 'CON' },
    { nome: 'Furtividade', mod: obterNumModificador(personagem.destreza), label: 'DES' },
    { nome: 'Guerra', mod: obterNumModificador(personagem.inteligencia), label: 'INT' },
    { nome: 'Iniciativa', mod: obterNumModificador(personagem.destreza), label: 'DES' },
    { nome: 'Intimidação', mod: obterNumModificador(personagem.carisma), label: 'CAR' },
    { nome: 'Intuição', mod: obterNumModificador(personagem.sabedoria), label: 'SAB' },
    { nome: 'Investigação', mod: obterNumModificador(personagem.inteligencia), label: 'INT' },
    { nome: 'Jogatina', mod: obterNumModificador(personagem.carisma), label: 'CAR' },
    { nome: 'Ladinagem', mod: obterNumModificador(personagem.destreza), label: 'DES' },
    { nome: 'Luta', mod: obterNumModificador(personagem.forca), label: 'FOR' },
    { nome: 'Misticismo', mod: obterNumModificador(personagem.inteligencia), label: 'INT' },
    { nome: 'Nobreza', mod: obterNumModificador(personagem.inteligencia), label: 'INT' },
    { nome: 'Percepção', mod: obterNumModificador(personagem.sabedoria), label: 'SAB' },
    { nome: 'Pilotagem', mod: obterNumModificador(personagem.destreza), label: 'DES' },
    { nome: 'Pontaria', mod: obterNumModificador(personagem.destreza), label: 'DES' },
    { nome: 'Reflexos', mod: obterNumModificador(personagem.destreza), label: 'DES' },
    { nome: 'Religião', mod: obterNumModificador(personagem.sabedoria), label: 'SAB' },
    { nome: 'Sobrevivência', mod: obterNumModificador(personagem.sabedoria), label: 'SAB' },
    { nome: 'Vontade', mod: obterNumModificador(personagem.sabedoria), label: 'SAB' }
  ];

  return (
    <View style={styles.containerContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>⬅ Voltar para a Lista</Text>
      </TouchableOpacity>

      {/* Menu de Abas Superior */}
      <View style={styles.abasContainer}>
        <TouchableOpacity style={[styles.abaBtn, abaAtiva === 'Ficha' && styles.abaAtiva]} onPress={() => setAbaAtiva('Ficha')}>
          <Text style={[styles.abaTexto, abaAtiva === 'Ficha' && styles.abaTextoAtivo]}>Ficha</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.abaBtn, abaAtiva === 'Pericias' && styles.abaAtiva]} onPress={() => setAbaAtiva('Pericias')}>
          <Text style={[styles.abaTexto, abaAtiva === 'Pericias' && styles.abaTextoAtivo]}>Perícias & Mochila</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.abaBtn, abaAtiva === 'Magias' && styles.abaAtiva]} onPress={() => setAbaAtiva('Magias')}>
          <Text style={[styles.abaTexto, abaAtiva === 'Magias' && styles.abaTextoAtivo]}>Habilidades & Magias</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {abaAtiva === 'Ficha' ? (
          <View>
            {/* --- CABEÇALHO --- */}
            <View style={styles.headerCard}>
              <Text style={styles.sistemaBadge}>TORMENTA 20</Text>
              <Text style={styles.nome}>{personagem.nome || 'Sem Nome'}</Text>
              <Text style={styles.subInfo}>
                {personagem.raca} • {personagem.origem} • {personagem.divindade} • {personagem.classe}
              </Text>
              
              <View style={styles.rowNivelEditor}>
                <Text style={styles.nivelTexto}>Nível do Personagem: {personagem.nivel}</Text>
                <View style={styles.botoesNivelRow}>
                  <TouchableOpacity style={styles.btnNivel} onPress={() => personagem.nivel > 1 && alterarValor('nivel', -1)}>
                    <Text style={styles.btnNivelTexto}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnNivel} onPress={() => alterarValor('nivel', 1)}>
                    <Text style={styles.btnNivelTexto}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* --- STATUS VITAIS & DEFESA --- */}
            <View style={styles.rowStatusVitais}>
              <View style={[styles.boxVital, { borderColor: '#ff5555' }]}>
                <Text style={styles.vitalTitulo}>PONTOS DE VIDA</Text>
                <Text style={styles.vitalValor}>{personagem.hpAtual}/{personagem.hpMax}</Text>
                <View style={styles.botoesRowPequeno}>
                  <TouchableOpacity style={styles.btnMenosPequeno} onPress={() => alterarValor('hpAtual', -1)}>
                    <Text style={styles.btnTexto}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnMaisPequeno} onPress={() => alterarValor('hpAtual', 1)}>
                    <Text style={styles.btnTexto}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.boxVital, { borderColor: '#3399ff' }]}>
                <Text style={styles.vitalTitulo}>PONTOS DE MANA</Text>
                <Text style={styles.vitalValor}>{personagem.pmAtual}/{personagem.pmMax}</Text>
                <View style={styles.botoesRowPequeno}>
                  <TouchableOpacity style={styles.btnMenosPequeno} onPress={() => alterarValor('pmAtual', -1)}>
                    <Text style={styles.btnTexto}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnMaisPequeno} onPress={() => alterarValor('pmAtual', 1)}>
                    <Text style={styles.btnTexto}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.boxVital, { borderColor: '#e6a100' }]}>
                <Text style={styles.vitalTitulo}>DEFESA TOTAL</Text>
                <Text style={styles.vitalValor}>{defesaTotal}</Text>
                <Text style={styles.defesaFormula}>10 + DES ({modDES})</Text>
              </View>
            </View>

            {/* --- ATRIBUTOS & MODIFICADORES --- */}
            <Text style={styles.secaoTituloGlobal}>ATRIBUTOS & MODIFICADORES</Text>
            <View style={styles.gridAtributos}>
              {[
                { chave: 'forca', label: 'FOR', mod: modFOR, numMod: obterNumModificador(personagem.forca) },
                { chave: 'destreza', label: 'DES', mod: modDES, numMod: numModDES },
                { chave: 'constituicao', label: 'CON', mod: modCON, numMod: obterNumModificador(personagem.constituicao) },
                { chave: 'inteligencia', label: 'INT', mod: modINT, numMod: obterNumModificador(personagem.inteligencia) },
                { chave: 'sabedoria', label: 'SAB', mod: modSAB, numMod: obterNumModificador(personagem.sabedoria) },
                { chave: 'carisma', label: 'CAR', mod: modCAR, numMod: obterNumModificador(personagem.carisma) }
              ].map((attr) => (
                <View key={attr.chave} style={styles.cardAtributoT20}>
                  <Text style={styles.labelAttrT20}>{attr.label}</Text>
                  
                  <TouchableOpacity 
                    onPress={() => {
                      const resultadoDado = Math.floor(Math.random() * 20) + 1;
                      const resultadoFinal = resultadoDado + attr.numMod;
                      Alert.alert(
                        `🎲 Teste de ${attr.label}`,
                        `Dado: ${resultadoDado}\nModificador: ${attr.mod}\n\n🏆 TOTAL: ${resultadoFinal}`
                      );
                    }}
                    style={styles.numeroClickArea}
                  >
                    <Text style={styles.valorAttrT20}>{personagem[attr.chave] || 1}</Text>
                  </TouchableOpacity>

                  <Text style={styles.modTextT20}>{attr.mod}</Text>
                  
                  <View style={styles.botoesAttrRow}>
                    <TouchableOpacity style={styles.btnAttr} onPress={() => alterarValor(attr.chave, -1)}>
                      <Text style={styles.btnTextoAttr}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnAttr} onPress={() => alterarValor(attr.chave, 1)}>
                      <Text style={styles.btnTextoAttr}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : abaAtiva === 'Pericias' ? (
          <View>
            <Text style={styles.secaoTituloGlobal}>PERÍCIAS OFICIAIS (TOTAL)</Text>
            <Text style={styles.subLabelsPericia}>
              Legenda: Metade do Nível ({Math.floor(personagem.nivel / 2)}) + Mod. Atributo + Treino (+2 se marcado)
            </Text>
            
            <View style={styles.gridPericias}>
              {listaPericias.map((p, idx) => {
                const ehTreinada = personagem.periciasTreinadas?.includes(p.nome);
                const bonusTreino = ehTreinada ? 2 : 0;
                const totalPericia = Math.floor(personagem.nivel / 2) + p.mod + bonusTreino;
                
                const rolarPericia = () => {
                  const resultadoDado = Math.floor(Math.random() * 20) + 1;
                  const resultadoFinal = resultadoDado + totalPericia;
                  Alert.alert(
                    `🎲 Rolagem de ${p.nome}`,
                    `Dado: ${resultadoDado}\nBônus: ${totalPericia >= 0 ? `+${totalPericia}` : totalPericia}\n\n🏆 TOTAL: ${resultadoFinal}`
                  );
                };

                return (
                  <TouchableOpacity 
                    key={idx} 
                    style={[styles.periciaItemBox, ehTreinada && styles.periciaTreinadaBox]}
                    onPress={rolarPericia}
                  >
                    <Text style={styles.periciaNome} numberOfLines={1}>
                      {ehTreinada ? '⭐ ' : ''}{p.nome}
                    </Text>
                    <Text style={styles.periciaTotal}>{totalPericia >= 0 ? `+${totalPericia}` : totalPericia}</Text>
                    <Text style={styles.periciaAttrLabel}>{p.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* --- MOCHILA --- */}
            <Text style={styles.secaoTituloGlobal}>EQUIPAMENTO (MOCHILA)</Text>
            <View style={styles.secaoBox}>
              <View style={styles.inputRow}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Digitar nova arma ou item..." 
                  placeholderTextColor="#555" 
                  value={novoItemMochila} 
                  onChangeText={setNovoItemMochila} 
                />
                <TouchableOpacity style={styles.btnAdicionar} onPress={adicionarEquipamento}>
                  <Text style={styles.btnAdicionarTexto}>+</Text>
                </TouchableOpacity>
              </View>

              {!personagem.inventario || personagem.inventario.length === 0 ? (
                <Text style={styles.mochilaVaziaText}>Mochila vazia.</Text>
              ) : (
                personagem.inventario.map((item, i) => (
                  <View key={i} style={styles.mochilaItemRow}>
                    <Text style={styles.listaItem}>• {item}</Text>
                    <TouchableOpacity onPress={() => removerEquipamento(i)}>
                      <Text style={styles.btnDeletarItem}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.secaoTituloGlobal}>PODERES, HABILIDADES & MAGIAS 🔮</Text>
            
            <View style={styles.secaoBox}>
              <Text style={[styles.vitalTitulo, { textAlign: 'left', marginBottom: 6 }]}>
                APRENDER NOVA HABILIDADE / MAGIA
              </Text>
              <TextInput 
                style={styles.input} 
                placeholder="Nome da Magia ou Poder" 
                placeholderTextColor="#555" 
                value={nomeNovaMagia} 
                onChangeText={setNomeNovaMagia} 
              />
              <View style={[styles.inputRow, { marginTop: 6 }]}>
                <TextInput 
                  style={[styles.input, { flex: 2 }]} 
                  placeholder="Dado (Ex: 2d6 ou 1d20)" 
                  placeholderTextColor="#555" 
                  value={dadoNovaMagia} 
                  onChangeText={setDadoNovaMagia} 
                />
                <TouchableOpacity 
                  style={[styles.btnAdicionar, { width: 'auto', paddingHorizontal: 16 }]} 
                  onPress={adicionarMagia}
                >
                  <Text style={styles.btnAdicionarTexto}>Aprender 🔮</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.subLabelsPericia}>Toque no card da magia para rolar os dados de efeito!</Text>
            
            <View style={styles.containerMagias}>
              {!personagem.magias || personagem.magias.length === 0 ? (
                <Text style={styles.mochilaVaziaText}>Nenhuma magia criada para este aventureiro.</Text>
              ) : (
                personagem.magias.map((magia, idx) => {
                  const conjurarMagia = () => {
                    let totalDados = 0;
                    let rolagensIndividuais = [];
                    for (let i = 0; i < (magia.qtd || 1); i++) {
                      const rolagem = Math.floor(Math.random() * (magia.faces || 20)) + 1;
                      rolagensIndividuais.push(rolagem);
                      totalDados += rolagem;
                    }
                    const resultadoFinal = totalDados + (magia.fixo || 0);
                    Alert.alert(
                      `🔮 Conjurando ${magia.nome}`,
                      `Dados jogados: (${rolagensIndividuais.join(' + ')})\nBônus fixo: +${magia.fixo || 0}\n\n🏆 VALOR DE EFEITO: ${resultadoFinal}`
                    );
                  };

                  return (
                    <TouchableOpacity key={idx} style={styles.magiaCardBox} onPress={conjurarMagia}>
                      <View style={styles.magiaCardEsquerda}>
                        <Text style={styles.magiaNomeTexto}>{magia.nome}</Text>
                        <Text style={styles.magiaDescricaoTexto} numberOfLines={1}>
                          Buff: {magia.descricao || 'Habilidade ativa.'}
                        </Text>
                        <Text style={styles.magiaCustoTexto}>{magia.tipo} • {magia.custo || '1 PM'}</Text>
                      </View>
                      <View style={styles.magiaCardDireita}>
                        <Text style={styles.magiaDadoTexto}>{magia.dado}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>
        )}

        {/* --- BOTÃO DE EXCLUIR --- */}
        <TouchableOpacity style={styles.btnExcluir} onPress={handleExcluir}>
          <Text style={styles.textoExcluir}>Excluir Ficha do Sistema 🗑️</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  containerContainer: { flex: 1, backgroundColor: '#121212', padding: 12, paddingTop: 40 },
  content: { paddingBottom: 40 },
  backButton: { marginBottom: 12 },
  backText: { color: '#d29642', fontSize: 16 },
  abasContainer: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', marginBottom: 16 },
  abaBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  abaAtiva: { borderBottomWidth: 2, borderColor: '#d29642' },
  abaTexto: { color: '#888', fontSize: 13, fontWeight: '600' },
  abaTextoAtivo: { color: '#fff' },
  headerCard: { backgroundColor: '#1e1e1e', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#d29642' },
  sistemaBadge: { backgroundColor: '#d29642', color: '#000', fontSize: 11, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginBottom: 6 },
  nome: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  subInfo: { color: '#aaa', fontSize: 12, marginTop: 2, textAlign: 'center' },
  nivelTexto: { color: '#d29642', fontSize: 13, fontWeight: 'bold' },
  rowStatusVitais: { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 16 },
  boxVital: { flex: 1, backgroundColor: '#1e1e1e', borderWidth: 1, padding: 6, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  vitalTitulo: { color: '#aaa', fontSize: 9, fontWeight: 'bold', textAlign: 'center', marginBottom: 2 },
  vitalValor: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  defesaFormula: { color: '#888', fontSize: 9, marginTop: 4, textAlign: 'center' },
  botoesRowPequeno: { flexDirection: 'row', gap: 6, marginTop: 4 },
  btnMaisPequeno: { backgroundColor: '#222', borderWidth: 1, borderColor: '#338a33', width: 24, height: 22, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  btnMenosPequeno: { backgroundColor: '#222', borderWidth: 1, borderColor: '#8a3333', width: 24, height: 22, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  btnTexto: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  secaoTituloGlobal: { color: '#d29642', fontSize: 14, fontWeight: 'bold', marginBottom: 6, marginTop: 6 },
  gridAtributos: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 6, marginBottom: 16 },
  cardAtributoT20: { width: '31%', backgroundColor: '#1e1e1e', borderRadius: 6, padding: 6, alignItems: 'center', borderWidth: 1, borderColor: '#333', marginBottom: 4 },
  labelAttrT20: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  valorAttrT20: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  modTextT20: { color: '#d29642', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  botoesAttrRow: { flexDirection: 'row', gap: 4 },
  btnAttr: { backgroundColor: '#2a2a2a', width: 24, height: 22, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  btnTextoAttr: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  btnExcluir: { backgroundColor: '#222', borderWidth: 1, borderColor: '#ff5555', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  textoExcluir: { color: '#ff5555', fontSize: 13, fontWeight: 'bold' },
  subLabelsPericia: { color: '#777', fontSize: 11, marginBottom: 10 },
  gridPericias: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 6, marginBottom: 16 },
  periciaItemBox: { width: '49%', backgroundColor: '#1a1a1a', borderLeftWidth: 3, borderColor: '#d29642', padding: 6, borderRadius: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  periciaTreinadaBox: { borderColor: '#33cc33' },
  periciaNome: { color: '#fff', fontSize: 11, flex: 1 },
  periciaTotal: { color: '#33cc33', fontSize: 12, fontWeight: 'bold', marginRight: 4 },
  periciaAttrLabel: { color: '#666', fontSize: 9 },
  secaoBox: { backgroundColor: '#1e1e1e', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#333', marginBottom: 12 },
  inputRow: { flexDirection: 'row', gap: 6 },
  input: { flex: 1, backgroundColor: '#121212', color: '#fff', padding: 8, borderRadius: 4, fontSize: 14, borderWidth: 1, borderColor: '#444' },
  btnAdicionar: { backgroundColor: '#d29642', width: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  btnAdicionarTexto: { color: '#000', fontSize: 14, fontWeight: 'bold' },
  mochilaItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#222' },
  listaItem: { color: '#ccc', fontSize: 13, fontStyle: 'italic' },
  btnDeletarItem: { fontSize: 14, paddingHorizontal: 4 },
  mochilaVaziaText: { color: '#666', fontSize: 13, textAlign: 'center', marginVertical: 8, fontStyle: 'italic' },
  rowNivelEditor: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  botoesNivelRow: { flexDirection: 'row', gap: 6 },
  btnNivel: { backgroundColor: '#2a2a2a', borderWidth: 1, borderColor: '#d29642', width: 28, height: 24, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  btnNivelTexto: { color: '#d29642', fontSize: 14, fontWeight: 'bold' },
  containerMagias: { flexDirection: 'column', gap: 8, marginBottom: 16 },
  magiaCardBox: { width: '100%', backgroundColor: '#1a1a1a', borderLeftWidth: 4, borderColor: '#3399ff', padding: 12, borderRadius: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2, borderWidth: 1, borderColor: '#222' },
  magiaCardEsquerda: { flex: 1 },
  magiaNomeTexto: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  magiaDescricaoTexto: { color: '#d29642', fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  magiaCustoTexto: { color: '#777', fontSize: 11, marginTop: 2 },
  magiaCardDireita: { backgroundColor: '#121212', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4, borderWidth: 1, borderColor: '#333' },
  magiaDadoTexto: { color: '#3399ff', fontSize: 13, fontWeight: 'bold' },
  numeroClickArea: { paddingHorizontal: 12, paddingVertical: 2, marginVertical: 2 }
});