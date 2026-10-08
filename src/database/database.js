import * as SQLite from 'expo-sqlite';

const NOME_BANCO = 'TavernaRPG_Tormenta20.db';

let db = null;

// ====================================================
// 1. CONEXÃO COM O BANCO DE DADOS
// ====================================================
export function obterConexaoBanco() {
  if (!db) {
    console.log('🗄️ Abrindo conexão com o banco:', NOME_BANCO);
    db = SQLite.openDatabaseSync(NOME_BANCO);
  }

  return db;
}

// ====================================================
// 2. CRIAÇÃO E INICIALIZAÇÃO DAS TABELAS
// ====================================================
export function inicializarBancoDeDados() {
  try {
    const banco = obterConexaoBanco();

    banco.execSync(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS personagens (
        id TEXT PRIMARY KEY,
        donoDoPersonagem TEXT NOT NULL,
        nome TEXT NOT NULL,
        classe TEXT NOT NULL,
        raca TEXT,
        origem TEXT,
        divindade TEXT,
        nivel INTEGER NOT NULL DEFAULT 1,
        hpMax INTEGER NOT NULL,
        hpAtual INTEGER NOT NULL,
        pmMax INTEGER NOT NULL,
        pmAtual INTEGER NOT NULL,
        forca INTEGER NOT NULL,
        destreza INTEGER NOT NULL,
        constituicao INTEGER NOT NULL,
        inteligencia INTEGER NOT NULL,
        sabedoria INTEGER NOT NULL,
        carisma INTEGER NOT NULL,
        inventario TEXT,
        periciasTreinadas TEXT,
        magias TEXT
      );
    `);

    console.log('🔮 Banco de dados e tabelas inicializados com sucesso!');
    return banco;

  } catch (error) {
    console.error('❌ Erro ao inicializar o banco de dados:', error);
    throw error;
  }
}

// ====================================================
// 3. FUNÇÕES DE USUÁRIOS & AUTENTICAÇÃO
// ====================================================

// Lista todos os usuários cadastrados (para testes / debug)
export function verificarUsuarios() {
  try {
    const banco = obterConexaoBanco();
    const usuarios = banco.getAllSync('SELECT id, email FROM usuarios');

    console.log('📋 USUÁRIOS NO BANCO:');
    console.log(usuarios);

    return usuarios;
  } catch (error) {
    console.error('❌ Erro ao consultar usuários:', error);
    return [];
  }
}

// Busca dados de um usuário pelo e-mail
export function buscarUsuarioPorEmail(email) {
  try {
    const banco = obterConexaoBanco();
    const emailLimpo = String(email || '').toLowerCase().trim();

    const usuario = banco.getFirstSync(
      'SELECT * FROM usuarios WHERE email = ?',
      [emailLimpo]
    );

    return usuario;
  } catch (error) {
    console.error('❌ Erro ao buscar usuário por e-mail:', error);
    return null;
  }
}

// Atualiza a senha do usuário
export function redefinirSenha(email, novaSenha) {
  try {
    const banco = obterConexaoBanco();
    const emailLimpo = String(email || '').toLowerCase().trim();

    const resultado = banco.runSync(
      'UPDATE usuarios SET senha = ? WHERE email = ?',
      [novaSenha, emailLimpo]
    );

    return resultado.changes > 0;
  } catch (error) {
    console.error('❌ Erro ao redefinir senha:', error);
    return false;
  }
}

// ====================================================
// 4. FUNÇÕES DE PERSONAGENS (CRUD COMPLETO)
// ====================================================

/**
 * Salva ou Atualiza um personagem no SQLite.
 * Usa INSERT OR REPLACE para atualizar caso o ID já exista.
 */
export function salvarPersonagem(personagem) {
  try {
    const banco = obterConexaoBanco();

    // Converte arrays/objetos em strings JSON para gravar em colunas TEXT
    const inventarioStr = typeof personagem.inventario === 'string'
      ? personagem.inventario
      : JSON.stringify(personagem.inventario || []);

    const periciasStr = typeof personagem.periciasTreinadas === 'string'
      ? personagem.periciasTreinadas
      : JSON.stringify(personagem.periciasTreinadas || []);

    const magiasStr = typeof personagem.magias === 'string'
      ? personagem.magias
      : JSON.stringify(personagem.magias || []);

    const idPersonagem = personagem.id || String(Date.now());
    const dono = String(personagem.donoDoPersonagem || '').toLowerCase().trim();

    const resultado = banco.runSync(
      `INSERT OR REPLACE INTO personagens (
        id, donoDoPersonagem, nome, classe, raca, origem, divindade,
        nivel, hpMax, hpAtual, pmMax, pmAtual, forca, destreza,
        constituicao, inteligencia, sabedoria, carisma,
        inventario, periciasTreinadas, magias
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idPersonagem,
        dono,
        personagem.nome || '',
        personagem.classe || '',
        personagem.raca || '',
        personagem.origem || '',
        personagem.divindade || '',
        personagem.nivel || 1,
        personagem.hpMax || 0,
        personagem.hpAtual || 0,
        personagem.pmMax || 0,
        personagem.pmAtual || 0,
        personagem.forca || 0,
        personagem.destreza || 0,
        personagem.constituicao || 0,
        personagem.inteligencia || 0,
        personagem.sabedoria || 0,
        personagem.carisma || 0,
        inventarioStr,
        periciasStr,
        magiasStr
      ]
    );

    console.log('✅ Personagem salvo com sucesso! ID:', idPersonagem);
    return resultado.changes > 0;

  } catch (error) {
    console.error('❌ Erro ao salvar personagem no banco:', error);
    return false;
  }
}

/**
 * Busca todas as fichas associadas ao e-mail de um usuário logado.
 */
export function buscarPersonagensPorDono(donoDoPersonagem) {
  try {
    const banco = obterConexaoBanco();
    const dono = String(donoDoPersonagem || '').toLowerCase().trim();

    const resultados = banco.getAllSync(
      'SELECT * FROM personagens WHERE donoDoPersonagem = ?',
      [dono]
    );

    // Converte de volta os campos JSON stringificados para objetos/arrays
    return resultados.map(p => ({
      ...p,
      inventario: JSON.parse(p.inventario || '[]'),
      periciasTreinadas: JSON.parse(p.periciasTreinadas || '[]'),
      magias: JSON.parse(p.magias || '[]')
    }));

  } catch (error) {
    console.error('❌ Erro ao buscar personagens:', error);
    return [];
  }
}

/**
 * Busca uma ficha específica pelo seu ID.
 */
export function buscarPersonagemPorId(id) {
  try {
    const banco = obterConexaoBanco();

    const p = banco.getFirstSync(
      'SELECT * FROM personagens WHERE id = ?',
      [id]
    );

    if (!p) return null;

    return {
      ...p,
      inventario: JSON.parse(p.inventario || '[]'),
      periciasTreinadas: JSON.parse(p.periciasTreinadas || '[]'),
      magias: JSON.parse(p.magias || '[]')
    };

  } catch (error) {
    console.error('❌ Erro ao buscar personagem por ID:', error);
    return null;
  }
}

/**
 * Deleta uma ficha pelo ID.
 */
export function deletarPersonagem(id) {
  try {
    const banco = obterConexaoBanco();

    const resultado = banco.runSync(
      'DELETE FROM personagens WHERE id = ?',
      [id]
    );

    console.log('🗑️ Personagem removido:', id);
    return resultado.changes > 0;
  } catch (error) {
    console.error('❌ Erro ao deletar personagem:', error);
    return false;
  }
}