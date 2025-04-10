// src/pages/colaboradores.js
import { useState } from 'react';

export default function Colaboradores() {
  const [formData, setFormData] = useState({
    CPF: '',
    Nome: '',
  });

  // Função para formatar o CPF
  const formatCPF = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11); // Apenas números, máx 11
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

    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(formData.CPF)) {
      alert('Por favor, insira um CPF válido no formato 000.000.000-00');
      return;
    }

    try {
      const res = await fetch('https://sheetdb.io/api/v1/kbce3mayhsmmg', {
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
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Cadastro de Colaborador</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px' }}>
        <label>Nome:</label>
        <input name="Nome" value={formData.Nome} onChange={handleChange} required />

        <label>CPF:</label>
        <input
          name="CPF"
          value={formData.CPF}
          onChange={handleChange}
          placeholder="000.000.000-00"
          maxLength={14} // 11 dígitos + 3 símbolos
          required
        />

        <button type="submit" style={{ marginTop: '1rem' }}>Salvar</button>
      </form>
    </div>
  );
}
