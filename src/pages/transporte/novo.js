// src/pages/transporte/novo.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';




export default function NovoTransporte() {
  const router = useRouter();
  const [transportes, setTransportes] = useState([
    { fornecedor: '', motorista: '', empresa: '', operacao: '', data: '', motivo: '', horario: '', quantidade: '', valor: '', cidade: '', veiculo: '', colaboradores: [''], falta: [''] }
  ]);
  
  const [usarMesmoValor, setUsarMesmoValor] = useState(false);
  
  const [dadosPlanilha, setDadosPlanilha] = useState([]);
  const [operacoesFiltradas, setOperacoesFiltradas] = useState([]);
  const [motoristasFiltrados, setMotoristasFiltrados] = useState([]);
  const formatarData = (dataString) => {
    const data = new Date(dataString);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();

   
    
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
    
        return `${dia}/${mes}/${ano}`;
  };
  
  

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
    const novaLinha = {
      fornecedor: '',
      motorista: '',
      empresa: '',
      operacao: '',
      data: '',
      motivo: '',
      horario: '',
      quantidade: '',
      valor: usarMesmoValor && transportes.length > 0 ? transportes[0].valor : '',
      cidade: '',
      veiculo: '',
      colaboradores: [''], // 👈 aqui estava faltando
      falta: [''] // 👈 aqui
    };
  
    setTransportes([...transportes, novaLinha]);
  };
  

  const removerLinha = (index) => {
    const novaLista = [...transportes];
    novaLista.splice(index, 1);
    setTransportes(novaLista);
  };

  const validarCampos = () => {
    for (let t of transportes) {
      if (!t.fornecedor || !t.motorista || !t.empresa || !t.data || !t.motivo || !t.horario || !t.quantidade || !t.veiculo || !t.cidade) {
        alert('Por favor, preencha todos os campos antes de enviar.');
        return false;
      }
    }
    return true;
  };

  const handleEnviar = () => {
    if (!validarCampos()) return;

    const mensagem = transportes.map((t, i) => {
          
      const faltasTexto = t.falta && t.falta.length > 0
        ? `\n   *FALTAS:*\n${t.falta.map((f, idx) => `  ${idx + 1}) ${f}`).join('\n')}`
        : '';
        const colaboradoresTexto = t.colaboradores && t.colaboradores.length > 0
        ? `\n   *COLABORADORES:*\n${t.colaboradores.map((f, idx) => `  ${idx + 1}) ${f}`).join('\n')}`
        : '';
    
      return `${i + 1}.
    *FORNECEDOR:* ${t.fornecedor}
    *DATA:* ${formatarData(t.data)} | *HORÁRIO:* ${t.horario}
    *EMPRESA:* ${t.empresa} | *OPERAÇÃO:* ${t.operacao}
    *VIAGEM:* ${t.motivo} | *CIDADE:* ${t.cidade}
    *VEÍCULO:* ${t.veiculo} | *MOTORISTA:* ${t.motorista}
    *COLABS:* ${t.quantidade}   
    ${colaboradoresTexto}${faltasTexto}`;
    }).join('\n------------------\n');
    

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
    <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f8f8f8',
      fontFamily: 'sans-serif',
      padding: '2rem'
    }}
  >
    
    <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
      
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
      <div
      key={index}
      style={{
        border: '1px solid #ccc',
        padding: '10px',
        borderRadius: '6px',
        marginBottom: '10px',
        background: '#f9f9f9',
        width: '350px'  // Largura fixa de 500px
      }}
    >
    
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
            <label>Veiculo:</label>
            <select  value={t.veiculo}  onChange={(e) => handleChange(index, 'veiculo', e.target.value)}>
                <option value="">Selecione</option>
                <option value="CARRO">CARRO</option>
                <option value="VAN">VAN</option>
        </select>
              </div>
              <div>
            <label>Cidade:</label>
            <select  value={t.cidade}  onChange={(e) => handleChange(index, 'cidade', e.target.value)}>
                <option value="">Selecione</option>
                <option value="EXTREMA">EXTREMA</option>
                <option value="ESTIVA">ESTIVA</option>
                <option value="ITAPEVA">ITAPEVA</option>
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
              <input type="date" value={t.data} onChange={(e) => handleChange(index, 'data', e.target.value)}
               style={{width: '140px', }} />
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
              <input type="time" value={t.horario} onChange={(e) => handleChange(index, 'horario', e.target.value)}
               style={{width: '140px', }} />
            </div>

            <div>
              <label>Qtd Colabs:</label>
            <input type="number"  value={t.quantidade}  onChange={(e) => handleChange(index, 'quantidade', e.target.value)} 
  style={{
    width: '140px',         // largura do input
    padding: '6px 8px',    // espaçamento interno
    border: '1px solid #ccc',  // borda cinza clara
    borderRadius: '6px',   // cantos arredondados
    fontSize: '14px',      // tamanho da fonte
    outline: 'none',       // remove contorno azul ao focar
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', // leve sombra
    height: '32px',
    textAlign: 'center' 
  }} min="1"
  
  
  />
  
  </div>
  <div style={{ marginTop: '1rem', width: '360px' }}>
  <label>Colaboradores:</label>
  {t.colaboradores.map((colaborador, indexColab) => (
    <div key={indexColab} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
      <input
        type="text"
        value={colaborador}
        onChange={e => {
          const novaLista = [...transportes];
          novaLista[index].colaboradores[indexColab] = e.target.value;
          setTransportes(novaLista);
        }}
        placeholder="Nome do colaborador"
        style={{ flex: 1 }}
      />
      <button
        onClick={() => {
          const novaLista = [...transportes];
          novaLista[index].colaboradores.splice(indexColab, 1);
          setTransportes(novaLista);
        }}
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        🗑️
      </button>
    </div>
  ))}
  <button
    onClick={() => {
      const novaLista = [...transportes];
      novaLista[index].colaboradores.push('');
      setTransportes(novaLista);
    }}
    style={{ marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
  >
    ➕
  </button>

  {/* FALTAS */}
  <div style={{ marginTop: '1rem' }}>
    <label>Faltas:</label>
    {t.falta.map((nomeFalta, indexFalta) => (
      <div key={indexFalta} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <input
          type="text"
          value={nomeFalta}
          placeholder="Nome do faltante"
          onChange={(e) => {
            const novosTransportes = [...transportes];
            novosTransportes[index].falta[indexFalta] = e.target.value;
            setTransportes(novosTransportes);
          }}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={() => {
            const novosTransportes = [...transportes];
            novosTransportes[index].falta.splice(indexFalta, 1);
            setTransportes(novosTransportes);
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
        🗑️
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={() => {
        const novosTransportes = [...transportes];
        novosTransportes[index].falta.push('');
        setTransportes(novosTransportes);
      }}
      style={{ marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
    >
      ➕
    </button>
  </div>
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
    </div>
  );
}
