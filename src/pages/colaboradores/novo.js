// src/pages/colaboradores/novo.js
import { useState, useEffect } from 'react';
import BackButton from '../../components/BackButton';

export default function NovoColaborador() {
  const [colaboradores, setColaboradores] = useState([
    { cpf: '', nome: '', funcao: '', diaria: '' }
  ]);
  const [cpfsDisponiveis, setCpfsDisponiveis] = useState([]);

  useEffect(() => {
    async function fetchCPFs() {
      try {
        const response = await fetch('https://sheetdb.io/api/v1/kbce3mayhsmmg');
        const data = await response.json();
        setCpfsDisponiveis(data);
      } catch (error) {
        console.error('Erro ao buscar CPFs:', error);
      }
    }

    fetchCPFs();
  }, []);

  const handleChange = (index, campo, valor) => {
    const novosColaboradores = [...colaboradores];

    if (campo === 'cpf') {
      valor = valor.replace(/\D/g, '').slice(0, 11); // só números
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2')
                   .replace(/(\d{3})(\d)/, '$1.$2')
                   .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

      const colaboradorEncontrado = cpfsDisponiveis.find(item => item.CPF === valor);
      novosColaboradores[index].nome = colaboradorEncontrado ? colaboradorEncontrado.Nome : '';
    }

    novosColaboradores[index][campo] = valor;
    setColaboradores(novosColaboradores);
  };

  const adicionarLinha = () => {
    setColaboradores([...colaboradores, { cpf: '', nome: '', funcao: '', diaria: '' }]);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <BackButton />
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Novo Colaborador</h1>

      {colaboradores.map((colab, index) => (
        <div key={index} style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '1rem'
        }}>
          <div style={{ flex: '1 1 100%' }}>
            <label>Nome:</label>
            <input
              type="text"
              value={colab.nome}
              readOnly
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#f0f0f0',
                userSelect: 'none',
                fontWeight: 'bold'
              }}
            />
          </div>

          <div style={{ flex: '1 1 100%' }}>
            <label>CPF:</label>
            <input
              list={`cpfs-${index}`}
              type="text"
              value={colab.cpf}
              onChange={(e) => handleChange(index, 'cpf', e.target.value)}
              placeholder="Digite ou selecione"
              style={{ width: '100%', padding: '8px' }}
            />
            <datalist id={`cpfs-${index}`}>
              {cpfsDisponiveis.map((item, i) => (
                <option key={i} value={item.CPF} />
              ))}
            </datalist>
          </div>

          <div style={{ flex: '1 1 50%' }}>
            <label>Função:</label>
            <select
              value={colab.funcao}
              onChange={(e) => handleChange(index, 'funcao', e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">Selecione</option>
              <option value="AUX. LOGISTICA">AUX. LOGISTICA</option>
              <option value="CONFERENTE">CONFERENTE</option>
            </select>
          </div>

          <div style={{ flex: '1 1 50%' }}>
            <label>Valor Diária:</label>
            <input
              type="number"
              value={colab.diaria}
              onChange={(e) => handleChange(index, 'diaria', e.target.value)}
              style={{ width: '100%', padding: '8px' }}
              placeholder="R$"
            />
          </div>
        </div>
      ))}

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          onClick={adicionarLinha}
          style={{
            fontSize: '2rem',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          ➕
        </button>
      </div>
    </div>
  );
}
