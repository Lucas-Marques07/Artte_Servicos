// src/pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();

  const usuariosCadastrados = [
    { email: 'marques.santoslucas@gmail.com', senha: '123456' },
    { email: 'lucas@empresa.com', senha: 'senha123' }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    const usuarioValido = usuariosCadastrados.find(
      (u) => u.email === email && u.senha === senha
    );

    if (usuarioValido) {
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioValido));
      router.push('/');
    } else {
      alert('E-mail ou senha inválidos!');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '1rem' }}>Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Senha</label><br />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: '#0070f3',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
