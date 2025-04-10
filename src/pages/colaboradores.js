import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Colaboradores() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    CPF: '',
    Nome: '',
  });
  const [cpfsExistentes, setCpfsExistentes] = useState([]);

  // Carrega os CPFs existentes ao carregar a página
  useEffect(() => {
    const carregarCPFs = async () => {
      try {
        const res = await fetch('https://script.google.com/macros/s/AKfycbzL6NoS3730uOtG1T3SsqpgXVp4r_s9rRDd-c9B85cip9mByzaYEzFwepWxawH1VHni/exec');
        const data = await res.json();
        const cpfs = data.map((colab) => colab.CPF);
        setCpfsExistentes(cpfs);
      } catch (error) {
        console.error('Erro ao buscar CPFs:', error);
      }
    };
    carregarCPFs();
  }, []);

  // Validação de CPF real (com dígito verificador)
  const validarCPF = (cpf) => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cleaned.charAt(i)) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cleaned.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cleaned.charAt(i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cleaned.charAt(10));
  };

  const formatCPF = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = name === 'CPF' ? formatCPF(value) : value;

    setFormData({
      ...formData,
      [name]: updatedValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cpf = formData.CPF;
    if (!validarCPF(cpf)) {
      alert('CPF inválido. Verifique e tente novamente.');
      return;
    }

    if (cpfsExistentes.includes(cpf)) {
      alert('Este CPF já está cadastrado.');
      return;
    }

    try {
      const res = await fetch('https://script.google.com/macros/s/AKfycbzL6NoS3730uOtG1T3SsqpgXVp4r_s9rRDd-c9B85cip9mByzaYEzFwepWxawH1VHni/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: formData })
      });

      if (res.ok) {
        alert('Colaborador cadastrado com sucesso!');
        setFormData({ CPF: '', Nome: '' });
      } else {
        alert('Erro ao cadastrar colaborador.');
      }
    } catch (error) {
      console.error('Erro ao conectar com o servidor:', error);
      alert('Erro ao conectar com o servidor.');
    }
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
      }}
    >
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        {/* Botão Voltar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button
            onClick={() => router.push('/')}
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

        <h1 style={{ marginBottom: '1rem' }}>Cadastro de Colaborador</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px' }}>
          <label>Nome:</label>
          <input
            name="Nome"
            value={formData.Nome}
            onChange={handleChange}
            required
            style={{ marginBottom: '1rem', padding: '0.5rem' }}
          />

          <label>CPF:</label>
          <input
            name="CPF"
            value={formData.CPF}
            onChange={handleChange}
            placeholder="000.000.000-00"
            maxLength={14}
            required
            style={{ marginBottom: '1rem', padding: '0.5rem' }}
          />

          <button
            type="submit"
            style={{
              marginTop: '1rem',
              backgroundColor: '#0c6a37',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}
