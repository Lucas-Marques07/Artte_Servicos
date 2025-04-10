import { useState } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';

export default function NovoColaborador() {
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = { nome, cargo, email, status };

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbyXuRkzGXN6r8jDXnEc7wGjrsSF4kYgwI052k0S8LI/dev', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMensagem('Enviado com sucesso!');
      } else {
        setMensagem('Erro ao enviar');
      }
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor.');
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Dados do Colaborador', 10, 10);
    doc.text(`Nome: ${nome}`, 10, 20);
    doc.text(`Cargo: ${cargo}`, 10, 30);
    doc.text(`Email: ${email}`, 10, 40);
    doc.text(`Status: ${status}`, 10, 50);
    doc.save(`colaborador_${nome}.pdf`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Novo Colaborador</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div>
          <input placeholder="Cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} />
        </div>
        <div>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <input placeholder="Status" value={status} onChange={(e) => setStatus(e.target.value)} />
        </div>
        <button type="submit">Salvar</button>
      </form>

      {mensagem && <p>{mensagem}</p>}

      <button onClick={handleDownloadPDF} style={{ marginTop: 10 }}>📄 Baixar PDF</button>

      <Link href="/colaboradores">
        <button style={{ marginTop: 20 }}>← Voltar</button>
      </Link>
    </div>
  );
}
