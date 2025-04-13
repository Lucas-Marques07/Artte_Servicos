import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';


const Mapa = dynamic(() => import('@/components/MapaRota'), { ssr: false });

export default function RotaVan() {
  const [inicio, setInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [paradas, setParadas] = useState([]);
  const [erro, setErro] = useState('');
  const [minutosPadrao, setMinutosPadrao] = useState(5);
  const router = useRouter();
  const novoInputRef = useRef(null);

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
    const cabecalho = `🚌 *Rota da Van* \n*Empresa:* ACME | *Data:* ${dataAtual} \n*Saída:* ${inicio} às ${horaInicio}`;
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

  const formatarData = () => new Date().toLocaleDateString('pt-BR');

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
        <h2 style={{ marginBottom: '1rem' }}>ITINERÁRIO DAS EMPRESAS</h2>
      </center>


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
              marginTop: '18px'
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
      padding: '1rem', marginBottom: '1rem',
      border: '1px solid #ddd', borderRadius: '8px', background: '#f8f8f8', width: '500px'  // Largura fixa de 500px
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Ponto {i + 1}</strong>
    
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <select
            onChange={(e) => trocarOrdem(i, parseInt(e.target.value))}
            value={i}
            style={{ fontSize: '0.8rem', width: 'auto', maxWidth: '120px', marginRight: '10px' }} // Ajuste para garantir o espaçamento
          >
            {paradas.map((_, idx) => (
              <option key={idx} value={idx}>{idx + 1}</option>
            ))}
          </select>
          
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
      </div>
      

            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
              <input
                type="text"
                value={parada.nome}
                onChange={e => atualizarParada(i, 'nome', e.target.value)}
                placeholder={`Ponto ${i + 1}`}
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
    <div
      key={j}
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap', // impede quebra de linha
        gap: '4px',          // espaço horizontal entre input e botão
        marginBottom: '2px', // espaço vertical entre inputs
        width: '100%',
      }}
    >
      <input
        type="text"
        value={colaborador}
        onChange={e => atualizarColaborador(i, j, e.target.value)}
        placeholder={`Colaborador ${j + 1}`}
        style={{
          flex: 1,
          minWidth: 0, // previne overflow em telas pequenas
        }}
        ref={j === parada.colaboradores.length - 1 ? novoInputRef : null}
      />
      <button
        onClick={() => removerColaborador(i, j)}
        style={{
          width: '20px',
          height: '20px',
          background: 'none',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0, // impede o botão de encolher
        }}
      >
        🗑️
      </button>
    </div>
  ))}

  <button
    onClick={() => adicionarColaborador(i)}
    style={{
      marginTop: '8px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.2rem'
    }}
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
      <style jsx>{`
  @media (max-width: 768px) {
    div {
      padding: 1rem !important;
    }

    header h1 {
      font-size: 1.4rem;
    }

    header p {
      font-size: 0.9rem;
    }

    input[type="text"],
    input[type="time"],
    input[type="number"],
    select {
      width: 100% !important;
      font-size: 1rem;
    }

    button {
      font-size: 0.9rem !important;
    }

    .ponto-container {
      flex-direction: column !important;
    }

    .ponto-container input {
      width: 100% !important;
    }

    .parada-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .parada-header strong {
      margin-bottom: 8px;
    }

    .botao-recalcular {
      font-size: 32px !important;
      margin-top: 10px !important;
    }
  }
`}</style>

    </div>
    </div>
  );
}
