import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';


const Mapa = dynamic(() => import('@/components/MapaRota'), { ssr: false });

export default function RotaVan() {
  const [inicio, setInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [paradas, setParadas] = useState([]);
  const [erro, setErro] = useState('');
  const [minutosPadrao, setMinutosPadrao] = useState(5); // Novo estado para definir os minutos
  const router = useRouter();

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
  
    // Atualiza o campo específico da parada
    novaLista[index][campo] = valor;
  
    // Se o campo atualizado for "hora", recalcula as horas dos pontos abaixo
    if (campo === 'hora') {
      // Atualiza os horários dos pontos abaixo
      for (let i = index + 1; i < novaLista.length; i++) {
        const minutosExtras = (i - index) * minutosPadrao; // Usando minutosPadrao
        novaLista[i].hora = calcularHoraComOffset(valor, minutosExtras);
      }
    }
  
    setParadas(novaLista);
  };

  const adicionarColaborador = (index) => {
    const novaLista = [...paradas];
    novaLista[index].colaboradores.push('');
    setParadas(novaLista);
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
  
    // Remover o ponto de origem e colocá-lo na nova posição
    const [removido] = novaLista.splice(fromIndex, 1);
    novaLista.splice(toIndex, 0, removido);
  
    // Agora, ajustamos os horários. Vamos manter o horário do ponto trocado.
    let minutosExtras = 0;
  
    // Atualiza os horários a partir do primeiro ponto
    novaLista.forEach((ponto, i) => {
      if (i === 0) {
        // O primeiro ponto mantém o horário inicial
        ponto.hora = calcularHoraComOffset(inicio, minutosExtras);
      } else {
        // Para os pontos abaixo, soma os minutos definidos no minutosPadrao
        minutosExtras += minutosPadrao;
        ponto.hora = calcularHoraComOffset(novaLista[i - 1].hora, minutosExtras);
      }
    });
  
    // Atualizar o estado da lista de paradas
    setParadas(novaLista);
  };

  // Função para recalcular os horários e adicionar a quantidade de minutos personalizada
  const recalcularHorarios = () => {
    if (!horaInicio || paradas.length === 0 || !minutosPadrao) {
      alert('Certifique-se de preencher o horário de início, definir os minutos e ter pelo menos um ponto.');
      return;
    }
  
    const novaLista = [...paradas];
    let minutosExtras = minutosPadrao; // Começa com minutosPadrao para o primeiro ponto
  
    novaLista.forEach((ponto, i) => {
      ponto.hora = calcularHoraComOffset(horaInicio, minutosExtras);
      minutosExtras += minutosPadrao;
    });
  
    setParadas(novaLista);
  };
  
  const compartilharRota = () => {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const cabecalho = `🚌 *Rota da Van* \n*Empresa:* ACME | *Data:* ${dataAtual} \n*Saída:* ${inicio} às ${horaInicio}`;

    const colaboradoresStr = paradas.map((ponto, idx) => {
      const nomes = ponto.colaboradores.map(c => `  - ${c}`).join('\n');
      return `*${idx + 1}. ${ponto.nome}* (${ponto.hora})\n${nomes}`;
    }).join('\n\n');

    const mensagem = `${cabecalho}\n\n${colaboradoresStr}`;

    if (navigator.share) {
      navigator.share({
        title: 'Rota da Van',
        text: mensagem,
      }).catch((error) => console.error('Erro ao compartilhar:', error));
    } else {
      alert('Compartilhamento não suportado neste navegador. Tente pelo celular.');
    }
  };

  const formatarData = () => new Date().toLocaleDateString('pt-BR');

  return (
    
    
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Botão Voltar */}
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
      <button
        onClick={() => router.push('/login')}
        style={{
          background: '#0c6a37',
          color: '#fff',
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

    {/* Aqui continua o restante da sua interface */}

      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>🚌 Transporte ACME</h1>
        <p style={{ color: '#555' }}>{formatarData()}</p>
      </header>

      <h2>Rota da Van</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>Ponto de Partida:</label>
        <input
          type="text"
          value={inicio}
          onChange={e => setInicio(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0px' }}>
  <div style={{ marginRight: '1px', width: '100%' }}>
    <label>Horário de Início:</label>
    <input
      type="time"
      value={horaInicio}
      onChange={e => setHoraInicio(e.target.value)}
    />
  </div>

  {/* Container para select de minutos + botão de recálculo */}
  <div style={{ marginleft: '1px', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div>
      <label>Minutos:</label>
      <input
        type="number"
        value={minutosPadrao}
        onChange={e => setMinutosPadrao(Number(e.target.value))}
        min="1"
        style={{ width: '100px' }}
      />
    </div>

    {/* Botão para recalcular horários */}
    <button
      onClick={recalcularHorarios}
      style={{
        width: '32px',
        height: '32px',
        fontSize: '40px',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        marginTop: '18px' // alinhamento vertical com o input
      }}
      title="Recalcular horários"
    >
      🔄
    </button>
  </div>
</div>


          {/* Exibe a mensagem de erro, se houver */}
      {erro && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          <strong>{erro}</strong>
        </div>
      )}

      <div>
        <label>Pontos de Parada:</label>

        {paradas.map((parada, i) => (
          <div key={i} style={{
            padding: '1rem', marginBottom: '1rem',
            border: '1px solid #ddd', borderRadius: '8px', background: '#f8f8f8'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Ponto {i + 1}</strong>
              <button
                onClick={() => removerParada(i)}
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
                  marginBottom: '10px',  // Adiciona um espaço abaixo do botão
                }}
              >
                🗑️
              </button>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '8px' }}>
              <select
                onChange={(e) => trocarOrdem(i, parseInt(e.target.value))}
                value={i}
                style={{
                  fontSize: '0.8rem',
                  width: 'auto',
                  maxWidth: '120px',
                  display: 'inline-block',
                }}
              >
                {paradas.map((_, idx) => (
                  <option key={idx} value={idx}>{idx + 1}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
              <input
                type="text"
                value={parada.nome}
                onChange={e => atualizarParada(i, 'nome', e.target.value)}
                placeholder={`Nome do ponto ${i + 1}`}
                style={{ flex: 2 }}
              />
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
                <div key={j} style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '4px',
                  alignItems: 'center'
                }}>
                  <input
                    type="text"
                    value={colaborador}
                    onChange={e => atualizarColaborador(i, j, e.target.value)}
                    placeholder={`Colaborador ${j + 1}`}
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={() => removerColaborador(i, j)}
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
                      marginBottom: '10px',
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
            marginTop: '1rem',
            backgroundColor: !inicio || !horaInicio ? '#ccc' : '#007bff',
            color: '#fff',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: !inicio || !horaInicio ? 'not-allowed' : 'pointer'
          }}
        >
          ➕ Adicionar Ponto
        </button>

       
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={compartilharRota}
          className="send-whatsapp-button"
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
          📤 Compartilhar Mensagem
        </button>
        
      </div>
    </div>
    
  );
}
