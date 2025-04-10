// src/pages/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const usuario = localStorage.getItem('usuarioLogado');
    if (!usuario) {
      router.push('/login');
    }
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        Gestão RH+
      </h1>

      <p style={{ marginBottom: '2rem' }}>
        Bem-vindo! Escolha uma das opções abaixo:
      </p>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ marginBottom: '1rem' }}>
          <Link href="/colaboradores">
            <span style={{
              backgroundColor: '#0070f3',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              textDecoration: 'none',
              cursor: 'pointer'
            }}>
              📋 Ver Colaboradores
            </span>
          </Link>
        </li>
        <li>
          <Link href="/colaboradores/novo">
            <span style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              textDecoration: 'none',
              cursor: 'pointer'
            }}>
              ➕ Adicionar Novo Colaborador
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
