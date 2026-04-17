'use client';

import React from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { parseCSV, generateLocationColors, type PassengerData } from '@/utils/csv-parser';

interface ImportFormProps {
  onImport: (title: string, data: any[]) => Promise<void>;
}

export const ImportForm: React.FC<ImportFormProps> = ({ onImport }) => {
  const [title, setTitle] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setIsUploading(true);
    try {
      const rawData = await parseCSV(file);
      const locations = rawData.map(p => p.localidade);
      const colors = generateLocationColors(locations);

      const processedData = rawData.map(p => ({
        ...p,
        cor_hex: colors[p.localidade],
        embarcado: false
      }));

      await onImport(title, processedData);
      setTitle('');
      setFile(null);
    } catch (error) {
      console.error('Erro ao importar CSV:', error);
      alert('Erro ao processar o arquivo CSV. Verifique o formato.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl">
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">Título da Viagem</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Excursão Lapinha - Grupo A"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          required
        />
      </div>

      <div className="relative group">
        <label className="block text-sm font-medium text-zinc-400 mb-2">Lista de Passageiros (CSV)</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-800 border-dashed rounded-2xl group-hover:border-zinc-700 transition-colors">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
            <div className="flex text-sm text-zinc-400">
              <label className="relative cursor-pointer rounded-md font-medium text-blue-500 hover:text-blue-400">
                <span>Upload de arquivo</span>
                <input type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
              </label>
              <p className="pl-1">ou arraste e solte</p>
            </div>
            <p className="text-xs text-zinc-500">Apenas CSV (nome, assento, localidade)</p>
          </div>
        </div>
        {file && (
          <div className="mt-4 flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <span className="text-sm text-zinc-300 truncate max-w-[200px]">{file.name}</span>
            <button type="button" onClick={() => setFile(null)} className="text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!file || !title || isUploading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-4 font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:hover:shadow-none transition-all flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processando...
          </>
        ) : (
          'Gerar Controle de Embarque'
        )}
      </button>
    </form>
  );
};
