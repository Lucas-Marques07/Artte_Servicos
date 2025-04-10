// src/pages/colaboradores/novo.js
import { useState, useEffect } from 'react';

export default function NovoColaborador() {
  const [colaboradores, setColaboradores] = useState([
    { cpf: '', nome: '', funcao: '', diaria: '' }
  ]);
  const [cpfsDisponiveis, setCpfsDisponiveis] = useState([]);
  const [usarMesmoValor, setUsarMesmoValor] = useState(false);

  useEffect(() => {
    async function fetchCPFs() {
      try {
        const response = await fetch('https://sheetdb.io/api/v1/kbce3mayhsmmg');
        const data = await response.json();
        setCpfsDisponiveis(data);
      } catch (error) {
        console.error('Erro ao buscar CPFs:', error);
      }
    }

    fetchCPFs();
  }, []);

  const handleChange = (index, campo, valor) => {
    const novosColaboradores = [...colaboradores];

    if (campo === 'cpf') {
      valor = valor.replace(/\D/g, '').slice(0, 11); // só números
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2')
                   .replace(/(\d{3})(\d)/, '$1.$2')
                   .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

      const colaboradorEncontrado = cpfsDisponiveis.find(item => item.CPF === valor);
      novosColaboradores[index].nome = colaboradorEncontrado ? colaboradorEncontrado.Nome : '';
    }

    novosColaboradores[index][campo] = valor;
    setColaboradores(novosColaboradores);
  };

  const adicionarLinha = () => {
    const novaLinha = { cpf: '', nome: '', funcao: '', diaria: '' };

    if (usarMesmoValor && colaboradores.length > 0) {
      const primeiro = colaboradores[0];
      novaLinha.funcao = primeiro.funcao;
      novaLinha.diaria = primeiro.diaria;
    }

    setColaboradores([...colaboradores, novaLinha]);
  };

  // Função para enviar as informações para o WhatsApp
  const enviarParaWhatsApp = () => {
    let mensagem = 'Novo Cadastro de Colaboradores:\n\n';

    // Montando a mensagem com todos os colaboradores
    colaboradores.forEach((colaborador, index) => {
      const { nome, cpf, funcao, diaria } = colaborador;
      mensagem += `Colaborador ${index + 1}:\n`;
      mensagem += `Nome: ${nome}\nCPF: ${cpf}\nFunção: ${funcao}\nValor da Diária: R$${diaria}\n\n`;
    });

    // Codificando a mensagem para o WhatsApp
    const mensagemCodificada = encodeURIComponent(mensagem);

    // Link de convite para o grupo (substitua pelo link real)
    const linkGrupoWhatsApp = 'https://chat.whatsapp.com/CXl0xz4CX0k5UNxV23Y9tB'; // Substitua pelo link do grupo

    // Gerar o link para o WhatsApp com o convite do grupo
    const linkWhatsApp = `${linkGrupoWhatsApp}&text=${mensagemCodificada}`;

    // Abrir o link no navegador para que o usuário entre no grupo
    window.open(linkWhatsApp, '_blank');
  };

  return (
    <div className="container">
      <h1>Novo Colaborador</h1>

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
          {/* Numeração da linha */}
          <div className="num-colaborador">
            {index + 1}
          </div>

          {/* Nome */}
          <div className="item">
            <label>Nome:</label>
            <input
              type="text"
              value={colab.nome}
              readOnly
              className="input-readonly"
            />
          </div>

          {/* CPF */}
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

          {/* Função */}
          <div className="item">
            <label>Função:</label>
            <select
              value={colab.funcao}
              onChange={(e) => handleChange(index, 'funcao', e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="AUX. LOGISTICA">AUX. LOGISTICA</option>
              <option value="CONFERENTE">CONFERENTE</option>
            </select>
          </div>

          {/* Diária */}
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

      {/* Botão de adicionar novo colaborador */}
      <div className="divider" />
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          onClick={adicionarLinha}
          className="add-button"
        >
          ➕
        </button>
      </div>

      {/* Botão de envio para WhatsApp */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button onClick={enviarParaWhatsApp} className="send-whatsapp-button">
          Enviar para o Grupo no WhatsApp
        </button>
      </div>
    </div>
  );
}
