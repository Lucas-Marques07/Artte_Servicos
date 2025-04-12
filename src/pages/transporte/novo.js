// src/pages/transporte/novo.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function NovoTransporte() {
  const router = useRouter();
  const [transportes, setTransportes] = useState([
    { fornecedor: '', motorista: '', empresa: '', operacao: '', data: '', motivo: '', horario: '', quantidade: '', valor: '' }
  ]);
  const [usarMesmoValor, setUsarMesmoValor] = useState(false);
  const [dadosPlanilha, setDadosPlanilha] = useState([]);
  const [operacoesFiltradas, setOperacoesFiltradas] = useState([]);
  const [motoristasFiltrados, setMotoristasFiltrados] = useState([]);

  useEffect(() => {
    fetch('https://script.google.com/macros/s/AKfycbzL6NoS3730uOtG1T3SsqpgXVp4r_s9rRDd-c9B85cip9mByzaYEzFwepWxawH1VHni/exec')
      .then(res => res.json())
      .then(data => {
        setDadosPlanilha(data);
      });
  }, []);

  const handleChange = (index, campo, valor) => {
    const novaLista = [...transportes];
    novaLista[index][campo] = valor;

    if (campo === 'empresa') {
      const operacoes = [...new Set(dadosPlanilha.filter(d => d.EMPRESA === valor).map(d => d.OPERAÇÃO))];
      const motoristas = [...new Set(dadosPlanilha.filter(d => d.EMPRESA === valor).map(d => d.MOTORISTA))];
      setOperacoesFiltradas(operacoes);
      setMotoristasFiltrados(motoristas);
      novaLista[index]['operacao'] = '';
      novaLista[index]['motorista'] = '';
    }

    setTransportes(novaLista);
  };

  const adicionarLinha = () => {
    const novaLinha = { fornecedor: '', motorista: '', empresa: '', operacao: '', data: '', motivo: '', horario: '', quantidade: '', valor: '' };
    if (usarMesmoValor && transportes.length > 0) {
      novaLinha.valor = transportes[0].valor;
    }
    setTransportes([...transportes, novaLinha]);
  };

  const removerLinha = (index) => {
    const novaLista = [...transportes];
    novaLista.splice(index, 1);
    setTransportes(novaLista);
  };

  const validarCampos = () => {
    for (let t of transportes) {
      if (!t.fornecedor || !t.motorista || !t.empresa || !t.data || !t.motivo || !t.horario || !t.quantidade || !t.valor) {
        alert('Por favor, preencha todos os campos antes de enviar.');
        return false;
      }
    }
    return true;
  };

  const handleEnviar = () => {
    if (!validarCampos()) return;

    const mensagem = transportes.map((t, i) => (
      `${i + 1}.
Fornecedor: ${t.fornecedor}
Motorista: ${t.motorista}
Empresa: ${t.empresa}
Operação: ${t.operacao}
Data: ${t.data}
Motivo: ${t.motivo}
Horário: ${t.horario}
Quantidade: ${t.quantidade}
Valor: R$${t.valor}`
    )).join('\n------------------\n');

    if (navigator.share) {
      navigator.share({
        title: 'Diárias de Transporte',
        text: mensagem,
      }).catch((error) => console.error('Erro ao compartilhar:', error));
    } else {
      alert('Compartilhamento não suportado neste navegador. Tente pelo celular.');
    }
  };

  const fornecedores = [...new Set(dadosPlanilha.map(d => d.FORNECEDOR))];
  const empresas = [...new Set(dadosPlanilha.map(d => d.EMPRESA))];
  const motivos = [...new Set(dadosPlanilha.map(d => d.VIAGEM))];

  return (
    <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      
      {/* Cabeçalho com logo e botão voltar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <img src="/icon.png" alt="Logo" style={{ height: '80px' }} />
        <button
          onClick={() => router.push('/login')}
          style={{
            background: '#0c6a37',
            color: '#fff',
            border: 'none',
            padding: '8px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            width: '80px',
            textAlign: 'center',
          }}
        >
          ⬅ Voltar
        </button>
      </div>

      {/* Título */}
      <center>
        <h2 style={{ marginBottom: '1rem' }}>Lançamentos de transporte</h2>
      </center>

      {/* Checkbox usar mesmo valor */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '0.5rem', fontSize: '14px' }}>
        <span style={{ marginRight: '6px' }}>Usar mesmo valor</span>
        <input
          type="checkbox"
          checked={usarMesmoValor}
          onChange={() => setUsarMesmoValor(!usarMesmoValor)}
          style={{ width: '14px', height: '14px' }}
        />
      </div>

      {/* Lista de transportes */}
      {transportes.map((t, index) => (
        <div key={index} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '6px', marginBottom: '10px', background: '#f9f9f9' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
            <button onClick={() => removerLinha(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div>
              <label>Fornecedor:</label>
              <select value={t.fornecedor} onChange={(e) => handleChange(index, 'fornecedor', e.target.value)}>
                <option value="">Selecione</option>
                {fornecedores.map((f, i) => <option key={i} value={f}>{f}</option>)}
              </select>
            </div>

            <div>
              <label>Empresa:</label>
              <select value={t.empresa} onChange={(e) => handleChange(index, 'empresa', e.target.value)}>
                <option value="">Selecione</option>
                {empresas.map((e, i) => <option key={i} value={e}>{e}</option>)}
              </select>
            </div>

            <div>
              <label>Operação:</label>
              <select value={t.operacao} onChange={(e) => handleChange(index, 'operacao', e.target.value)}>
                <option value="">Selecione</option>
                {operacoesFiltradas.map((op, i) => <option key={i} value={op}>{op}</option>)}
              </select>
            </div>

            <div>
              <label>Motorista:</label>
              <select value={t.motorista} onChange={(e) => handleChange(index, 'motorista', e.target.value)}>
                <option value="">Selecione</option>
                {motoristasFiltrados.map((m, i) => <option key={i} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label>Data:</label>
              <input type="date" value={t.data} onChange={(e) => handleChange(index, 'data', e.target.value)} />
            </div>

            <div>
              <label>Motivo:</label>
              <select value={t.motivo} onChange={(e) => handleChange(index, 'motivo', e.target.value)}>
                <option value="">Selecione</option>
                {motivos.map((m, i) => <option key={i} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label>Horário:</label>
              <input type="time" value={t.horario} onChange={(e) => handleChange(index, 'horario', e.target.value)} />
            </div>

            <div>
              <label>Qtd:</label>
              <input type="number" value={t.quantidade} onChange={(e) => handleChange(index, 'quantidade', e.target.value)} />
            </div>

            <div>
              <label>Valor:</label>
              <input type="number" value={t.valor} onChange={(e) => handleChange(index, 'valor', e.target.value)} />
            </div>
          </div>
        </div>
      ))}

      {/* Botão adicionar */}
      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        <button onClick={adicionarLinha} style={{ fontSize: '20px', background: '#e0e0e0', padding: '4px 10px', borderRadius: '4px' }}>
          ➕ Adicionar
        </button>
      </div>

      {/* Botão compartilhar */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button onClick={handleEnviar} style={{ background: '#0c6a37', color: '#fff', padding: '8px 16px', borderRadius: '6px', fontSize: '14px' }}>
          📤 Compartilhar Transporte
        </button>
      </div>
    </div>
  );
}
