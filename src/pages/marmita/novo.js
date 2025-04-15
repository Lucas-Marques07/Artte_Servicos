// src/pages/marmita/novo.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function NovaMarmita() {
  const router = useRouter();
  const [marmitas, setMarmitas] = useState([
    { data: '', horario: '', empresa: '', operacao: '', solicitante: '', quantidade: '', valor: '' }
  ]);
  const [usarMesmoValor, setUsarMesmoValor] = useState(false);
  const [dadosPlanilha, setDadosPlanilha] = useState([]);
  const [operacoesFiltradas, setOperacoesFiltradas] = useState([]);

  const [nomeLogado, setNomeLogado] = useState('');

useEffect(() => {
  if (typeof window !== 'undefined') {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
    if (usuario?.usuario) {
      setNomeLogado(usuario.usuario);
      setMarmitas([{ data: '', horario: '', empresa: '', operacao: '', solicitante: usuario.usuario, quantidade: '', valor: '' }]);
    }
  }
}, []);




  useEffect(() => {
    fetch('https://script.google.com/macros/s/AKfycbzL6NoS3730uOtG1T3SsqpgXVp4r_s9rRDd-c9B85cip9mByzaYEzFwepWxawH1VHni/exec')
      .then(res => res.json())
      .then(data => setDadosPlanilha(data));
  }, []);

  const handleChange = (index, campo, valor) => {
    const novaLista = [...marmitas];
    novaLista[index][campo] = valor;

    if (campo === 'empresa') {
      const operacoes = [...new Set(dadosPlanilha.filter(d => d.EMPRESA === valor).map(d => d.OPERAÇÃO))];
      setOperacoesFiltradas(operacoes);
      novaLista[index]['operacao'] = '';
    }

    setMarmitas(novaLista);
  };

  const adicionarLinha = () => {
    const novaLinha = { data: '', horario: '', empresa: '', operacao: '', solicitante: nomeLogado, quantidade: '', valor: '' };
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
      if (!m.data || !m.horario || !m.empresa || !m.operacao || !m.solicitante || !m.quantidade || !m.valor) {
        alert('Por favor, preencha todos os campos antes de enviar.');
        return false;
      }
    }
    return true;
  };

  const handleEnviar = () => {
    if (!validarCampos()) return;

    const mensagem = marmitas.map((m, i) => (
      `${i + 1}.
Solicitante: ${m.solicitante}
Empresa: ${m.empresa}
Operação: ${m.operacao}
Data: ${m.data}
Horário: ${m.horario}
Quantidade: ${m.quantidade}
Valor: R$${m.valor}`
    )).join('\n------------------\n');

    if (navigator.share) {
      navigator.share({ title: 'Solicitação de Marmitas', text: mensagem })
        .catch((error) => console.error('Erro ao compartilhar:', error));
    } else {
      alert('Compartilhamento não suportado neste navegador. Tente pelo celular.');
    }
  };

  const empresas = [...new Set(dadosPlanilha.map(d => d.EMPRESA))];

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
        <h2 style={{ marginBottom: '3rem' }}>Solicitação de Marmita</h2>
      </center>
        
        {marmitas.map((m, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', background: '#f9f9f9' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => removerLinha(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

              <div>
                <label>Data:</label>
                <input type="date" value={m.data} onChange={(e) => handleChange(index, 'data', e.target.value)} />
              </div>

              <div>
                <label>Horário:</label>
                <input type="time" value={m.horario} onChange={(e) => handleChange(index, 'horario', e.target.value)} />
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
                <label>Quantidade:</label>
                <input type="number" value={m.quantidade} onChange={(e) => handleChange(index, 'quantidade', e.target.value)} />
              </div>

              <div>
                <label>Valor:</label>
                <input type="number" value={m.valor} onChange={(e) => handleChange(index, 'valor', e.target.value)} />
              </div>
            </div>
          </div>
        ))}

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button onClick={adicionarLinha} style={{ fontSize: '16px', background: '#e0e0e0', padding: '6px 12px', borderRadius: '6px' }}>
            ➕ Adicionar
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button onClick={handleEnviar} style={{ background: '#0c6a37', color: '#fff', padding: '10px 20px', borderRadius: '6px', fontSize: '14px' }}>
            📤 Compartilhar Solicitação
          </button>
        </div>
      </div>
    </div>
  );
}
