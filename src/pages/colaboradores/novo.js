// src/pages/colaboradores/novo.js
import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { useRouter } from 'next/router';



export default function NovoColaborador() {
  const router = useRouter(); // ⬅ Adicionado
  const [colaboradores, setColaboradores] = useState([
    { cpf: '', nome: '', funcao: '', diaria: '', empresa: '', operacao: '', turno: '' }
  ]);
  const [cpfsDisponiveis, setCpfsDisponiveis] = useState([]);
  const [funcoesUnicas, setFuncoesUnicas] = useState([]);
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
      } else {
        novosColaboradores[index].nome = '';
      }
    }

    novosColaboradores[index][campo] = valor;
    setColaboradores(novosColaboradores);
  };

  const adicionarLinha = () => {
    const novaLinha = { cpf: '', nome: '', funcao: '', diaria: '', empresa: '', operacao: '', turno: '', Obs: '' };

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
    const formatarData = (dataString) => {
      const [ano, mes, dia] = dataString.split('-');
      return `${dia}/${mes}/${ano}`;
    };
    
    
    const dataFormatada = formatarData(cabecalho.data);
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;
  
    // Carrega a imagem da logo
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
  
    // 1. Adiciona a borda externa
    doc.setDrawColor(12, 106, 55); // verde escuro para linhas
    doc.setLineWidth(0.8);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
    // 2. Adiciona a logo
    doc.addImage(logoBase64, 'JPEG', 17, 17, 35, 35);
  
    // 3. Título centralizado
    doc.setFontSize(20);
    doc.setTextColor(12, 106, 55); // equivalente a #022c15 em RGB 
    doc.text('Lista de Presença', pageWidth / 2, 25, { align: 'center' });
  
    y = 45;
  
    // 4. Cabeçalho centralizado
    doc.setFontSize(11);
    doc.setTextColor(33, 33, 33);
  
    const headerLines = [
      `Cliente: ${cabecalho.cliente}`,
      `Operação: ${cabecalho.operacao}`,
      `Data: ${dataFormatada}   Turno: ${cabecalho.turno}`,
      `Entrada: ${cabecalho.entrada}   Saída: ${cabecalho.saida}`
    ];
  
    // Definir a fonte e a cor
doc.setFontSize(10);
doc.setTextColor(33, 33, 33);

// Espaçamento inicial
const leftColumnX = pageWidth / 3.8; // Posição para a coluna da esquerda
const rightColumnX = pageWidth / 2 + 10; // Posição para a coluna da direita

// Adiciona as informações em colunas
doc.text(`Cliente: ${cabecalho.cliente}`, leftColumnX, y); 
doc.text(`Operação: ${cabecalho.operacao}`, rightColumnX, y);
y += 7;

doc.text(`Data: ${dataFormatada}`, leftColumnX, y); 
doc.text(`Turno: ${cabecalho.turno}`, rightColumnX, y);
y += 7;

doc.text(`Entrada: ${cabecalho.entrada}`, leftColumnX, y); 
doc.text(`Saída: ${cabecalho.saida}`, rightColumnX, y);
y += 10;

  
    y += 0;
  
    // 5. Linha separadora
    doc.setDrawColor(12, 106, 55);
    doc.setLineWidth(0.5);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;
  
    // 6. Lista de colaboradores
    colaboradores.forEach((colab, index) => {
      if (y > 270) {
        doc.addPage();
        // Reaplica a borda em nova página
        doc.setDrawColor(12, 106, 55);
        doc.setLineWidth(0.8);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
        y = 20;
      }
  
      // Nome em negrito
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`${index + 1}. ${colab.nome}`, 20, y);
      y += 6;
  
      // Dados adicionais em cinza
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`CPF: ${colab.cpf} | Função: ${colab.funcao} | Diária: R$${colab.diaria}${colab.Obs ? ` | *Obs: ${colab.Obs}*` : ''}`, 25, y);
      y += 10;
    });
  
    // 7. Abre visualização do PDF em nova aba
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
      <h2 style={{ marginBottom: '3rem' }}>Lançamento de Listas</h2>
    </center>



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
      <label>Nome do Cliente:</label>
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
  <span style={{ marginRight: '8px' }}>Padrão</span>
  <input
    type="checkbox"
    checked={usarMesmoValor}
    onChange={() => setUsarMesmoValor(!usarMesmoValor)}
    style={{
      width: '16px',
      height: '16px',
      cursor: 'pointer',
      margin: 0,
    }}
  />
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
            <label>CPF:</label>
            <input
              list={`cpfs-${index}`}
              type="text"
              value={colab.cpf}
              onChange={(e) => handleChange(index, 'cpf', e.target.value)}
              placeholder="Digite ou selecione"
            />
            <datalist id={`cpfs-${index}`}>
              {cpfsDisponiveis.map((item, i) => (
                <option key={i} value={item.CPF} />
              ))}
            </datalist>
          </div>

          <div className="item">
            <label>Nome:</label>
            <input
              type="text"
              value={colab.nome}
              readOnly
              className="input-readonly"
            />
          </div>

          

          <div className="item">
            <label>Função:</label>
            <select
              value={colab.funcao}
              onChange={(e) => handleChange(index, 'funcao', e.target.value)}
            >
              <option value="">Selecione</option>
              {funcoesUnicas.map((funcao, i) => (
                <option key={i} value={funcao}>{funcao}</option>
              ))}
            </select>
          </div>

          <div className="item">
            <label>Valor Diária:</label>
            <input
              type="number"
              value={colab.diaria}
              onChange={(e) => handleChange(index, 'diaria', e.target.value)}
              placeholder="R$"
            />
          </div>
          <div className="item">
            <label>Obs:</label>
            <input
              type="text"
              value={colab.Obs}
              onChange={(e) => handleChange(index, 'Obs', e.target.value)}
              placeholder=""
            />
          </div>
        </div>
      ))}

      <div className="divider" />
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button onClick={adicionarLinha} className="add-button">
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
   onClick={() => {
    const { cliente, operacao, data, turno, entrada, saida } = cabecalho;

    // Verificação de campos obrigatórios no cabeçalho
    if (!cliente || !data || !entrada || !saida || !turno) {
      alert('Preencha todos os campos obrigatórios do cabeçalho (Cliente, Operação, Data, Entrada, Saída e Turno).');
      return;
    }

    // Validação dos colaboradores
    const camposInvalidos = colaboradores.filter((colab) =>
      !colab.cpf || !colab.nome || !colab.funcao || !colab.diaria
    );

    if (camposInvalidos.length > 0) {
      alert('Preencha todos os campos obrigatórios (Nome, CPF, Função e Diária) dos colaboradores.');
      return;
    }

    // Formatação de data
    const dataFormatada = new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
    
  
    const cabecalhoStr = `📋 *CLIENTE:* ${cliente} | ${operacao} | 📆 ${dataFormatada} \n\n🕒 *${entrada}* | *${saida}* | *${turno}*
    
👥 *NOME | CPF | FUNÇÃO | VALOR | OBS*`;
    
    const colaboradoresStr = colaboradores.map((c, i) => (
    `${i + 1}- *${c.nome}* | CPF: ${c.cpf} | ${c.funcao} | ${c.diaria}${c.Obs ? ` | ${c.Obs}` : ''}`
    )).join('\n');
  
    const mensagem = `${cabecalhoStr}\n\n${colaboradoresStr}`;
  
    if (navigator.share) {
      navigator.share({
        title: 'Cadastro de Colaboradores',
        text: mensagem,
      }).catch((error) => console.error('Erro ao compartilhar:', error));
    } else {
      alert('Compartilhamento não suportado neste navegador. Tente pelo celular.');
    }
  }}

    className="send-whatsapp-button"
  >
    📧 Informar Lista
  </button>
</div>
</div>

    </div>
  );
}
