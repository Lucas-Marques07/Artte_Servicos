// src/components/BackButton.js
import { useRouter } from 'next/router';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      style={{
        marginBottom: '1rem',
        backgroundColor: '#ccc',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
      }}
    >
      ← Voltar
    </button>
  );
}
