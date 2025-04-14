import React, { useState, useRef } from 'react';

const GerenciarColaboradores = () => {
  const [colaboradores, setColaboradores] = useState([]);
  const novoInputRef = useRef(null);

  const atualizarColaborador = (index, novoValor) => {
    const novosColaboradores = [...colaboradores];
    novosColaboradores[index] = novoValor;
    setColaboradores(novosColaboradores);
  };

  const adicionarColaborador = () => {
    setColaboradores([...colaboradores, '']);
    // Após adicionar, foca no novo input
    setTimeout(() => {
      if (novoInputRef.current) {
        novoInputRef.current.focus();
      }
    }, 100);
  };

  const removerColaborador = (index) => {
    const novosColaboradores = colaboradores.filter((_, i) => i !== index);
    setColaboradores(novosColaboradores);
  };

  return (
    <div>
      <label>Colaboradores:</label>
      {colaboradores.map((colaborador, index) => (
        <div key={index} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <input
            type="text"
            value={colaborador}
            onChange={e => atualizarColaborador(index, e.target.value)}
            placeholder={`Colaborador ${index + 1}`}
            style={{ flex: 1 }}
            ref={index === colaboradores.length - 1 ? novoInputRef : null}
          />
          <button
            onClick={() => removerColaborador(index)}
            style={{
              width: '20px', height: '20px', background: 'none', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            🗑️
          </button>
        </div>
      ))}
      <button
        onClick={adicionarColaborador}
        style={{ marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        ➕
      </button>
    </div>
  );
};

export default GerenciarColaboradores;
