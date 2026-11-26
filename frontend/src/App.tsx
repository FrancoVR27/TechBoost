import { useEffect, useState } from 'react';

export default function App() {
  const [message, setMessage] = useState('Cargando...');

  useEffect(() => {
    fetch('http://localhost:3000')
      .then((res) => res.text())
      .then((data) => setMessage(data))
      .catch(() => setMessage('Error al conectar con NestJS'));
  }, []);

  return (
    <main>
      <h1>React + NestJS</h1>
      <p>Respuesta del backend: {message}</p>
    </main>
  );
}