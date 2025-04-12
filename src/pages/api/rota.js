export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }
    const chave = process.env.ORS_API_KEY;
    const { locais, horaInicio } = req.body;
  
    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Chave da API não configurada' });
  
    try {
      const coordenadas = await Promise.all(locais.map(async (local) => {
        const resp = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(local)}&boundary.country=BR`);
        const json = await resp.json();
        if (!json.features?.length) throw new Error(`Endereço não encontrado: ${local}`);
        const [lng, lat] = json.features[0].geometry.coordinates;
        return { nome: local, coord: [lng, lat] };
      }));
  
      const coordsApenas = coordenadas.map(p => p.coord);
      const rotaResp = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coordinates: coordsApenas }),
      });
      const rota = await rotaResp.json();
  
      const horarios = [];
      let atual = new Date(`2000-01-01T${horaInicio}:00`);
     const duracoes = rota?.features?.[0]?.properties?.segments?.map(s => s.duration);
if (!duracoes || duracoes.length === 0) {
  throw new Error('Não foi possível calcular os tempos de deslocamento');
}


for (let i = 0; i < coordenadas.length; i++) {
  const local = coordenadas[i].nome;
  const horaStr = atual.toTimeString().slice(0, 5);
  horarios.push({ local, hora: horaStr });

  if (i < duracoes.length) {
    const duracaoEmMs = duracoes[i] * 1000; // converter para ms
    atual = new Date(atual.getTime() + duracaoEmMs + 2 * 60000); // tempo de trajeto + 2 min de parada
  }
}

    
  
      const coordenadasFormatadas = coordenadas.map(p => ({
        nome: p.nome,
        lat: p.coord[1],
        lng: p.coord[0],
      }));
      
      return res.status(200).json({
        coordenadas: coordenadasFormatadas,
        horarios,
        geojson: rota,
      });
      
  
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
