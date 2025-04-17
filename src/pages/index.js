import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();

  const usuariosCadastrados = [
    { usuario: 'Lucas', senha: '582746' },
    { usuario: 'Patrícia', senha: '316474' },
    { usuario: 'Sergio', senha: '1010' },
    { usuario: 'Clayton', senha: '010767' },
    { usuario: 'Kesia', senha: '129742' },
    { usuario: 'Juliana', senha: '096234' },
    { usuario: 'Simone', senha: '1418' },
    { usuario: 'Julio', senha: '140058' },
    { usuario: 'Flávio', senha: '123778' },
    { usuario: 'Daniela', senha: '134084' },
    { usuario: 'Ana Carolina', senha: '022199' },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    const usuarioValido = usuariosCadastrados.find(
      (u) => u.usuario === usuario && u.senha === senha
    );

    if (usuarioValido) {
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioValido));
      router.push('/login');
    } else {
      alert('Usuário ou senha inválidos!');
    }
  };

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
          position: 'relative',
          background: '#fff',
          padding: '2rem 3rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          width: '270px',
          maxWidth: '400px',
          overflow: 'hidden',
          height:'300px'

        }}
      >
        {/* Fundo com logo transparente */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '95%',
            backgroundImage: 'url("/artte.png")',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: 0.25,
            zIndex: 0,
          }}
        ></div>

        {/* Conteúdo por cima do fundo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
           <h2
              style={{
                color: '#141e7d',
                fontSize: '1.8rem',
                marginBottom: '1rem',
              }}
            >
              Artte Serviços
            </h2>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem' }}>Usuário</label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                style={{
                  width: '93%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem' }}>Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                style={{
                  width: '93%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                backgroundColor: '#141e7d',
                color: 'white',
                padding: '0.6rem 1rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
