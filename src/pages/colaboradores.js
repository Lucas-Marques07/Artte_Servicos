import { useState } from 'react';

export default function Colaboradores() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: ''
  });
  const [mensagem, setMensagem] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('Enviando...');

    try {
      const response = await fetch('https://sheetdb.io/api/v1/wg86ifdzv6w7h', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: form }),
      });

      if (response.ok) {
        setMensagem('Dados enviados com sucesso!');
        setForm({ nome: '', email: '', telefone: '' });
      } else {
        setMensagem('Erro ao enviar.');
      }
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Cadastro de Colaboradores</h1>
      <form onSubmit={handleSubmit}>
        <input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} required />
        <button type="submit">Enviar</button>
      </form>
      <p>{mensagem}</p>
    </div>
  );
}
