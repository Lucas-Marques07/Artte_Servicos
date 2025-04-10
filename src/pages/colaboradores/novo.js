// src/pages/colaboradores/novo.js
import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react'; // ícone da lixeira

export default function NovoColaborador() {
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
        const response = await fetch('https://sheetdb.io/api/v1/kbce3mayhsmmg');
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
      `Novo Cadastro de Colaborador:\n\nNome: ${nome}\nCPF: ${cpf}\nFunção: ${funcao}\nValor da Diária: R$${diaria}`
    );

    const numeroWhatsApp = '5511949324422';
    const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
    window.open(linkWhatsApp, '_blank');
  };

  const handleSubmit = () => {
    const nomeArquivo = `cadastro_${cabecalho.cliente}_${cabecalho.operacao}_${cabecalho.data}.txt`;

    let texto = `Cadastro de Colaboradores\n\n`;
    texto += `Cliente: ${cabecalho.cliente}\n`;
    texto += `Operação: ${cabecalho.operacao}\n`;
    texto += `Data: ${cabecalho.data}\n`;
    texto += `Turno: ${cabecalho.turno}\n`;
    texto += `Entrada: ${cabecalho.entrada}\n`;
    texto += `Saída: ${cabecalho.saida}\n\n`;

    colaboradores.forEach((colab, index) => {
      texto += `#${index + 1}\n`;
      texto += `Nome: ${colab.nome}\n`;
      texto += `CPF: ${colab.cpf}\n`;
      texto += `Empresa: ${colab.empresa}\n`;
      texto += `Operação: ${colab.operacao}\n`;
      texto += `Turno: ${colab.turno}\n`;
      texto += `Função: ${colab.funcao}\n`;
      texto += `Diária: R$${colab.diaria}\n\n`;
    });

    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    colaboradores.forEach(colab => {
      if (colab.nome && colab.cpf && colab.funcao && colab.diaria) {
        enviarParaWhatsApp(colab);
      }
    });
  };

  return (
    <div className="container">
      <h1>Listas RH+</h1>

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

      <label style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <input
          type="checkbox"
          checked={usarMesmoValor}
          onChange={() => setUsarMesmoValor(!usarMesmoValor)}
          style={{ marginRight: '0.5rem' }}
        />
        Usar mesma função e diária para todos os colaboradores
      </label>

      {colaboradores.map((colab, index) => (
        <div key={index} className="colaborador-container">
          <button
            onClick={() => removerColaborador(index)}
            className="botao-lixeira"
            title="Remover colaborador"
          >
            <Trash2 size={20} />
          </button>

          <div className="num-colaborador">
            {index + 1}
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
          Enviar para WhatsApp
        </button>
      </div>
    </div>
  );
}
