import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';

const Mapa = dynamic(() => import('@/components/MapaRota'), { ssr: false });

export default function RotaVan() {
  const [inicio, setInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [paradas, setParadas] = useState([]);
  const [erro, setErro] = useState('');
  const [minutosPadrao, setMinutosPadrao] = useState(5);
  const [pontosUnicos, setPontosUnicos] = useState([]);
  const router = useRouter();
  const novoInputRef = useRef(null);
  
  // Função para buscar os pontos de fretamento da planilha (ou API)
  const buscarPontosDeFretamento = async () => {
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbzL6NoS3730uOtG1T3SsqpgXVp4r_s9rRDd-c9B85cip9mByzaYEzFwepWxawH1VHni/exec'); // Substitua pela URL da sua planilha
      const data = await response.json();
    
      const pontos = [...new Set(data.map(item => item['pontofretamento']).filter(Boolean))];
      setPontosUnicos(pontos);
   
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
      doc.text('Itinerário', pageWidth / 2, 25, { align: 'center' });
    
      y = 45;
    
      // 4. Cabeçalho centralizado
      doc.setFontSize(11);
      doc.setTextColor(33, 33, 33);
    
      const headerLines = [
        `Cliente: ${cabecalho.cliente}`,
        `Operação: ${cabecalho.operacao}`,
        `Data: ${cabecalho.data}   Turno: ${cabecalho.turno}`,
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
  
  doc.text(`Data: ${cabecalho.data}`, leftColumnX, y); 
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
        doc.text(`CPF: ${colab.cpf} | Função: ${colab.funcao} | Diária: R$${colab.diaria}`, 25, y);
        y += 10;
      });
    
      // 7. Abre visualização do PDF em nova aba
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

  const compartilharRota = () => {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const cabecalho = `🗺️ *Rota da Van* \n*Empresa:* ACME | *Data:* ${dataAtual} \n*Saída:* ${inicio} às ${horaInicio}`;
    const colaboradoresStr = paradas.map((ponto, idx) => {
      const nomes = ponto.colaboradores.map(c => `  - ${c}`).join('\n');
      return `*${idx + 1}. ${ponto.nome}* (${ponto.hora})\n${nomes}`;
    }).join('\n\n');
    const mensagem = `${cabecalho}\n\n${colaboradoresStr}`;

    if (navigator.share) {
      navigator.share({ title: 'Rota da Van', text: mensagem }).catch(err => console.error(err));
    } else {
      alert('Compartilhamento não suportado neste navegador. Tente pelo celular.');
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
      background: '#f8f8f8', fontFamily: 'sans-serif', padding: '2rem'
    }}>
      <div style={{
        background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>

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

        <div style={{ marginBottom: '1rem' }}>
          <label>Ponto de Partida:</label>
          <input
            type="text"
            value={inicio}
            onChange={e => setInicio(e.target.value)}
            style={{ width: '90%' }}
          />
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0px' }}>
          <div style={{ marginRight: '1px', width: '100%' }}>
            <label>Início:</label>
            <input
              type="time"
              value={horaInicio}
              onChange={e => setHoraInicio(e.target.value)}
            />
          </div>
          <div style={{ marginLeft: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>
              <label>Minutos:</label>
              <input
                type="number"
                value={minutosPadrao}
                onChange={e => setMinutosPadrao(Number(e.target.value))}
                min="1"
                style={{ width: '30px' }}
              />
            </div>
            <button
              onClick={recalcularHorarios}
              style={{
                width: '32px', height: '32px', fontSize: '25px', padding: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none',
                cursor: 'pointer', marginTop: '18px'
              }}
              title="Recalcular horários"
            >
              🔄
            </button>
          </div>
        </div>

        {erro && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            <strong>{erro}</strong>
          </div>
        )}

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
          <button
            onClick={adicionarParada}
            disabled={!inicio || !horaInicio}
            style={{
              marginTop: '1rem', backgroundColor: !inicio || !horaInicio ? '#ccc' : '#007bff',
              color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px',
              cursor: !inicio || !horaInicio ? 'not-allowed' : 'pointer'
            }}
          >
            ➕ Adicionar Ponto
          </button>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={compartilharRota}
            style={{
              padding: '10px 20px', background: '#25D366', color: '#fff', borderRadius: '6px',
              border: 'none', fontWeight: 'bold', fontSize: '1rem'
            }}
          >
            📤 Compartilhar Mensagem
          </button>
          
        </div>
      
        <button onClick={handleSubmit} className="send-whatsapp-button">
          Enviar para WhatsApp
        </button>
      </div>
    </div>
  );
}
