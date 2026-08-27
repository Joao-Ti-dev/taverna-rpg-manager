import { open } from 'react-native-quick-sqlite';

const NOME_BANCO = 'TavernaRPG_Tormenta20.db';

let db = null;

export function obterConexaoBanco() {
  if (!db) {
    console.log('🗄️ Abrindo banco:', NOME_BANCO);

    db = open({
      name: NOME_BANCO,
    });
  }

  return db;
}

export function inicializarBancoDeDados() {
  try {
    const banco = obterConexaoBanco();

    banco.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL
      );
    `);

    banco.execute(`
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

    console.log('🔮 Banco de dados inicializado com sucesso!');

    return banco;

  } catch (error) {
    console.error(
      '❌ Erro ao inicializar banco:',
      error
    );

    throw error;
  }
}

export function verificarUsuarios() {
  try {
    const banco = obterConexaoBanco();

    const resultado = banco.execute(
      'SELECT id, email FROM usuarios'
    );

    console.log('📋 USUÁRIOS NO BANCO:');
    console.log(resultado?.rows);

    return resultado;

  } catch (error) {
    console.error(
      '❌ Erro ao consultar usuários:',
      error
    );

    return null;
  }
}