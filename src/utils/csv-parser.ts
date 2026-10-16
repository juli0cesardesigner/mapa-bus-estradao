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
  
  // Paleta de cores de alto contraste, cobrindo espectros completamente distintos:
  // Azul Real, Laranja Quente, Roxo Elétrico, Verde Esmeralda, Ciano Vivo, Rosa Magenta, Amarelo Ouro, etc.
  const palette = [
    '#2563EB', // 1. Azul Royal Vivo
    '#059669', // 2. Verde Esmeralda
    '#D97706', // 3. Âmbar / Laranja Ocre
    '#7C3AED', // 4. Violeta / Roxo Escuro
    '#0891B2', // 5. Ciano Oceânico
    '#4F46E5', // 6. Índigo Elétrico
    '#0284C7', // 7. Sky Blue Claro
    '#9333EA', // 8. Púrpura Intenso
    '#EAB308', // 9. Amarelo Sol
    '#64748B', // 10. Ardósia Metálico
    '#065F46', // 11. Verde Floresta Profundo
    '#1D4ED8', // 12. Azul Cobalto
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
