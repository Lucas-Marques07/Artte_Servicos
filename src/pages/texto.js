import React, { useState } from 'react';

const SeuComponente = () => {
  const [usarMesmoValor, setUsarMesmoValor] = useState(false);
  const [motorista, setMotorista] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [veiculo, setVeiculo] = useState('');

  return (
    <div>
      {/* Checkbox para usar o mesmo valor */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '0.5rem', fontSize: '14px' }}>
        <span style={{ marginRight: '6px' }}>Usar mesmo valor</span>
        <input
          type="checkbox"
          checked={usarMesmoValor}
          onChange={() => setUsarMesmoValor(!usarMesmoValor)}
          style={{ width: '14px', height: '14px' }}
        />
      </div>

      {/* Inputs para motorista, fornecedor e veículo */}
      <div>
        <label>Motorista:</label>
        <input
          type="text"
          value={motorista}
          onChange={(e) => setMotorista(e.target.value)}
          disabled={usarMesmoValor} // Desabilita se o checkbox estiver marcado
        />
      </div>

      <div>
        <label>Fornecedor:</label>
        <input
          type="text"
          value={fornecedor}
          onChange={(e) => setFornecedor(e.target.value)}
          disabled={usarMesmoValor} // Desabilita se o checkbox estiver marcado
        />
      </div>

      <div>
        <label>Veículo:</label>
        <input
          type="text"
          value={veiculo}
          onChange={(e) => setVeiculo(e.target.value)}
          disabled={usarMesmoValor} // Desabilita se o checkbox estiver marcado
        />
      </div>

      {/* Repetir os valores quando o checkbox estiver marcado */}
      {usarMesmoValor && (
        <div>
          <div>
            <label>Motorista (repetido):</label>
            <input
              type="text"
              value={motorista}
              disabled // Desabilitado para ser igual ao valor original
            />
          </div>

          <div>
            <label>Fornecedor (repetido):</label>
            <input
              type="text"
              value={fornecedor}
              disabled // Desabilitado para ser igual ao valor original
            />
          </div>

          <div>
            <label>Veículo (repetido):</label>
            <input
              type="text"
              value={veiculo}
              disabled // Desabilitado para ser igual ao valor original
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SeuComponente;
