// src/pages/colaboradores/novo.js
import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { useRouter } from 'next/router';



export default function NovoColaborador() {
  const router = useRouter(); // ⬅ Adicionado
  const [colaboradores, setColaboradores] = useState([]);
const [cpfsDisponiveis, setCpfsDisponiveis] = useState([]);
const [textoImportado, setTextoImportado] = useState('');
const [funcoesUnicas, setFuncoesUnicas] = useState([]);
const [clientesUnicos, setClientesUnicos] = useState([]);
const [texto, setTexto] = useState('');
const [operacoesUnicas, setOperacoesUnicas] = useState([]);
const [horaInicio, setHoraInicio] = useState('');
const [minutosPadrao, setMinutosPadrao] = useState(5);
const [turnosUnicos, setTurnosUnicos] = useState([]);
const [usarMesmoValor, setUsarMesmoValor] = useState(false);
const [cliente, setCliente] = useState('');
const [data, setData] = useState('');
const [inicio, setInicio] = useState('');
const [fim, setFim] = useState('');
const [pontosUnicos, setPontosUnicos] = useState([]);
const [pontosDaRota, setPontosDaRota] = useState([]);
const [novoPonto, setNovoPonto] = useState('');
const [paradas, setParadas] = useState([]);
const [pontosSelecionados, setPontosSelecionados] = useState([]); // para esse itinerário
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

const handleEnviar = () => {
  if (!validarCampos()) return;

  const dataFormatada = new Date(cabecalho.data).toLocaleDateString('pt-BR');
  
  const cabecalhoStr = `🗺️ *ITINERÁRIO - ${cabecalho.cliente}*\n📅 *Data:* ${dataFormatada}\n🚩 *Entrada:* ${cabecalho.entrada}\n⏰ *Saída da Rota:* ${horaInicio}`;

  // Agrupa os colaboradores por parada
  const colaboradoresStr = paradas.map((ponto, idx) => {
    const colabs = colaboradores
      .filter(c => c.ponto === ponto.nome && c.nome.trim() !== '')
      .map(c => `  - ${c.nome}`)
      .join('\n');

    return `*${idx + 1}. ${ponto.nome}* (${ponto.hora})\n${colabs || '  - Sem colaboradores'}`;
  }).join('\n\n');

  const mensagem = `${cabecalhoStr}\n\n${colaboradoresStr}`;

  if (navigator.share) {
    navigator.share({
      title: 'Rota da Van',
      text: mensagem,
    }).catch(err => console.error(err));
  } else {
    alert('Compartilhamento não suportado neste navegador. Tente pelo celular.');
  }
};

const adicionarParada = () => {
  const minutosExtras = paradas.length * minutosPadrao; // não soma +1, porque o índice já começa em 0
  const novaHora = calcularHoraComOffset(horaInicio, minutosExtras);

  setParadas([...paradas, { nome: '', hora: novaHora, colaboradores: [] }]);
};

const formatarDataParaInput = (data) => {
  const [dia, mes] = data.split('/');
  const hoje = new Date();
  const ano = hoje.getFullYear();
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
};

const importarTexto = (texto) => {
  texto = texto.replace(/\*/g, ''); // Remove todos os asteriscos
  const linhas = texto.split('\n').map((linha) => linha.trim());

  // CABEÇALHO
  const clienteMatch = texto.match(/CLIENTE:\s*(.*?)\s*\|/i);
  const operacaoMatch = texto.match(/CLIENTE:.*?\|\s*(.*?)\s*\|/i);
  const dataMatch = texto.match(/📆\s*(\d{2}\/\d{2})/);
  const horaMatch = texto.match(/🕒\s*([\d:]+)\s*\|\s*([\d:]+)/);
  const turnoMatch = texto.match(/🕒.*\|\s*([\w\s]+)/);

  const erros = [];

  if (!clienteMatch) erros.push('Cliente');
  if (!operacaoMatch) erros.push('Operação');
  if (!dataMatch) erros.push('Data');
  if (!horaMatch || !horaMatch[1] || !horaMatch[2]) {
    erros.push('Horário de Entrada e Saída');
  }
  if (!turnoMatch) erros.push('Turno');

  // COLABORADORES
  const novosColaboradores = linhas
    .filter((linha) => /^\d+-/.test(linha))
    .map((linha, index) => {
      const partes = linha.split('|').map((parte) => parte.trim());
      const nome = partes[0].replace(/^\d+-/, '').trim();
      const cpfMatch = partes[1]?.match(/CPF:\s*([\d.-]+)/i);
      const funcao = partes[2] || '';
      const diaria = partes[3] || '';
      const obs = partes[4] || '';

      const errosColab = [];
      if (!nome) errosColab.push('Nome');
      if (!cpfMatch || !cpfMatch[1]) errosColab.push('CPF');
      if (!funcao) errosColab.push('Função');
      if (!diaria) errosColab.push('Diária');

      if (errosColab.length > 0) {
        erros.push(`Colaborador ${index + 1}: ${errosColab.join(', ')}`);
      }

      return {
        nome,
        cpf: cpfMatch ? cpfMatch[1] : '',
        funcao,
        diaria,
        Obs: obs,
        ponto: '' // precisa existir!
      };
      
    });

  if (erros.length > 0) {
    alert(`⚠️ Erros encontrados na importação:\n\n- ${erros.join('\n- ')}`);
    return;
  }

  // Se estiver tudo certo, define os estados
  setCabecalho((prev) => ({
    ...prev,
    cliente: clienteMatch[1],
    operacao: operacaoMatch[1],
    data: formatarDataParaInput(dataMatch[1]),
    entrada: horaMatch[1],
    saida: horaMatch[2],
    turno: turnoMatch[1].trim()
  }));

  setColaboradores(novosColaboradores);
};


 
useEffect(() => {
  async function fetchCPFs() {
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbzL6NoS3730uOtG1T3SsqpgXVp4r_s9rRDd-c9B85cip9mByzaYEzFwepWxawH1VHni/exec');
      const data = await response.json();
      setCpfsDisponiveis(data);

      const pontos = [...new Set(data.map(item => item['pontofretamento']).filter(Boolean))];
      setPontosUnicos(pontos);

      const funcoes = [...new Set(data.map(item => item['FUNÇÃO']).filter(Boolean))];
      setFuncoesUnicas(funcoes);

      const clientes = [...new Set(data.map(item => item['EMPRESA']).filter(Boolean))];
      setClientesUnicos(clientes);

      const operacoes = [...new Set(data.map(item => item['OPERAÇÃO']).filter(Boolean))];
      setOperacoesUnicas(operacoes);

      const turnos = [...new Set(data.map(item => item['TURNO']).filter(Boolean))];
      setTurnosUnicos(turnos);
    } catch (error) {
      console.error('Erro ao buscar CPFs:', error);
    }
  }


  fetchCPFs();
}, []);
useEffect(() => {
  if (!texto) return;

  // Chama a função importarTexto para processar o texto
  importarTexto(texto);
}, [texto]);
const calcularHoraComOffset = (horaBase, offsetMinutos) => {
  const [h, m] = horaBase.split(':').map(Number);
  const data = new Date();
  data.setHours(h);
  data.setMinutes(m + offsetMinutos);
  const horaFinal = data.toTimeString().slice(0, 5);
  return horaFinal;
};
const recalcularHorarios = () => {
  if (!horaInicio) return;

  const novaLista = [...paradas];
  novaLista.forEach((p, i) => {
    const offset = i * minutosPadrao;
    p.hora = calcularHoraComOffset(horaInicio, offset);
  });

  setParadas(novaLista);
};
  

  const [cabecalho, setCabecalho] = useState({
    cliente: '',
    operacao: '',
    data: '',
    turno: '',
    entrada: '',
    saida: ''
  });

  useEffect(() => {
    async function fetchCPFs() {
      try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbzL6NoS3730uOtG1T3SsqpgXVp4r_s9rRDd-c9B85cip9mByzaYEzFwepWxawH1VHni/exec');
        const data = await response.json();
        setCpfsDisponiveis(data);
  
        const funcoes = [...new Set(data.map(item => item['FUNÇÃO']).filter(Boolean))];
        setFuncoesUnicas(funcoes);
  
        const clientes = [...new Set(data.map(item => item['EMPRESA']).filter(Boolean))];
        setClientesUnicos(clientes);
  
        const operacoes = [...new Set(data.map(item => item['OPERAÇÃO']).filter(Boolean))];
        setOperacoesUnicas(operacoes);
  
        const turnos = [...new Set(data.map(item => item['TURNO']).filter(Boolean))];
        setTurnosUnicos(turnos);
      } catch (error) {
        console.error('Erro ao buscar CPFs:', error);
      }
    }
  
    fetchCPFs();
  }, []);

  useEffect(() => {
    if (!texto) return;
    return (
      <div>
        <h1>Cadastro de Novo Colaborador</h1>
    
        <div>
          <h2>Cabeçalho</h2>
          <p><strong>Cliente:</strong> {cliente}</p>
          <p><strong>Data:</strong> {data}</p>
          <p><strong>Início:</strong> {inicio}</p>
          <p><strong>Fim:</strong> {fim}</p>
        </div>
    
        <div>
          <h2>Colaboradores</h2>
          <ul>
            {colaboradores.map((colaborador, index) => (
              <li key={index}>
                <strong>Nome:</strong> {colaborador.nome} | 
                <strong> CPF:</strong> {colaborador.cpf} | 
                <strong> Função:</strong> {colaborador.funcao} | 
                <strong> Valor:</strong> {colaborador.diaria}
              </li>
            ))}
          </ul>
        </div>
    
        {/* Aqui você pode adicionar mais campos ou botões conforme necessário */}
      </div>
    );
    
  
    const clienteMatch = texto.match(/CLIENTE:\s*(.*?)\s*\|/i);
    const dataMatch = texto.match(/📆\s*(\d{2}\/\d{2})/);
    const horaMatch = texto.match(/🕒\s*([\d:]+)\s*\|\s*([\d:]+)/);
  
    if (clienteMatch && clienteMatch[1]) setCliente(clienteMatch[1]);
    if (dataMatch && dataMatch[1]) setData(dataMatch[1]);
    if (horaMatch && horaMatch[1] && horaMatch[2]) {
      setInicio(horaMatch[1]);
      setFim(horaMatch[2]);
    }
  }, [texto]);
  
  const validarCampos = () => {
    // 1. Verificar se horaInicio foi preenchida
    if (!horaInicio) {
      alert('Por favor, preencha o horário de início da rota.');
      return false;
    }
  
    // 2. Verificar se cliente e data foram preenchidos
    if (!cabecalho.cliente || !cabecalho.data) {
      alert('Por favor, preencha os campos de Cliente e Data.');
      return false;
    }
  
    // 3. Verificar se há colaboradores
    if (colaboradores.length === 0) {
      alert('Adicione pelo menos um colaborador.');
      return false;
    }
  
    // 4. Verificar se cada colaborador tem nome, CPF, função, diária e ponto de embarque
    for (let i = 0; i < colaboradores.length; i++) {
      const colab = colaboradores[i];
      if (!colab.nome ) {
        alert(`Preencha todos os campos obrigatórios para o colaborador ${i + 1}.`);
        return false;
      }
      if (!colab.ponto) {
        alert(`Selecione o ponto de embarque para o colaborador ${i + 1} (${colab.nome}).`);
        return false;
      }
    }
  
    // 5. Verificar se cada parada está completa e com horário válido
    const horarioRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  
    for (let i = 0; i < paradas.length; i++) {
      const parada = paradas[i];
      if (!parada.nome || !parada.hora) {
        alert(`Preencha nome e horário para a parada ${i + 1}.`);
        return false;
      }
      if (!horarioRegex.test(parada.hora)) {
        alert(`O horário da parada "${parada.nome}" está inválido. Use o formato HH:mm.`);
        return false;
      }
  
      // Verificar se tem colaboradores associados
      const colabsNoPonto = colaboradores.filter(c => c.ponto === parada.nome);
      if (colabsNoPonto.length === 0) {
        alert(`A parada "${parada.nome}" não tem nenhum colaborador atribuído.`);
        return false;
      }
    }
  
    return true;
  };
  
  
  const handleChange = (index, campo, valor) => {
    const novosColaboradores = [...colaboradores];

    if (campo === 'cpf') {
      valor = valor.replace(/\D/g, '').slice(0, 11);
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2')
                   .replace(/(\d{3})(\d)/, '$1.$2')
                   .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

      const colaboradorEncontrado = cpfsDisponiveis.find(item => item.CPF === valor);
      if (colaboradorEncontrado) {
        novosColaboradores[index].nome = colaboradorEncontrado.Nome;
      }
      // ❌ Não zera o nome caso não encontre
      
    }

    novosColaboradores[index][campo] = valor;
    setColaboradores(novosColaboradores);
  };

  const adicionarLinha = () => {
    const novaLinha = {
      cpf: '',
      nome: '',
      funcao: '',
      diaria: '',
      empresa: '',
      operacao: '',
      turno: '',
      Obs: '',
      ponto: '' // <- adicione esta linha
    };
    

    if (usarMesmoValor && colaboradores.length > 0) {
      const primeiro = colaboradores[0];
      novaLinha.funcao = primeiro.funcao;
      novaLinha.diaria = primeiro.diaria;
    }

    setColaboradores([...colaboradores, novaLinha]);
  };

  const removerColaborador = (index) => {
    const novaLista = [...colaboradores];
    novaLista.splice(index, 1);
    setColaboradores(novaLista);
  };

  const enviarParaWhatsApp = (colaborador) => {
    const { nome, cpf, funcao, diaria } = colaborador;

    const mensagem = encodeURIComponent(
      `Novo Cadastro de Colaborador:\n\nNome: ${nome}\nCPF: ${cpf}\nFunção: ${funcao}\nValor da Diária: R$${diaria}`
    );

    const numeroWhatsApp = '5511949324422';
    const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
    window.open(linkWhatsApp, '_blank');
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
       // Buscar os colaboradores que embarcam neste ponto
const colabsNoPonto = colaboradores.filter(colab => colab.ponto === ponto.nome);

colabsNoPonto.forEach((colab) => {
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
  doc.text(`- ${colab.nome}`, x + 5, y);
  y += 7;
});

    
        y += 5; // Espaço entre os pontos
      });
    
      // Abrir PDF
      const pdfUrl = doc.output('bloburl');
      window.open(pdfUrl, '_blank');
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
    }}
  >
    <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', minWidth: '85vw' }}>
      
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
      <h2 style={{ marginBottom: '3rem' }}>Itinerário pós Recrutamento</h2>
    </center>
    {/* CARTÃO 1 - Lista de Recrutamento */}
<div style={{ background: '#f2f2f2', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
  <h3 style={{ marginBottom: '01rem' }}>📋 Lista de Recrutamento:</h3>
  <textarea
    placeholder="Cole aqui a mensagem da lista"
    value={textoImportado}
    onChange={(e) => setTextoImportado(e.target.value)}
    rows={6}
    style={{ width: '93%', marginTop: '10px', padding: '10px', borderColor: '#0c6a37', display: 'center' }}
  />
  <button
    onClick={() => importarTexto(textoImportado)}
    style={{
      marginTop: '10px',
      background: '#0c6a37',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '5px',
      cursor: 'pointer'
    }}
  >
    Importar Dados
  </button>
</div>

{/* CARTÃO 2 - Início, Minutos e Pontos de Parada */}
<div style={{ background: '#f2f2f2', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', marginBottom: '1rem' }}>
    <div>
      <label>Início:</label>
      <input
        type="time"
        value={horaInicio}
        onChange={e => setHoraInicio(e.target.value)}
        style={{ width: '140px' }}
      />
    </div>

    <div>
      <label>Minutos:</label>
      <input
        type="number"
        value={minutosPadrao}
        onChange={e => setMinutosPadrao(Number(e.target.value))}
        min="1"
        style={{ width: '60px' }}
      />
    </div>

    <button
      onClick={recalcularHorarios}
      style={{
        height: '40px',
        fontSize: '22px',
        padding: '0 10px',
        background: '#f2f2f2',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer'
      }}
      title="Recalcular horários"
    >
      🔄
    </button>
  </div>

  <h3 style={{ marginBottom: '1rem', }}>Pontos de Parada</h3>
  {paradas.map((parada, i) => (
    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
      <select
        value={parada.nome}
        onChange={(e) => atualizarParada(i, 'nome', e.target.value)}
        style={{ flex: 1 }}
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
        style={{ width: '100px' }}
      />

      <span
        onClick={() => {
          const novaLista = [...paradas];
          novaLista.splice(i, 1);
          setParadas(novaLista);
        }}
        style={{ cursor: 'pointer', fontSize: '18px' }}
      >
        🗑️
      </span>
    </div>
  ))}

<div style={{ textAlign: 'center', marginTop: '1rem' }}>
  <span
    onClick={adicionarParada}
    style={{
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px'
    }}
  >
    ➕
  </span>
</div>

</div>


         {/* Cabeçalho da operação */}
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
  </div>
</div>


      <div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: '1rem',
    whiteSpace: 'nowrap',
  }}
> 
</div>
      {colaboradores.map((colab, index) => (
        <div key={index} className="colaborador-container">
     <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
    
  <button
    onClick={() => removerColaborador(index)}
    className="botao-lixeira"
    title="Remover colaborador"
    style={{
      width: '20px',
      height: '20px',
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    }}
  >
    <Trash2 size={20} />
  </button>
</div>      
<div className="num-colaborador">{index + 1}</div>
 
           <div className="item">
            <label>Nome:</label>
            <input
  type="text"
  value={colab.nome}
  onChange={(e) => handleChange(index, 'nome', e.target.value)}
  className="input-editavel"
/>

          </div>
          <div className="item">
  <label>Ponto de Embarque:</label>
  <select
  value={colab.ponto}
  onChange={(e) => handleChange(index, 'ponto', e.target.value)}
>
  <option value="">Selecione</option>
  {paradas.map((p, i) => (
    <option key={i} value={p.nome}>{p.nome}</option>
  ))}
</select>


</div>



          

          
        </div>
      ))}

      <div className="divider" />
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button onClick={adicionarLinha} className="add-button"
        style={{ fontSize: '20px', background: '#e0e0e0', padding: '4px 10px', borderRadius: '4px' }}>
        ➕
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button onClick={handleSubmit} className="send-whatsapp-button">
        📄 Visualizar Lista
        </button>
      </div>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        
      <button
  onClick={handleEnviar}  
  className="send-whatsapp-button"
>
  📧 Informar Lista
</button>

</div>
</div>


    </div>
  );
}
