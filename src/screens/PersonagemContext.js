import React, { createContext, useState, useEffect } from 'react';
import { obterConexaoBanco, inicializarBancoDeDados } from '../database/database.js';

export const PersonagemContext = createContext();

export function PersonagemProvider({ children }) {
  const [todosPersonagens, setTodosPersonagens] = useState([]);
  const [carregandoFichas, setCarregandoFichas] = useState(true);

  useEffect(() => {
    try {
      inicializarBancoDeDados();
      carregarFichasDoBanco();
    } catch (error) {
      console.log('Erro ao iniciar fichas:', error);
    } finally {
      setCarregandoFichas(false);
    }
  }, []);

  const carregarFichasDoBanco = () => {
    try {
      const db = obterConexaoBanco();
      const resultado = db.execute('SELECT * FROM personagens');
      
      if (resultado.rows) {
        const fichasFormatadas = resultado.rows.map(p => ({
          ...p,
          inventario: p.inventario ? JSON.parse(p.inventario) : [],
          periciasTreinadas: p.periciasTreinadas ? JSON.parse(p.periciasTreinadas) : [],
          magias: p.magias ? JSON.parse(p.magias) : []
        }));
        setTodosPersonagens(fichasFormatadas);
      }
    } catch (error) {
      console.log('Erro ao carregar fichas:', error);
    }
  };

  const adicionarPersonagem = (donoEmail, nome, classe, raca, origem, divindade, hp, forca, destreza, constituicao, inteligencia, sabedoria, carisma, periciasTreinadas, magiasCriadas) => {
    const id = Math.random().toString();
    const dono = donoEmail.toLowerCase().trim();
    const hpMax = parseInt(hp) || 10;

    try {
      const db = obterConexaoBanco();
      db.execute(
        `INSERT INTO personagens (id, donoDoPersonagem, nome, classe, raca, origem, divindade, nivel, hpMax, hpAtual, pmMax, pmAtual, forca, destreza, constituicao, inteligencia, sabedoria, carisma, inventario, periciasTreinadas, magias) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 11, 11, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, dono, nome, classe, raca || 'Humano', origem || 'Nenhuma', divindade || 'Nenhuma',
          hpMax, hpMax, parseInt(forca) || 10, parseInt(destreza) || 10, parseInt(constituicao) || 10,
          parseInt(inteligencia) || 10, parseInt(sabedoria) || 10, parseInt(carisma) || 10,
          JSON.stringify(['Saco de dormir', 'Traje de viajante']),
          JSON.stringify(periciasTreinadas || []),
          JSON.stringify(magiasCriadas || [])
        ]
      );
      carregarFichasDoBanco();
    } catch (error) {
      console.log('Erro ao inserir ficha:', error);
    }
  };

  const excluirPersonagem = (id) => {
    try {
      const db = obterConexaoBanco();
      db.execute('DELETE FROM personagens WHERE id = ?', [id]);
      carregarFichasDoBanco();
    } catch (error) {
      console.log('Erro ao deletar:', error);
    }
  };

  const editarPersonagem = (p) => {
    try {
      const db = obterConexaoBanco();
      db.execute(
        `UPDATE personagens SET 
          nome = ?, classe = ?, raca = ?, origem = ?, divindade = ?, nivel = ?, 
          hpMax = ?, hpAtual = ?, pmMax = ?, pmAtual = ?,
          forca = ?, destreza = ?, constituicao = ?, inteligencia = ?, sabedoria = ?, carisma = ?, 
          inventario = ?, periciasTreinadas = ?, magias = ? 
         WHERE id = ?`,
        [
          p.nome, p.classe, p.raca, p.origem, p.divindade, p.nivel,
          p.hpMax, p.hpAtual, p.pmMax, p.pmAtual,
          p.forca, p.destreza, p.constituicao, p.inteligencia, p.sabedoria, p.carisma,
          JSON.stringify(p.inventario || []),
          JSON.stringify(p.periciasTreinadas || []),
          JSON.stringify(p.magias || []),
          p.id
        ]
      );
      carregarFichasDoBanco();
    } catch (error) {
      console.log('Erro ao atualizar:', error);
    }
  };

  return (
    <PersonagemContext.Provider value={{ todosPersonagens, carregandoFichas, adicionarPersonagem, excluirPersonagem, editarPersonagem }}>
      {children}
    </PersonagemContext.Provider>
  );
}

export default PersonagemProvider;
