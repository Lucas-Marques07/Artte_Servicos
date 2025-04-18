// src/pages/marmita/novo.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

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

  const compartilharTexto = () => {
    if (!validarCampos()) return;

    const mensagem = marmitas.map((m, i) => {
      const dataFormatada = new Date(m.data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });

      return `🧾 Solicitação de Reembolso *${i + 1}º*

🗂️ Categoria: ${m.categoria} | 📅 Data: ${dataFormatada}
🏢 Empresa: ${m.empresa} | ⚙️ Operação: ${m.operacao}
💰 Valor: R$ ${m.valor} | 👤 Solicitante: ${m.solicitante}

📝 OBS: ${m.endereço}`;

    }).join('\n-------------------------\n');

    if (navigator.share) {
      navigator.share({
        title: 'Solicitação de Reembolso',
        text: mensagem,
      }).catch((err) => console.error("Erro ao compartilhar texto:", err));
    } else {
      alert("Compartilhamento de texto não suportado.");
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
                  {categoriaUnicos.map((e, i) => <option key={i} value={e}>{e}</option>)}
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
          <button onClick={compartilharTexto} style={{ background: '#141e7d', color: '#fff', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', marginRight: '1rem' }}>
            📄 Enviar Solicitação
          </button>
          <button onClick={compartilharComprovante} style={{ background: '#2e7d32', color: '#fff', padding: '10px 20px', borderRadius: '6px', fontSize: '14px' }}>
            📎 Enviar Comprovante
          </button>
        </div>
      </div>
    </div>
  );
}
