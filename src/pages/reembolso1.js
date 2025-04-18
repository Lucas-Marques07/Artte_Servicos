// src/pages/marmita/novo.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';


export default function NovaMarmita() {
  const router = useRouter();
  const [marmitas, setMarmitas] = useState([
    { data: '', horario: '', empresa: '', operacao: '', solicitante: '', quantidade: '', valor: '' , categoria: ''}
  ]);
  const [dadosPlanilha, setDadosPlanilha] = useState([]);
  const [operacoesFiltradas, setOperacoesFiltradas] = useState([]);
  const [nomeLogado, setNomeLogado] = useState('');
  const [usarMesmoValor, setUsarMesmoValor] = useState(false);
  const [categoriaUnicos, setcategoriaUnicos] = useState([]);
  const [file, setFile] = useState(null);
  
  const [cabecalho, setCabecalho] = useState({
    cliente: '',
    operacao: '',
    data: '',
    turno: '',
    entrada: '',
    saida: ''
  });
  
  

  const compartilharTudo = async () => {
    if (!file) {
      alert("Nenhum comprovante selecionado.");
      return;
    }
  
    if (!validarCampos()) return;
  
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
  
    const loadImageAsBase64 = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    };
  
    const logoBase64 = await loadImageAsBase64(await (await fetch('/artte1.png')).blob());
    const comprovanteBase64 = await loadImageAsBase64(file);
  
    // Borda externa
    doc.setDrawColor(20, 30, 125);
    doc.setLineWidth(0.8);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
    // Logo
    doc.addImage(logoBase64, 'JPEG', 17, 20, 35, 35);
  
    // Título
    doc.setFontSize(20);
    doc.setTextColor(20, 30, 125);
    doc.text('Solicitação de Reembolso', pageWidth / 2, 30, { align: 'center' });
  
    // Dados da marmita
    const m = marmitas[0];
    const dataFormatada = new Date(m.data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  
    // Colunas centralizadas (sem borda)
    doc.setFontSize(11);
    doc.setTextColor(33, 33, 33);
    const colSpacing = 75;
    const colPadding = 50;
    const totalWidth = colSpacing + colPadding;
    const col1X = (pageWidth - totalWidth) / 2;
    const col2X = col1X + colSpacing;
    let linhaY = 60;
    const linhaEspaco = 7;
  
    const escreveColuna = (label, valor, x, y) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, x, y);
      const labelWidth = doc.getTextWidth(label) + 2;
      doc.setFont(undefined, 'normal');
      doc.text(valor || '-', x + labelWidth, y);
    };
  
    // Linhas das colunas
    escreveColuna('Categoria:', m.categoria, col1X, linhaY);
    escreveColuna('Data:', dataFormatada, col2X, linhaY);
    linhaY += linhaEspaco;
  
    escreveColuna('Empresa:', m.empresa, col1X, linhaY);
    escreveColuna('Operação:', m.operacao, col2X, linhaY);
    linhaY += linhaEspaco;
  
    escreveColuna('Solicitante:', m.solicitante, col1X, linhaY);
    escreveColuna('Valor:', `R$ ${m.valor}`, col2X, linhaY);
    linhaY += linhaEspaco +5;
  
    escreveColuna('Observação:', m.endereço, col1X, linhaY);
    linhaY += linhaEspaco;
  
    // Linha separadora após o texto
    doc.setDrawColor(20, 30, 125);
    doc.setLineWidth(0.5);
    doc.line(20, linhaY, pageWidth - 20, linhaY);
    let y = linhaY + 12;
  
    // Título da imagem
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Comprovante em anexo:', col1X, y);
    y += 12;
  
    // Imagem do comprovante
    const imgWidth = pageWidth - 80;
    const imgHeight = 100;
    const imgX = (pageWidth - imgWidth) / 2;
    doc.addImage(comprovanteBase64, 'JPEG', imgX, y, imgWidth, imgHeight);
  
    // Assinatura
    const assinaturaY = y + imgHeight + 20;

// Cor azul escuro e largura perceptível
doc.setDrawColor(20, 30, 125);  // #141e7d
doc.setLineWidth(0.5);            // mais visível
doc.line(pageWidth / 4, assinaturaY, pageWidth * 3 / 4, assinaturaY);

// Texto abaixo da linha
doc.setFontSize(10);
doc.setTextColor(0);
doc.setFont(undefined, 'normal');
doc.text('Assinatura do Responsável para Validação', pageWidth / 2, assinaturaY + 5, { align: 'center' });


  
    // 🧾 Finalização com nome personalizado
    const pdfBlob = doc.output('blob');
  
    const formatarDataBR = (dataString) => {
        const [ano, mes, dia] = dataString.split("-");
        return `${dia}_${mes}_${ano}`; // <-- separador alterado
      };
      
  
    const data = formatarDataBR(m.data);
    const nome = m.solicitante?.trim().replace(/\s+/g, '_') || 'usuario';
    const categoria = m.categoria?.trim().replace(/\s+/g, '_') || 'categoria';
    const nomeArquivo = `Reembolso ${nome} - ${categoria} - ${data}.pdf`;
  
    const pdfFile = new File([pdfBlob], nomeArquivo, { type: 'application/pdf' });
  
    try {
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: 'Solicitação de Reembolso',
          files: [pdfFile],
        });
      } else {
        throw new Error('Compartilhamento não suportado');
      }
    } catch (error) {
      console.warn('Download automático ativado como fallback');
      const url = URL.createObjectURL(pdfFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };
  
  
  
  
  
  
  
  
  

  const compartilharComprovante = () => {
    if (!file) {
      alert("Nenhum comprovante selecionado.");
      return;
    }

    if (navigator.share) {
      navigator.share({
        title: 'Comprovante de Reembolso',
        files: [file],
      }).catch((err) => console.error("Erro ao compartilhar imagem:", err));
    } else {
      alert("Compartilhamento de arquivos não suportado.");
    }
  };

  const handleCheckboxChange = () => {
    setUsarMesmoValor(!usarMesmoValor);
  };

  useEffect(() => {
    if (dadosPlanilha.length > 0) {
      const operacoes = [...new Set(dadosPlanilha.map(d => d.OPERAÇÃO).filter(Boolean))];
      setOperacoesFiltradas(operacoes);
    }
  }, [dadosPlanilha]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
      if (usuario?.usuario) {
        setNomeLogado(usuario.usuario);
        setMarmitas([{ data: '', horario: '', empresa: '', operacao: '', solicitante: usuario.usuario, quantidade: '', valor: '', endereço: '' }]);
      }
    }
  }, []);

  useEffect(() => {
    fetch('https://script.google.com/macros/s/AKfycbzL6NoS3730uOtG1T3SsqpgXVp4r_s9rRDd-c9B85cip9mByzaYEzFwepWxawH1VHni/exec')
      .then(res => res.json())
      .then(data => setDadosPlanilha(data));
  }, []);

  useEffect(() => {
    if (dadosPlanilha.length > 0) {
      const categoria = [...new Set(dadosPlanilha.map(item => item['Categoria reembolso']).filter(Boolean))];
      setcategoriaUnicos(categoria);
    }
  }, [dadosPlanilha]);

  const handleChange = (index, campo, valor) => {
    const novaLista = [...marmitas];
    novaLista[index][campo] = valor;
    setMarmitas(novaLista);
  };

  const adicionarLinha = () => {
    const novaLinha = { data: '', horario: '', empresa: '', operacao: '', solicitante: nomeLogado, quantidade: '', valor: '', endereço: '' };
    if (usarMesmoValor && marmitas.length > 0) {
      novaLinha.valor = marmitas[0].valor;
    }
    setMarmitas([...marmitas, novaLinha]);
  };

  const removerLinha = (index) => {
    const novaLista = [...marmitas];
    novaLista.splice(index, 1);
    setMarmitas(novaLista);
  };

  const validarCampos = () => {
    for (let m of marmitas) {
      if (!m.data || !m.empresa || !m.solicitante || !m.valor) {
        alert('Por favor, preencha todos os campos antes de enviar.');
        return false;
      }
    }
    return true;
  };

  const empresas = [...new Set(dadosPlanilha.map(d => d.EMPRESA))];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8f8f8', fontFamily: 'sans-serif', padding: '2rem' }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
        {/* Cabeçalho com logo e botão voltar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <img src="/artte.ico" alt="Logo" style={{ height: '110px' }} />
          <button onClick={() => router.push('/login')} style={{ background: '#141e7d', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', width: '80px', textAlign: 'center' }}>
            ⬅ Voltar
          </button>
        </div>

        <center><h2 style={{ marginBottom: '1rem' }}>Solicitação de Reembolso</h2></center>
        
        {marmitas.map((m, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '6px', marginBottom: '10px', background: '#f9f9f9', width: '350px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
              <span onClick={() => removerLinha(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑️</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label>Categoria:</label>
                <select value={m.categoria} onChange={(e) => handleChange(index, 'categoria', e.target.value)}>
                  <option value="">Selecione</option>
                  {categoriaUnicos
                  .filter((e) => e && e.trim() !== "") 
                  .sort((a, b) => a.localeCompare(b))
                  .map((e, i) => <option key={i} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label>Data:</label>
                <input type="date" value={m.data} onChange={(e) => handleChange(index, 'data', e.target.value)} />
              </div>
              <div>
                <label>Empresa:</label>
                <select value={m.empresa} onChange={(e) => handleChange(index, 'empresa', e.target.value)}>
                  <option value="">Selecione</option>
                  {empresas.map((e, i) => <option key={i} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label>Operação:</label>
                <select value={m.operacao} onChange={(e) => handleChange(index, 'operacao', e.target.value)}>
                  <option value="">Selecione</option>
                  {operacoesFiltradas.map((op, i) => <option key={i} value={op}>{op}</option>)}
                </select>
              </div>
              <div>
                <label>Solicitante:</label>
                <input type="text" value={m.solicitante} disabled />
              </div>
              <div>
                <label>Valor:</label>
                <input type="number" value={m.valor} onChange={(e) => handleChange(index, 'valor', e.target.value)} placeholder="R$" />
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label>Obs:</label>
                <input type="text" value={m.endereço} onChange={(e) => handleChange(index, 'endereço', e.target.value)} style={{ width: '90%', fontSize: '16px' }} />
              </div>
            </div>
          </div>
        ))}

        
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{ marginBottom: '1rem' }} />
          <br />
          <button onClick={compartilharTudo} style={{ background: '#141e7d', color: '#fff', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', marginBottom: '1rem' }}>
  📤 Enviar PDF + Comprovante
</button>


        </div>
      </div>
    </div>
  );
}
