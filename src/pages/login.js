import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);

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
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#0c6a37' }}>
          Gestão RH+
        </h1>

        {usuario && (
          <p style={{ marginBottom: '1rem', color: '#555' }}>
            Olá,  <strong>{usuario.usuario}</strong>!
          </p>
        )}

        <p style={{ marginBottom: '2rem' }}>
          Bem-vindo! Escolha uma das opções abaixo:
        </p>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '1rem' }}>
            <Link href="/colaboradores">
              <span
                style={{
                  backgroundColor: '#0070f3',
                  color: 'white',
                  padding: '0.5rem 1.2rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  display: 'inline-block',
                }}
              >
                📋 Cadastrar Colaboradores
              </span>
            </Link>
          </li>
          <li>
          <Link href="transporte/novo">
              <span
                style={{
                  backgroundColor: '#0070f3',
                  color: 'white',
                  padding: '0.5rem 1.2rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  display: 'inline-block',
                }}
              >
                📋 lançar transporte
              </span>
            </Link>
            </li>

          <li>
            <Link href="/colaboradores/novo">
              <span
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.5rem 1.2rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  display: 'inline-block',
                }}
              >
                ➕ Lançar lista
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
