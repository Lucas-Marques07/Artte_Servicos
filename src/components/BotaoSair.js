// components/BotaoSair.js
import { useRouter } from 'next/router';

export default function BotaoSair() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado');
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        backgroundColor: '#dc2626',
        color: 'white',
        padding: '0.4rem 1rem',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        position: 'absolute',
        top: '20px',
        right: '20px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      }}
    >
      🚪 Sair
    </button>
  );
}
