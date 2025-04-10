// src/pages/colaboradores/novo.js
import { useState, useEffect, useRef } from 'react';
import BackButton from '../../components/BackButton';

export default function NovoColaborador() {
  const [linhas, setLinhas] = useState([{ cpf: '', nome: '', funcao: '', diaria: '' }]);
  const [cpfs, setCpfs] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState([]);
  const inputRefs = useRef([]);

  useEffect(() => {
    async function fetchCPFs() {
      try {
        const response = await fetch('https://sheetdb.io/api/v1/kbce3mayhsmmg');
        const data = await response.json();
        setCpfs(data);
      } catch (error) {
        console.error('Erro ao buscar CPFs:', error);
      }
    }

    fetchCPFs();
  }, []);

  const handleSelecionarCpf = (index, cpfSelecionado) => {
    const novoNome = cpfs.find(item => item.CPF === cpfSelecionado)?.Nome || '';
    const novasLinhas = [...linhas];
    novasLinhas[index].cpf = cpfSelecionado;
    novasLinhas[index].nome = novoNome;
    setLinhas(novasLinhas);
    const novasSugestoes = [...mostrarSugestoes];
    novasSugestoes[index] = false;
    setMostrarSugestoes(novasSugestoes);
  };

  const handleChangeCpf = (index, value) => {
    const novasLinhas = [...linhas];
    novasLinhas[index].cpf = value;
    setLinhas(novasLinhas);
    const novasSugestoes = [...mostrarSugestoes];
    novasSugestoes[index] = true;
    setMostrarSugestoes(novasSugestoes);
  };

  const adicionarLinha = () => {
    setLinhas([...linhas, { cpf: '', nome: '', funcao: '', diaria: '' }]);
    setMostrarSugestoes([...mostrarSugestoes, false]);
  };

  const sugestoesFiltradas = (cpfDigitado) => {
    return cpfs.filter(item => item.CPF.includes(cpfDigitado));
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <BackButton />
      <h1>Novo Colaborador</h1>

      {linhas.map((linha, index) => (
        <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '1rem', position: 'relative' }}>
          <input
            type="text"
            value={linha.nome}
            readOnly
            tabIndex={-1}
            style={{ flex: 2, padding: '8px', backgroundColor: '#f3f3f3', userSelect: 'none' }}
          />

          <div style={{ position: 'relative', flex: 2 }}>
            <input
              ref={el => inputRefs.current[index] = el}
              type="text"
              maxLength={14}
              value={linha.cpf}
              onChange={(e) => handleChangeCpf(index, e.target.value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'))}
              onFocus={() => setMostrarSugestoes(prev => {
                const updated = [...prev];
                updated[index] = true;
                return updated;
              })}
              onBlur={() => setTimeout(() => {
                setMostrarSugestoes(prev => {
                  const updated = [...prev];
                  updated[index] = false;
                  return updated;
                });
              }, 200)}
              placeholder="Digite ou selecione o CPF"
              style={{ width: '100%', padding: '8px' }}
            />

            {mostrarSugestoes[index] && sugestoesFiltradas(linha.cpf).length > 0 && (
              <ul style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                border: '1px solid #ccc',
                maxHeight: '150px',
                overflowY: 'auto',
                backgroundColor: '#fff',
                position: 'absolute',
                top: '100%',
                left: 0,
                width: inputRefs.current[index]?.offsetWidth || '100%',
                zIndex: 1000
              }}>
                {sugestoesFiltradas(linha.cpf).map((item, i) => (
                  <li
                    key={i}
                    onClick={() => handleSelecionarCpf(index, item.CPF)}
                    style={{ padding: '8px', cursor: 'pointer' }}
                  >
                    {item.CPF}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <select
            value={linha.funcao}
            onChange={(e) => {
              const novas = [...linhas];
              novas[index].funcao = e.target.value;
              setLinhas(novas);
            }}
            style={{ flex: 2, padding: '8px' }}
          >
            <option value="">Selecione a função</option>
            <option value="AUX. LOGISTICA">AUX. LOGISTICA</option>
            <option value="CONFERENTE">CONFERENTE</option>
          </select>

          <input
            type="number"
            placeholder="Valor Diária"
            value={linha.diaria}
            onChange={(e) => {
              const novas = [...linhas];
              novas[index].diaria = e.target.value;
              setLinhas(novas);
            }}
            style={{ flex: 1, padding: '8px' }}
          />
        </div>
      ))}

      <button onClick={adicionarLinha} style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}>➕</button>
    </div>
  );
}
