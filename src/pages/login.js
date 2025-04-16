// src/pages/login.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const botaoEstilo = {
    backgroundColor: '#0c6a37',
    color: 'white',
    padding: '0.5rem 1.2rem',
    borderRadius: '6px',
    textDecoration: 'none',
    cursor: 'pointer',
    display: 'inline-block',
    minWidth: '220px',
    textAlign: 'center',
  };
  

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (!usuarioSalvo) {
      router.push('/login');
    } else {
      setUsuario(JSON.parse(usuarioSalvo)); // transforma string em objeto
    }
  }, []);

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
      <div
        style={{
          background: '#fff',
          padding: '2rem 3rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
        
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
  <button
    onClick={() => router.push('/')}
    className="botao-lixeira"
    title="Sair"
    style={{
      width: '15px',
      height: '15px',
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    }}
  >
    Sair
  </button>
</div>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#0c6a37' }}>
          Gestão RH+
        </h1>

        {usuario && (
          <p style={{ marginBottom: '1rem', color: '#555' }}>
            Olá,  <strong>{usuario.usuario}</strong>!
          </p>
        )}

        <p style={{ marginBottom: '2rem' }}>
           Bem-vindo(a)! Escolha uma das opções abaixo:
        </p>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '1rem' }}>
            <Link href="/colaboradores">
            <span style={botaoEstilo}>
                👷 Cadastrar Colaboradores
              </span>
            </Link>
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <Link href="marmita/novo">
            <span style={botaoEstilo}>
                 🍽️ Solicitar Marmitas
            </span>

            </Link>
          </li>
          
        <li style={{ marginBottom: '1rem' }}>
          <Link href="transporte/novo">
          <span style={botaoEstilo}>
                🚐 Lançar Transporte
              </span>
            </Link>
            </li>

            <li style={{ marginBottom: '1rem' }}>
          <Link href="/rota">
          <span style={botaoEstilo}>
          🗺️ Itinerário
              </span>
            </Link>
            </li>
       
            <li style={{ marginBottom: '1rem' }}>
            <Link href="/colaboradores/novo">
            <span style={botaoEstilo}>
                📋 Lançar lista
              </span>
            </Link>
          </li>
          <li style={{ marginBottom: '1rem' }}>
            <Link href="/colaboradores/enviarlista">
            
            <span style={botaoEstilo}>
            📨 Enviar lista
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
