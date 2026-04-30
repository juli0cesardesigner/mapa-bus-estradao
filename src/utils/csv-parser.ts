import Papa from 'papaparse';

export interface PassengerData {
  nome: string;
  assento: number;
  localidade: string;
}

export const parseCSV = (file: File): Promise<PassengerData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row: any) => ({
          nome: (row.nome || row.Nome || '').toUpperCase().trim(),
          assento: parseInt(row.assento || row.Assento || '0'),
          localidade: (row.localidade || row.Localidade || 'GERAL').toUpperCase().trim(),
        }));
        resolve(data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const generateLocationColors = (locations: string[]) => {
  const uniqueLocations = Array.from(new Set(locations.map(l => l.toUpperCase().trim())));
  const colors: Record<string, string> = {};
  
  // Paleta de cores vibrantes e modernas
  const palette = [
    '#2563EB', // Azul Royal
    '#DC2626', // Vermelho Vibrante
    '#059669', // Verde Esmeralda
    '#D97706', // Âmbar / Laranja
    '#7C3AED', // Violeta
    '#DB2777', // Rosa Choque
    '#0891B2', // Ciano Profundo
    '#EA580C', // Laranja Queimado
    '#4F46E5', // Índigo
    '#BE185D', // Carmesim
  ];

  uniqueLocations.forEach((loc, index) => {
    colors[loc] = palette[index % palette.length];
  });

  return colors;
};

export const parseRawText = (text: string): PassengerData[] => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  return lines.map(line => {
    // Regex para tentar extrair: (Assento) - (Nome) - (Localidade)
    // Suporta formatos como:
    // "01 - Joao Silva - Centro"
    // "Joao Silva - Centro"
    // "Joao Silva"
    // "01 Joao Silva"
    
    let assento = 0;
    let nome = '';
    let localidade = 'GERAL';

    // 1. Tentar extrair assento no início
    const seatMatch = line.match(/^(\d+)\s*[\.\-\/\s]*/);
    if (seatMatch) {
      assento = parseInt(seatMatch[1]);
      line = line.replace(seatMatch[0], '');
    }

    // 2. Tentar extrair localidade no final (após - ou ;)
    const locMatch = line.match(/\s*[\-\;\/\|]\s*([^-\;\/\|]+)$/);
    if (locMatch) {
      localidade = locMatch[1].trim().toUpperCase();
      line = line.replace(locMatch[0], '');
    }

    // 3. O que sobrou é o nome
    nome = line.trim().toUpperCase();

    return {
      nome: nome || 'PASSAGEIRO SEM NOME',
      assento: assento,
      localidade: localidade || 'GERAL'
    };
  });
};
