import { QuickSQLite } from 'react-native-quick-sqlite';

let db = null;

export function obterConexaoBanco() {
  if (!db) {
    db = QuickSQLite.open('TavernaRPG_Tormenta20.db');
  }
  return db;
}

export function inicializarBancoDeDados() {
  try {
    const banco = obterConexaoBanco();
    
    if (!banco) {
      console.log("⏳ Aguardando carregamento do driver nativo...");
      return;
    }

    // Criação da tabela de usuários
    banco.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL
      );
    `);

    // Criação da tabela de fichas (Tormenta20)
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

    console.log('🔮 Banco de Dados QuickSQLite pronto para a mesa!');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas no QuickSQLite:', error);
  }
}
