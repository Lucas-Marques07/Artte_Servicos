import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';

const Mapa = dynamic(() => import('@/components/MapaRota'), { ssr: false });

export default function RotaVan() {
  const [inicio, setInicio] = useState('');
  const [colaboradores, setColaboradores] = useState([
    { cpf: '', nome: '', funcao: '', diaria: '', empresa: '', operacao: '', turno: '' }
  ]);
  const [horaInicio, setHoraInicio] = useState('');
  const [paradas, setParadas] = useState([]);
  const [erro, setErro] = useState('');
  const [minutosPadrao, setMinutosPadrao] = useState(5);
  const [pontosUnicos, setPontosUnicos] = useState([]);
  const [cpfsDisponiveis, setCpfsDisponiveis] = useState([]);
  const router = useRouter();
  const novoInputRef = useRef(null);
   const [funcoesUnicas, setFuncoesUnicas] = useState([]);
   const [data, setData] = useState([]);
  const [clientesUnicos, setClientesUnicos] = useState([]);
  const [operacoesUnicas, setOperacoesUnicas] = useState([]);
  const [turnosUnicos, setTurnosUnicos] = useState([]);
  const [usarMesmoValor, setUsarMesmoValor] = useState(false);
  const [cabecalho, setCabecalho] = useState({
    cliente: '',
    operacao: '',
    data: '',
    turno: '',
    entrada: '',
    saida: ''
  });
  
  // Função para buscar os pontos de fretamento da planilha (ou API)
  const buscarPontosDeFretamento = async () => {
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbzL6NoS3730uOtG1T3SsqpgXVp4r_s9rRDd-c9B85cip9mByzaYEzFwepWxawH1VHni/exec'); // Substitua pela URL da sua planilha
      const data = await response.json();
    
      const pontos = [...new Set(data.map(item => item['pontofretamento']).filter(Boolean))];
      setPontosUnicos(pontos);
      setCpfsDisponiveis(data);

        const funcoes = [...new Set(data.map(item => item['FUNÇÃO']).filter(Boolean))];
        setFuncoesUnicas(funcoes);

        const clientes = [...new Set(data.map(item => item['EMPRESA']).filter(Boolean))];
        setClientesUnicos(clientes);

        const operacoes = [...new Set(data.map(item => item['OPERAÇÃO']).filter(Boolean))];
        setOperacoesUnicas(operacoes);

        const turnos = [...new Set(data.map(item => item['TURNO']).filter(Boolean))];
        setTurnosUnicos(turnos);
    
   
  } catch (err) {
    console.error('Erro ao buscar pontos de fretamento:', err);
  }
};

  // Carregar os pontos de fretamento assim que o componente for montado
  useEffect(() => {
    buscarPontosDeFretamento();
  }, []);

  // Função para calcular a hora com offset
  const calcularHoraComOffset = (horaBase, minutosParaAdicionar) => {
    if (!horaBase) return '';
    const [h, m] = horaBase.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + minutosParaAdicionar);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const adicionarParada = () => {
    const minutosExtras = (paradas.length + 1) * minutosPadrao;
    const novaHora = calcularHoraComOffset(horaInicio, minutosExtras);
    setParadas([...paradas, { nome: '', hora: novaHora, colaboradores: [] }]);
  };

  const removerParada = (index) => {
    const novaLista = [...paradas];
    novaLista.splice(index, 1);
    setParadas(novaLista);
  };
  const validarCampos = () => {
      
    // Verificar se as paradas possuem colaborador, hora e dados válidos
    for (let ponto of paradas) {
      if (!ponto.nome || !ponto.hora || ponto.colaboradores.length === 0) {
        alert('Por favor, preencha todas as paradas com nome, hora e colaboradores para seguir.');
        return false;
      }
    }
  
    // Verificar se a empresa e a data foram preenchidos corretamente
    if (!cabecalho.cliente || !cabecalho.data) {
      alert('Por favor, preencha os campos de empresa e data para seguir.');
      return false;
    }
  
    return true;
  };

  const atualizarParada = (index, campo, valor) => {
    const novaLista = [...paradas];
    novaLista[index][campo] = valor;
    if (campo === 'hora') {
      for (let i = index + 1; i < novaLista.length; i++) {
        const minutosExtras = (i - index) * minutosPadrao;
        novaLista[i].hora = calcularHoraComOffset(valor, minutosExtras);
      }
    }
    setParadas(novaLista);
  };
  const handleSubmit = async () => {
    const doc = new jsPDF();
    if (!validarCampos()) return;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const formatarData = (dataString) => {
      const [ano, mes, dia] = dataString.split('-');
      return `${dia}/${mes}/${ano}`;
    };
  
    const dataAtual = formatarData(cabecalho.data);
  
    // Carrega logo
    const loadImageAsBase64 = async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    };
  
    const logoBase64 = await loadImageAsBase64('/logo.jpeg');
  
    // PDF - Borda
    doc.setDrawColor(12, 106, 55);
    doc.setLineWidth(0.8);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
    // PDF - Logo
    doc.addImage(logoBase64, 'JPEG', 17, 17, 35, 35);
  
    // Título
    doc.setFontSize(20);
    doc.setTextColor(12, 106, 55);
    doc.text('ITINERÁRIO EMPRESAS', pageWidth / 2, 25, { align: 'center' });
  
    // Cabeçalho
    let y = 45;
    const leftColumnX = pageWidth / 3.8;
    const rightColumnX = pageWidth / 2 + 10;
  
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
  
    doc.text(`Cliente: ${cabecalho.cliente}`, leftColumnX, y);
    doc.text(`Operação: ${cabecalho.operacao}`, rightColumnX, y);
    y += 7;
  
    doc.text(`Data: ${dataAtual}`, leftColumnX, y);
    doc.text(`Turno: ${cabecalho.turno}`, rightColumnX, y);
    y += 7;
  
    doc.text(`Entrada: ${cabecalho.entrada}`, leftColumnX, y);
    doc.text(`Saída: ${cabecalho.saida}`, rightColumnX, y);
    y += 10;
  
    // Linha separadora
    doc.setDrawColor(12, 106, 55);
    doc.setLineWidth(0.5);
    doc.line(20, y, pageWidth - 20, y);
    y += 14;
  
    // Paradas com colaboradores em duas colunas
    let x = 20;
    const coluna2X = pageWidth / 2 + 5;
    let usandoSegundaColuna = false;
    const yInicial = y;
  
    paradas.forEach((ponto, index) => {
      if (y > 260) {
        if (!usandoSegundaColuna) {
          x = coluna2X;
          y = yInicial;
          usandoSegundaColuna = true;
        } else {
          doc.addPage();
          doc.setDrawColor(12, 106, 55);
          doc.setLineWidth(0.8);
          doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
          x = 20;
          y = 20;
          usandoSegundaColuna = false;
        }
      }
  
      // Nome do ponto com hora
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`${index + 1}. ${ponto.nome} - ${ponto.hora}`, x, y);
      y += 7;
  
      // Colaboradores
      ponto.colaboradores.forEach((colab) => {
        if (y > 260) {
          if (!usandoSegundaColuna) {
            x = coluna2X;
            y = yInicial;
            usandoSegundaColuna = true;
          } else {
            doc.addPage();
            doc.setDrawColor(12, 106, 55);
            doc.setLineWidth(0.8);
            doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
            x = 20;
            y = 20;
            usandoSegundaColuna = false;
          }
        }
  
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(`- ${colab}`, x + 5, y);
        y += 7;
      });
  
      y += 5; // Espaço entre os pontos
    });
  
    // Abrir PDF
    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');
  };
  
  

  const adicionarColaborador = (index) => {
    const novaLista = [...paradas];
    novaLista[index].colaboradores.push('');
    setParadas(novaLista);
    setTimeout(() => {
      if (novoInputRef.current) novoInputRef.current.focus();
    }, 100);
  };

  const removerColaborador = (indexParada, indexColaborador) => {
    const novaLista = [...paradas];
    novaLista[indexParada].colaboradores.splice(indexColaborador, 1);
    setParadas(novaLista);
  };

  const atualizarColaborador = (indexParada, indexColaborador, nome) => {
    const novaLista = [...paradas];
    novaLista[indexParada].colaboradores[indexColaborador] = nome;
    setParadas(novaLista);
  };

  
  const trocarOrdem = (fromIndex, toIndex) => {
    const novaLista = [...paradas];
    const [removido] = novaLista.splice(fromIndex, 1);
    novaLista.splice(toIndex, 0, removido);

    let minutosExtras = 0;
    novaLista.forEach((ponto, i) => {
      if (i === 0) {
        ponto.hora = calcularHoraComOffset(inicio, minutosExtras);
      } else {
        minutosExtras += minutosPadrao;
        ponto.hora = calcularHoraComOffset(novaLista[i - 1].hora, minutosExtras);
      }
    });

    setParadas(novaLista);
  };


  const recalcularHorarios = () => {
    if (!horaInicio || paradas.length === 0 || !minutosPadrao) {
      alert('Certifique-se de preencher o horário de início, definir os minutos e ter pelo menos um ponto.');
      return;
    }

    const novaLista = [...paradas];
    let minutosExtras = minutosPadrao;
    novaLista.forEach((ponto, i) => {
      ponto.hora = calcularHoraComOffset(horaInicio, minutosExtras);
      minutosExtras += minutosPadrao;
    });

    setParadas(novaLista);
  };

  const handleEnviar = () => {
    if (!validarCampos()) return;
    
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    // Defina o cabeçalho da mensagem
    const cabecalhoStr = `🗺️ *ITINERÁRIO - ${cabecalho.cliente}*\n📅 *Data:* ${dataAtual}\n🚩 *Ponto Inicial:* ${inicio}\n⏰ *Saída:* ${horaInicio}`;
    
    // Gerando a lista de colaboradores
    const colaboradoresStr = paradas.map((ponto, idx) => {
      const nomes = (ponto.colaboradores || [])
        .filter(c => c && c.trim() !== '')
        .map(c => `  - ${c}`)
        .join('\n');
    
      return `*${idx + 1}. ${ponto.nome}* (${ponto.hora})\n${nomes || '  - Sem colaboradores'}`;
    }).join('\n\n');
    
    
    
    
    // Mensagem final
    const mensagem = `${cabecalhoStr}\n\n${colaboradoresStr}`;
    
    // Verifica se o navegador suporta o compartilhamento
    if (navigator.share) {
      navigator
        .share({ title: 'Rota da Van', text: mensagem })
        .catch(err => console.error(err));
    } else {
      alert('Compartilhamento não suportado neste navegador. Tente pelo celular.');
    }
  };
  
  

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
    }}>
     <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', minWidth: '85vw' }}>
          {/* Cabeçalho com logo e botão voltar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'
        }}>
          <img src="/icon.png" alt="Logo" style={{ height: '80px' }} />
          <button
            onClick={() => router.push('/login')}
            style={{
              background: '#0c6a37', color: '#fff', border: 'none', padding: '8px 10px',
              borderRadius: '6px', cursor: 'pointer', fontSize: '14px', width: '80px', textAlign: 'center',
            }}
          >
            ⬅ Voltar
          </button>
        </div>

        {/* Título */}
        <center><h2 style={{ marginBottom: '1rem' }}>ITINERÁRIO DAS EMPRESAS</h2></center>

        <div
  style={{
    border: '1px solid #ccc',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
    background: '#f9f9f9',
    width: '90%',
    marginRight: '40px',   
  }}
>
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px'
  }}>
    <div>
      <label>Cliente:</label>
      <select
        value={cabecalho.cliente}
        onChange={(e) => setCabecalho({ ...cabecalho, cliente: e.target.value })}
      >
        <option value="">Selecione</option>
        {clientesUnicos.map((cliente, i) => (
          <option key={i} value={cliente}>{cliente}</option>
        ))}
      </select>
    </div>

    <div>
      <label>Operação:</label>
      <select
        value={cabecalho.operacao}
        onChange={(e) => setCabecalho({ ...cabecalho, operacao: e.target.value })}
      >
        <option value="">Selecione</option>
        {operacoesUnicas.map((op, i) => (
          <option key={i} value={op}>{op}</option>
        ))}
      </select>
    </div>

    <div>
      <label>Data:</label>
      <input
        type="date"
        value={cabecalho.data}
        onChange={(e) => setCabecalho({ ...cabecalho, data: e.target.value })}
        style={{ width: '140px' }}
      />
    </div>

    <div>
      <label>Turno:</label>
      <select
        value={cabecalho.turno}
        onChange={(e) => setCabecalho({ ...cabecalho, turno: e.target.value })}
      >
        <option value="">Selecione</option>
        {turnosUnicos.map((turno, i) => (
          <option key={i} value={turno}>{turno}</option>
        ))}
      </select>
    </div>

    <div>
      <label>Entrada:</label>
      <input
        type="time"
        value={cabecalho.entrada}
        onChange={(e) => setCabecalho({ ...cabecalho, entrada: e.target.value })}
        style={{ width: '140px' }}
      />
    </div>

    <div>
      <label>Saída:</label>
      <input
        type="time"
        value={cabecalho.saida}
        onChange={(e) => setCabecalho({ ...cabecalho, saida: e.target.value })}
        style={{ width: '140px' }}
      />
    </div>
    <div style={{ marginBottom: '0rem' }}>
  <label>Ponto de Partida:</label>
  <input
    type="text"
    value={inicio}
    onChange={e => setInicio(e.target.value)}
    style={{ width: '300px', marginBottom: '10px' }}
  />
  <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
  <div>
    <label>Início:</label>
    <input
      type="time"
      value={horaInicio}
      onChange={e => setHoraInicio(e.target.value)}
      style={{ width: '180px' }}
    />
  </div>

  <div>
    <label>Minutos:</label>
    <input
      type="number"
      value={minutosPadrao}
      onChange={e => setMinutosPadrao(Number(e.target.value))}
      min="1"
      style={{ width: '30px', marginLeft: '0px' }}
    />
  </div>

  <button
    onClick={recalcularHorarios}
    style={{
      width: '40px',
      height: '40px',
      fontSize: '22px',
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      marginBottom: '2px', 
      marginLeft: '0px'
    }}
    title="Recalcular horários"
  >
    🔄
  </button>
</div>
</div>

{/* Linha com Início, Minutos e botão de recalcular */}

 
        {erro && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            <strong>{erro}</strong>
          </div>
        )}
  </div>
</div>

       

        <div>
          <label>Pontos de Parada:</label>
          {paradas.map((parada, i) => (
            <div key={i} style={{
              padding: '1rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '8px', background: '#f8f8f8'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Ponto {i + 1}</strong>
                <div style={{ display: 'flex', alignItems: 'center' }}>
          <select
            onChange={(e) => trocarOrdem(i, parseInt(e.target.value))}
            value={i}
            style={{ fontSize: '0.8rem', width: '60px', maxWidth: '120px', marginLeft: '170px' }} // Ajuste para garantir o espaçamento
          >
            {paradas.map((_, idx) => (
              <option key={idx} value={idx}>{idx + 1}</option>
            ))}
          </select>
</div>
                <button
                  onClick={() => removerParada(i)}
                  title="Remover ponto"
                  style={{
                    width: '20px', height: '20px', background: 'none', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                >
                  🗑️
                </button>
              </div>
              
              <div style={{ marginTop: '10px',  display: 'flex', gap: '10px' }}>
 
  <select
    value={parada.nome}
    onChange={(e) => atualizarParada(i, 'nome', e.target.value)}
    style={{ width: '100%', marginBottom: '8px' }}
  >
    <option value="">Selecione</option>
    {pontosUnicos.map((ponto, index) => (
      <option key={index} value={ponto}>{ponto}</option>
    ))}
  </select>
                <input
                  type="time"
                  value={parada.hora}
                  onChange={e => atualizarParada(i, 'hora', e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>

              <div>
                <label>Colaboradores:</label>
                {parada.colaboradores.map((colaborador, j) => (
                  <div key={j} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <input
                      type="text"
                      value={colaborador}
                      onChange={e => atualizarColaborador(i, j, e.target.value)}
                      placeholder={`Colaborador ${j + 1}`}
                      style={{ flex: 1 }}
                      ref={j === parada.colaboradores.length - 1 ? novoInputRef : null}
                    />
                    <button
                      onClick={() => removerColaborador(i, j)}
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
                  onClick={() => adicionarColaborador(i)}
                  style={{ marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ➕
                </button>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
  <span
    onClick={adicionarParada}
    disabled={!inicio || !horaInicio}
    style={{
      textAlign: 'center',
      marginTop: '1rem',
      backgroundColor: !inicio || !horaInicio ? '#ccc' : '#007bff',
      color: '#fff',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '4px',
      cursor: !inicio || !horaInicio ? 'not-allowed' : 'pointer'
    }}
  >
    ➕
  </span>
</div>

        </div>
        
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  <button
    onClick={handleSubmit}
    className="send-whatsapp-button"
    style={{
      padding: '10px 20px',
      marginBottom: '1rem', // Espaço entre os botões
      fontSize: '1rem'
    }}
  >
    📄 Visualizar Itinerário
  </button>

  <button
    onClick={handleEnviar}
    style={{
      padding: '10px 20px',
      background: '#25D366',
      color: '#fff',
      borderRadius: '6px',
      border: 'none',
      fontWeight: 'bold',
      fontSize: '1rem'
    }}
  >
    📧 Informar Itinerário
  </button>
</div>

     
       
      </div>
    </div>
  );
}
