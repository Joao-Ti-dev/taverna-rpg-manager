import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  obterConexaoBanco,
  inicializarBancoDeDados,
} from '../database/database.js';

export const PersonagemContext = createContext();

export function PersonagemProvider({ children }) {
  const [todosPersonagens, setTodosPersonagens] = useState([]);
  const [carregandoFichas, setCarregandoFichas] = useState(true);

  // =========================================================
  // AUXILIAR: CONVERTE JSON SALVO NO BANCO
  // =========================================================

  const converterJSON = (valor, padrao = []) => {
    if (!valor) return padrao;
    if (Array.isArray(valor)) return valor;

    try {
      return JSON.parse(valor);
    } catch (error) {
      console.log('⚠️ Erro ao converter JSON:', valor);
      return padrao;
    }
  };

  // =========================================================
  // CARREGAR FICHAS
  // =========================================================

  const carregarFichasDoBanco = useCallback((email = null) => {
    try {
      const db = obterConexaoBanco();

      if (!email || typeof email !== 'string' || !email.trim()) {
        console.log('⚠️ Nenhum e-mail informado. Nenhuma ficha foi carregada.');
        setTodosPersonagens([]);
        return [];
      }

      const emailNormalizado = email.toLowerCase().trim();

      console.log('📚 Carregando fichas do usuário:', emailNormalizado);

      // No expo-sqlite, getAllSync retorna diretamente um array de objetos
      const linhas = db.getAllSync(
        `
        SELECT *
        FROM personagens
        WHERE LOWER(donoDoPersonagem) = ?
        ORDER BY id DESC
        `,
        [emailNormalizado]
      );

      console.log('📚 Fichas encontradas:', linhas.length);

      const fichasFormatadas = linhas.map((p) => ({
        ...p,
        inventario: converterJSON(p.inventario, []),
        periciasTreinadas: converterJSON(p.periciasTreinadas, []),
        magias: converterJSON(p.magias, []),
      }));

      setTodosPersonagens(fichasFormatadas);
      return fichasFormatadas;

    } catch (error) {
      console.error('❌ Erro ao carregar fichas:', error);
      setTodosPersonagens([]);
      return [];
    }
  }, []);

  // =========================================================
  // ADICIONAR PERSONAGEM
  // =========================================================

  const adicionarPersonagem = (
    dono,
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
    periciasTreinadas = [],
    magiasCriadas = []
  ) => {
    try {
      const emailDono = typeof dono === 'string' ? dono.toLowerCase().trim() : '';

      if (!emailDono) {
        console.error('❌ E-mail do dono não informado.');
        return false;
      }

      if (!nome || !nome.trim()) {
        console.error('❌ Nome do personagem não informado.');
        return false;
      }

      const db = obterConexaoBanco();

      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

      const hpMax = parseInt(hp, 10) || 10;
      const hpAtual = hpMax;
      const pmMax = 11;
      const pmAtual = 11;

      const forcaValor = parseInt(forca, 10) || 10;
      const destrezaValor = parseInt(destreza, 10) || 10;
      const constituicaoValor = parseInt(constituicao, 10) || 10;
      const inteligenciaValor = parseInt(inteligencia, 10) || 10;
      const sabedoriaValor = parseInt(sabedoria, 10) || 10;
      const carismaValor = parseInt(carisma, 10) || 10;

      const inventarioInicial = ['Saco de dormir', 'Traje de viajante'];

      // Uso do runSync para INSERT
      db.runSync(
        `
        INSERT INTO personagens (
          id, donoDoPersonagem, nome, classe, raca, origem, divindade,
          nivel, hpMax, hpAtual, pmMax, pmAtual, forca, destreza,
          constituicao, inteligencia, sabedoria, carisma,
          inventario, periciasTreinadas, magias
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          id,
          emailDono,
          nome.trim(),
          classe ? classe.trim() : '',
          raca?.trim() || 'Humano',
          origem?.trim() || 'Nenhuma',
          divindade?.trim() || 'Nenhuma',
          1, // nível
          hpMax,
          hpAtual,
          pmMax,
          pmAtual,
          forcaValor,
          destrezaValor,
          constituicaoValor,
          inteligenciaValor,
          sabedoriaValor,
          carismaValor,
          JSON.stringify(inventarioInicial),
          JSON.stringify(Array.isArray(periciasTreinadas) ? periciasTreinadas : []),
          JSON.stringify(Array.isArray(magiasCriadas) ? magiasCriadas : []),
        ]
      );

      console.log('✅ Personagem salvo:', nome);
      console.log('👤 Dono:', emailDono);

      carregarFichasDoBanco(emailDono);
      return true;

    } catch (error) {
      console.error('❌ Erro ao adicionar personagem:', error);
      return false;
    }
  };

  // =========================================================
  // EXCLUIR PERSONAGEM
  // =========================================================

  const excluirPersonagem = (id, email = null) => {
    try {
      if (!id) {
        console.error('❌ ID do personagem não informado.');
        return false;
      }

      const db = obterConexaoBanco();

      if (email) {
        const emailNormalizado = email.toLowerCase().trim();

        // Uso do runSync para DELETE com e-mail
        db.runSync(
          `
          DELETE FROM personagens
          WHERE id = ?
          AND LOWER(donoDoPersonagem) = ?
          `,
          [id, emailNormalizado]
        );

        carregarFichasDoBanco(emailNormalizado);
      } else {
        // Uso do runSync para DELETE padrão
        db.runSync(
          `
          DELETE FROM personagens
          WHERE id = ?
          `,
          [id]
        );

        console.log('⚠️ Personagem excluído sem validação de e-mail.');
      }

      console.log('🗑️ Personagem excluído:', id);
      return true;

    } catch (error) {
      console.error('❌ Erro ao deletar personagem:', error);
      return false;
    }
  };

  // =========================================================
  // EDITAR PERSONAGEM
  // =========================================================

  const editarPersonagem = (p, email = null) => {
    try {
      if (!p || !p.id) {
        console.error('❌ Personagem inválido para edição.');
        return false;
      }

      const db = obterConexaoBanco();

      const emailNormalizado =
        email && typeof email === 'string'
          ? email.toLowerCase().trim()
          : p.donoDoPersonagem
            ? p.donoDoPersonagem.toLowerCase().trim()
            : '';

      if (emailNormalizado) {
        // Uso do runSync para UPDATE
        db.runSync(
          `
          UPDATE personagens
          SET
            nome = ?,
            classe = ?,
            raca = ?,
            origem = ?,
            divindade = ?,
            nivel = ?,
            hpMax = ?,
            hpAtual = ?,
            pmMax = ?,
            pmAtual = ?,
            forca = ?,
            destreza = ?,
            constituicao = ?,
            inteligencia = ?,
            sabedoria = ?,
            carisma = ?,
            inventario = ?,
            periciasTreinadas = ?,
            magias = ?
          WHERE id = ?
          AND LOWER(donoDoPersonagem) = ?
          `,
          [
            p.nome || '',
            p.classe || '',
            p.raca || 'Humano',
            p.origem || 'Nenhuma',
            p.divindade || 'Nenhuma',
            parseInt(p.nivel, 10) || 1,
            parseInt(p.hpMax, 10) || 10,
            parseInt(p.hpAtual, 10) || 10,
            parseInt(p.pmMax, 10) || 11,
            parseInt(p.pmAtual, 10) || 11,
            parseInt(p.forca, 10) || 10,
            parseInt(p.destreza, 10) || 10,
            parseInt(p.constituicao, 10) || 10,
            parseInt(p.inteligencia, 10) || 10,
            parseInt(p.sabedoria, 10) || 10,
            parseInt(p.carisma, 10) || 10,
            JSON.stringify(Array.isArray(p.inventario) ? p.inventario : []),
            JSON.stringify(Array.isArray(p.periciasTreinadas) ? p.periciasTreinadas : []),
            JSON.stringify(Array.isArray(p.magias) ? p.magias : []),
            p.id,
            emailNormalizado,
          ]
        );

        carregarFichasDoBanco(emailNormalizado);
      } else {
        console.error('❌ E-mail do dono não informado para edição.');
        return false;
      }

      console.log('✏️ Personagem atualizado:', p.nome);
      return true;

    } catch (error) {
      console.error('❌ Erro ao atualizar personagem:', error);
      return false;
    }
  };

  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  useEffect(() => {
    const iniciar = () => {
      try {
        inicializarBancoDeDados();
        console.log('✅ Banco de personagens inicializado.');
      } catch (error) {
        console.error('❌ Erro ao inicializar banco de personagens:', error);
      } finally {
        setCarregandoFichas(false);
      }
    };

    iniciar();
  }, []);

  // =========================================================
  // VALOR DO CONTEXTO
  // =========================================================

  return (
    <PersonagemContext.Provider
      value={{
        todosPersonagens,
        carregandoFichas,
        carregarFichasDoBanco,
        adicionarPersonagem,
        excluirPersonagem,
        editarPersonagem,
      }}
    >
      {children}
    </PersonagemContext.Provider>
  );
}

export default PersonagemProvider;