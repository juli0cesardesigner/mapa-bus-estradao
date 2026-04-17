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
  const uniqueLocations = Array.from(new Set(locations));
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
