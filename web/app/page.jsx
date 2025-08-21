
export default async function Home() {
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
  let health = { ok: false };
  try {
    const res = await fetch(`${base}/health`, { cache: 'no-store' });
    health = await res.json();
  } catch(e) {}
  return (
    <main style={{padding: 24, fontFamily: 'system-ui, sans-serif'}}>
      <h1>ProvaFoco MVP</h1>
      <p>Status da API: {health.ok ? 'online' : 'offline'}</p>
      <p>Use o formulário de criação de Ranking (em breve) e submissão de gabarito.</p>
    </main>
  );
}
