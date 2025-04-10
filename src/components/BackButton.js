// src/components/BackButton.js
import Link from 'next/link';

const BackButton = () => (
  <Link href="/colaboradores">
    <button style={{
      padding: '0.5rem 1.5rem',
      backgroundColor: '#022c15',
      color: '#f1f1f1',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginBottom: '1rem',
    }}>
      Voltar
    </button>
  </Link>
);

export default BackButton;
