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
    const novaLinha = { cpf: '', nome: '', funcao: '', diaria: '', empresa: '', operacao: '', turno: '' };

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
      `Novo Cadastro de Colaborador:\n\nNome: ${nome}\nCPF: ${cpf}\nFunção: ${funcao}\nValor da OBS: ${diaria}`
    );

    const numeroWhatsApp = '5511949324422';
    const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
    window.open(linkWhatsApp, '_blank');
  };

  const handleSubmit = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;
    const pages = [];
  
    const formatarDataBR = (dataISO) => {
      const [ano, mes, dia] = dataISO.split("-");
      return `${dia}/${mes}/${ano}`;
    };
  
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
  
    const logoBase64 = await loadImageAsBase64("/artte.png");
  
    // Função para cabeçalho da página (reutilizável)
    const desenharCabecalho = () => {
      doc.setDrawColor(20, 30, 125);
      doc.setLineWidth(0.8);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      doc.addImage(logoBase64, "PNG", 22, 17, 35, 35);
      doc.setFontSize(20);
      doc.setTextColor(20, 30, 125);
      doc.text("Lista de Presença", pageWidth / 2, 25, { align: "center" });
  
      let yCab = 38;
      doc.setFontSize(10);
      doc.setTextColor(33, 33, 33);
      const leftColumnX = pageWidth / 3;
      const rightColumnX = pageWidth / 1.9 + 10;
  
      doc.text(`Cliente: ${cabecalho.cliente}`, leftColumnX, yCab);
      doc.text(`Operação: ${cabecalho.operacao}`, rightColumnX, yCab);
      yCab += 7;
      doc.text(`Data: ${formatarDataBR(cabecalho.data)}`, leftColumnX, yCab);
      doc.text(`Turno: ${cabecalho.turno}`, rightColumnX, yCab);
      yCab += 7;
      doc.text(`Entrada: ${cabecalho.entrada}`, leftColumnX, yCab);
      doc.text(`Saída: ${cabecalho.saida}`, rightColumnX, yCab);
      yCab += 10;
  
      doc.setDrawColor(20, 30, 125);
      doc.setLineWidth(0.5);
      doc.line(20, yCab, pageWidth - 20, yCab);
      return yCab + 10;
    };
  
    y = desenharCabecalho();
  
    // Lista de colaboradores
    colaboradores.forEach((colab, index) => {
      if (y > 250) {
        pages.push(doc.internal.getNumberOfPages());
        doc.addPage();
        y = desenharCabecalho();
      }
  
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`${index + 1}. ${colab.nome}`, 20, y);
      y += 6;
  
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `CPF: ${colab.cpf} | Função: ${colab.funcao} | OBS: ${colab.diaria}`,
        25,
        y
      );
      y += 10;
    });
  
    // Espaço e linha de assinatura na última página
    if (y > 250) {
      doc.addPage();
      y = desenharCabecalho();
    }
  
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(33, 33, 33);
    doc.text(`
      Assinatura do responsável (${cabecalho.cliente}): _________________________________`,
      20,
      y
    );
  
    // Total de páginas e numeração no rodapé
    const totalPages = doc.internal.getNumberOfPages();
for (let i = 1; i <= totalPages; i++) {
  doc.setPage(i);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`${i} / ${totalPages}`, pageWidth - 20, pageHeight - 15, { align: 'right' });
}

  
    // Visualização e download
    const blob = doc.output("blob");
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = `${cabecalho.cliente} ${cabecalho.turno} ${formatarDataBR(cabecalho.data)}.pdf`;
a.click();

  };
  
  
  
  

  return (
    <div className="container">
  {/* Botão Voltar */}
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
    <button
      onClick={() => router.push('/login')}
      style={{
        background: '#6770ff', // Verde
        color: '#fff',          // Texto branco
        border: 'none',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
      }}
    >
      ⬅ Voltar
    </button>
  </div>

  

  {/* Cabeçalho */}
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '1rem'
    }}
  >
  
    <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
      Lista de Presença
    </h1>

    <img
      src="/artte.png"
      alt="Logo"
      style={{ width: '150px', height: 'auto' }}
    />
  </div>



      {/* Cabeçalho da operação */}
      <div className="cabecalho-operacao">
        <div className="item">
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

        <div className="item">
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

        <div className="item">
          <label>Data:</label>
          <input
            type="date"
            value={cabecalho.data}
            onChange={(e) => setCabecalho({ ...cabecalho, data: e.target.value })}
          />
        </div>

        <div className="item">
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

        <div className="item">
          <label>Entrada:</label>
          <input
            type="time"
            value={cabecalho.entrada}
            onChange={(e) => setCabecalho({ ...cabecalho, entrada: e.target.value })}
          />
        </div>

        <div className="item">
          <label>Saída:</label>
          <input
            type="time"
            value={cabecalho.saida}
            onChange={(e) => setCabecalho({ ...cabecalho, saida: e.target.value })}
          />
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
            <label>OBS:</label>
            <input
              type="text"
              value={colab.diaria}
              onChange={(e) => handleChange(index, 'diaria', e.target.value)}
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
        📄 Visualizar
        </button>
      </div>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
  <button
   onClick={() => {
    const { cliente, operacao, data, turno, entrada, saida } = cabecalho;
    const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
  
    const cabecalhoStr = `*Cliente:* ${cliente} | *Operação:* ${operacao} | *Data:* ${dataFormatada} \n*Turno:* ${turno} | *Entrada:* ${entrada} | *Saída:* ${saida}`;
    
    const colaboradoresStr = colaboradores.map((c, i) => (
      `${i + 1}. ${c.nome} | CPF: ${c.cpf} | ${c.funcao} | ${c.diaria}`
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
    ✉️ Enviar Mensagem
  </button>
</div>

    </div>
  );
}
