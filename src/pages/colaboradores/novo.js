import React, { useState } from 'react';
import Link from 'next/link';

export default function NovoColaborador() {
  const [formData, setFormData] = useState({
    nome: '',
    cargo: '',
    status: 'Ativo',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Novo colaborador:', formData);
    alert('Colaborador salvo (simulado)');
    setFormData({ nome: '', cargo: '', status: 'Ativo' });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Novo Colaborador</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome: </label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Cargo: </label>
          <input
            type="text"
            name="cargo"
            value={formData.cargo}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Status: </label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>
        <button type="submit" style={{ marginTop: '1rem' }}>
          Salvar
        </button>
      </form>

      <p style={{ marginTop: '2rem' }}>
        <Link href="/colaboradores">← Voltar para lista</Link>
      </p>
    </div>
  );
}
import BackButton from '../components/BackButton'

export default function Colaboradores() {
  return (
    <div>
      <h1>Colaboradores</h1>
      {/* ...conteúdo da página... */}
      <BackButton />
    </div>
  )
}
