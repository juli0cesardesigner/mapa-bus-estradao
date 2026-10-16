import Papa from 'papaparse';

export interface PassengerData {
  nome: string;
  assento: number;
  localidade: string;
}

export const parseCSV = async (file: File): Promise<PassengerData[]> => {
  const text = await file.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const hasNameHeader = headers.some((h: string) => h.toLowerCase() === 'nome');
        
        if (!hasNameHeader) {
          // Fallback para parseRawText se não encontrar cabeçalhos padrão
          resolve(parseRawText(text));
          return;
        }

        const data = results.data.map((row: any) => ({
          nome: (row.nome || row.Nome || '').toUpperCase().trim(),
          assento: parseInt(row.assento || row.Assento || '0'),
          localidade: (row.localidade || row.Localidade || 'GERAL').toUpperCase().trim(),
        }));
        resolve(data);
      },
      error: (error: any) => {
        reject(error);
      },
    });
  });
};

export const generateLocationColors = (locations: string[]) => {
  const uniqueLocations = Array.from(new Set(locations.map(l => l.toUpperCase().trim())));
  const colors: Record<string, string> = {};
  
  // Paleta de cores vibrantes, modernas e sem tons vermelhos
  const palette = [
    '#2563EB', // Azul Royal
    '#0D9488', // Teal / Verde Petróleo (substituiu vermelho)
    '#059669', // Verde Esmeralda
    '#D97706', // Âmbar / Dourado
    '#7C3AED', // Violeta
    '#0284C7', // Azul Céu Vibrante
    '#0891B2', // Ciano Profundo
    '#6366F1', // Índigo Moderno
    '#10B981', // Menta
    '#8B5CF6', // Roxo Suave
    '#F59E0B', // Amarelo Ouro
    '#14B8A6', // Turquesa
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

    // 1. Tentar extrair assento no início (incluindo tab)
    const seatMatch = line.match(/^(\d+)\s*[\.\-\/\s\t]*/);
    if (seatMatch) {
      assento = parseInt(seatMatch[1]);
      line = line.replace(seatMatch[0], '');
    }

    // 2. Tentar extrair localidade no final (após -, ;, /, |, ou tab)
    const locMatch = line.match(/\s*[\-\;\/\|\t]\s*([^-\;\/\|\t]+)$/);
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
