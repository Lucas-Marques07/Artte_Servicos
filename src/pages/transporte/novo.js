// src/pages/transporte/novo.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';




export default function NovoTransporte() {
  const router = useRouter();
  const [transportes, setTransportes] = useState([
    { fornecedor: '', motorista: '', empresa: '', operacao: '', data: '', motivo: '', horario: '', quantidade: '', valor: '', cidade: '', veiculo: '', colaboradores: [], falta: [] }
  ]);
  
  const [usarMesmoValor, setUsarMesmoValor] = useState(false);
  const handleCheckboxChange = () => {
    setUsarMesmoValor(!usarMesmoValor);
  };
  
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
      // Aqui você pode atualizar as opções de operações e motoristas
      const operacoes = [...new Set(dadosPlanilha.map(d => d.OPERAÇÃO))];
      const motoristas = [...new Set(dadosPlanilha.map(d => d.MOTORISTA))];
  
      setOperacoesFiltradas(operacoes);
      setMotoristasFiltrados(motoristas);
  
      novaLista[index]['operacao'] = '';
      novaLista[index]['motorista'] = '';
    }
  
    setTransportes(novaLista);
  };
  

  const adicionarLinha = () => {
    const novaLinha = {
      fornecedor: usarMesmoValor && transportes.length > 0 ? transportes[0].fornecedor : '',
      motorista: usarMesmoValor && transportes.length > 0 ? transportes[0].motorista : '',
      empresa: '',
      operacao: '',
      data: usarMesmoValor && transportes.length > 0 ? transportes[0].data : '',
      motivo: '',
      horario: '',
      quantidade: '',
      valor: usarMesmoValor && transportes.length > 0 ? transportes[0].valor : '',
      cidade: '',
      veiculo: usarMesmoValor && transportes.length > 0 ? transportes[0].veiculo : '',
      colaboradores: [],
      falta: [],
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
      ? `\n\n❌ *Faltas:*\n${t.falta.map((f, idx) => `   ${idx + 1}. ${f}`).join('\n')}`
      : '';

    const colaboradoresTexto = t.colaboradores && t.colaboradores.length > 0
      ? `\n👤 *Colaboradores:*\n${t.colaboradores.map((f, idx) => `   ${idx + 1}. ${f}`).join('\n')}`
      : '';

    return `
🚐 *Transporte - Viagem ${i + 1}*

• *Fornecedor:* ${t.fornecedor}
• *Data:* ${formatarData(t.data)} | *Horário:* ${t.horario}
• *Empresa:* ${t.empresa} | *Operação:* ${t.operacao}
• *Motivo:* ${t.motivo} | *Cidade:* ${t.cidade}
• *Veículo:* ${t.veiculo} | *Motorista:* ${t.motorista}
• *Qtd. Colaboradores:* ${t.quantidade}
${colaboradoresTexto}${faltasTexto}
`.trim();
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
  const Operação = [...new Set(dadosPlanilha.map(d => d.OPERAÇÃO))];
  const Motorista = [...new Set(dadosPlanilha.map(d => d.MOTORISTA))];
  

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
        <img src="/artte.ico" alt="Logo" style={{ height: '110px' }} />
        <button
          onClick={() => router.push('/login')}
          style={{
            background: '#141e7d',
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
        <h2 style={{ marginBottom: '1rem' }}>Lançamentos de Transporte</h2>
      </center>

      {/* Checkbox usar mesmo valor */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '0.5rem', fontSize: '14px' }}>
  <span style={{ marginRight: '6px' }}>Padrão</span>
  <input
    type="checkbox"
    checked={usarMesmoValor}
    onChange={handleCheckboxChange}
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
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '8px' }}>
  <span style={{ fontWeight: 'bold', fontSize: '15px', marginLeft: '10px' , marginBottom: '10px'}}>{index + 1}º Viagem</span>
  <span onClick={() => removerLinha(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', marginLeft: '16px' , marginBottom: '20px' }}>🗑️</span>
</div>





          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div>
              <label>Fornecedor:</label>
              <select value={t.fornecedor} onChange={(e) => handleChange(index, 'fornecedor', e.target.value)}>
                <option value="">Selecione</option>
                {fornecedores
                 .filter((e) => e && e.trim() !== "") 
                
                 .map((f, i) => <option key={i} value={f}>{f}</option>)}
              </select>
            </div>

            <div>
              <label>Empresa:</label>
              <select value={t.empresa} onChange={(e) => handleChange(index, 'empresa', e.target.value)}>
                <option value="">Selecione</option>
                {empresas    .filter((e) => e && e.trim() !== "") 
                 .sort((a, b) => a.localeCompare(b))
                  .map((e, i) => <option key={i} value={e}>{e}</option>)}
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
                <option value="SÃO PAULO">SÃO PAULO</option>
        </select>
              </div>
            <div>
              <label>Operação:</label>
              <select value={t.operacao} onChange={(e) => handleChange(index, 'operacao', e.target.value)}>
                <option value="">Selecione</option>
                {operacoesFiltradas .filter((e) => e && e.trim() !== "") 
                
                .map((op, i) => <option key={i} value={op}>{op}</option>)}
              </select>
            </div>

            <div>
              <label>Motorista:</label>
              <select value={t.motorista} onChange={(e) => handleChange(index, 'motorista', e.target.value)}>
                <option value="">Selecione</option>
                {motoristasFiltrados      .filter((e) => e && e.trim() !== "") 
                
                  .map((m, i) => <option key={i} value={m}>{m}</option>)}
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
                {motivos
                .filter((e) => e && e.trim() !== "") 
                
                  .map((m, i) => <option key={i} value={m}>{m}</option>)}
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
     <div>
  {/* O ícone agora é clicável diretamente */}
  <span
    onClick={() => {
      const novaLista = [...transportes];
      novaLista[index].colaboradores.splice(indexColab, 1);
      setTransportes(novaLista);
    }}
    style={{ cursor: 'pointer', fontSize: '18px' }}
  >
    🗑️
  </span>
</div>

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
        <span
          type="button"
          onClick={() => {
            const novosTransportes = [...transportes];
            novosTransportes[index].falta.splice(indexFalta, 1);
            setTransportes(novosTransportes);
          }}
          style={{ cursor: 'pointer', fontSize: '18px' }}
        >
        🗑️
        </span>
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
        <span onClick={adicionarLinha} style={{ fontSize: '20px', background: '#e0e0e0', padding: '4px 10px', borderRadius: '4px' }}>
          ➕
        </span>
      </div>

      {/* Botão compartilhar */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button onClick={handleEnviar} style={{ background: '#141e7d', color: '#fff', padding: '8px 16px', borderRadius: '6px', fontSize: '14px' }}>
        📧 Informar Viagem
        </button>
      </div>
    </div>
    </div>
  );
}
